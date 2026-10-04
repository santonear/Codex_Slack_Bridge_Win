# Runtime verification / 运行程序验证

The runtime uses the existing Codex desktop chat queue on Windows. Automated tests replace Slack and Codex with test fixtures; they do not prove a live connection.

运行程序通过 Windows 上已有 Codex 桌面聊天的队列投递。自动测试使用 Slack 和 Codex 测试替身，不能证明真实服务已联通。

| Check / 检查 | Result / 结果 |
| --- | --- |
| Configuration, durable delivery, duplicate prevention, uncertain submissions, final feedback / 配置、持久化、防重投、不确定投递、最终回传 | Covered by automated tests / 自动测试覆盖 |
| Local API session, Host/Origin restrictions, Chinese input, diagnostic redaction / 本地 API 会话、Host/Origin 限制、中文输入、诊断脱敏 | Covered by automated tests / 自动测试覆盖 |
| Chinese and English browser setup, failed credential retry, simulated round trip, narrow screen / 中英浏览器配置、凭据失败重试、模拟往返、窄屏 | Browser test / 浏览器测试 |
| Windows private storage, local page, duplicate application launch / Windows 私有目录、本地页面、防重复启动 | Checked locally in an isolated data directory / 已在隔离数据目录检查 |
| Existing desktop connection, signed-in account, queue schema, chat listing / 已有桌面连接、登录状态、队列协议、聊天列表 | Read-only local probe passed; no task submitted / 本机只读检查通过，未投递任务 |
| Live Slack → original chat → Slack / 真实 Slack → 原聊天 → Slack | Not yet verified for this runtime / 本版尚未验证 |
| Reboot recovery and a new computer / 重启恢复和新电脑 | Not yet verified / 尚未验证 |

To verify a real round trip, follow the quick start and send the generated communication test in your own Slack channel. The wizard passes only after the matching request, final answer, no-tool check and successful Slack feedback.

验证真实往返时，按快速开始文档在自己的 Slack 频道发送生成的通信测试。向导只有在请求匹配、最终回复确认、未使用工具且 Slack 回传成功后，才显示通过。

The read-only probe used installed Codex 0.160.0. Other versions must pass the same login and experimental queue-schema checks. The final automated run passed 43 tests and one Chromium browser workflow; three configuration checks also run through the storage test import.

本机只读检查使用已安装的 Codex 0.160.0。其他版本也需通过登录和实验队列协议检查。最终自动测试通过 43 项及一个 Chromium 浏览器流程，其中三项配置检查也由存储测试导入执行。
