# Evidence, Versions, and Outstanding Acceptance

[中文版](../zh/04-evidence.md)

While preparing these documents, we read the historical records without restarting the production bridge, sending a new Slack test or calling a live model.

## 1. Checks made while preparing the documents

| Item | Observation | What it establishes |
|---|---|---|
| Documentation directory permissions | Unique temporary file created/written/read consistently/deleted; PASS | These operations work for this chat in this directory, not all paths |
| Source chat log | Read the specified local JSONL messages, including queue delivery and AGENT3 response | Original context recovered; raw history not published |
| Bridge package | Version 0.2.0; Codex CLI/SDK 0.160.0; Bolt 5.1.0 | Installed files, not current service health |
| Role source | Three fixed identities, claim, queue, stable state checks | Installed behavior; no new submission |
| Transport source | initialize/read/list/add allowlist, experimental opt-in, current-user paths | Installed transport scope |
| Installation records | AGENT3 route, state repair, portable update records exist | Recorded upgrades, not proof of a live process now |
| Saved original-role state | AGENT1/AGENT2 completed records; AGENT3 TURN_COMPLETED with response | Historical outcomes supported by source chat |
| Later state | Other later AGENT1/AGENT2 records are INTERRUPTED | Successful communication tests do not guarantee every later task finishes |

AGENT3 has a saved completion record. The same original chat actually received and answered the marked Slack message. Its businessSuccessIndependentlyVerified flag is false: this is communication evidence only.

## 2. Historical test results

| Item | Historical result | Limitation |
|---|---|---|
| 0.2.0 installed offline suite | 120/120 | Version/environment-specific; not rerun |
| Executor smoke | Real SDK, fixed local response, one controlled write, replay denied | No live-model edit or business acceptance |
| 0.2.1 permission candidate | 18/18 new; 130/138 full suite | Not installed |
| Initial notifier offline suite | 23 passed | Real hooks/mobile events validated separately later |
| Mobile approval and notifications | Approval, fixed response, and Slack summary observed | Not every tool/hook combination covered |
| Original desktop communication test | completed, expected answer, zero tools, preserved history, SUCCEEDED | Communication test, not project verification |
| Original AGENT1/AGENT2 route | TURN_COMPLETED and original answers returned | Later tasks require their own state check |
| Login startup check | Registry/user/path/Node/notifier/daemon/socket checks passed | Actual reboot round trip not performed |

## 3. Outstanding work

- ChatGPT: the connection attempt was unsuccessful; outside this Codex/Slack handbook's main scope.
- Actual reboot, login, original writer availability, Slack round trip, and notification acceptance.
- New-machine history/authentication/state migration, rebinding, mobile pairing, and reboot acceptance.
- Live-model executor edits and business acceptance, under separately verified authorization.
- If 0.2.1 development resumes, resolve full-suite failures and revalidate scope before installation.

## 4. Anonymized source locations

These paths describe historical artifacts. They are templates, not paths that exist on every machine. No raw chat logs, state bodies, credentials, backup history, or candidate archives are published.

- Source chat: `<SOURCE_CHAT_LOG_FILE>`.
- Bridge: `<BRIDGE_DIR>`.
- Installation records: `<INSTALL_VERIFICATION_RECORD>`, `<ADDITIONAL_ROLE_INSTALL_RECORD>`, `<ROLE_STATUS_PATCH_RECORD>`, `<PORTABLE_INSTALL_RECORD>`.
- Original-route state: `.state/original-work-role-deliveries`; only role/state/time fields were used in this document.
- Source output: `<ARTIFACTS_DIR>`.
- Early CONTROL-CHECK/README documents describe an unconnected route; later migration guidance predates AGENT3. Read them in the order the work progressed.
- The notifier README contains an early not-enabled state; later real tests supplied the missing evidence.
- Controlled-executor historical experience: `<EXPERIENCE_RECORD_FILE>`, cross-checked against artifacts and the source chat.

Read old titles and versions alongside later tests. If the source and this guide disagree, check again, update the guide and keep the original records.

## 5. Official documentation versus deployed details

[Slack Socket Mode](https://docs.slack.dev/apis/events-api/using-socket-mode/) explains transport and app tokens. [App Server](https://learn.chatgpt.com/docs/app-server) explains thread read/resume, approvals, status, and permissions. [Remote](https://learn.chatgpt.com/docs/remote-connections) explains account/host and mobile access.

These pages were opened in this run. The public App Server page did not reveal thread/queue/add. Queue fields, Windows proxy handshake, and polling details are based on deployed source/schema and historical testing, not a stable cross-version public API promise.
