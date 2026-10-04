# 问题分析和解决尝试的资料索引

[English](en/05-references.md)

外部链接用于解释机制；“本机是否成功”仍以日志、源码和真实验收为准。原聊天明确引用的资料与本轮补充核验分开标注，不虚构失败尝试当时曾读过某第三方文章。

## 历史引用、且本轮重新访问

| 来源与内容链接 | 用于分析什么 | 采取的尝试 / 适用范围 |
|---|---|---|
| [OpenAI App Server](https://learn.chatgpt.com/docs/app-server) | 线程读取、恢复、审批和连接能力 | 分清 read 与 resume；不把独立服务读历史当作桌面控制 |
| [OpenAI 审批协议](https://learn.chatgpt.com/docs/app-server#approvals) | 请求批准与当前连接的关系 | 0.2.1 候选只回传自有请求，不能代替任意桌面弹窗 |
| [OpenAI hooks](https://learn.chatgpt.com/docs/hooks) | 生命周期事件与通知触发点 | 使用六类事件发提醒；不返回批准决定 |
| [hooks 信任](https://learn.chatgpt.com/docs/hooks#review-and-trust-hooks) | 安装后不触发的原因 | 审阅与信任，不能只看 worker READY |
| [hooks Stop](https://learn.chatgpt.com/docs/hooks#stop) | 回合结束信号的边界 | 摘录最终答复，但不把 Stop 当业务成功 |
| [OpenAI Remote](https://learn.chatgpt.com/docs/remote-connections) | 手机向原聊天发消息和审批 | 配对同账户/工作区，主机在线；独立验证手机批准和 Slack 通知 |
| [微软 Run/RunOnce](https://learn.microsoft.com/en-us/windows/win32/setupapi/run-and-runonce-registry-keys) | Windows 用户登录启动 | 核对 HKCU 启动登记；登记通过不算真实重启验收 |
| [第三方项目 Desktop Commander 设置](https://github.com/desktop-commander/remote-desktop-commander/blob/main/docs/SETUP.md) | 旧方案的远程维护部署 | 仅为可选维护通道，不是 Slack 原聊天队列必需依赖；历史 ops 文档含此引用 |

## 本轮补充核验的官方资料和第三方知识库

| 来源与内容链接 | 内容要点 | 对应问题 |
|---|---|---|
| [Slack Socket Mode](https://docs.slack.dev/apis/events-api/using-socket-mode/) | 主动 WebSocket、app-level token、事件订阅 | Bot 安装、xapp/xoxb 区分、无需公网接收端点 |
| [OpenAI 官方队列测试源码](https://github.com/openai/codex/blob/main/codex-rs/app-server/tests/suite/v2/thread_queue.rs) | queue/list、add 等调用与测试 | 为队列路线提供源码参考；main 随时变化，不替代旧版本 schema |
| [MDN：WebSocket 服务器](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers) | Upgrade、101、Sec-WebSocket-Accept、掩码帧、ping/pong、分片 | 解释 proxy 直接发送 JSON 后无响应，以及握手/帧处理应先验证 |
| [微软 PowerShell 字符编码](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_character_encoding) | Windows PowerShell 和现代 PowerShell 的 UTF-8/BOM 行为差异 | 中文 .ps1 解析、Get-Content UTF8、Node JSON BOM 兼容 |
| [微软 Windows 文件路径](https://learn.microsoft.com/en-us/windows/win32/fileio/naming-a-file) | 路径命名空间、扩展路径前缀与长度 | `\\?\` 范围误判、复制临时测试长路径失败 |

MDN 是本轮实际打开的第三方知识库。没有证据表明历史失败尝试曾引用 Stack Overflow 等社区帖子，因此不补写“当时参考过”的记录。源码与资料说明只作简短归纳，完整内容请访问链接。

## 资料不能替代的本地结论

- `paginated`、参数拼写和 active writer 是不同条件，不能用一段通用文档替所有 RPC 错误定性。
- 此机 original thread queue 实测成功，不能保证别的版本、机器或普通 ChatGPT 聊天有相同接口。
- UNKNOWN/FAILED 可能在执行、读取或反馈任一层发生；状态 JSON、marker 和原回合需要共同核验。
- 测试统计、hash 备份、worktree 未变化和安装成功都属于项目证据，外部知识库不能替它们出具验收。
