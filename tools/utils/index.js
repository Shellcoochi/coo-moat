const childProcess = require("child_process");
const cliSpinner = require("cli-spinner");
const axios = require("axios");
const urlJoin = require("url-join");
const semver = require("semver");
const fs = require("fs-extra");

/** 检查当前目录是否包含 .git 目录 */
function isGitRepository() {
  return fs.existsSync(".git") && fs.statSync(".git").isDirectory();
}

function getNpmInfo(npmName) {
  if (!npmName) {
    return null;
  }
  const registryUrl = "https://registry.npmJs.org";
  const npmUrl = urlJoin(registryUrl, npmName);
  return axios
    .get(npmUrl)
    .then((response) => {
      if (response.status === 200) {
        return response.data;
      }
      return null;
    })
    .catch((err) => Promise.reject(err));
}

function getNpmSemverVersions(baseVersion, versions) {
  return versions
    .filter((version) => semver.satisfies(version, `^${baseVersion}`))
    .sort((a, b) => (semver.gt(b, a) ? 1 : -1));
}

function exec(command, args, options) {
  const win32 = process.platform === "win32";

  const cmd = win32 ? "cmd" : command;
  const cmdArs = win32 ? ["/c"].concat(command, args) : args;
  return childProcess.spawn(cmd, cmdArs, options || {});
}

function execAsync(command, args, options) {
  return new Promise((resolve, reject) => {
    const p = exec(command, args, options);
    p.on("error", (e) => {
      reject(e);
    });
    p.on("exit", (c) => {
      resolve(c);
    });
  });
}

function isObject(o) {
  return Object.prototype.toString.call(o) === "[object Object]";
}

function spinnerStart(msg, setSpinnerString = "|/-\\") {
  const Spinner = cliSpinner.Spinner;

  const spinner = new Spinner(msg + " %s");
  spinner.setSpinnerString(setSpinnerString);
  spinner.start();
  return spinner;
}

function sleep(timeout = 1000) {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}

module.exports = {
  isGitRepository,
  isObject,
  spinnerStart,
  sleep,
  exec,
  execAsync,
  getNpmInfo,
  getNpmSemverVersions,
};
