# Public Related Projects: Similarities and Differences

[中文版](../06-related-projects.md) · Checked 2026-10-05, Asia/Shanghai.

## 1. Scope and finding

**Public alternatives exist. Slack-to-local-Codex is not unique to this project.** Four direct Slack bridges and three adjacent notification/channel/workflow projects were identified.

Research used public search plus domain-restricted GitHub, GitLab, Gitee, Codeberg, and Bitbucket queries. READMEs, project documentation, and selected source files were opened. No third-party project was installed, executed, or fully audited. Their capabilities below are documented claims, not local verification.

This repository publishes bilingual documentation, not runtime bridge code. “Our implementation” means the previously deployed old-machine design supported by historical evidence. Functional overlap and release completeness are separate comparisons.

## 2. Direct Slack bridges

| Project/source | Similarities | Differences |
|---|---|---|
| [BHSDuncan/codex-slack-bridge](https://github.com/BHSDuncan/codex-slack-bridge) | Local Codex, Socket Mode, allowlists, mapped threads, final answers, approval notices | Slash-command new/resume/attach and Slack approvals; terminal-owned approvals remain notification-only. Documents macOS launchd. Our Windows route queues to the original desktop writer and uses mobile approval |
| [earonesty/codex-slack](https://github.com/earonesty/codex-slack) | Native sessions, persistence, deduplication, no automatic uncertain replay, status/replies | Project channels, session threads, saved-thread discovery, approval buttons/forms. README explicitly excludes attachment to a running terminal or remote app-server; saved chats resume through its own connection. Our route uses the original desktop queue |
| [Innei/slack-codex-broker](https://github.com/Innei/slack-codex-broker) | Socket Mode, app-server, continuing threads, workspace isolation | Creates/resumes a broker thread per Slack thread, supports history backfill and optional attachments; container/multi-repository oriented. Different from verified Windows fixed-original-role queue submission |
| [josephbartlett/codex-relay](https://github.com/josephbartlett/codex-relay) | Task intake, read-only planning, explicit approval, worktree isolation, audit/status | Current adapter runs codex exec --json, then approved workspace-write, with PR/optional email workflows. Our executor validates structured edits in the host; original-chat queue is separate. Arbitrary live-terminal attachment remains follow-on work there |

Selected source checks: [Agent contract](https://github.com/earonesty/codex-slack/blob/main/src/agent.ts) defines create/resume/input/response interfaces; [Relay ExecAdapter](https://github.com/josephbartlett/codex-relay/blob/main/apps/orchestrator/src/runner/ExecAdapter.ts) spawns Codex with explicit workspace and an environment allowlist. These checks are not full audits.

## 3. Adjacent projects

| Project/source | Similarities | Differences |
|---|---|---|
| [yhdesai/codex-toolbox](https://github.com/yhdesai/codex-toolbox) | Same-thread mapping, mirroring, replies, permission buttons, allowlists | Telegram/Discord rather than Slack; polls JSONL when live CLI events are absent. Our focus is Slack plus Windows desktop queue and mobile approval |
| [Wangmerlyn/coding-agent-notifier](https://github.com/Wangmerlyn/coding-agent-notifier) | Hook-triggered Slack completion alerts, Codex integration | Notification component for Slack DMs/Feishu and multiple CLIs, not our inbound task queue. Old Codex-Slack-Notifier URL redirects. [Integration guide](https://github.com/Wangmerlyn/coding-agent-notifier/blob/main/docs/integrations.md) |
| [Yeachan-Heo/oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex) | Hooks, Slack notifications, roles, workflow state | Broader CLI workflow layer. [Notifications/reply injection](https://oh-my-codex.dev/docs.html#notifications) describes tmux-based reply injection; native Windows/Codex App is not the recommended default. Different from original desktop app-server queue |

## 4. Platform coverage

| Platform | Observation | Limit |
|---|---|---|
| GitHub | Seven projects and selected sources opened | Alternatives verified to exist; not exhaustive |
| Gitee | [OMX copy](https://gitee.com/ai-large-model-tool/oh-my-codex/blob/main/README.zh.md?skip_mobile=true) is marked as a fork | Not counted as an independent implementation; may lag upstream |
| GitLab | Public queries/topic pages exposed Telegram bridge and Slack MCP neighbors | No same-scope independent Slack/original-desktop-queue project verified here; absence not established |
| Codeberg | robots.txt restricted access | Incomplete coverage |
| Bitbucket | Public index gave no directly verifiable equivalent | Not a full platform scan |

Some GitHub src directory pages could not be fetched; the two linked raw source files were readable. Other feature comparisons rely on opened project documentation, not search snippets or unofficial mirrors alone.

## 5. Our combination and current gaps

The observed combination is fixed original Windows desktop identity → queue/add → original writer → marker/turn/final-answer validation → Slack feedback, plus separate hook worker, phone approval, controlled executor, no replay, and Windows encoding/path fixes. This is an observed design, not a claim of industry uniqueness.

Other projects publish more complete runnable systems for discovery, dynamic binding, interactive approval, attachments, containers, or PR delivery. This repository remains documentation-only. Actual reboot/new-machine acceptance and live-model executor acceptance are still missing.

Not finding an original-desktop queue route in a project's documentation does not prove that it cannot support one. Replacing the existing installation requires version-specific source review and actual tests.

## 6. Ideas inspected but not implemented

Potential references include attach/detach UI, SQLite journals and uncertain-state recovery, bounded Slack history backfill, neutral session workspaces, audit/worktree/PR workflows, and notification templates. No third-party installation or production change was made. Existing permissions and approval constraints remain the deployment authority.
