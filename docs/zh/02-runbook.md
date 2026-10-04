# 操作手册：部署、使用、重启与迁移

目录、文件和环境变量名已匿名化。使用前替换尖括号中的路径，并将 PROJECT_ROOT/PROJECT_CODE 改为所用 bridge 要求的变量名。

[English](../en/02-runbook.md)

角色使用 AGENT1/AGENT2/AGENT3，聊天 ID 使用 THREAD_ID_AGENTn。现有 parser 仍按部署时的 alias 解析，发送示例前要替换为自己的配置，并检查 parser、角色映射和 transport 允许列表。文档中的代号不会改变运行中的 alias。

## 1. 先确认部署对象

本页记录旧版部署，需要旧机已有的源码和安装产物。安装本仓库当前运行程序请看 [快速开始](07-quickstart.md)，不要把本页命令套用到新版。旧版路径占位符为：

```text
<BRIDGE_DIR>
```

将 bridge 放在业务仓库和 worktree 之外。`<DOCS_REPO_DIR>` 是本次文档 Git 仓库，不是现有服务的迁移目的地。

旧机已安装 0.2.0 及后续原聊天队列路由，不要为了阅读本手册重新执行所有历史安装脚本。后文分别说明部署和日常操作。

## 2. 部署前准备

- Windows，Node >=22.16；旧产物锁定 Codex CLI/SDK 0.160.0、Slack Bolt 5.1.0。
- 可登录的桌面客户端、本机 app-server daemon/control socket，以及目标原聊天的执行连接。
- 有权安装 Slack App 的工作区、目标频道、允许用户 ID。
- 若要手机审批，手机与桌面使用同一账户/工作区，桌面在线并完成官方 Remote 配对。
- 备份原聊天和 bridge；明确哪些目录允许改动，不能把测试目录指向业务 worktree。

实验性队列接口以本机版本为准。更新客户端后先复核 schema 和只读探针，不能假定 0.160.0 参数仍有效。

## 3. Slack App 与最小权限

