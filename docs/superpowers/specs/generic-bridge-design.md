# Windows beginner bridge design / Windows 新手通用 Bridge 设计

Status: design for review; runtime implementation has not started.
状态：待审阅设计；运行代码尚未实现。

## Goal and scope / 目标与范围

Deliver reusable runtime code in the public Codex_Slack_Bridge_Win repository. At the next GitHub submission, rename the existing Codex_Slack_Bridge repository and update the local remote and documentation links; retain public visibility. A first-time user downloads and extracts the project, double-clicks a launcher, and follows a local browser wizard to connect Slack to existing Codex desktop chats. Windows is the first supported platform. Both UI and manuals support English and Chinese. No installer, Docker requirement, controlled-write executor, or ChatGPT connection is included in this release.

在公开 Codex_Slack_Bridge_Win 仓库交付通用运行代码。下次向 GitHub 提交时，将现有 Codex_Slack_Bridge 仓库重命名，并同步更新本地远程地址和文档链接，保持公开。首次使用者下载解压后双击启动，通过本地浏览器向导将 Slack 连接到已有 Codex 桌面聊天。首版支持 Windows，界面与手册均为中英双语。首版不包含独立安装程序、Docker 依赖、受控写入执行器或 ChatGPT 连接。

A successful test links a Slack request to the selected existing chat and returns its final reply to the same Slack thread. Saving configuration, authenticating Slack, or observing a completed turn alone does not establish this success. Live verification requires the user's own authorized Slack workspace and logged-in Codex desktop application.

测试通过时，应能确认 Slack 请求进入所选原聊天，最终回复返回同一 Slack 消息线程。保存配置、Slack 身份验证成功、单独看到聊天完成，都不能替代此验收。真实验证需要使用者授权的 Slack 工作区与已登录的 Codex 桌面应用。

## Approach / 实现方式

Use a small Node.js application with Slack Bolt Socket Mode, a local HTTP wizard, and a desktop queue adapter extracted and generalized from the existing bridge. The launcher checks Node availability and shows bilingual installation guidance if absent; it installs pinned project dependencies on explicit first-run action and opens the wizard. It does not silently install Node or authorize accounts. A packaged executable would simplify dependencies but adds packaging and update work; Docker complicates access to the desktop connection. Both are deferred.

采用小型 Node.js 应用，使用 Slack Bolt Socket Mode 和本地 HTTP 向导，并将现有 bridge 的桌面队列适配器改为通用配置。启动入口检查 Node；缺失时显示双语安装指引。首次运行由使用者明确触发安装锁定的项目依赖，并打开向导。不静默安装 Node 或授权账户。独立可执行程序需要额外打包与更新维护；Docker 增加访问桌面连接的复杂度，两者后续再考虑。

## Components / 组件

- Launcher: prerequisite checks, dependency bootstrap, local server startup, browser opening, actionable failures. / 启动入口：环境检查、依赖准备、启动本地服务与浏览器、明确失败处理方法。
- Wizard: bilingual setup steps, validation, route selection, test progress, start/stop and status. / 向导：双语步骤、配置验证、路由选择、测试进度、启动停止与状态。
- Configuration store: versioned local configuration, separate secrets, atomic saves and restrictive Windows ACLs. / 配置存储：版本化本地配置、独立凭据文件、原子保存与限制性 Windows ACL。
- Slack adapter: Socket Mode, workspace/channel/user allowlists, event deduplication, thread replies and token redaction. / Slack 适配器：Socket Mode、工作区频道用户白名单、事件去重、线程回复与凭据脱敏。
- Desktop adapter: discovered or explicitly selected executable/socket paths, protocol negotiation, capability checks, chat listing and queue operations. / 桌面适配器：发现或显式指定程序及连接路径、协议协商、能力检查、聊天列表与队列操作。
- Delivery store: durable request identity, submission state, result correlation and recovery. / 投递存储：持久化请求身份、提交状态、结果关联与恢复。
- Diagnostics: redacted checks and an export preview excluding secrets and chat contents by default. / 诊断：脱敏检查与导出预览，默认排除凭据和聊天正文。

No production bridge files are modified. No project-specific directories, private chat IDs, usernames or custom aliases are embedded. Runtime routes are explicitly bound as AGENT1, AGENT2, etc. Discovery may list chats; runtime access is restricted to the selected chat IDs. The bridge never answers desktop tool or approval requests on the user's behalf.

