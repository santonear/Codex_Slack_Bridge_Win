# Windows 快速入门

[English](../en/07-quickstart.md)

## 准备

需要 Windows、Node.js 22.16 或更高版本、已登录的 Codex 桌面应用，以及有应用安装权限的 Slack 工作区。电脑需保持在线。首版没有登录自启动或独立安装程序。

首次使用建议创建专用 Slack 应用，不要让新旧 bridge 同时接收同一个机器人的消息。

## 启动

下载仓库 ZIP 并解压，双击根目录的 Start-Bridge.cmd。缺少 Node 时按[官方下载页](https://nodejs.org/en/download)安装，再重新启动。首次准备依赖时输入 y 确认安装，需要联网。

浏览器会打开本地向导，地址只监听 127.0.0.1。不要分享带会话凭据的完整地址。

## 配置与测试

1. 检查 Windows、Node 和私有存储。
2. 打开并登录 Codex，点击“检查并列出聊天”。本步骤只读，不发送任务。接口不兼容时不会创建替代聊天。
3. 下载 Manifest，在 [Slack 应用管理](https://api.slack.com/apps)导入。开启 Socket Mode，创建带 connections:write 的 App-level token，安装到工作区，并邀请机器人加入目标频道。
4. 填写 xoxb Bot token、xapp App token、工作区 ID、频道 ID 和允许用户 ID。多个用户用逗号分隔，显示名不能代替 ID。验证身份不代表频道接收已通过。
5. 为 AGENT1、AGENT2 等选择已有聊天，确认名称。也可手动填写 ID 和名称，每个聊天只能绑定一次。
6. 保存配置。保存时重新检查 Slack 身份和桌面聊天，通过后点击“启动 Bridge”。
7. 选择 Agent，生成测试指令。在 Slack 输入 @，从候选列表选择自己的机器人，再粘贴生成的指令，发送到配置的频道。

测试需确认收到 Slack 消息、原聊天入队、最终回复匹配、未使用工具和 Slack 回传，才显示通过。保存配置不能替代往返测试。

## 找到 Slack ID

在浏览器打开自己的工作区，地址通常形如 https://app.slack.com/client/TEAM_ID/CHANNEL_ID。/client/ 后以 T 开头的一段是工作区 ID；不要使用以 E 开头的组织 ID。频道 ID 可从频道详情复制。打开自己的成员资料，在“更多”菜单选择“复制成员 ID”，填入允许用户列表。其他允许成员也按同样方法复制。

参考：[Slack 工作区 URL 和 ID](https://slack.com/intl/en-gb/help/articles/221769328-Locate-your-Slack-URL-or-ID)、[成员 ID](https://slack.com/intl/en-gb/help/articles/360003827751-Create-a-link-to-a-members-profile-)。

## 日常使用

真正提及机器人后，发送 AGENT1：你的任务，或 AGENT1：状态。新程序也接受英文 status。一条消息只发给一个 Agent。原聊天沿用现有权限，权限申请仍需在 Codex 中处理，bridge 不代批。

默认每日共享额度为 30 次，默认等待 90 秒。超时后保留待确认状态，查询“状态”而不是重新发任务。向导“刷新结果”也会核对当前测试，确认最终回复后可补发反馈，不重新入队。

依赖准备完成后，启动窗口自动关闭，服务在后台运行，浏览器打开配置向导。“停止 Bridge”会停止 Slack 接收，向导仍可编辑配置。再次双击可复用配置，不自动重放旧任务。

## 本地数据

配置、token 和投递记录位于 Windows 用户应用数据目录下的 CodexSlackBridgeWin，使用限制访问的 Windows ACL，放在源码目录之外。已保存 token 不回显，留空时沿用旧值。

诊断报告先预览再下载，排除聊天正文、凭据、真实路径和身份信息。不要上传完整本地数据目录。

[运行排障](08-runtime-troubleshooting.md) · [Slack Manifest](https://docs.slack.dev/app-manifests/) · [Socket Mode](https://docs.slack.dev/tools/bolt-js/concepts/socket-mode/) · [Codex App Server](https://learn.chatgpt.com/docs/app-server)

长回复按段回传，补发时跳过已确认的段。若最后一段发送结果不确定，状态查询会提示。确认接受可能重复最后一段后，发送 AGENT1：补发回复；它不会重新投递任务。每日额度按 UTC 自然日计数。
