import { exec as spawn, execAsync } from '../../tools/utils/index.js'
import log from '../../tools/log/index.js'

const PREFIX = 'pnpm'
function exec() {
    //   const cmdObj = arguments[arguments.length - 1]
    //   console.log(cmdObj.name())
    // eslint初始化
    initEslint()
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

export default exec
