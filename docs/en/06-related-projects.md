# Public Related Projects: Similarities and Differences

[中文版](../zh/06-related-projects.md)

## 1. Scope and finding

Several published projects already connect Slack to local Codex. Others provide notifications, additional messaging platforms or broader workflows.

The comparison is based on project READMEs, documentation and selected source files. These projects have not been tested locally or fully audited.

The comparisons primarily describe the historical deployment. This repository now also provides a Windows runtime and bilingual setup wizard. The historical mobile approval notifier and separate executor are not included in this version. Similar features do not imply the same deployment or verification scope.

## 2. Direct Slack bridges

| Project/source | Similarities | Differences |
|---|---|---|
| [BHSDuncan/codex-slack-bridge](https://github.com/BHSDuncan/codex-slack-bridge) | Local Codex, Socket Mode, allowlists, mapped threads, final answers, approval notices | Slash-command new/resume/attach and Slack approvals; terminal-owned approvals remain notification-only. Documents macOS launchd. Our Windows route queues to the original desktop writer and uses mobile approval |
| [earonesty/codex-slack](https://github.com/earonesty/codex-slack) | Native sessions, persistence, deduplication, no automatic uncertain replay, status/replies | Project channels, session threads, saved-thread discovery, approval buttons/forms. README explicitly excludes attachment to a running terminal or remote app-server; saved chats resume through its own connection. Our route uses the original desktop queue |
| [Innei/slack-codex-broker](https://github.com/Innei/slack-codex-broker) | Socket Mode, app-server, continuing threads, workspace isolation | Creates/resumes a broker thread per Slack thread, supports history backfill and optional attachments; container/multi-repository oriented. Different from verified Windows fixed-original-role queue submission |
| [josephbartlett/codex-relay](https://github.com/josephbartlett/codex-relay) | Task intake, read-only planning, explicit approval, worktree isolation, audit/status | Current adapter runs codex exec --json, then approved workspace-write, with PR/optional email workflows. Our executor validates structured edits in the host; original-chat queue is separate. Arbitrary live-terminal attachment remains follow-on work there |

Selected source checks: [Agent contract](https://github.com/earonesty/codex-slack/blob/main/src/agent.ts) defines create/resume/input/response interfaces; [Relay ExecAdapter](https://github.com/josephbartlett/codex-relay/blob/main/apps/orchestrator/src/runner/ExecAdapter.ts) spawns Codex with explicit workspace and an environment allowlist. These checks are not full audits.

### Comparison with the current runtime

This version uses the existing Windows desktop chat queue, fixed AGENT bindings, a bilingual browser wizard and durable delivery records. These published projects overlap with it while using different runtime designs.

| Project and source | Shared features | Differences from this version |
|---|---|---|
| [hyungchulc/codex-debug-bridge](https://github.com/hyungchulc/codex-debug-bridge) | Existing Codex App task, correlated replies, owner/session binding and retained approvals | Uses the macOS App’s Chromium debug surface. Slack uses HTTP webhooks with an HTTPS callback; private authority files and memory routing are also included. This version uses Windows app-server queues and Socket Mode |
| [panzhang83/codex-slack](https://github.com/panzhang83/codex-slack) | Socket Mode, user allowlists, existing session attachment, conversation observation and final replies | Python SDK separates observe/control; control resumes the session and supports attachments and interactive input. This version queues requests for the original desktop connection to execute |
| [shekit/openbridge](https://github.com/shekit/openbridge) | Local Codex from Slack, channel/session mapping and guided configuration | Supports Claude Code/Codex CLI, Discord, project switching and scheduled tasks on a laptop or VPS. This version configures existing Windows Codex desktop chats through a local browser |
| [nordbyte/nordrelay](https://github.com/nordbyte/nordrelay) | Codex/Slack connectivity, local WebUI, queues and access controls | Multiple backends/transports, users/groups, files/voice and multi-host control. This version configures one Slack workspace/channel; its README does not establish the same Windows desktop queue route |

These comparisons describe published documentation, without installation tests. An undocumented route is unconfirmed, not proven unsupported. None of this establishes that our approach is unique.


## 3. Adjacent projects

| Project/source | Similarities | Differences |
|---|---|---|
| [yhdesai/codex-toolbox](https://github.com/yhdesai/codex-toolbox) | Same-thread mapping, mirroring, replies, permission buttons, allowlists | Telegram/Discord rather than Slack; polls JSONL when live CLI events are absent. Our focus is Slack plus Windows desktop queue and mobile approval |
| [Wangmerlyn/coding-agent-notifier](https://github.com/Wangmerlyn/coding-agent-notifier) | Hook-triggered Slack completion alerts, Codex integration | Notification component for Slack DMs/Feishu and multiple CLIs, not our inbound task queue. Old Codex-Slack-Notifier URL redirects. [Integration guide](https://github.com/Wangmerlyn/coding-agent-notifier/blob/main/docs/integrations.md) |
| [Yeachan-Heo/oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex) | Hooks, Slack notifications, roles, workflow state | Broader CLI workflow layer. [Notifications/reply injection](https://oh-my-codex.dev/docs.html#notifications) describes tmux-based reply injection; native Windows/Codex App is not the recommended default. Different from original desktop app-server queue |

## 4. Our approach and unfinished work

On Windows, this bridge submits tasks to fixed original desktop chat IDs through queue/add. The original writer processes them, and the bridge checks the marker, turn and final answer before replying in Slack. Tests also covered a separate hook worker, phone approval and an offline controlled executor. The work included replay prevention and Windows encoding/path fixes. These are recorded results, not evidence that the design is unique.

Other projects publish runtime code for chat discovery, dynamic binding, interactive approval, attachments, containers or PR delivery. The current runtime provides fixed chat bindings, queue delivery, durable records and final feedback. Live Slack round trips, reboot recovery and setup on another computer remain unverified for this version; a separate executor is outside its scope.

If a project does not document an original-desktop queue route, support remains unconfirmed. Check its version and source, then test it before replacing the existing installation.
