# Troubleshooting References

[中文版](../zh/05-references.md)

## Interfaces, approvals and deployment

| Source | Analysis supported | Attempt / scope |
|---|---|---|
| [OpenAI App Server](https://learn.chatgpt.com/docs/app-server) | Thread read/resume and connection ownership | Reading saved history is not desktop control |
| [Approval protocol](https://learn.chatgpt.com/docs/app-server#approvals) | Requests belong to their execution connection | 0.2.1 only responded to bridge-owned requests |
| [Hooks](https://learn.chatgpt.com/docs/hooks) | Lifecycle events | Six event types used for notification, not approval |
| [Hook trust](https://learn.chatgpt.com/docs/hooks#review-and-trust-hooks) | Installed hooks may remain inactive | Review/trust rather than relying on worker READY |
| [Stop hook](https://learn.chatgpt.com/docs/hooks#stop) | End-of-turn signal | Final-answer excerpts do not prove business success |
| [Remote connections](https://learn.chatgpt.com/docs/remote-connections) | Mobile messages and approval | Same account/workspace and online host; test separately |
| [Microsoft Run/RunOnce](https://learn.microsoft.com/en-us/windows/win32/setupapi/run-and-runonce-registry-keys) | User-login startup | Registration is not actual reboot acceptance |
| [Third-party Desktop Commander setup](https://github.com/desktop-commander/remote-desktop-commander/blob/main/docs/SETUP.md) | Optional historical maintenance service | Not required by the original-thread queue; cited in old ops guidance |

## Transport, encoding and paths

| Source | Content used | Related problem |
|---|---|---|
| [Slack Socket Mode](https://docs.slack.dev/apis/events-api/using-socket-mode/) | Outbound WebSocket, app token, event subscription | App setup and no public endpoint |
| [Official queue test source](https://github.com/openai/codex/blob/main/codex-rs/app-server/tests/suite/v2/thread_queue.rs) | Queue list/add tests | Source reference only; moving main does not replace deployed 0.160.0 schema |
| [MDN WebSocket servers](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers) | Upgrade/101/accept header, frames, ping/pong | Why raw JSON before handshake failed; frame processing |
| [Microsoft character encoding](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_character_encoding) | Windows PowerShell versus modern UTF-8/BOM behavior | Chinese scripts, JSON decoding, BOM tolerance |
| [Microsoft Windows paths](https://learn.microsoft.com/en-us/windows/win32/fileio/naming-a-file) | Namespaces, extended paths, length | Prefix containment false rejection and temporary-tree copying |

## Checks the references cannot replace

- Paginated history, invalid enums, and active-writer ownership are distinct conditions; one generic passage cannot diagnose every RPC rejection.
- One machine's queue test does not guarantee another version, host, or non-Codex chat exposes the same route.
- UNKNOWN/FAILED may originate in execution, state reads, or feedback; inspect marker, turn, and stored state together.
- Test counts, backups, unchanged worktrees, and installation results are project evidence, not conclusions certified by an external page.
