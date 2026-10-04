# Runbook: Setup, Daily Use, Reboot, and Migration

Directory names, filenames and environment keys are anonymized. Replace the angle-bracket placeholders and map PROJECT_ROOT/PROJECT_CODE to the keys your installed bridge expects.

[中文版](../zh/02-runbook.md)

AGENT1/AGENT2/AGENT3 and THREAD_ID_AGENTn are anonymized placeholders. The installed parser uses deployment-specific aliases, so sending AGENTn literally will not work without corresponding configuration. Map these templates to your parser, role mapping, and transport allowlist. This documentation does not change production aliases.

## 1. Before using this guide

This is a documentation repository, not a runnable bridge distribution. The procedures need the reviewed source, lockfile, and installation artifacts from the existing machine. Do not run npm start in this documentation directory.

The anonymized historical bridge directory is:

```text
<BRIDGE_DIR>
```

The actual path must be taken from your installation. Keep the bridge outside business repositories and worktrees. `<DOCS_REPO_DIR>` is the documentation Git directory, not a migration destination for the production service.

The old machine already had 0.2.0 plus later queue patches. Do not rerun every historical installer just to read this guide.

## 2. Prerequisites

- Windows and Node >=22.16. Historical dependencies: Codex CLI/SDK 0.160.0 and Slack Bolt 5.1.0.
- A signed-in desktop app, local app-server daemon/control socket, and a working original-thread writer.
- Authorization to install a Slack app; workspace/channel/allowed-user IDs.
- For mobile approval: the same account/workspace, an online desktop app, and official Remote pairing.
- Backups of original chats and bridge configuration; explicit writable scope. Test directories must be separate from business worktrees.

Experimental APIs are version-specific. After a client update, recheck the native schema and read-only probes before using old parameters.

## 3. Slack app and minimum scopes

