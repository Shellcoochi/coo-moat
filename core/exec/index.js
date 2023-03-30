import fs from 'fs-extra'
import { exec as spawn, execAsync } from '../../tools/utils/index.js'
import log from '../../tools/log/index.js'

const PREFIX = 'pnpm'
const PLUGIN = [
    "dbaeumer.vscode-eslint",
]
const EXTENSIONS_TEMPLATE =
{
    "recommendations": PLUGIN
}
const SETTINGS_TEMPLATE = {
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true
    }
}

function exec() {
    //   const cmdObj = arguments[arguments.length - 1]
    //   console.log(cmdObj.name())
    // eslint初始化
    // initEslint()
    updateVscodeConfig()
}

/**
 * 初始化eslint
 */
function initEslint() {
    const installEslint = spawn(PREFIX, ['i eslint -D'])
    installEslint.stdout.on('data', function (data) {
        log.info(data)
    })
    installEslint.stderr.on('data', function (data) {
        log.error(data)
    })
    installEslint.on('close', function (code) {
        if (code !== 0) {
            log.error('ESLint依赖安装出错: ' + code)
        } else {
            log.success('ESLint依赖安装成功')
            initEslintConfig()
        }
    })
}

/**
 * 初始化eslint配置文件
 */
function initEslintConfig() {
    const createEslintConfig = spawn(PREFIX, ['eslint', '--init'], {
        stdio: 'inherit'
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
    updateExtensions();
    updateSettings();
    // // 确保目标JSON文件存在，若不存在则创建
    // fs.ensureFile(extensionsFilePath).then(() => {
    //     // 获取原有的目标JSON文件内容
    //     let extensions = fs.readJsonSync(extensionsFilePath, { throws: false })
    //     // 若内容不为空则向原有内容中追加
    //     if (extensions) {
    //         extensions.recommendations = [...extensions.recommendations, ...PLUGIN]
    //     } else {
    //         // 若内容为空则直接写入新内容
    //         extensions = EXTENSIONS_TEMPLATE
    //     }
    //     fs.writeJson(extensionsFilePath, extensions, { spaces: '\t' }, err => {
    //         if (err) return console.error(err)
    //         console.log('success!')
    //     })
    // }).catch(err => {
    //     throw(err)
    // })
    //  //修改ignore文件
}


/**
 * 修改[.vscode] settings.json
 */
function updateSettings() {
    const settingsFilePath = '.vscode/settings.json'
    // 确保目标JSON文件存在，若不存在则创建
    fs.ensureFile(settingsFilePath).then(() => {
        // 获取原有的目标JSON文件内容
        let settings = fs.readJsonSync(settingsFilePath, { throws: false })
        // 若内容不为空则向原有内容中追加
        if (settings) {
            settings["editor.codeActionsOnSave"] = {
                "source.fixAll.eslint": true
            }
        } else {
            // 若内容为空则直接写入新内容
            settings = SETTINGS_TEMPLATE
        }
        fs.writeJson(settingsFilePath, settings, { spaces: '\t' }, err => {
            if (err) return log.error(err)
            log.success(`${settingsFilePath}已修改`)
        })
    }).catch(err => {
        throw (err)
    })
}

/**
 * 修改[.vscode] extensions.json
 */
function updateExtensions() {
    const extensionsFilePath = '.vscode/extensions.json'
    // 确保目标JSON文件存在，若不存在则创建
    fs.ensureFile(extensionsFilePath).then(() => {
        // 获取原有的目标JSON文件内容
        let extensions = fs.readJsonSync(extensionsFilePath, { throws: false })
        // 若内容不为空则向原有内容中追加
        if (extensions) {
            extensions.recommendations = [...extensions.recommendations, ...PLUGIN]
        } else {
            // 若内容为空则直接写入新内容
            extensions = EXTENSIONS_TEMPLATE
        }
        fs.writeJson(extensionsFilePath, extensions, { spaces: '\t' }, err => {
            if (err) return log.error(err)
            log.success(`${extensionsFilePath}已修改`)
        })
    }).catch(err => {
        throw (err)
    })
}


export default exec
