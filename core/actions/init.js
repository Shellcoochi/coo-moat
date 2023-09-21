const fs = require("fs-extra");
const inquirer = require("inquirer");
const { exec: spawn, spinnerStart } = require("../../tools/utils");
const log = require("../../tools/log");
const { PACKAGEMANAGER, ENV } = require("../consts");

const EXTENSIONS_TEMPLATE = {
  recommendations: ["dbaeumer.vscode-eslint"],
};
const SETTINGS_TEMPLATE = {
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
  },
};

const IGNORE_TEMPLATE = `
# coo-moat
!.vscode/settings.json
!.vscode/extensions.json
    `;
const DEPENDENCIES = [
  "eslint@~8.37.0",
  "@commitlint/config-conventional@~17.4.4",
  "@commitlint/cli@~17.5.1",
  "husky@~8.0.3",
  "lint-staged@~13.2.0",
];

async function init() {
  try {
    const prompts = [];
    if (!PACKAGEMANAGER.CHOICES.includes(process.env[ENV.PACKAGEMANAGER])) {
      prompts.push({
        type: "list",
        name: PACKAGEMANAGER.NAME,
        message: `请选择您的包管理工具`,
        choices: PACKAGEMANAGER.CHOICES,
        default: PACKAGEMANAGER.DEFAULT,
      });
    }
    const inquirerData = await inquirer.prompt(prompts);
    process.env = { ...process.env, ...inquirerData };
    const spinner = spinnerStart("正在安装依赖");
    // 安装依赖
    installPkg(
      DEPENDENCIES,
      () => {
        spinner.stop();
        log.success("依赖安装成功！");
        // 初始化eslint配置文件
        initEslintConfig();
        // 初始化commitlint配置文件
        initCommitintConfig();
        // 初始化pkg.json中的husky初始化命令
        initHuskyConfig();
        // 初始化pkg.json中的lint-stage配置
        initLintstagedConfig();
        // 更新[.vscode]中的配置文件
        updateVscodeConfig();
        // 更新[.gitionore]
        updateIgnoreFile();
      },
      ["-D"]
    );
  } catch (e) {
    log.error(e);
  }
}

/**
 * 安装依赖包
 * @param {*} pkgName 包名
 * @param {*} callBack 安装成功后的回调函数
 * @param {*} args 命令参数
 */
function installPkg(pkgNames, callBack, args = []) {
  const PREFIX = process.env[ENV.PACKAGEMANAGER] ?? PACKAGEMANAGER.DEFAULT;
  const installer = spawn(PREFIX, ["install", ...pkgNames, ...args]);
  installer.stdout.on("data", function (data) {
    log.info(data);
  });
  installer.stderr.on("data", function (data) {
    log.info(data);
  });
  installer.on("close", function (code) {
    if (code !== 0) {
      throw code;
    } else {
      callBack?.();
    }
  });
}

/**
 * 初始化pkg.json中的husky配置
 */
function initLintstagedConfig() {
  rewriteJson(
    (fileJson) => {
      fileJson["lint-staged"] = {
        "*.{js,ts,jsx,tsx,vue}": ["eslint --fix"],
      };
      return fileJson;
    },
    { path: "package.json" }
  );
}

/**
 * 初始化pkg.json中的husky初始化命令
 */
function initHuskyConfig() {
  rewriteJson(
    (fileJson) => {
      const { scripts } = fileJson;
      const cmdKey = "moat:init-husky";
      const inithuskyCmd =
        'rm -rf .husky && npx husky install && npx husky add .husky/commit-msg "npx --no-install commitlint --edit $1" && npx husky add .husky/pre-commit "npx lint-staged" ';
      scripts[cmdKey] = inithuskyCmd;
      if (scripts.prepare) {
        scripts.prepare = scripts.prepare + ` && npm run ${cmdKey}`;
      } else {
        scripts.prepare = `npm run ${cmdKey}`;
      }
      return fileJson;
    },
    { path: "package.json" }
  );
}

/**
 * 初始化commitlint配置文件
 */
function initCommitintConfig() {
  spawn(
    "echo module.exports = { extends: ['@commitlint/config-conventional'] }",
    [">", "commitlint.config.js"],
    {
      stdio: "inherit",
    }
  );
}

/**
 * 初始化eslint配置文件
 */
function initEslintConfig() {
  spawn("npx", ["eslint", "--init"], {
    stdio: "inherit",
  });
}

/**
 * 更新[.gitionore]
 *  --使[.vscode]中的extensions.json、settings.json可提交至仓库
 */
function updateIgnoreFile() {
  fs.outputFile(".gitignore", IGNORE_TEMPLATE, { flag: "a" }, (err) => {
    if (err) throw err;
    log.success(`.gitignore已修改`);
  });
}

/**
 * 更新[.vscode]中的配置文件
 *  --extensions.json
 *  --settings.json
 */
function updateVscodeConfig() {
  const extensionsFilePath = ".vscode/extensions.json";
  const settingsFilePath = ".vscode/settings.json";
  // 修改[.vscode] extensions.json
  rewriteJson(
    (fileJson) => {
      return { ...fileJson, ...EXTENSIONS_TEMPLATE };
    },
    { path: extensionsFilePath }
  );
  // 修改[.vscode] settings.json
  rewriteJson(
    (fileJson) => {
      return { ...fileJson, ...SETTINGS_TEMPLATE };
    },
    { path: settingsFilePath }
  );
}

/**
 * 重写json文件（若文件存在且不为空，则追加写入；若文件不存在则创建并写入）
 * @param {*} path 文件路径
 * @param {*} template 写入的内容
 * @param {*} styles 文件内容格式美化
 */
function rewriteJson(callBack, options) {
  try {
    const { path, styles = { spaces: "\t" } } = options;
    // 确保目标JSON文件存在，若不存在则创建
    fs.ensureFileSync(path);
    const fileJson = callBack(fs.readJsonSync(path, { throws: false }));
    fs.writeJSONSync(path, fileJson, styles);
    log.success(`${path}已修改`);
  } catch (error) {
    throw new Error(error);
  }
}

module.exports = init;
