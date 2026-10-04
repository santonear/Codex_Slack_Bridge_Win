# 避坑与排障

[English](../en/03-pitfalls.md)

## 1. 容易误判的结果

| 失败或误解 | 已知原因 / 证据边界 | 正确做法 | 机制资料 |
|---|---|---|---|
| 协作输出像正确 Agent，于是认为原聊天接入 | 角色 prompt 相同，实际是 bridge 独立会话 | 同时核对固定 ID、原聊天消息、最终回复和 Slack 回执 | [App Server](https://learn.chatgpt.com/docs/app-server) |
| AGENT3 通过连接器发送测试信息，但 @AGENT3 无法投递 | 出站连接器与 bot 入站路由独立 | 单独实现并验收 AGENT3 队列路由 | [官方队列测试源码](https://github.com/openai/codex/blob/main/codex-rs/app-server/tests/suite/v2/thread_queue.rs) |
| hooks 提醒成功，被当作 Slack 能反向控制 | hooks 只报告事件 | 分开测通知和指令投递 | [hooks 事件](https://learn.chatgpt.com/docs/hooks) |
| 队列 add 成功就称任务完成 | 队列只确认提交 | 用唯一 marker 查 completed 和 final_answer | [官方队列测试源码](https://github.com/openai/codex/blob/main/codex-rs/app-server/tests/suite/v2/thread_queue.rs) |
| TURN_COMPLETED 就称功能成功 | 回合完成不等于业务验收 | 查回复、文件、测试等真实交付证据 | [官方队列测试源码](https://github.com/openai/codex/blob/main/codex-rs/app-server/tests/suite/v2/thread_queue.rs) |
| 三行角色指令当作一条任务 | parser 按单消息单角色解析 | 每条消息一个角色；拒绝混合正文 | [Slack Socket Mode](https://docs.slack.dev/apis/events-api/using-socket-mode/) |

## 2. 协议与聊天身份

| 症状 | 根因或已知限制 | 修复与停止条件 | 机制资料 |
|---|---|---|---|
| proxy initialize 超时，无返回 | 最初没有完成 WebSocket 握手 | 先 Upgrade，再发送 RPC；分阶段记录超时 | [MDN 握手/帧](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers) |
| 能 read 原 ID，但 notLoaded | 当前连接的独立服务未加载该聊天 | 不能推断桌面没运行或记忆丢失 | [App Server](https://learn.chatgpt.com/docs/app-server) |
| 长历史查询突然断开 | 探针曾限制单响应 1 MB；某次具体原因未完全确定 | 明确报告帧大小与方法；受控调整上限，不能猜根因 | [MDN 握手/帧](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers) |
| RPC -32600，错误信息不足 | 参数或状态多种原因均可导致 | 保留 rpcMethod/rpcCode/rpcDetail，先只读诊断 | [App Server](https://learn.chatgpt.com/docs/app-server) |
| `readOnly` 被拒绝 | 本机接口当时要求 `read-only` | 读取部署版 schema，区分方法字段；不要跨版本照搬 | [App Server](https://learn.chatgpt.com/docs/app-server) |
| `readOnly.access` 被拒绝 | 部署版已采用 permission profile | 用本机原生 schema，避免同时传互斥权限字段 | [App Server](https://learn.chatgpt.com/docs/app-server) |
| 早期 AGENT2 恢复拒绝被归因 paginated | 同时存在参数拼写错误，缺完整错误 | 保留为多候选原因；不转换历史、不重建替代 | [App Server](https://learn.chatgpt.com/docs/app-server) |
| `already has an active writer` | 原聊天被另一连接持有，空闲也可能发生 | 不强杀、不删锁、不抢占；改用已验证 queue 路线 | [官方队列测试源码](https://github.com/openai/codex/blob/main/codex-rs/app-server/tests/suite/v2/thread_queue.rs) |
| 切换聊天后仍 active writer | 界面切换没有释放原连接 | 停止恢复路径；unsubscribe 只能释放自己的连接 | [Windows 路径](https://learn.microsoft.com/en-us/windows/win32/fileio/naming-a-file) |
| queue 查询要求 experimentalApi | 连接未声明实验能力 | initialize 显式 opt-in；仅改探针连接，不扩大权限 | [官方队列测试源码](https://github.com/openai/codex/blob/main/codex-rs/app-server/tests/suite/v2/thread_queue.rs) |

官方当前 App Server 文档说明了 read/resume、权限配置与 paginated 的限制，但不能替代部署版 schema，更不能反推历史错误只有一个原因。[官方协议说明](https://learn.chatgpt.com/docs/app-server)

协议分析依据：[线程读取与恢复](https://learn.chatgpt.com/docs/app-server#read-a-stored-thread-without-resuming)、[权限配置](https://learn.chatgpt.com/docs/app-server#start-or-resume-a-thread)。main 分支源码仅供参考；历史请求必须以 0.160.0 schema 为准。

## 3. 独立测试聊天与桌面显示

- **空聊天创建后马上断开**：曾没有可恢复 rollout；create 成功不证明已持久化。测试时同一连接内创建、发送首轮、确认回复和持久化，记录一次性 claim。
- **source filter 误判**：独立测试 source 是 `vscode`，仅按 appServer 筛选查不到；使用默认/全来源查询后可找到。列表可找到仍不保证桌面侧栏可见。
- **桌面搜索不到独立聊天**：保留“独立服务往返通过，桌面显示未通过”的边界。不要改来源字段、搬历史或新建聊天冒充原 Agent。
- **重复运行一次性测试**：防重放标记拒绝第二次调用是正常保护。读取前次结果，不删除标记强行重试。

这些测试问题的协议参照：[线程 start/resume/list](https://learn.chatgpt.com/docs/app-server)。create、持久化、来源过滤和桌面展示的具体结论来自本机测试，资料页不保证桌面自动同步。

## 4. Windows、PowerShell 和安装路径

| 症状 | 实际原因 | 处理 | 机制资料 |
|---|---|---|---|
| npm.ps1 被执行策略拦截 | PowerShell 默认解析到 .ps1 | 使用 npm.cmd；不放宽全局策略 | [PowerShell 执行策略](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_execution_policies) |
| PS 出现 `>>` | 通常是引号/括号未闭合而等待续行 | Ctrl+C 回正常提示符，再执行一条完整命令 | [PowerShell 解析](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_parsing) |
| 旧会话能读 `<DOCS_REPO_DIR>` 但不能写 | Codex 沙箱未将目录列为 writable root | 在该目录开新聊天并实测；不能靠改 NTFS ACL 解除 | [Codex 权限边界](https://learn.chatgpt.com/docs/app-server#approvals) |
| 119/120，EXEC_PROJECT_CONFIG | 用户目录上级 Codex 配置影响隔离测试 | 移验证副本到独立目录，不跳过安全检查 | [Codex 权限边界](https://learn.chatgpt.com/docs/app-server#approvals) |
| PowerShell 中文脚本解析失败 | Windows PowerShell 读取无 BOM UTF-8 的兼容问题 | 对含中文 .ps1 用兼容编码，并用 powershell.exe 实测解析 | [PowerShell 编码](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_character_encoding) |
| 含中文 JSON 读取失败 | Get-Content 默认编码误读 | 明确 `-Encoding UTF8` | [PowerShell 编码](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_character_encoding) |
| Node JSON.parse 失败 / LOCAL_RUN_FAILED | PowerShell 写 JSON 加了 UTF-8 BOM | 备份后规范为 UTF-8，读取兼容首位 BOM；不重跑任务 | [PowerShell 编码](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_character_encoding) |
| 历史路径超出范围被误报 | Windows 路径含 `\\?\` 前缀 | 规范扩展路径后重做边界校验，不能移除范围保护 | [Windows 路径](https://learn.microsoft.com/en-us/windows/win32/fileio/naming-a-file) |
| AGENT3安装复制失败，路径约 262 字符 | 递归复制旧离线测试生成的 home/session/tmp | 只复制正式测试文件，临时数据在运行时生成 | [Windows 路径](https://learn.microsoft.com/en-us/windows/win32/fileio/naming-a-file) |
| Slack 返回旧帮助菜单 | 未安装，或运行进程未加载新路由 | 查安装记录、源码 hash、守护路径；不继续发测试 | [Windows 路径](https://learn.microsoft.com/en-us/windows/win32/fileio/naming-a-file) |
| 0.2.0 启动健康检查失败 | 旧守护程序只识别 `0.1.` 标记 | 兼容健康协议并明确实际版本；失败自动恢复旧版 | [App Server](https://learn.chatgpt.com/docs/app-server) |

不要将“脚本语法通过”写成“安装成功”，也不要将临时测试 Git 仓库的 `HEAD is now at ... seed` 写成业务项目被重置。需要核对实际工作目录。

## 5. 结果状态的两次误报

**桌面固定测试 FAILED**：之后只读核验确认 completed、预期最终回复、零工具调用和历史保留；当时未记录完整中间数据，无法确定准确触发原因。修复等待逻辑并纠正已有结果，不重发测试消息。

**AGENT1/AGENT2 INTERRUPTED**：诊断发现同一回合随后 completed，说明过早采纳过渡状态。增加终态稳定性检查和状态重新核验。后续仍可能有真的中断；不能把所有 INTERRUPTED 都改成成功。

遇到旧状态异常，优先查看 marker、turnId、状态和 final_answer。错误显示可能来自编码读取、Slack 发送或业务执行，需要查清是哪一步出错。

结果分析参照：[App Server 回合生命周期](https://learn.chatgpt.com/docs/app-server)、[hooks Stop](https://learn.chatgpt.com/docs/hooks#stop)。原聊天队列相关测试可见[官方源码](https://github.com/openai/codex/blob/main/codex-rs/app-server/tests/suite/v2/thread_queue.rs)；FAILED/INTERRUPTED 修复效果来自本机结果重新核验。

## 6. 执行器和审批边界

- workspace-write 和 prompt 都不是精确文件白名单。模型生成修改，本地宿主强制校验，才是本项目采用的受控落盘路线。
- 工具目录曾存在第二处，不能只过滤顶层 tools；SSE 必须完整验证后再交给 SDK。
- TOML 配置、MCP/hooks 继承和 Windows 路径竞态必须检查；历史实现用配置约束和原生句柄加固，不等于通用沙箱证明。
- 全套失败时不安装：0.2.1 候选 130/138 通过不是全绿；不能靠 18/18 新测试宣布生产完成。
- 手机批准的是原 Codex 权限请求；Slack 批准执行的是另一个执行包。直接权限审批候选不具备任意桌面弹窗控制能力。
- claim、结果与 Slack 发送状态持久化分开。发送失败可以补反馈，不能重新调用模型；UNKNOWN/PENDING 先查，不自动重放。

边界资料：[App Server 审批](https://learn.chatgpt.com/docs/app-server#approvals)、[hooks 信任](https://learn.chatgpt.com/docs/hooks#review-and-trust-hooks)、[手机 Remote](https://learn.chatgpt.com/docs/remote-connections)。本地执行器的 claim、SSE 过滤与 Windows 句柄策略来自项目源码及离线证据，不是这些文档承诺的通用白名单能力。

## 7. 排障顺序

1. **输入层**：真正 @机器人了吗？频道是否已加 App？是否一条消息一个角色？
2. **Slack 接收层**：token 类型、scope、Socket Mode、事件订阅和白名单是否正确？
3. **进程层**：实际运行目录和安装 hash 是否对应最新路由？是否重复消费者？
4. **身份层**：固定 ID + 名称是否匹配？target 是 Codex 还是ChatGPT Web？
5. **控制层**：daemon/socket、WebSocket 握手、experimentalApi 是否正常？
6. **队列层**：是否已有消息、旧未确认任务、配额限制？入队 ack 和 marker 是否保存？
7. **执行层**：原聊天是否在线，等待批准、回合中断还是最终回复未就绪？
8. **反馈层**：状态 JSON 编码、稳定终态、Slack 发送错误是否正常？
9. **验收层**：业务成果独立验证；重启/新机迁移分别需要真实往返。

每一步都记录看到的结果和还没确认的原因。不要为了修状态删除原聊天、生产去重记录、锁文件或凭据。