不修改现有生产 bridge。不内置项目专属目录、私人聊天 ID、用户名或自定义 alias。运行路由显式绑定为 AGENT1、AGENT2 等。配置阶段可以列出聊天；运行阶段仅访问已绑定聊天 ID。Bridge 不代替使用者批准桌面工具或权限请求。

## Setup flow / 配置流程

1. Choose language; check supported Windows/Node versions and writable application data storage. / 选择语言，检查支持的 Windows 与 Node 版本及应用数据目录写权限。
2. Detect Codex desktop connection, confirm login and required queue capabilities; guide corrections without changing the user's Codex configuration. / 检测 Codex 桌面连接、登录与队列能力；给出修复指引，不修改使用者的 Codex 配置。
3. Provide an importable Slack app manifest and official links; guide app creation, Socket Mode, bot installation and inviting the bot to the selected channel. / 提供可导入 Slack App Manifest 与官方链接，引导创建应用、开启 Socket Mode、安装机器人并邀请到所选频道。
4. Enter bot/app tokens locally; verify identity, workspace, channel membership and authorized users; save only after successful validation. / 本地输入 bot/app token，验证身份、工作区、频道成员关系与允许用户，验证成功后保存。
5. Select existing chats and assign unique AGENT aliases; verify chat identity and ability to inspect its queue without submitting a task. / 选择已有聊天并分配唯一 AGENT 代指；检查聊天身份与队列可读性，此步骤不提交任务。
6. Start the bridge; ask the user to send a generated benign test command from Slack. Its nonce requests an exact reply and explicitly forbids tools or file changes. A fresh matching final reply must return to the same Slack thread. / 启动 bridge，让使用者从 Slack 发送生成的无副作用测试命令；命令含随机标记，要求精确回复并明确禁止工具与文件改动。新的匹配最终回复必须回到同一 Slack 线程。
7. Show each stage and the overall result; allow retry only where it cannot duplicate an uncertain submission. Explain that the bridge must remain running. / 展示各阶段及整体结果；只有不会重复不确定提交的阶段才允许重试；说明 bridge 必须保持运行。

The initial release has no automatic Windows login startup. Users can restart by double-clicking the launcher; saved configuration is reused. ChatGPT is documented as not connected in this attempt.

首版不自动设置 Windows 登录启动。使用者再次双击即可复用已保存配置。ChatGPT 明确记录为本次尝试未连接成功。

## Transport, recovery and errors / 传输、恢复与错误

Before enqueueing, persist a unique delivery record. Check route availability, queue state and configured limits. Use a unique client message marker to correlate the submitted turn. Persist enqueue acknowledgement and terminal results before publishing Slack feedback. Do not resume or take ownership of the original desktop chat. Do not delete locks or terminate its writer.

入队前持久化唯一投递记录，检查路由可用性、队列状态与配置限制。使用唯一客户端消息标记关联提交的回合。先持久化入队确认及最终结果，再发送 Slack 反馈。不 resume 或接管原桌面聊天，不删除锁或终止聊天写入进程。

Distinguish queued, running, waiting for desktop approval, completed, interrupted, failed, timed out and unknown submission where the protocol provides evidence. If no approval evidence is available, show waiting with an instruction to inspect Codex, rather than inventing a cause. Timeout and lost acknowledgements never trigger automatic resubmission. Restart reconciles durable records against desktop state; unclear state remains unresolved and blocks duplicate delivery. Slack reply failures retain the result for explicit feedback retry without re-enqueueing.

根据协议返回的信息，显示排队、运行、等待桌面批准、完成、中断、失败、超时或提交状态不明。没有批准证据时显示等待并提示检查 Codex，不猜测原因。超时或确认丢失绝不自动重新提交。重启后将持久化记录与桌面状态核对；状态不清晰时保持未解决并阻止重复投递。Slack 回传失败保留结果，可明确重试回传而不重新入队。

The queue API is version-dependent. Feature-detect required methods and fail with a clear compatibility diagnosis when unavailable. Do not silently fall back to creating another chat or running a separate Codex session.

队列 API 依赖版本。检查必需的接口，缺失时说明兼容性问题。不静默降级为创建新聊天或运行独立 Codex 会话。

## Local security / 本地安全

