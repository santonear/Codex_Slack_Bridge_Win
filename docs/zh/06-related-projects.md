# 公开类似项目：相同点与区别

[English](../en/06-related-projects.md)

## 1. 检索范围和结论

Slack → 本地 Codex 已有多个公开实现，也有提供通知、其他消息平台和工作流的相关项目。

功能对比依据各项目的 README、文档和部分源码，未经过本地运行验证或完整安全审计。

表中的“本项目”主要指有历史记录支持的旧版部署。当前仓库也提供 Windows 运行代码和中英配置向导；历史部署中的手机审批通知和独立 Executor 不包含在本版内。功能相似不等于部署方式或验证范围相同。

## 2. 直接相关 Slack 项目

| 项目与来源 | 与本项目相同点 | 主要区别 |
|---|---|---|
| [BHSDuncan/codex-slack-bridge](https://github.com/BHSDuncan/codex-slack-bridge) | 本地 Codex、Socket Mode、用户/频道限制、线程映射、最终回复和审批提示 | 提供 `/codex` new/resume/attach 与 Slack 审批；终端自有回合审批仅通知，需终端处理。文档主要部署 macOS launchd。本项目在 Windows 用原桌面队列投递，审批由手机处理，不接管原 writer |
| [earonesty/codex-slack](https://github.com/earonesty/codex-slack) | 原生会话、持久化、去重、不确定投递不自动重放、状态和回复 | 频道绑定项目，Slack 线程绑定会话；提供保存聊天发现、审批按钮和问题表单。README 明确不附着正在运行的终端或远程 app-server；`!thread` 经 bridge 自己的连接恢复保存聊天。本项目走原桌面队列，由原连接执行 |
| [Innei/slack-codex-broker](https://github.com/Innei/slack-codex-broker) | Socket Mode、app-server、Slack 线程继续同一 Codex 会话、工作区隔离 | 每个 Slack 线程 start/resume 一份 broker 会话，普通回复继续；支持历史回填和可选附件。偏容器/多仓库。不是本文实测的 Windows 原桌面固定角色 queue 路线 |
| [josephbartlett/codex-relay](https://github.com/josephbartlett/codex-relay) | Slack 发布任务、只读规划、明确批准、worktree 隔离、审计、状态反馈 | 当前执行适配器是 `codex exec --json`；批准后 workspace-write，并提供 PR/可选邮件流程。本项目 Executor 采用结构化修改由宿主校验落盘；原聊天队列又是另一条路线。该项目不把任意正在运行终端的接管列为当前已完成能力 |

源文件抽查：[codex-slack Agent 接口](https://github.com/earonesty/codex-slack/blob/main/src/agent.ts) 定义 create/resume/input/response 等能力；[Relay ExecAdapter](https://github.com/josephbartlett/codex-relay/blob/main/apps/orchestrator/src/runner/ExecAdapter.ts) 通过子进程运行 Codex，使用显式 workspace 和环境变量允许列表。抽查不能代替全仓库审计。

### 与当前运行程序直接比较

本版采用 Windows 原桌面聊天队列、固定 AGENT 绑定、中英浏览器向导和持久化投递记录。下面这些项目也已公开代码，功能有交集，运行方式并不相同。

| 项目与来源 | 相同点 | 与本版的区别 |
|---|---|---|
| [hyungchulc/codex-debug-bridge](https://github.com/hyungchulc/codex-debug-bridge) | 消息进入已有 Codex App 任务、匹配结果回传、固定身份和会话、保留审批约束 | 使用 macOS Codex App 的 Chromium 调试接口，Slack 经 HTTP webhook，需要 HTTPS 回调；还包含私人指令文件和记忆路由。本版使用 Windows app-server queue 与 Socket Mode，不安装这些组件 |
| [panzhang83/codex-slack](https://github.com/panzhang83/codex-slack) | Socket Mode、用户限制、已有会话绑定、观察对话和最终回复 | Python SDK 区分 observe/control；接管后 resume 会话，支持附件和交互输入。本版投递到原桌面队列，由原连接执行，不接管回合 |
| [shekit/openbridge](https://github.com/shekit/openbridge) | Slack 控制本地 Codex、频道和会话映射、配置向导 | 支持 Claude Code/Codex CLI、Discord、项目切换和定时任务，可在笔记本或 VPS 运行。本版只面向 Windows 上已有 Codex 桌面聊天，使用本地浏览器配置 |
| [nordbyte/nordrelay](https://github.com/nordbyte/nordrelay) | Codex/Slack 连接、本地 WebUI、队列和访问限制 | 提供多后端、多消息平台、用户/群组权限、文件/语音和多主机控制。本版只配置一个 Slack 工作区及频道；未在其 README 中核实与本版相同的 Windows 原桌面队列路线 |

这些对照来自各项目公开说明，没有安装验证。不能把“未说明同一路线”写成“不支持”，也不能据此判断本方案独有。

## 3. 相关项目

| 项目与来源 | 相同点 | 主要区别 |
|---|---|---|
| [yhdesai/codex-toolbox](https://github.com/yhdesai/codex-toolbox) | 原 Codex thread 映射、消息镜像、回复返回同 thread、权限按钮、用户限制 | 当前文档主接 Telegram/Discord，CLI 事件不足时轮询 JSONL；不是 Slack bridge。本项目专注 Slack、Windows 原桌面队列和手机审批 |
| [Wangmerlyn/coding-agent-notifier](https://github.com/Wangmerlyn/coding-agent-notifier) | hooks 后把完成提醒发到 Slack；支持 Codex | 是通知组件，Slack DM/飞书通知与多个 CLI 集成；不把通知组件当作本文的反向任务队列。旧 Codex-Slack-Notifier 链接已重定向。可参考其[集成说明](https://github.com/Wangmerlyn/coding-agent-notifier/blob/main/docs/integrations.md) |
| [Yeachan-Heo/oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex) | Codex hooks、Slack 通知、角色协作、工作流状态 | 是更广的 CLI 工作流层；[通知/回复注入文档](https://oh-my-codex.dev/docs.html#notifications) 描述 Slack 通知及基于 tmux 的 reply injection。原生 Windows/Codex App 非推荐默认路径。与本项目 app-server 原桌面 queue 不同 |

## 4. 本项目的做法与未完成事项

本项目在 Windows 上按固定 ID 向原桌面聊天的队列提交任务，由原 writer 处理，再用 marker 核对回合和 final_answer，将回复发回 Slack。还验证过独立 hooks worker、手机审批和离线受控执行器，并处理了失败后重复提交、Windows 编码和路径问题。这些结果来自已有测试，不能据此认定方案独有。

其他公开项目已提供会话发现、动态绑定、交互审批、附件、容器部署或 PR 流程等运行代码。本版提供固定聊天绑定、队列投递、持久化记录和最终回传，仍未完成真实 Slack 往返、重启和新电脑的验收；独立 Executor 不在本版范围内。

对方文档未说明原桌面 queue 路线时，只能记为尚未确认。能否替换现有方案，还需检查具体版本、核心源码并实际测试。
