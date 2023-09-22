/** 环境变量 */
const ENV = {
  /** 包管理工具 */
  PACKAGEMANAGER: "packagemanager",
  /** 是否是GIT仓库目录 */
  ISGITREPOSITORY: "isGitRepository",
  /** 当前项目是否已经存在lint相关工具 */
  EXCLUDEDEPENDENCIES: [],
};

/** 在lint相关工具 */
const DEPENDENCIES = [
  "eslint",
  "husky",
  "@commitlint/config-conventional",
  "@commitlint/cli",
  "lint-staged",
];

/** 包管理工具 */
const PACKAGEMANAGER = {
  NAME: ENV.PACKAGEMANAGER,
  CHOICES: ["npm", "pnpm", "yarn"],
  DEFAULT: "npm",
};

module.exports = { ENV, DEPENDENCIES, PACKAGEMANAGER };