Bind the wizard to 127.0.0.1, use an unpredictable per-launch session credential, validate Host and Origin, and require authenticated state-changing requests. Do not enable cross-origin access. Never return saved tokens to the browser or include them in logs, exports, Slack replies or git. Store user data outside the downloaded source tree; guard ACL setup failures and explain the corrective step before persisting secrets. No public tunnel or inbound Slack webhook is needed.

向导仅监听 127.0.0.1，使用每次启动随机会话凭据，校验 Host 与 Origin，修改状态的请求必须通过认证。不开放跨域访问。不向浏览器回传已保存 token，不在日志、导出、Slack 回复或 git 中包含 token。使用者数据存放于下载源码目录之外；设置 ACL 失败时先解释修复方法，不继续持久化凭据。不需要公网隧道或 Slack 入站 webhook。

## Verification and deliverables / 验证与交付

Automated checks cover configuration validation, allowlists, authentication/origin checks, secret redaction, protocol framing, capability failures, duplicate events, crash/timeout recovery, final-answer correlation and failed Slack feedback. Browser tests cover both languages and setup error/retry flows using fake adapters. Offline tests do not claim successful real Slack or Codex communication.

自动检查覆盖配置验证、白名单、会话及来源校验、凭据脱敏、协议帧、能力缺失、重复事件、崩溃超时恢复、最终回复关联及 Slack 回传失败。浏览器测试通过模拟适配器验证两种语言与配置错误重试流程。离线测试不宣称真实 Slack 或 Codex 通信成功。

Deliver runtime source, dependency lockfile, Windows launcher, Slack manifest, bilingual quick start and troubleshooting, test instructions and a redacted verification report. Update the existing related-project comparison to distinguish shipped functionality from planned capabilities. Before publishing, check tracked files for private aliases, identifiers, credentials and local artifacts. Record actual live verification separately from automated results and explicitly list any step requiring user account authorization.

交付运行源码、依赖锁文件、Windows 启动入口、Slack Manifest、双语快速入门及排障手册、测试说明与脱敏验证报告。更新已有同类项目对比，区分已交付功能与规划能力。发布前检查 Git 跟踪文件，排除私人 alias、标识、凭据和本地临时文件。分开记录真实通信与自动测试的结果，注明哪些步骤需要账户授权。

## Reference basis / 参考依据

These links explain the underlying mechanisms; they do not establish compatibility of every installed desktop version. / 下列链接解释底层机制，不代表所有已安装桌面版本均兼容。

- [Codex App Server](https://learn.chatgpt.com/docs/app-server): protocol and lifecycle / 协议与生命周期。
- [Official Codex repository](https://github.com/openai/codex): queue implementation and version-specific protocol evidence / 队列实现与版本相关协议证据。
- [Slack Socket Mode](https://docs.slack.dev/apis/events-api/using-socket-mode/): connection and app tokens / 连接与 app token。
- [Slack Bolt Socket Mode](https://docs.slack.dev/tools/bolt-js/concepts/socket-mode/): runtime integration / 运行集成。
- [Slack app manifests](https://docs.slack.dev/app-manifests/): reproducible setup / 可复用配置。
- [MDN WebSocket server guidance](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers): third-party explanation of transport framing / 第三方传输帧说明。
- [PowerShell encoding](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_character_encoding): Windows Unicode pitfalls / Windows Unicode 避坑。

Each implemented troubleshooting entry must link the relevant official documentation and any third-party explanation actually used, and distinguish observed facts from hypotheses. / 每条实际排障记录必须链接相关官方文档与确实采用的第三方解释，并区分观察事实与推测。

## Public identity placeholders / 公开身份占位符

All public examples and shareable diagnostics must mask actual Slack workspace, channel, user, bot and app names/IDs and workspace URLs. Use `<<Slack workspace>>`, `<<Slack channel>>`, `<<Slack user>>`, `<<Slack bot>>`, and `<<Slack app>>`. Required local runtime configuration retains actual values privately; documentation never publishes them. Official Slack documentation URLs and API field names remain intact.

全部公开示例与可分享诊断必须隐藏真实 Slack 工作区、频道、用户、机器人及应用名称/ID和工作区链接，使用 `<<Slack工作组>>`、`<<Slack频道>>`、`<<Slack用户>>`、`<<Slack机器人>>`、`<<Slack应用>>`。运行所需的真实配置仅保留在本机私有数据中，不公开发布。官方 Slack 文档链接和 API 字段名保留。
