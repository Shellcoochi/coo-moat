import { createRequire } from 'module'
import { Command } from 'commander'
import exec from '../exec/index.js'
import log from '../../tools/log/index.js'

const require = createRequire(import.meta.url)
const pkg = require('../../package.json')

const program = new Command()

/**
 * 主函数
 */
function core () {
  try {
    // 脚手架执行的准备阶段
    prepare()
    // 注册命令
    registerCommand()
  } catch (e) {
    log.error(e.message)
  }
}

function registerCommand () {
  program
    .name(Object.keys(pkg.bin)[0])
    .usage('<command> [options]')
    .version(pkg.version)

  program
    .command('init [projectName]')
    .action(exec)

  program.parse(process.argv)
}

/**
 * 脚手架执行的准备阶段，主要包含：
 *  --版本检查
 *  --root降权
 *  --检查用户主目录是否存在
 */
function prepare () {
  checkPkgVersion()
}

/**
 * 脚手架版本检查
 */
function checkPkgVersion () {
  // 1.获取当前版本号和模块名
  const currentVersion = pkg.version
  const npmName = pkg.name
  log.notice('cli', currentVersion)
  // 2.调用npm API，获取所有版本号
  // 3.提取所有版本号，比对那些大于当前版本号
  // 4.获取最新版本号，提醒用户更新到最新版本
}

export default core
