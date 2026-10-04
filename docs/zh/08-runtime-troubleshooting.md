# 运行排障

[English](../en/08-runtime-troubleshooting.md)

| 问题 | 分析与处理 | 参考 |
|---|---|---|
| Node 缺失或版本过低 | 安装 Node.js 22.16 或更高版本，重新启动；不用修改全局 PowerShell 策略 | [Node 下载](https://nodejs.org/en/download) |
| 依赖安装失败 | 检查网络和解压目录写权限，再次确认安装；不要跳过错误 | [npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci) |
| 桌面连接缺失 | 打开并登录 Codex；必要时填写自己的程序与 socket 绝对路径 | [App Server](https://learn.chatgpt.com/docs/app-server) |
| 队列接口不兼容 | 检查部署版 schema；不通过新建聊天冒充原聊天 | [官方队列测试](https://github.com/openai/codex/blob/main/codex-rs/app-server/tests/suite/v2/thread_queue.rs) |
| Slack 验证失败 | 检查 xoxb token、应用安装和工作区；Socket Mode 还需要正确的 xapp token | [Socket Mode](https://docs.slack.dev/tools/bolt-js/concepts/socket-mode/) |
| 身份验证通过但收不到消息 | 邀请机器人加入频道，检查 app_mention、允许用户，并真正提及机器人 | [Slack 事件](https://docs.slack.dev/apis/events-api/) |
| 聊天身份不匹配 | 刷新列表并核对 ID 与名称；改名或分叉后重新绑定 | [App Server](https://learn.chatgpt.com/docs/app-server) |
| PENDING 或 UNKNOWN | 查询已有回合，不重新投递 | [App Server 生命周期](https://learn.chatgpt.com/docs/app-server) |
| 原聊天完成但回传失败 | 通过状态查询或测试结果刷新补发反馈，不重新入队 | [chat.postMessage](https://docs.slack.dev/reference/methods/chat.postMessage/) |
| ALREADY_RUNNING | 使用已有向导，或停止原实例后启动；不要终止所有 Node 进程 | [快速入门](07-quickstart.md) |
| INSTANCE_STALE | 上次进程异常退出。退出本程序所有窗口，打开用户本地应用数据目录下的 CodexSlackBridgeWin，查看 instance.json 的 PID，并在任务管理器确认该进程不存在；只删除 instance.json，再启动。保留配置和投递记录，不要删除整个目录 | [快速开始](07-quickstart.md) |
| 私有目录或 ACL 失败 | 检查当前用户数据目录权限；ACL 失败后不会保存凭据 | [Windows icacls](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/icacls) |
| 中文路径或脚本读取异常 | 使用解压后的路径；启动脚本采用兼容 Windows PowerShell 的编码 | [PowerShell 编码](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_character_encoding) |

握手与协议帧的第三方说明见 [MDN WebSocket 服务器](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers)。资料解释机制，具体结果见测试报告。

首版不安装历史手册中的审批通知 worker、手机审批通知或独立受控执行器。原聊天仍可按自身配置请求批准。ChatGPT Web 在原尝试中未连接成功，本程序只连接 Codex。
