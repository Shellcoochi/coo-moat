const { Command } = require('commander')
const fs = require('fs-extra')
const semver = require('semver');
const { init } = require('../actions')
const log = require('../../tools/log')
const { getNpmInfo, getNpmSemverVersion } = require('../../tools/utils')

const pkg = require("../package.json");

const program = new Command()

async function main() {
  try {
    // 脚手架执行的准备阶段
   await prepare()
    // 注册命令
    registerCommand()
  } catch (e) {
    log.error(e.message)
  }
}

function registerCommand() {
  program
    .name(pkg.name)
    .usage('<command> [options]')
    .option("-pm, --packageManager <packageManager>", "是否指定包管理工具（默认值：npm）？")
    .version(pkg.version)

  program
    .command('init')
    .action(init)

  //指定全局包管理工具
  program.on("option:packageManager", () => {
    const options = program.opts();
    process.env.CLI_PACKAGE_MANAGER = options.packageManager;
  });

  program.parse(process.argv)
}

/**
 * 脚手架执行的准备阶段，主要包含：
 *  --版本检查
 */
async function prepare() {
 await checkPkgVersion()
}

function checkRoot() {
  const rootCheck = require("root-check");
  rootCheck();
}

/**
 * 脚手架版本检查
 */
async function checkPkgVersion() {
  //1.获取当前版本号和模块名
  const currentVersion = pkg.version;
  const npmName = pkg.name;
  //2.调用npm API，获取所有版本号
  const curPkgInfo = await getNpmInfo('coo-moat')
  const lastVersion = curPkgInfo?.['dist-tags']?.latest ?? currentVersion;
  if (lastVersion && semver.gt(lastVersion, currentVersion)) {
    log.warn(
      "发现新版本",
      `建议手动更新 ${npmName}，当前版本 ${currentVersion}，最新版本 ${lastVersion}`
    );
  }
}

module.exports = main
