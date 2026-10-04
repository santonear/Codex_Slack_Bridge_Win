# 证据、版本与待验收事项

[English](../en/04-evidence.md)

整理文档时只读取了历史记录，未重启生产 bridge、发送新的 Slack 测试或调用真实模型。

## 1. 整理时核对的内容

| 项目 | 观察结果 | 证明范围 |
|---|---|---|
| `<DOCS_REPO_DIR>` 权限 | 随机临时文件创建/写入/读取一致/删除后不存在，全部 PASS | 当前会话在该目录可完成这些操作，不代表其他目录也可写 |
| 原聊天日志 | 按消息读取指定 ID 的本地 JSONL，含队列投递及AGENT3回复 | 原聊天上下文已找回；原始记录未上传 |
| bridge package.json | 0.2.0；Codex CLI/SDK 0.160.0；Bolt 5.1.0 | 安装文件版本，不代表服务当前健康 |
| work-role-route.mjs | AGENT3/AGENT1/AGENT2 固定 ID 与名称、claim、queue、状态校验存在 | 安装源码行为；本轮未主动投递 |
| work-role-transport.mjs | 只允许 initialize/read/queue list/add；实验能力 opt-in；按当前用户定位 daemon/socket | 当前安装传输范围 |
| 三份安装记录 | AGENT3、状态修复、便携更新记录存在 | 记录显示升级已执行，不独立证明此刻运行进程在线 |
| 原角色状态文件 | AGENT1和 AGENT2 各有 TURN_COMPLETED；AGENT3 有 TURN_COMPLETED 和回复 | 历史登记结果与聊天互相支持 |
| 后续状态 | AGENT1/AGENT2 也有较晚 INTERRUPTED 记录 | 联调成功不意味着以后每条业务任务都完成 |

日志记录了原 AGENT3 聊天收到 Slack 指令并回复，状态文件也保存了完成结果。`businessSuccessIndependentlyVerified:false` 表示只验证了通信，未验收业务成果。

## 2. 历史测试结果

| 项目 | 历史记录 | 限制 |
|---|---|---|
| 0.2.0 安装后离线套件 | 120/120 通过 | 环境和版本特定；本轮未重跑 |
| Executor smoke | 真 SDK + 本地固定模型响应，一次受控落盘，重复批准不重跑 | 不等于真实模型修改或业务验收 |
| 0.2.1 候选权限审批 | 新测试 18/18；全套 130/138 | 未安装，不能写成生产可用 |
| 通知 worker 初始离线验证 | 23 项通过 | 真实发送、hooks 信任和手机审批后来分别核验 |
| 真实审批通知 | 手机批准后固定回复和 Slack 简报，历史联调通过 | 不代表所有审批工具都触发 hooks |
| 原桌面测试消息 | completed、固定回复、0 工具、历史保留、SUCCEEDED | 通信测试，不是项目测试 |
| 原 AGENT1/AGENT2 路由 | Slack 返回 TURN_COMPLETED 及原聊天最终回复 | 后续单条任务仍需单独看结果 |
| 登录自启检查 | 入口、用户、路径、Node、通知、daemon/socket 通过 | 未真实重启验收 |

## 3. 仍待完成

- ChatGPT Web：本次尝试未能成功连接，不属于本次 Codex/Slack 经验的重点。
- 真实重启后登录、原聊天在线、Slack 往返和通知验收。
- 新电脑原聊天/认证/状态迁移与重新绑定、手机重新配对及重启验收。
- Executor 真实模型修改与业务验收；原有安全边界下需独立授权和验证。
- 0.2.1 如果继续开发，必须解决全套失败并重新确认适用范围；不能拿候选替代当前通知方案。

## 4. 本地来源

以下是为公开发布而匿名化的旧机证据路径模板，需替换目录、文件和 ID 等占位符。原聊天 JSONL、凭据、状态正文、历史备份、候选 zip 均未加入仓库。

- 原日志：`<SOURCE_CHAT_LOG_FILE>`。
- bridge：`<BRIDGE_DIR>`。
- 安装记录：bridge 下的 `<INSTALL_VERIFICATION_RECORD>`、`<ADDITIONAL_ROLE_INSTALL_RECORD>`、`<ROLE_STATUS_PATCH_RECORD>`、`<PORTABLE_INSTALL_RECORD>`。
- 状态目录：bridge 下 `.state/original-work-role-deliveries`；只提取角色/状态/时间，不上传用户任务正文。
- 输出产物根：`<ARTIFACTS_DIR>`。
- 阶段性方案：其 `desktop-agent-routing/CONTROL-CHECK.zh-CN.md`、`README.zh-CN.md` 是早期未接入状态；`BRIDGE-RESTART-MIGRATION.zh-CN.md` 比较晚但未覆盖AGENT3新增。
- 通知文档：其 `desktop-slack-notifier/README.zh-CN.md` 包含早期“未启用”状态，后续原聊天实测才补齐链路。
- 受控执行经验：`<EXPERIENCE_RECORD_FILE>`，作为历史线索，与安装产物和原聊天交叉核对。

判断功能时结合后续测试，不只看旧标题或版本号。如果源码与本文不一致，重新核对并更新文档，保留原记录。

## 5. 官方资料与实际部署

- [Slack Socket Mode](https://docs.slack.dev/apis/events-api/using-socket-mode/)：本机主动 WebSocket 连接与 app token 配置依据。
- [Codex App Server](https://learn.chatgpt.com/docs/app-server)：read/resume、审批、线程状态和权限配置依据。
- [Remote connections](https://learn.chatgpt.com/docs/remote-connections)：手机与桌面账户、主机在线及审批入口依据。

以上页面本轮已访问。公开 App Server 页面没有检索到 `thread/queue/add`；队列方法、请求字段、Windows proxy 握手与状态轮询细节来自部署版源码/schema 和本次历史实测，不能据此保证其他版本也支持同样的公开 API。
