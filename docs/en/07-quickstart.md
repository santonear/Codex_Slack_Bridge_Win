# Windows Quick Start

[中文](../zh/07-quickstart.md)

## Requirements

You need Windows, Node.js 22.16 or later, a signed-in Codex desktop app, and a Slack workspace where you can install apps. Keep the computer online. This release has no installer or login autostart.

Create a dedicated Slack app for a first setup. Do not run two bridges for the same bot.

## Launch

Download and extract the repository ZIP, then double-click Start-Bridge.cmd. If Node is missing, install it from the [official download page](https://nodejs.org/en/download) and launch again. First-time dependency setup asks for confirmation; enter y. Internet access is required.

The browser opens a wizard listening only on 127.0.0.1. Do not share the full URL, which contains a local session credential.

## Setup and testing

1. Check Windows, Node and private storage.
2. Open Codex, sign in and select “Check and list chats.” This step reads without sending a task. An incompatible API will not trigger a substitute chat.
3. Download the manifest and import it in [Slack app management](https://api.slack.com/apps). Enable Socket Mode, create an app-level token with connections:write, install the app and invite the bot to the target channel.
4. Enter the xoxb bot token, xapp app token, workspace ID, channel ID and allowed user IDs. Separate users with commas. Display names are not IDs. Authentication does not verify channel reception.
5. Choose existing chats for AGENT1, AGENT2, etc., and confirm titles. You can enter IDs and titles manually. Bind each chat only once.
6. Save settings. Saving rechecks Slack identity and desktop chats. Start the bridge after those checks pass.
7. Select an agent and generate a test command. In Slack, type @, select your actual bot and paste the command after the mention. Send it in the configured channel.

The test requires Slack reception, original-chat enqueueing, a matching final answer, no tool use and Slack feedback. Saving settings does not replace a round-trip test.

## Find your Slack IDs

Open your workspace in a browser. Its address usually looks like https://app.slack.com/client/TEAM_ID/CHANNEL_ID. The T-prefixed segment after /client/ is the workspace ID; an E-prefixed organization ID is not accepted. Copy the channel ID from channel details. Open your own member profile, select More → Copy member ID, and paste it into the allowed users field. Repeat for any other allowed member.

References: [Slack URL and ID](https://slack.com/intl/en-gb/help/articles/221769328-Locate-your-Slack-URL-or-ID), [member ID](https://slack.com/intl/en-gb/help/articles/360003827751-Create-a-link-to-a-members-profile-).

## Daily use

After selecting the actual bot mention, send AGENT1: your task or AGENT1: status. The new runtime also accepts 状态. Use one agent per message. The original chat keeps its permissions; respond to approval requests in Codex. The bridge does not approve them.

The default shared daily limit is 30 and the tracking timeout is 90 seconds. Query status after a timeout rather than resending. “Refresh result” checks the current wizard test and can deliver a confirmed final answer without enqueueing again.

Keep the browser and launcher running. “Stop Bridge” stops Slack reception while leaving setup available. Closing the launcher ends the service. Launch again to reuse saved settings; old tasks are not replayed.

## Local data

Settings, tokens and delivery records live in the Windows user application-data directory under CodexSlackBridgeWin, outside the source folder, protected by restrictive Windows ACLs. Saved tokens are not displayed; blank fields reuse them.

Preview diagnostics before downloading. Reports exclude chat text, credentials, actual paths and identities. Do not upload the full local data directory.

[Runtime troubleshooting](08-runtime-troubleshooting.md) · [Slack manifests](https://docs.slack.dev/app-manifests/) · [Socket Mode](https://docs.slack.dev/tools/bolt-js/concepts/socket-mode/) · [Codex App Server](https://learn.chatgpt.com/docs/app-server)

Long replies retain acknowledged parts. If the last part’s delivery is uncertain, a status query explains it. Send AGENT1: retry feedback only if you accept a possible duplicate of that part; this does not resubmit the task. The daily limit resets by UTC calendar day.
