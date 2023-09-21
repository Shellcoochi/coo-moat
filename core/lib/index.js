const { Command } = require("commander");
const fs = require("fs-extra");
const semver = require("semver");
const { init } = require("../actions");
const { PACKAGEMANAGER, ENV } = require("../consts");
const log = require("../../tools/log");
const inquirer = require("inquirer");
const {
  execAsync,
  getNpmInfo,
  isGitRepository,
  getNpmSemverVersion,
} = require("../../tools/utils");

const pkg = require("../../package.json");

const program = new Command();

async function main() {
  try {
    // 脚手架执行的准备阶段
    await prepare();
    // 注册命令
    registerCommand();
  } catch (e) {
    log.error(e.message);
  }
}

function registerCommand() {
  program
    .name(pkg.name)
    .usage("<command> [options]")
    .option(
      `-pm, --packageManager <${ENV.PACKAGEMANAGER}>`,
      `是否指定包管理工具（默认值：${PACKAGEMANAGER.DEFAULT}）？`
    )
    .version(pkg.version);

  program.command("init").description("初始化前端工程规范").action(init);

  //指定全局包管理工具
  program.on("option:packageManager", () => {
    const options = program.opts();
    process.env[PACKAGEMANAGER.NAME] = options.packageManager;
  });

  program.parse(process.argv);
}

/**
 * 脚手架执行的准备阶段，主要包含：
 * - 脚手架版本检查
 * - 是否为Git目录
 */
async function prepare() {
  await checkPkgVersion();
  await checkGitRepository();
}

function checkRoot() {
  const rootCheck = require("root-check");
  rootCheck();
}

/**
 * 检查当前目录是否为Git目录，如不是则可选择，是否进行初始化
 * - 若选择不初始化则终止程序
 * - 选择初始化则程序继续执行
 */
async function checkGitRepository() {
  if (!isGitRepository()) {
    const inquirerData = await inquirer.prompt({
      type: "confirm",
      name: ENV.ISGITREPOSITORY,
      message: `当前目录并非一个Git仓库目录，是否初始化Git仓库`,
    });
    if (inquirerData[ENV.ISGITREPOSITORY]) {
      await initGit();
      log.success("Git初始化完成！");
      return true;
    } else {
      log.info("当前目录并非一个Git仓库目录，请初始化Git后重试，程序终止!");
      process.exit(0);
    }
  } else {
    return true;
  }
}

/**
 * 脚手架版本检查
 */
async function checkPkgVersion() {
  //1.获取当前版本号和模块名
  const currentVersion = pkg.version;
  const npmName = pkg.name;
  //2.调用npm API，获取所有版本号
  const curPkgInfo = await getNpmInfo("coo-moat");
  const lastVersion = curPkgInfo?.["dist-tags"]?.latest ?? currentVersion;
  if (lastVersion && semver.gt(lastVersion, currentVersion)) {
    log.warn(
      "发现新版本",
      `建议手动更新 ${npmName}，当前版本 ${currentVersion}，最新版本 ${lastVersion}`
    );
  }
}

/**
 * 初始化git
 */
async function initGit() {
  try {
    execAsync("git", ["init"], {
      stdio: "ignore",
    });
  } catch (error) {
    throw new Error(error);
  }
}

module.exports = main;
