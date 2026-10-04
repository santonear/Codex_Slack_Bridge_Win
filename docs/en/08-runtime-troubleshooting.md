# Runtime Troubleshooting

[中文](../zh/08-runtime-troubleshooting.md)

| Problem | Analysis and action | Reference |
|---|---|---|
| Node missing or too old | Install Node.js 22.16 or later and launch again; no global PowerShell policy change | [Node download](https://nodejs.org/en/download) |
| Dependency installation failed | Check the network and extracted-folder permissions, then confirm installation again | [npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci) |
| Desktop connection missing | Open Codex and sign in; enter your own absolute executable/socket paths if needed | [App Server](https://learn.chatgpt.com/docs/app-server) |
| Queue API incompatible | Check the installed schema; do not substitute another chat | [Official queue tests](https://github.com/openai/codex/blob/main/codex-rs/app-server/tests/suite/v2/thread_queue.rs) |
| Slack authentication failed | Check the xoxb token, installation and workspace; Socket Mode also needs the correct xapp token | [Socket Mode](https://docs.slack.dev/tools/bolt-js/concepts/socket-mode/) |
| Authentication passes but messages do not arrive | Invite the bot, check app_mention/allowed users and select an actual bot mention | [Slack events](https://docs.slack.dev/apis/events-api/) |
| Chat identity mismatch | Refresh the list and verify ID/title; rebind after renaming or forking | [App Server](https://learn.chatgpt.com/docs/app-server) |
| PENDING or UNKNOWN | Query the existing turn; do not resubmit | [App Server lifecycle](https://learn.chatgpt.com/docs/app-server) |
| Final answer exists but feedback failed | Query status to retry rejected feedback. Uncertain feedback needs explicit retry; the last part may repeat, but the task is never enqueued again | [chat.postMessage](https://docs.slack.dev/reference/methods/chat.postMessage/) |
| ALREADY_RUNNING | Use the existing wizard or stop it before launching; do not terminate every Node process | [Quick start](07-quickstart.md) |
| INSTANCE_STALE | The previous process exited unexpectedly. Close all Bridge windows, open CodexSlackBridgeWin in your user’s local application-data directory, and check the PID in instance.json is absent in Task Manager. Delete only instance.json, then launch again. Keep settings and delivery records | [Quick start](07-quickstart.md) |
| Private-directory or ACL failure | Check user application-data permissions; credentials are not saved after ACL failure | [Windows icacls](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/icacls) |
| Chinese paths or script decoding fail | Use the extracted path; the launcher uses Windows PowerShell-compatible encoding | [PowerShell encoding](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_character_encoding) |

[MDN WebSocket servers](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers) explains the handshake and framing. The test report records actual results.

This release does not install the historical approval worker, mobile notifications or a separate controlled executor. Existing chats retain their approval configuration. The original ChatGPT attempt failed; this runtime connects Codex only.
