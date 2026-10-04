# Codex_Slack_Bridge_Win

Less chair time, more life time. This human was made to roam—not to become a desktop accessory.

**[English](#english) | [中文](#中文)**

## 中文

在 Slack 中向 Windows 本机已有的 Codex 桌面聊天发送任务，并把最终回复带回原 Slack 线程。AGENT1、AGENT2 等名称对应你在向导中选择的聊天。

下载仓库 ZIP 并解压，安装 Node.js 22.16 或更高版本，登录并打开 Codex 桌面应用，然后双击 **Start-Bridge.cmd**。首次运行会询问是否安装依赖，并打开中英双语本地浏览器向导。

- [从零配置和通信测试](docs/zh/07-quickstart.md)
- [运行程序排障](docs/zh/08-runtime-troubleshooting.md)
- [验证范围](docs/runtime-verification.md)

本版使用 Socket Mode，不需要公网服务器。只接收指定工作区、频道和用户的请求。配置与 token 保存在当前 Windows 用户的本地数据目录；公开仓库不包含凭据和私人聊天记录。

投递前保存记录。结果不确定时阻止新任务，不自动重投；回传失败可以查询状态并补发回复。桌面聊天的权限和审批继续生效。

本版不包含自启动、手机审批通知组件或独立执行器。真实 Slack 往返、重启恢复及新电脑配置仍需实测。本次尝试未能成功与 ChatGPT Web 连接。

### 经验与手册

以下内容记录早期部署，部分功能属于旧版独立组件。安装当前运行程序请使用上面的快速开始。

1. [全过程与架构](docs/zh/01-process.md)
2. [旧版部署与日常使用](docs/zh/02-runbook.md)
3. [问题、分析与解决尝试](docs/zh/03-pitfalls.md)
4. [历史证据范围](docs/zh/04-evidence.md)
5. [官方文档与第三方知识库](docs/zh/05-references.md)
6. [类似项目与差异](docs/zh/06-related-projects.md)

文档中的 Slack 身份和本机路径使用占位符。发送指令时，请在 Slack 中选择自己的真实机器人。

## English

Send tasks from Slack to an existing Codex desktop chat on your Windows computer and return the final answer to the original Slack thread. AGENT1 and AGENT2 refer to the chats you select during setup.

Download and extract the repository ZIP, install Node.js 22.16 or newer, and open the signed-in Codex desktop app. Double-click **Start-Bridge.cmd**. The first launch asks before installing dependencies and opens a local setup wizard in English or Chinese.

- [Setup and communication test](docs/en/07-quickstart.md)
- [Runtime troubleshooting](docs/en/08-runtime-troubleshooting.md)
- [Verification scope](docs/runtime-verification.md)

Socket Mode needs no public server. Requests are restricted to the configured workspace, channel and users. Settings and tokens stay in the current Windows user’s local data directory. This repository contains no credentials or private conversations.

Delivery records are saved before submission. Uncertain results block new tasks and are never automatically resubmitted. Failed feedback can be queried and retried. The desktop chat keeps its existing permissions and approvals.

This version includes no automatic startup, mobile approval notifier or independent executor. A live Slack round trip, reboot recovery and setup on another computer still need testing. The ChatGPT Web connection attempt was unsuccessful.

### Experience and manuals

These documents describe the earlier deployment, including separate components. Use the quick start above to install the current runtime.

1. [Process and architecture](docs/en/01-process.md)
2. [Historical deployment and daily use](docs/en/02-runbook.md)
3. [Problems, analysis and attempted fixes](docs/en/03-pitfalls.md)
4. [Historical evidence](docs/en/04-evidence.md)
5. [Official documentation and third-party references](docs/en/05-references.md)
6. [Related projects and differences](docs/en/06-related-projects.md)

Slack identities and machine paths in the manuals are placeholders. Select your actual bot in Slack when sending a command.

### Development / 开发验证

~~~powershell
npm.cmd ci
npm.cmd test
npm.cmd run test:browser
npm.cmd run check
~~~

Browser tests use simulated external services. They do not send tasks to your Slack workspace or Codex chats.

浏览器测试使用外部服务替身，不向你的 Slack 工作区或 Codex 聊天发送任务。