1. Create an app in [Slack app management](https://api.slack.com/apps).
2. Enable Socket Mode and Event Subscriptions; subscribe to `app_mention`.
3. Add bot scopes `app_mentions:read` and `chat:write`.
4. Generate an app-level `xapp-…` token with `connections:write`.
5. Install to the workspace and obtain the `xoxb-…` Bot User OAuth Token.
6. Add the bot to the target channel. Workspace installation alone does not join a private channel.
7. Collect actual team, channel, and member IDs; display names are not identifiers.

No public event Request URL is needed. The basic route does not request channel history, DMs, or files. Scope changes require reinstalling authorization. [Slack Socket Mode](https://docs.slack.dev/apis/events-api/using-socket-mode/)

## 4. Local configuration and initial checks

With reviewed bridge source and lockfile, run inside its real directory:

```powershell
Set-Location '<BRIDGE_DIR>'
npm.cmd ci
```

For a first installation only, copy `.env.example` to `.env` and fill it locally:

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

These are placeholders, not production credentials. Run `npm.cmd test`, then `npm.cmd run doctor`. Doctor checks configuration format, paths, and dependencies; it does not prove valid tokens, Codex login, model availability, or sandbox enforcement.

Start the basic bridge in mock mode and select a real bot mention to test ping/help. Complete the source package's legitimate Codex authentication flow. Review `npm.cmd run smoke:codex` before running it because it may call a model. Enable the required model path only after its own validation.

**MOCK_MODE applies to the basic role route; do not assume it prevents a later original-chat queue route from submitting a task.** Keep that route disabled until identity checks and an authorized isolated test pass.

## 5. Install and test the original-chat queue

Historical artifacts were under the source chat's `desktop-agent-routing` output. It includes outdated candidates and temporary test snapshots. Select the correct final artifacts rather than copying the entire tree.

1. **Back up and identify:** verify original ID/title, preserve history/config/hooks, and record business Git state. Confirm that the target is Codex.
2. **Read-only probe:** connect to daemon proxy, complete WebSocket Upgrade, initialize with `capabilities.experimentalApi:true`, and call only thread/read and queue/list.
3. **Isolated desktop test:** create a separate desktop test chat. Send one fixed no-tool communication task with a one-time marker; confirm that the original chat displays and answers it.
4. **Slack test route:** require the complete offline suite, baseline hashes, and backups before installation. Verify queue acknowledgement separately from final answer, zero tool calls, and history preservation.
5. **Role binding:** update and verify the role map and transport allowlist together. Validate AGENT1/AGENT2, then AGENT3, separately.
6. **Result checking:** match the SlackDelivery marker; wait for final_answer and stable terminal state. Correct saved results by reading the existing turn, not by resending it.
7. **Post-install checks:** verify that the running consumer loaded the installed source, then query each role. Old help output calls for installation/process inspection first.

Historical installer names include `<QUEUE_TEST_INSTALLER>`, `<QUEUE_STATUS_PATCH>`, `<ROLE_ROUTING_INSTALLER>`, `<ROLE_STATUS_PATCH>`, `<STARTUP_UPDATE_SCRIPT>`, and `<ADDITIONAL_ROLE_INSTALLER>`. These are staged old-machine patches, not a generic new-machine installer. Filenames and deployment-specific environment keys are anonymized; map them to your installed source before use.

## 6. Daily Slack commands

Choose the actual bot from Slack's mention list. Send each template as a separate message after mapping the role aliases:

```text
@<<Slack bot>> ping
@<<Slack bot>> AGENT1：状态
@<<Slack bot>> AGENT2：状态
@<<Slack bot>> AGENT3：状态
```

The installed status keyword is `状态` (“status”); English `status` is not automatically supported. The bot display name is deployment-specific too.

A first communication test can use:

```text
@<<Slack bot>> AGENT3: Communication test only. Do not read files, call tools, or change the project. Reply only: AGENT3 original chat connected.
```

One message targets one role. Do not embed another role command inside a task. The legacy collaboration command uses bridge-owned sessions; it does not fan out to all original chats.

The route function defaults to a shared dailyLimit of 3 across the three roles, counted by UTC date. Check the server call, which may override it. The basic MAX_TURNS_PER_DAY setting is not necessarily this route's quota. Tracking normally waits about 90 seconds, then may become PENDING; query status instead of resending.

| State | Meaning | Action |
|---|---|---|
| Preparing / CLAIMED | Registered or claimed | Do not submit again |
| QUEUED | Queue acknowledged | Wait for the original writer |
| PENDING | Submitted; final result unconfirmed | Query this role's status later |
| UNKNOWN | Submission or feedback is uncertain | Inspect the marked turn; no blind replay |
| TURN_COMPLETED | Completed turn with final response | Read the response; verify business acceptance separately |
| FAILED / INTERRUPTED | Stable observed failure/interruption | Investigate; do not call it success |
| Not delivered / REJECTED | Validation, busy, queue, or quota rejection | Resolve the reason before a new task |

“No task registered through this route” describes bridge-local records; the chat may still have desktop tasks.

## 7. Approval reminders and phone approval

The notifier is deployed separately under `<NOTIFIER_DIR>`, with state and stdout/stderr logs. Hooks write local events and the worker forwards them.

Back up existing hooks before first installation. Review conflicts rather than overwriting modified configuration. Use Codex `/hooks` to review and trust all six event types, checking Active/Review state. Worker READY alone does not prove hook activation.

When reminded, open the same host and original chat in mobile Codex/Remote, examine the requested scope, and approve or reject there. Both devices need the same account/workspace and an online host. [Official Remote guide](https://learn.chatgpt.com/docs/remote-connections)

PreToolUse may only mean “approval might be needed.” PostToolUse means an operation returned; Stop means the turn ended. Continuing after approval and business success are separate facts. Final-answer excerpts sent to Slack must be appropriate for the channel.

The uninstalled 0.2.1 candidate cannot approve arbitrary desktop dialogs. Executor-package commands are separate, with deployment-specific parser keywords:

```text
@<<Slack bot>> 批准执行 <package-id> <12-character-hash>
@<<Slack bot>> 执行状态 <package-id>
@<<Slack bot>> 取消执行 <package-id>
```

These mean approve execution, execution status, and cancel execution. Use the original Slack thread and authorized identity; inspect package scope and baseline. Automatic commit/merge/push/deploy are not verified executor capabilities.

## 8. Recovery after reboot

Startup occurs after Windows user login, not before login as a system service. Bridge startup, desktop writer availability, and notifier startup are separate.

Wait for active turns to end before rebooting. Then:

1. Sign in as the original Windows user, connect to the network, and keep the host awake.
2. Open the desktop app and confirm original chats/Remote are available.
3. Run the installation's `Check-Bridge-Startup.ps1`: check registry entry, UserSid, BaseDir, Node, notifier Startup entry, daemon/socket, and bridge state.
4. Send ping and separate AGENT1/AGENT2/AGENT3 status queries.
5. Send one no-tool communication test; verify the original chat and Slack TURN_COMPLETED.
6. Record the real reboot round trip before marking recovery verified. `RealRebootVerified=false` is a conservative fixed field, not an automatic acceptance test.

Old-machine launchers: `<STATUS_LAUNCHER>` shows status; `<RESTART_LAUNCHER>` restarts only the bridge; `<START_LAUNCHER>` starts managed components; `<STOP_LAUNCHER>` stops the current run; `<ENABLE_AUTOSTART>`/`<DISABLE_AUTOSTART>` affects later logins. Inspect the installed entries because Start/Stop may also manage optional Desktop Commander Remote.

CONNECTED_REPORTED means the process reported a connection. Test a message round trip as well. Do not kill every node.exe or delete uncertain locks. Desktop Commander Remote was a maintenance channel, not a dependency of the original-chat queue route.

## 9. Migrating to another computer

1. Preserve source, lockfile, role rules, hooks, and deployment notes. Back up credentials/state/history separately; exclude them from shareable source archives.
2. Install Node and the desktop app, authenticate legitimately, place the bridge outside business repositories, and run npm.cmd ci and tests.
3. Reconfigure Slack IDs, allowed users, project paths, and automation BaseDir/Node/UserSid. Never reuse the old SID blindly.
4. Verify daemon/socket presence; portable path discovery does not create or start them.
5. Verify original history availability. Same-account login does not guarantee local-history migration. Prefer Remote to the old host when needed; do not overwrite running databases or copy authentication files as a supposed restore.
6. Verify role IDs, titles, parser, and transport allowlist together. New/forked chats require explicit rebinding.
7. Migrate the notifier separately, adjust paths, re-trust hooks, and pair the phone again.
8. Stop the old bridge and startup before switching production. Keep one production consumer for the bot. Preserve claims/deduplication; do not replay uncertain tasks during migration.
9. Validate a no-tool round trip, phone approval notifications, and an actual reboot. Preserve old backups; stop the new connection before reverting to the old machine.

The historical migration package is source material, not a verified one-click restore. New-machine migration remains untested.