1. 在 [Slack 应用管理](https://api.slack.com/apps) 创建应用，使用自己的工作区。
2. 开启 Socket Mode，开启 Event Subscriptions，订阅 `app_mention`。
3. Bot scopes 为 `app_mentions:read` 和 `chat:write`。
4. 生成 App-level token，添加 `connections:write`，得到 `xapp-…`。
5. 安装应用到工作区，得到 Bot User OAuth Token `xoxb-…`。
6. 将机器人加入目标频道；私有频道要通过频道集成添加 App，仅安装到工作区不够。
7. 收集 team ID、channel ID、允许成员 ID，不能用显示名替代。

本方案不需要公网 Request URL，也未为基础指令申请 history、DM 或附件读取权限。改变 OAuth scope 后需重新安装授权。[Socket Mode 官方说明](https://docs.slack.dev/apis/events-api/using-socket-mode/)

## 4. 本地配置与基础联调

检查 bridge 源码和 lockfile 后，在安装目录运行：

```powershell
Set-Location '<BRIDGE_DIR>'
npm.cmd ci
```

首次配置才复制 `.env.example` 为 `.env`，在本地填写：

```dotenv
SLACK_BOT_TOKEN=xoxb-REPLACE_ME
SLACK_APP_TOKEN=xapp-REPLACE_ME
SLACK_TEAM_ID=T_REPLACE_ME
SLACK_CHANNEL_ID=C_REPLACE_ME
SLACK_ALLOWED_USER_IDS=U_REPLACE_ME
PROJECT_ROOT=<PROJECT_ROOT_DIR>
PROJECT_CODE=<PROJECT_WORKTREE_DIR>
MOCK_MODE=true
CODEX_MODEL=
TURN_TIMEOUT_MS=180000
MAX_TURNS_PER_DAY=30
```

示例中的值需要替换，机器人 token 只保存在本地。依次运行 `npm.cmd test`、`npm.cmd run doctor`；doctor 仅检查格式、路径和依赖，不证明 Slack 登录或模型可用。

以 mock 模式启动基础 bridge，在 Slack 中选择自己的机器人，测试 ping 和帮助。按所用源码的流程登录 Codex。`npm.cmd run smoke:codex` 可能调用模型，先查看脚本再运行，通过测试后再启用对应模型路径。

**MOCK_MODE 是基础角色路径的开关，不能假定它会阻止新增原聊天队列路由发送任务。** 原聊天路由应保持未启用，直到单独完成身份核验和授权测试。

## 5. 安装并验证原聊天队列

历史安装产物位于旧聊天输出的 `desktop-agent-routing`。其中有阶段性候选和测试快照，应选择最终对应版本，不能将全部文件递归复制进生产。

1. **备份与核对**：获取目标原聊天 ID 和名称；备份历史、配置、hooks，记录业务 Git 状态。先确认属于 Codex，普通 ChatGPT 另行处理。
2. **只读探针**：连接 daemon proxy，完成 WebSocket Upgrade；initialize 声明 `capabilities.experimentalApi:true`；只用 `thread/read` 和 `thread/queue/list` 检查身份与队列。
3. **隔离测试**：由桌面创建独立测试聊天，只发送无工具固定回复任务。记录一次性标识，确认原聊天显示消息且回复；不要用原业务 Agent 调试协议。
4. **Slack 测试路由**：安装前完整离线测试、校验基线 hash、备份，失败即停止。先验证“已排队”，再验证最终回复、零工具调用和原历史保留。
5. **角色绑定**：核对目标 ID 和名称，将角色映射与 transport 允许列表同时更新。先接 AGENT1/AGENT2，再接 AGENT3，每个角色单独测试往返通信。
6. **结果判断**：用 SlackDelivery 标识匹配回合，等待 final_answer；failed/interrupted 需要稳定性检查。只重新读取与修正已有结果，不重发任务修复状态。
7. **安装后核对**：检查实际处理消息的进程加载了新源码，再查询每个角色的状态。出现旧帮助菜单时先查安装记录和启动路径。

旧机脚本名依次包含 `<QUEUE_TEST_INSTALLER>`、`<QUEUE_STATUS_PATCH>`、`<ROLE_ROUTING_INSTALLER>`、`<ROLE_STATUS_PATCH>`、`<STARTUP_UPDATE_SCRIPT>`、`<ADDITIONAL_ROLE_INSTALLER>`。它们是旧机分阶段升级产物，不是新电脑通用安装器。

## 6. 日常 Slack 指令

先从 Slack 候选列表选择机器人，下面每条作为独立消息发送：

```text
@<<Slack机器人>> ping
@<<Slack机器人>> AGENT1：状态
@<<Slack机器人>> AGENT2：状态
@<<Slack机器人>> AGENT3：状态
```

首次验证一个原角色时，可发送：

```text
@<<Slack机器人>> AGENT3：仅验证通信，不读取文件、不调用工具、不修改项目。请只回复：AGENT3原聊天连接成功
```

旧源码只接受一条消息一个原角色。不要在 AGENT1 的正文中嵌入 `AGENT2：…`。`协作：…` 使用桥接自建角色，不能作为三个原聊天同时投递的替代用法。

原聊天路由函数默认 dailyLimit=3，三个角色共享按 UTC 日期计算的额度。服务可能覆盖这个值，需检查调用处。基础 `.env` 的 MAX_TURNS_PER_DAY 不必然等于该路由的投递配额。源码最多跟踪约 90 秒，超过时限可转 PENDING，此时查询状态，不自动重投。

| 返回状态 | 含义 | 下一步 |
|---|---|---|
| 准备投递 / CLAIMED | 已登记或认领 | 不重复发送 |
| QUEUED | 队列已确认收到 | 等原 Agent 处理 |
| PENDING | 已入队，结果尚未确认 | 稍后单独查询角色状态 |
| UNKNOWN | 投递或反馈过程不确定 | 核对 marker 对应历史，不盲目重发 |
| TURN_COMPLETED | 回合已完成且有最终答复 | 阅读回复；业务结果另验收 |
| FAILED / INTERRUPTED | 观察到稳定失败/中断 | 查具体原因，不能当作成功 |
| 未投递 / REJECTED | 校验、忙碌、队列或额度拒绝 | 解除对应原因后重新提交新任务 |

“当前没有通过此路由登记的任务”只指 bridge 本地登记，不证明该原聊天没有桌面任务。

## 7. 审批提醒与手机处理

通知程序独立部署在 `<NOTIFIER_DIR>`，状态文件和 stdout/stderr 日志也在这里。hooks 写入本地事件，worker 将事件转发到 Slack。

首次安装时先备份现有 hooks，使用通知包的 Enable 入口；遇到已有配置或修改应审查差异。通过 Codex `/hooks` 审阅并信任六类 hook，确认 Active 和 Review 状态。READY 只证明 worker 就绪，不证明 hooks 已启用。

收到需要批准的提醒后，在手机 ChatGPT 的 Codex/Remote 中打开同一主机与原聊天，查看具体权限范围后批准或拒绝。手机和桌面必须使用相同账户与工作区，主机应用保持在线。[官方 Remote 说明](https://learn.chatgpt.com/docs/remote-connections)

`PreToolUse` 的权限申请提示可能只是“可能需要批准”。`PostToolUse` 表示操作返回；`Stop` 表示回合结束。任务继续执行或工具返回后，还需要检查业务结果。最终答复摘录会发到 Slack，应只含适合该频道的简报。

不要使用未安装的 0.2.1 指令来批准桌面弹窗。受控执行包的操作另有：

```text
@<<Slack机器人>> 批准执行 <package-id> <12位hash>
@<<Slack机器人>> 执行状态 <package-id>
@<<Slack机器人>> 取消执行 <package-id>
```

由指定用户在原 Slack 线程中处理执行包，核对修改范围和基线。当前 Executor 尚未验证自动 commit、merge、push 或 deploy。

## 8. 重启后的恢复

当前采用 Windows 用户登录启动，不是开机未登录就运行的系统服务。bridge 自启不等于桌面原聊天在线，也不等于通知 worker 自启。

计划重启前等 Agent 回合结束。重启后：

1. 登录原 Windows 用户，联网并保持主机唤醒。
2. 打开桌面应用，确认 Remote/原聊天连接可用。
3. 用旧聊天输出中的 `Check-Bridge-Startup.ps1` 检查启动登记、UserSid、BaseDir、Node、通知 Startup、daemon/socket 及 bridge 状态。
4. 在 Slack 分别发 ping、AGENT1 状态、AGENT2 状态、AGENT3 状态。
5. 再发一条无工具通信任务，核对原聊天收到、回复及 Slack TURN_COMPLETED。
6. 记录真实重启后的结果，才能将“重启恢复”标为通过。检查脚本的 `RealRebootVerified=false` 是固定的保守标记，不会自己完成此验收。

旧机快捷入口：`<STATUS_LAUNCHER>` 查看状态；`<RESTART_LAUNCHER>` 只重启 bridge；`<START_LAUNCHER>` 启动守护组件；`<STOP_LAUNCHER>` 停止当次运行；`<ENABLE_AUTOSTART>`/`<DISABLE_AUTOSTART>` 控制下次登录。Start/Stop 可能也管理可选 Desktop Commander Remote，执行前查看本机入口。

CONNECTED_REPORTED 只表示进程报告了连接，仍需测试消息往返。不要按名称杀全部 node.exe，不要删不明锁。Desktop Commander Remote 是旧维护通道，原聊天队列投递不依赖它。

## 9. 换电脑迁移

1. 保存源码、lockfile、角色规则、hooks 和部署说明；凭据、状态、历史分别备份，不能打进可分享源码包。
2. 新用户安装 Node 与桌面应用、合法登录；bridge 放独立目录，运行 npm.cmd ci 和测试。
3. 重新配置 Slack IDs、允许用户、业务路径；重新生成 automation 的 BaseDir/Node/UserSid，不复制旧 SID。
4. 核验 daemon/socket 是否真的存在。按用户目录定位路径不会自动创建或启动服务。
5. 核验原聊天是否可用。同账户登录不保证本地历史迁移；优先用 Remote 继续旧机原聊天。不要运行时覆盖数据库或复制认证文件冒充恢复。
6. 原角色 ID 映射和 transport 允许列表同步核对；新建/分叉的 ID 不同，要明确重新绑定。
7. 通知 worker 独立迁移、改路径、重新审阅 hooks；手机重新配对。
8. 切生产前先停旧机 bridge 及自启，同一机器人只留一份生产消费者。迁移状态时保留去重/claim，不能重放旧未确认任务。
9. 先验无工具往返，再验手机审批通知，再验真实重启。旧备份保留；失败时停新机连接后恢复旧机，不能双机并行抢消息。

现有迁移包只包含源文件，尚未在新电脑上验证一键恢复或完整迁移。
