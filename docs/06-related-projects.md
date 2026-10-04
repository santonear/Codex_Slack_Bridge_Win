# 公开类似项目：相同点与区别

[English](en/06-related-projects.md) · 检索日期：2026-10-05，北京时间。

## 1. 检索范围和结论

**已有公开实现，Slack → 本地 Codex 不是本项目独有的能力。** 找到四个直接相关 Slack bridge，以及三个通知/其他聊天平台/工作流相关项目。

检索覆盖公开网络索引及 GitHub、GitLab、Gitee、Codeberg、Bitbucket 的域名限定查询。实际打开项目 README、项目文档和部分源文件；没有安装或运行第三方项目，也没有完整安全审计。下表的第三方能力是作者文档描述，不能写成在本机实测通过。

本仓库公开的是双语经验和手册；“本项目实现”指此前旧机已部署并有证据的方案，**不表示本仓库提供可运行 bridge**。比较时要区分功能相似与发布完整度。

## 2. 直接相关 Slack 项目

| 项目与来源 | 与本项目相同点 | 主要区别 |
|---|---|---|
| [BHSDuncan/codex-slack-bridge](https://github.com/BHSDuncan/codex-slack-bridge) | 本地 Codex、Socket Mode、用户/频道限制、线程映射、最终回复和审批提示 | 提供 `/codex` new/resume/attach 与 Slack 审批；终端自有回合审批仅通知，需终端处理。文档主要部署 macOS launchd。本项目在 Windows 用原桌面队列投递，审批由手机处理，不接管原 writer |
| [earonesty/codex-slack](https://github.com/earonesty/codex-slack) | 原生会话、持久化、去重、不确定投递不自动重放、状态和回复 | 频道绑定项目，Slack 线程绑定会话；提供保存聊天发现、审批按钮和问题表单。README 明确不附着正在运行的终端或远程 app-server；`!thread` 经 bridge 自己的连接恢复保存聊天。本项目走原桌面队列，由原连接执行 |
| [Innei/slack-codex-broker](https://github.com/Innei/slack-codex-broker) | Socket Mode、app-server、Slack 线程继续同一 Codex 会话、工作区隔离 | 每个 Slack 线程 start/resume 一份 broker 会话，普通回复继续；支持历史回填和可选附件。偏容器/多仓库。不是本文实测的 Windows 原桌面固定角色 queue 路线 |
| [josephbartlett/codex-relay](https://github.com/josephbartlett/codex-relay) | Slack 发布任务、只读规划、明确批准、worktree 隔离、审计、状态反馈 | 当前执行适配器是 `codex exec --json`；批准后 workspace-write，并提供 PR/可选邮件流程。本项目 Executor 采用结构化修改由宿主校验落盘；原聊天队列又是另一条路线。该项目不把任意正在运行终端的接管列为当前已完成能力 |

源文件抽查：[codex-slack Agent 接口](https://github.com/earonesty/codex-slack/blob/main/src/agent.ts) 定义 create/resume/input/response 等能力；[Relay ExecAdapter](https://github.com/josephbartlett/codex-relay/blob/main/apps/orchestrator/src/runner/ExecAdapter.ts) 通过子进程运行 Codex，使用显式 workspace 和环境变量允许列表。抽查不能代替全仓库审计。

## 3. 相邻能力项目

| 项目与来源 | 相同点 | 主要区别 |
|---|---|---|
| [yhdesai/codex-toolbox](https://github.com/yhdesai/codex-toolbox) | 原 Codex thread 映射、消息镜像、回复返回同 thread、权限按钮、用户限制 | 当前文档主接 Telegram/Discord，CLI 事件不足时轮询 JSONL；不是 Slack bridge。本项目专注 Slack、Windows 原桌面队列和手机审批 |
| [Wangmerlyn/coding-agent-notifier](https://github.com/Wangmerlyn/coding-agent-notifier) | hooks 后把完成提醒发到 Slack；支持 Codex | 是通知组件，Slack DM/飞书通知与多个 CLI 集成；不把通知组件当作本文的反向任务队列。旧 Codex-Slack-Notifier 链接已重定向。可参考其[集成说明](https://github.com/Wangmerlyn/coding-agent-notifier/blob/main/docs/integrations.md) |
| [Yeachan-Heo/oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex) | Codex hooks、Slack 通知、角色协作、工作流状态 | 是更广的 CLI 工作流层；[通知/回复注入文档](https://oh-my-codex.dev/docs.html#notifications) 描述 Slack 通知及基于 tmux 的 reply injection。原生 Windows/Codex App 非推荐默认路径。与本项目 app-server 原桌面 queue 不同 |

## 4. 平台检查结果

| 平台 | 本次观察 | 结论边界 |
|---|---|---|
| GitHub | 实际打开上述七项目及部分源文件 | 已证实存在直接/相邻实现；没有声称穷尽全部仓库 |
| Gitee | 打开 [oh-my-codex 副本](https://gitee.com/ai-large-model-tool/oh-my-codex/blob/main/README.zh.md?skip_mobile=true)，页面标注 fork，上游另核对 | 是相关项目副本，不作为独立创新实现计数；可能落后上游 |
| GitLab | 域名查询和公开 topic 页出现 Telegram bridge、Slack MCP 等相邻结果 | 本轮未核验到可列为同范围的独立 Slack→Codex 原桌面队列实现；不等于没有 |
| Codeberg | 查询访问受 robots.txt 限制 | 覆盖不完整，不能据此断言不存在 |
| Bitbucket | 公开索引查询未提供可核验的直接对应项目 | 非平台完整扫描，结果有限 |

部分 GitHub src 目录页获取失败，但上述两份 raw 源文件可读取；其余功能判断来自实际读取的 README/项目文档。搜索片段或镜像不作为关键功能的唯一证据。

## 5. 本项目实际差异和缺口

本项目值得保留的经验组合是：**Windows 原桌面固定聊天身份 → 外部 queue/add → 原 writer 处理 → marker 核对回合和 final_answer → Slack 回执**，以及独立 hooks worker、手机审批、受控执行器、失败后的不重放和 Windows 编码/路径处理。这是已观察的组合，不宣称业内唯一。

现阶段公开项目在通用会话发现、动态绑定、交互审批、附件、容器部署、PR 流程等方面提供更完整的可运行产品。本仓库仍是文档，没有发布脱敏后的通用运行代码；重启、新机迁移、真实模型 Executor 等验收也没有补齐。

“未在对方文档中证实原桌面 queue 路线”不等于“对方绝不支持”。只有进一步核对部署版本、核心源码和真实运行，才能判断某个项目能否替换旧机方案。

## 6. 可借鉴但本轮未实施的内容

- codex-slack-bridge：会话发现、attach/detach 和交互审批界面。
- codex-slack：SQLite journal、去重、uncertain 状态及投递恢复设计。
- slack-codex-broker：Slack 历史回填和中立 session workspace。
- codex-relay：任务包、审计、worktree 与 PR 交付流程。
- notifier/OMX：事件通知模板和多渠道适配。

这些是后续比较线索，不是已安装组件，也不修改本项目原有审批、权限与部署约束。
