import log from 'npmlog'

log.level = 'info'
log.heading = 'coo'// 修改log前缀
log.addLevel('success', 2000, { fg: 'green', bold: true })// 添加自定义命令

export default log
