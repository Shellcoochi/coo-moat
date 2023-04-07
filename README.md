# 前端规范脚手架


此工具可一键配置前端工程规范，包括：编码规范、提交规范。意在解解放前端工程繁琐的规范配置，保持项目规范统一。

工具会自动初始化，eslint配置、husky配置、commitlint配置、lint-stage配置。
注：
	- 初始化后的配置仅包含基础配置，如需扩展可自行添加配置即可
	- 初始化时若部分配置文件已存在，则会追加配置
## 用法

*安装*
```javascript
npm install coo-moat --global
```
*在前端项目根目录下执行*
```javascript
npm run coo init
```
