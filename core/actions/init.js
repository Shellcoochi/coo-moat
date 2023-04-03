const fs = require('fs-extra')
const { exec: spawn, execAsync } = require('../../tools/utils')
const log = require('../../tools/log')

const PREFIX = 'pnpm'

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

function exec() {
    try {
        // eslint初始化
        installPkg('eslint', initEslintConfig, ['-D'])
        // 初始化commitlint
        installPkg('@commitlint/{config-conventional,cli}', initCommitintConfig, ['-D'])
        //初始化husky
        installPkg('husky', initHuskyConfig, ['-D',])
        return false
        // 更新[.vscode]中的配置文件
        updateVscodeConfig()
        // 更新[.gitionore]
        updateIgnoreFile()
    } catch (e) {
        log.error(e)
    }
}

function installPkg(pkgName, callBack, args = []) {
    const installer = spawn(PREFIX, ['install', pkgName, ...args])
    installer.stdout.on('data', function (data) {
        log.info(data)
    })
    installer.stderr.on('data', function (data) {
        log.info(data)
    })
    installer.on('close', function (code) {
        if (code !== 0) {
            throw (`${pkgName} 安装出错: ${code}`)
        } else {
            log.success(`${pkgName} 安装成功`)
            callBack?.()
        }
    })
}

/**
 * 初始化husky配置文件
 */
function initHuskyConfig() {
    // 生成.husky目录命令
    const dirCmd = 'husky install'
    // 添加pre-commit钩子命令
    const preCommitCmd = "add .husky/pre-commit 'npx run lint-staged'"
    //添加commit-msg钩子命令
    const commitMsgCmd = "add .husky/commit-msg 'npx --no-install commitlint --edit $1'"
    spawn('npx', [dirCmd, preCommitCmd, commitMsgCmd], {
        stdio: 'inherit'
    })
}

/**
 * 初始化commitlint配置文件
 */
function initCommitintConfig() {
    spawn('echo',
        ["module.exports = {extends: ['@commitlint/config-conventional']}", '>', 'commitlint.config.js'], {
        stdio: 'inherit'
    })
}

/**
 * 初始化eslint配置文件
 */
function initEslintConfig() {
    spawn(PREFIX, ['eslint', '--init'], {
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
    //修改ignore文件
}

/**
 * 重写json文件
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

module.exports = exec
