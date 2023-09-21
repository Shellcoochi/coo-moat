const ENV = {
  /** 包管理工具 */
  PACKAGEMANAGER: "packagemanager",
  /** 是否是GIT仓库目录 */
  ISGITREPOSITORY: "isGitRepository",
};

const PACKAGEMANAGER = {
  NAME: ENV.PACKAGEMANAGER,
  CHOICES: ["npm", "pnpm", "yarn"],
  DEFAULT: "npm",
};

module.exports = { ENV, PACKAGEMANAGER };
