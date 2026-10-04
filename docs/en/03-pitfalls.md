# Pitfalls: Problem, Analysis, and Attempted Resolution

[中文版](../zh/03-pitfalls.md) · [Source index](05-references.md)

External sources explain mechanisms; local logs and artifacts establish whether a test succeeded. MDN and Microsoft encoding/path guidance were added during this documentation run. They are not presented as articles read during the original failures.

## 1. Results that are easy to misread

| Problem | Analysis | Resolution | Reference |
|---|---|---|---|
| Collaboration looked like the expected agents | Role prompts matched, but threads were bridge-owned | Verify fixed original ID, visible message, final reply, and feedback | [App Server](https://learn.chatgpt.com/docs/app-server) |
| A connector greeting worked, but AGENT3 mentions did not | Outbound connector and inbound bot routing are separate | Add and test the actual queue route | [Slack Socket Mode](https://docs.slack.dev/apis/events-api/using-socket-mode/) |
| Hook notifications were mistaken for inbound control | Hooks only reported events | Test notifications and submission separately | [Hooks](https://learn.chatgpt.com/docs/hooks) |
| Queue acknowledgement was called completion | Submission is not execution | Match the unique marker, completed turn, and final answer | [Queue test source](https://github.com/openai/codex/blob/main/codex-rs/app-server/tests/suite/v2/thread_queue.rs) |
| TURN_COMPLETED was called feature success | A finished turn does not prove business acceptance | Inspect actual deliverables and tests | [App Server lifecycle](https://learn.chatgpt.com/docs/app-server) |
| Several role commands became one task | Parser handled one message as one role | Separate messages; reject mixed-role bodies | [Slack event transport](https://docs.slack.dev/apis/events-api/using-socket-mode/) |

## 2. Protocol and thread identity

| Problem | Analysis | Attempt and stopping condition | Reference |
|---|---|---|---|
| Proxy initialize timed out | Initial probe omitted WebSocket Upgrade | Handshake first, then RPC; report each stage | [MDN handshake and frames](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers) |
| Original ID could be read but was notLoaded | Independent server did not load that thread | Do not infer the desktop agent stopped or lost history | [Read without resume](https://learn.chatgpt.com/docs/app-server#read-a-stored-thread-without-resuming) |
| Long-history connection closed | Probe had a 1 MB response limit; exact cause of one failure remained uncertain | Log frame size/method and adjust bounded limits | [MDN frames](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers) |
| RPC -32600 lacked detail | Invalid parameters and runtime state can both reject a request | Preserve rpcMethod/code/detail; diagnose without resending | [App Server](https://learn.chatgpt.com/docs/app-server) |
| readOnly was rejected | Deployed method expected read-only | Read native schema; do not copy another version's enum | [Thread parameters](https://learn.chatgpt.com/docs/app-server#start-or-resume-a-thread) |
| readOnly.access was rejected | Permission representation changed | Use deployed permission profiles; avoid mutually exclusive fields | [Thread parameters](https://learn.chatgpt.com/docs/app-server#start-or-resume-a-thread) |
| Resume rejection was attributed solely to paginated history | A parameter typo also existed; full error was missing | Keep multiple candidate causes; do not convert history or recreate identity | [App Server](https://learn.chatgpt.com/docs/app-server) |
| already has an active writer | Another connection owned the writer, even when idle | Do not kill/delete locks; use the verified queue route | [App Server](https://learn.chatgpt.com/docs/app-server) |
| Switching chats did not release the writer | UI navigation did not release ownership | Stop resume attempts; unsubscribe releases only the caller's subscription | [App Server](https://learn.chatgpt.com/docs/app-server) |
| Queue read required experimentalApi | Connection did not opt in | Set capability on this connection only | [Official queue tests](https://github.com/openai/codex/blob/main/codex-rs/app-server/tests/suite/v2/thread_queue.rs) |

The attempt to connect the original ChatGPT Web chat was unsuccessful.

## 3. Independent test threads and desktop visibility

- **Create then immediately disconnect:** an empty test thread had no recoverable rollout. Create, send the first turn, check response/persistence in one connection, and claim the test once.
- **Source filter mismatch:** the test thread had source vscode. An appServer-only query missed it; default/all-source lists found it. Being listed did not prove desktop visibility.
- **Desktop search failed:** preserve the distinction between an independent-server round trip and a desktop-original-chat connection. Do not alter source metadata or move history to manufacture success.
- **Repeated one-time command was rejected:** this was replay protection, not a failed model call. Read the previous result; do not remove the claim.

Protocol reference: [thread start/resume/list](https://learn.chatgpt.com/docs/app-server). Persistence and visibility outcomes were machine-specific observations.

## 4. Windows and PowerShell

| Problem | Analysis | Resolution | Reference |
|---|---|---|---|
| npm.ps1 blocked | PowerShell resolved npm to a script | Use npm.cmd without weakening global policy | [PowerShell execution policies](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_execution_policies) |
| A continuation prompt appeared | Usually an unmatched quote/bracket | Cancel the partial input; run one complete command | [PowerShell parsing](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_parsing) |
| Documentation directory was readable but not writable | Old chat sandbox lacked a writable root | Open a new chat in the target directory and perform an actual write/read/delete probe | [Local evidence](04-evidence.md) |
| 119/120, EXEC_PROJECT_CONFIG | Ancestor Codex configuration affected isolated tests | Move the verification copy to an isolated directory; retain the protection | [App Server configuration context](https://learn.chatgpt.com/docs/app-server) |
| Chinese .ps1 parse failure | Windows PowerShell encoding compatibility | Use compatible UTF-8 handling and test with powershell.exe | [Character encoding](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_character_encoding) |
| Chinese JSON could not be read | Implicit decoding was wrong | Use explicit Get-Content -Encoding UTF8 | [Character encoding](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_character_encoding) |
| JSON.parse / LOCAL_RUN_FAILED | PowerShell wrote a UTF-8 BOM | Back up, normalize, and tolerate a leading BOM; do not replay the task | [Character encoding](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_character_encoding) |
| History path incorrectly rejected | Extended Windows path prefix | Normalize and recheck containment; keep scope checks | [Windows paths](https://learn.microsoft.com/en-us/windows/win32/fileio/naming-a-file) |
| Installer copy failed near 262 characters | Old test home/session/tmp tree was copied | Copy formal tests only; generate temporary data at runtime | [Windows paths](https://learn.microsoft.com/en-us/windows/win32/fileio/naming-a-file) |
| Slack returned old help | Patch was absent or not loaded by the consumer | Check install record, hash, and process directory | [Slack transport](https://docs.slack.dev/apis/events-api/using-socket-mode/) |
| 0.2.0 health check failed | Legacy supervisor recognized only an old version marker | Preserve protocol compatibility while exposing actual version; restore on failure | [Historical evidence](04-evidence.md) |

A syntax check does not confirm installation. If a Git test prints seed/reset output, check its working directory before assuming it changed the business repository.

## 5. Two incorrect result reports

**Fixed desktop test FAILED:** later read-only verification found completed, the expected answer, zero tool calls, and preserved history. Intermediate data were missing, so the exact trigger was not established. Wait logic and saved-state repair were added without sending another task.

**AGENT1/AGENT2 INTERRUPTED:** the same turn later became completed, showing that an early observation was treated as terminal. Stable terminal checks and status revalidation fixed those records. A future interruption may be real; never rewrite every interrupted state as success.

Inspect marker, turnId, state, and final_answer. Failure can occur in execution, state decoding, or Slack feedback. [App Server lifecycle](https://learn.chatgpt.com/docs/app-server), [Stop hook](https://learn.chatgpt.com/docs/hooks#stop), [queue test source](https://github.com/openai/codex/blob/main/codex-rs/app-server/tests/suite/v2/thread_queue.rs).

## 6. Executor and approval boundaries

- workspace-write and prompts do not enforce exact file allowlists. The project's chosen route validates structured edits in the host.
- A second tool catalog was discovered. Filter both catalogs and validate complete SSE before handing it to the SDK.
- Check inherited TOML/MCP/hooks and Windows path replacement races. Historical safeguards are project-specific, not a general sandbox proof.
- Do not install on partial test success: 18/18 new tests did not cancel the 130/138 regression result.
- Mobile approval responds to the original Codex permission request; package approval authorizes a separate controlled executor. They are not interchangeable.
- Persist claim, execution result, and Slack delivery separately. Retrying feedback must not rerun the model; query UNKNOWN/PENDING first.

References: [App Server approvals](https://learn.chatgpt.com/docs/app-server#approvals), [hook trust](https://learn.chatgpt.com/docs/hooks#review-and-trust-hooks), [mobile Remote](https://learn.chatgpt.com/docs/remote-connections). Host claim/SSE/native-handle details come from project source and offline evidence, not a guarantee in these pages.

## 7. Troubleshooting order

1. Input: real mention, bot channel membership, one role per message.
2. Slack reception: token type, scopes, events, Socket Mode, allowlists.
3. Process: current source hash/path, installed patch, duplicate consumers.
4. Identity: fixed ID/title; Codex versus another chat system.
5. Control connection: daemon/socket, WebSocket handshake, experimental capability.
6. Queue: existing submissions, unresolved prior task, quota, marker/ack persistence.
7. Execution: writer availability, approval wait, interrupted turn, missing final response.
8. Feedback: JSON encoding, stable terminal state, Slack errors.
9. Acceptance: independently verify business work, actual reboot, and new-machine migration.

Record observations and uncertainty at every step. Do not delete original history, credentials, uncertain locks, or production deduplication records to fix a status display.
