import fs from 'fs-extra'
import { exec as spawn, execAsync } from '../../tools/utils/index.js'
import log from '../../tools/log/index.js'

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
        //   const cmdObj = arguments[arguments.length - 1]
        //   console.log(cmdObj.name())
        // eslint初始化
        // initEslint()
        updateVscodeConfig()
        updateIgnoreFile()
    } catch (e) {
        log.error(e)
    }

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
        throw (data)
    })
    installEslint.on('close', function (code) {
        if (code !== 0) {
            throw ('ESLint依赖安装出错: ' + code)
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

export default exec
