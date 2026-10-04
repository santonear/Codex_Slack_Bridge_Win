# Slack → 本地 Codex bridge：全过程

[English](../en/01-process.md)

## 1. 要解决的问题

目标是通过 Slack 向已有的本地 Codex 聊天发送任务，沿用原聊天的历史、权限和项目约束。需要批准时，Slack 发出提醒，在手机端完成审批，执行结束后将结果返回 Slack。

最终使用 **Slack Socket Mode、固定原聊天 ID 和本地消息队列**。bridge 将指令加入队列，原聊天的执行连接继续处理。它不接管原聊天，也不增加文件或命令权限。

```mermaid
flowchart TD
    U["在 Slack 真正提及 <<Slack机器人>>"] --> S[Socket Mode 接收事件]
    S --> V[工作区 / 频道 / 用户校验与去重]
    V --> R{指令路由}
    R -->|AGENT1 / AGENT2 / AGENT3| Q[核对固定 ID 和名称后加入原聊天队列]
    Q --> C[原 Codex 聊天执行，沿用原权限]
    C --> A{需要审批?}
    A -->|是| H[hooks → 独立通知 worker → Slack 提醒]
    H --> M[手机 Codex / Remote 审批]
    M --> C
    A -->|否或已批准| F[按投递标识核对回合和最终回复]
    F --> B[原 Slack 消息线程返回结果]
    R -->|协作| L[桥接自建 AGENT3 → AGENT2 → AGENT1 只读评审]
    R -->|批准执行包| E[本地受控执行器 → 独立 worktree]
```

