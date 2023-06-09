const fs = require('fs-extra')
const { exec: spawn, execAsync, spinnerStart } = require('../../tools/utils')
const log = require('../../tools/log')

const EXTENSIONS_TEMPLATE =
{
    "recommendations": [
        "dbaeumer.vscode-eslint",
    ]
}
const SETTINGS_TEMPLATE = {
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true
    }
}

const IGNORE_TEMPLATE = `
# coo-moat
!.vscode/settings.json
!.vscode/extensions.json
    `
const DEPENDENCIES = [
    'eslint@~8.37.0',
    '@commitlint/config-conventional@~17.4.4',
    '@commitlint/cli@~17.5.1',
    'husky@~8.0.3',
    'lint-staged@~13.2.0'
]

function init() {
    try {
        const spinner =spinnerStart('正在安装依赖')
        // 安装依赖
        installPkg(DEPENDENCIES, () => {
            spinner.stop()
            log.success('依赖安装成功！')
            // 初始化eslint配置文件
            initEslintConfig()
            // 初始化commitlint配置文件
            initCommitintConfig()
            // 初始化husky配置文件
            initHuskyConfig()
            // 初始化pkg.json中的husky配置
            initLintstagedConfig()
            // 更新[.vscode]中的配置文件
            updateVscodeConfig()
            // 更新[.gitionore]
            updateIgnoreFile()
        }, ['-D'])

    } catch (e) {
        log.error(e)
    }
}

/**
 * 安装依赖包
 * @param {*} pkgName 包名
 * @param {*} callBack 安装成功后的回调函数
 * @param {*} args 命令参数
 */
function installPkg(pkgNames, callBack, args = []) {
    const PREFIX = process.env.CLI_PACKAGE_MANAGER ?? 'npm'
    const installer = spawn(PREFIX, ['install', ...pkgNames, ...args])
    installer.stdout.on('data', function (data) {
        log.info(data)
    })
    installer.stderr.on('data', function (data) {
        log.info(data)
    })
    installer.on('close', function (code) {
        if (code !== 0) {
            throw (code)
        } else {
            callBack?.()
        }
    })
}

/**
 * 初始化pkg.json中的husky配置
 */
function initLintstagedConfig() {
    rewriteJson('package.json', {
        "lint-staged": {
            "*.{js,vue}": [
                "eslint --fix"
            ]
        }
    })
}

/**
 * 初始化husky配置文件
 */
async function initHuskyConfig() {
    // 生成.husky目录命令
    const dirCmd = ['husky', 'install'];
    // 添加pre-commit钩子命令
    const preCommitCmd = ['husky', 'add', '.husky/pre-commit', 'npx lint-staged']
    //添加commit-msg钩子命令
    const commitMsgCmd = ['husky', 'add', '.husky/commit-msg', 'npx --no-install commitlint --edit $1'];
    await execAsync("npx", dirCmd, {
        stdio: "inherit"
    });
    await execAsync("npx", preCommitCmd, {
        stdio: "inherit"
    });
    await execAsync("npx", commitMsgCmd, {
        stdio: "inherit"
    });
}

/**
 * 初始化commitlint配置文件
 */
function initCommitintConfig() {
    spawn("echo module.exports = { extends: ['@commitlint/config-conventional'] }",
        ['>', 'commitlint.config.js'], {
        stdio: 'inherit'
    })
}

/**
 * 初始化eslint配置文件
 */
function initEslintConfig() {
    spawn('npx', ['eslint', '--init'], {
        stdio: 'inherit'
    })
}

/**
 * 更新[.gitionore]
 *  --使[.vscode]中的extensions.json、settings.json可提交至仓库
 */
function updateIgnoreFile() {
    fs.outputFile('.gitignore', IGNORE_TEMPLATE, { flag: 'a' }, err => {
        if (err) throw err
        log.success(`.gitignore已修改`)
    })
}

/**
 * 更新[.vscode]中的配置文件
 *  --extensions.json
 *  --settings.json
 */
function updateVscodeConfig() {
    const extensionsFilePath = '.vscode/extensions.json'
    const settingsFilePath = '.vscode/settings.json'
    // 修改[.vscode] extensions.json
    rewriteJson(extensionsFilePath, EXTENSIONS_TEMPLATE)
    // 修改[.vscode] settings.json
    rewriteJson(settingsFilePath, SETTINGS_TEMPLATE)
}

/**
 * 重写json文件（若文件存在且不为空，则追加写入；若文件不存在则创建并写入）
 * @param {*} path 文件路径
 * @param {*} template 写入的内容
 * @param {*} styles 文件内容格式美化
 */
function rewriteJson(path, template, styles = { spaces: '\t' }) {
    // 确保目标JSON文件存在，若不存在则创建
    fs.ensureFile(path).then(() => {
        // 获取原有的目标JSON文件内容
        let fileJson = fs.readJsonSync(path, { throws: false })
        // 若内容不为空则向原有内容中追加
        if (fileJson) {
            fileJson = { ...fileJson, ...template }
        } else {
            // 若内容为空则直接写入新内容
            fileJson = template
        }
        fs.writeJson(path, fileJson, styles, err => {
            if (err) throw err
            log.success(`${path}已修改`)
        })
    }).catch(err => {
        throw (err)
    })
}

module.exports = init
