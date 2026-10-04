# Codex_Slack_Bridge_Win

**[English](#english) | [中文](#中文)**

## 中文

Slack → Windows 本地 Codex bridge 的设计复盘、部署步骤和避坑手册。

公开文档中的 Slack 工作区、频道、用户和机器人均使用占位符：`<<Slack工作组>>`、`<<Slack频道>>`、`<<Slack用户>>`、`<<Slack机器人>>`。机器人提及示例须在 Slack 中选择自己的真实机器人，不能直接照发占位符。

来源：原聊天 `THREAD_ID_AGENT3`、现有 bridge 源码和安装记录。

## 阅读顺序

1. [全过程：目标、架构、演进与验收](docs/zh/01-process.md)
2. [步骤：安装、日常使用、重启和迁移](docs/zh/02-runbook.md)
3. [避坑：失败尝试、原因、处理和排障顺序](docs/zh/03-pitfalls.md)
4. [证据范围与待完成事项](docs/zh/04-evidence.md)
5. [官方文档与第三方知识库索引](docs/zh/05-references.md)
6. [公开类似项目及功能比较](docs/zh/06-related-projects.md)

角色名称已匿名化为 AGENT1/AGENT2/AGENT3；部署命令为模板，需映射到自己的实际配置。

## 已验证的功能

- Slack 指令能进入原「AGENT1」「AGENT2」「AGENT3」Codex 聊天；原聊天回复可返回 Slack。
- 原聊天需要审批时，Slack 发提醒；用户在手机批准，回合结束后 Slack 发简报。原聊天中的通信和手机审批已在历史联调中验证。
- 桥接自建的产品 → AGENT2 → AGENT1只读协作仍是另一条链路。
- 0.2.0 的受控执行器在离线模拟中验证过审批、防重放及独立 worktree 落盘。

## 尚未完成

- 本次尝试未能成功与 ChatGPT 原聊天连接。
- 0.2.1 Slack 直接权限审批只是候选包，未通过全部回归、未安装；不能批准任意桌面权限弹窗。
- 用户登录后的自启动登记和检查曾通过，真正重启后的通信验收尚未完成；新电脑迁移也未实测。

本仓库目前只有 Markdown 文档，尚未发布运行代码或一键安装程序，也不包含密钥、认证数据和原始聊天记录。部署时需要已有 bridge 源码和安装产物。早期文档中的“尚未接入”要结合后续队列测试结果阅读。

## English

This guide records how the Slack → Windows local Codex bridge was built, deployed and tested, including failed attempts and fixes.

Slack workspace, channel, user and bot identities use placeholders: `<<Slack workspace>>`, `<<Slack channel>>`, `<<Slack user>>`, `<<Slack bot>>`. Select your actual bot in Slack instead of sending the placeholder literally.

1. [Complete process and architecture](docs/en/01-process.md)
2. [Setup, daily use, reboot, and migration](docs/en/02-runbook.md)
3. [Pitfalls: problems, analysis, and resolution attempts](docs/en/03-pitfalls.md)
4. [Evidence and outstanding acceptance](docs/en/04-evidence.md)
5. [Official documentation and third-party references](docs/en/05-references.md)
6. [Public related projects and comparison](docs/en/06-related-projects.md)

Roles and thread IDs are anonymized as AGENT1/AGENT2/AGENT3 and THREAD_ID_AGENTn. Command examples are templates; map them to your actual deployment.

Historical tests verified submissions into the original Codex chats, original-chat responses, and approval reminders followed by mobile approval and Slack summaries. Bridge-owned read-only collaboration and the offline controlled executor are separate capabilities.

The original ChatGPT connection attempt was unsuccessful. Direct Slack permission approval remained an uninstalled candidate. Actual reboot recovery and new-machine migration remain untested.

This public repository contains documentation only. It does not publish bridge runtime source, credentials, authentication data, raw conversations, or a one-click installer. Read historical “not connected” conclusions in chronological context; later original-thread queue tests changed that outcome.