Socket Mode 由本机主动连接 Slack WebSocket，不需要开放公网 HTTP 接收端口。[Slack 官方说明](https://docs.slack.dev/apis/events-api/using-socket-mode/)

## 2. 四种功能

| 能力 | 谁执行 | 历史与权限 | 验证边界 |
|---|---|---|---|
| 桥接自建角色协作 | bridge 创建/继续的 Codex 角色会话 | 独立于桌面原聊天；只读评审 | 协作返回正常不证明原桌面 Agent 收到指令 |
| 原聊天双向通信 | 桌面原聊天持有的执行连接 | 固定原 ID，沿用原聊天历史和审批 | 入队、执行、最终回复、Slack 反馈分别确认 |
| 桌面审批和结束通知 | hooks 捕获事件，worker 发 Slack | 不返回批准决定 | 通知成功不证明 Slack 可反向控制 |
| Executor 批准执行 | 本地宿主校验模型提出的结构化修改 | 精确文件范围，独立 worktree | 离线模拟通过不代表真实业务验收 |

本次尝试未能成功连接 ChatGPT Web 中的原聊天。

## 3. 方案演进

### 阶段一：已有只读桥接与 0.2.0 受控执行

最初的 bridge 创建了 AGENT3、AGENT2、AGENT1 三个独立角色。“协作”按顺序调用，最多三次，将只读文件快照和前一个角色的结论交给下一个角色。这些会话与桌面原聊天分开。

开始尝试时已有 0.1.3。随后加入受控写入：模型返回结构化修改，本地执行器检查后写入独立 worktree，不向模型开放任意 shell 执行。

执行包记录批准人、Slack 线程、基线、允许修改的文件、包 hash、有效期和一次性执行状态。执行前保存 claim，结束后先保存结果再发 Slack，避免崩溃或消息发送失败导致模型重复执行。

加固包括工具目录过滤、完整 SSE 验证、继承配置检查、Windows 句柄锁定、拒绝 reparse/hardlink 路径。升级首次被旧守护程序健康检查误判失败，安装器恢复 0.1.3；保留旧健康标记后成功安装 0.2.0。安装后的记录显示 120/120 离线测试通过、真实 SDK 固定响应模拟落盘成功、回滚预检通过。没有真实模型写入、提交、推送或部署验证。

### 阶段二：从 Slack 直接审批转为通知 + 手机审批

最初尝试从 Slack 批准 Codex 桌面的权限弹窗。0.2.1 候选只处理 bridge 自己持有的请求，并仅允许既有范围内的只读权限；18 项新增测试通过，但全套 130/138 通过，因此未安装。它不能接管任意桌面原聊天的弹窗。

随后改为 Slack 文字提醒、手机审批和执行结束通知。独立通知程序部署后，注册并信任 `PreToolUse`、`PermissionRequest`、`PostToolUse`、`Stop`、`SubagentStop`、`Interrupt` hooks。

测试中收到过审批等待提醒和结束简报。随后在独立桌面测试聊天中完成手机批准，并核对固定回复与 Slack 简报，确认这条流程可用。hooks 本身不读机器人凭据、不联网、不返回审批决定；worker 使用本地配置发通知。

### 阶段三：确认任务进入原聊天

目标包括 AGENT2、AGENT1 的现有 Codex 聊天，以及 ChatGPT Web 中的原聊天。最初把三条示例放入同一 Slack 消息，被当作一个任务；角色协作结果也只来自桥接自己的会话。因此，验收时必须确认消息出现在指定的原聊天中。

核对了 AGENT2 和 AGENT1 的固定 ID，后来确认另一目标聊天位于 ChatGPT Web。最初原聊天路由先明确报告“未投递”，防止静默落到新的角色会话。

### 阶段四：连接控制接口和失败的恢复路线

本机 Codex/SDK 基线为 0.160.0。`app-server proxy` 探针最初在 initialize 超时；补上 WebSocket Upgrade 握手后连接成功。独立 daemon 能读取原 ID，但显示 `notLoaded`，不能由此认为桌面聊天没运行。

桌面服务使用内部 stdio 连接，独立 daemon 使用可连接的控制 socket。能读保存记录不等于持有桌面写入连接。

恢复测试先备份原聊天、索引一致性快照、hooks、bridge，并记录业务项目的 worktree 状态。过程中出现响应大小限制、RPC 参数错误和恢复拒绝；原记录和项目状态均保留。

曾把原 AGENT2 恢复失败归因于 `paginated` 历史，后发现 `readOnly` 参数也写错；因此无法确认历史格式是唯一原因。独立新聊天测试还经历空聊天未持久化、过时权限字段、source filter 不匹配、侧栏不可见等问题。

独立测试聊天后来实现 Slack 往返及持久化，但桌面可见性仍未验证。桌面新建的测试聊天报 `already has an active writer`；切换聊天没有释放占用。随后停止尝试恢复和接管，保留进程、锁和历史来源。

### 阶段五：用队列接入原桌面聊天

本机 0.160.0 schema 中发现 `thread/queue/*`。连接声明 `experimentalApi:true` 后，队列只读查询成功。向桌面测试聊天调用 `thread/queue/add`，消息出现在原聊天并由其回复，无需 `thread/resume` 或启动另一执行连接。

先接入 Slack 固定测试入口：原聊天收到了消息并回复，但 bridge 曾误报 FAILED。修复“等待最终答复”的结果判断；再解决 PowerShell 脚本编码、JSON 读取编码和 JSON BOM，测试记录随后返回 SUCCEEDED。

接入 AGENT1 和 AGENT2：核对 ID、名称、队列、历史路径并备份；修复 Windows `\\?\` 路径误判。两角色投递成功，但曾把短暂 `interrupted` 当终态；加入稳定状态检查、状态复查和混合角色指令拒绝，之后分别返回 `TURN_COMPLETED` 与原聊天最终答复。

### 阶段六：通用路径、自启动与 AGENT3

去掉用户目录硬编码，按当前 Windows 用户定位 daemon/socket；登记用户登录后的启动入口。启动检查曾通过，实际重启往返仍未做。

AGENT3 最初通过 Slack 连接器发送测试信息，只证明出站成功。加入 AGENT3 队列路由后，安装因复制旧离线测试临时目录而触发 262 字符长路径；改为只复制正式测试文件后安装成功。

随后，原 AGENT3 聊天收到带 `SlackDelivery-…` 的 Slack 指令并返回输出信息。状态文件也记录了 TURN_COMPLETED 和输出信息，确认消息已进入原聊天。

## 4. 最终角色绑定

| Slack 指令 | 原聊天 | 固定 ID | 结果 |
|---|---|---|---|
| `AGENT1：…` | `ORIGINAL_AGENT1_TITLE` | `THREAD_ID_AGENT1` | 历史联调往返通过 |
| `AGENT2：…` | `ORIGINAL_AGENT2_TITLE` | `THREAD_ID_AGENT2` | 历史联调往返通过 |
| `AGENT3：…` | `AGENT3` | `THREAD_ID_AGENT3` | 原聊天收到并回复；当前源码包含绑定 |
| ChatGPT Web | 网页端原聊天 | 已识别，仓库不保留私人网址 | 未接入；不能替换成新 Codex 聊天冒充 |

表中 ID 为匿名化占位符，不是可直接使用的配置。名称变化也可能触发身份校验失败；不能仅改一处 ID 绕过校验。

## 5. 原聊天路由内部顺序

1. 上游校验 Slack 工作区、频道、允许用户并去重。
2. 解析真正提及和单角色指令；拒绝混合角色正文。
3. 根据 Slack team/channel/messageTs/user 生成 deliveryId；已有记录不重投。
4. 核对原聊天固定 ID 和名称；检查队列为空、旧任务已确认终态、配额允许。
5. 先落盘 `CLAIMED` 与角色锁，再向队列写入带唯一 `SlackDelivery-…` 的消息。
6. 收到队列确认后保存 `QUEUED`，向 Slack 报告等待执行。
7. 用 marker 查原聊天回合；确认 completed 和 final_answer 后保存 `TURN_COMPLETED`。
8. 超时保存 `PENDING`；异常可能为 `UNKNOWN`。通过状态查询核对已有回合，不自动重投。
9. 最终回复与回合状态返回原 Slack 线程，业务成功仍需独立验收。

当前源码连续五次读到相同的 failed/interrupted 签名后，才确认失败或中断；completed 还必须有 final_answer。这解决了已遇到的误报，后续版本仍可能出现状态竞态。

## 6. 权限原则

原聊天指令携带“遵循已有权限、审批要求和项目约束；不额外授予权限”。因此原聊天可用能力由其已有配置决定，不能将桥接自建角色的只读限制误说成原聊天的强制只读保证。

批准 Executor 执行包、批准 Codex 权限卡片和发布队列任务，需要分别验证。协议和客户端可能变化，实验性队列能力应以部署版本 schema 和实际往返为准；公开 App Server 页未检索到 `thread/queue/add`，其细节依据本机源码及历史实测。
