## 🚀 Abuse CLI — The Funniest Mistyped-Command Handler in the Terminal

Abuse CLI is a developer-friendly (and sometimes unfriendly 😉) command-line tool that roasts you when you mistype commands—while also helping you figure out what you actually meant.

It makes your terminal fun, sarcastic, and brutally honest.

Perfect for developers who type fast, break things often, and want a good laugh while debugging.

### ⭐ Features

🔥 Roasts you when you type invalid commands

💡 Suggests the right command using fuzzy matching

😇 Choose your insult style: sarcastic, friendly, badass

🎚️ Adjustable severity levels: low, medium, high

🌍 Multi-language support (default: English)

🔧 Full config management with abuse config

📂 Uses per-user config stored in ~/.abuse/config.json

🛡️ Exempt critical commands like sudo, ssh, etc.

🔍 Logs events to help you track usage

### 📦 Installation
npm install -g abuse-cli

Now the abuse command becomes available globally.

🧪 How It Works

Whenever you mistype a command such as:

neofetech

Abuse CLI will respond with something like:

💀 Wow, even your typos have typos.
❌ Command "neofetech" is not installed.
💡 Maybe you meant: neofetch

Or in badass mode:

💀 That command was so bad the shell requested backup.
❌ Command "nnnn" is not installed.

🧩 Commands Overview

### abuse handle <attempt>

Handles mistyped or invalid commands.

Example:

abuse handle gti status

Output:

💀 Did your keyboard sneeze or was that intentional?
❌ Command "gti" is not installed.
💡 Maybe you meant: git

### abuse config

Manage your configuration.

Options:
Command Description
--set key=value Set a config key
--get key Get a config value
--delete key Delete a key
--reset Reset config to defaults
--path Show config file path
--open Open config in $EDITOR
Example:
abuse config --set severity=high
abuse config --set insult_style=badass

⚙️ Configuration

Your config lives at:

~/.abuse/config.json

Default Config:
{
"language": "en",
"severity": "medium",
"enabled": true,
"ai_enabled": false,
"ai_model": "gpt-4.1-mini",
"ai_provider": "openai",
"ai_endpoint": "",
"allow_in_scripts": false,
"exempt_commands": ["sudo", "ssh"],
"insult_style": "sarcastic",
"data_dir": "~/.abuse"
}

🎚️ Severity Levels

Choose how hard Abuse CLI should roast you:

Level Description
low Soft, gentle nudges
medium Moderate sarcasm (default)
high Extreme roasting 🔥

If a user tries setting something else:

❌ Invalid severity "super".
Available: low, medium, high

🎭 Insult Styles

Choose your roast personality:

Style Description
sarcastic Classic sarcastic programmer humor
friendly Soft, playful, harmless fun
badass Brutal, action-movie style roasting

Invalid input example:

❌ Invalid insult style "rude".
Available: sarcastic, friendly, badass

📁 Insult File Structure
data/
└── insults/
└── en/
├── sarcastic/
│ ├── low.json
│ ├── medium.json
│ └── high.json
├── friendly/
│ ├── low.json
│ ├── medium.json
│ └── high.json
└── badass/
├── low.json
├── medium.json
└── high.json

Each file contains an array of roast strings.

🛡️ Exempt Commands

Some commands should never be roasted (security reasons).

Default exemptions:

sudo

ssh

Set yours:

abuse config --set exempt_commands='["sudo","git","npm"]'

🧠 Smart Suggestion Engine

Abuse CLI uses:

string-similarity

system commands (compgen)

PATH executables

…to attempt to guess what you actually meant.

📜 Logging

Every roast is logged to:

~/.abuse/logs.jsonl

Containing:

{
"command": "gti status",
"insult": "Did your keyboard sneeze?",
"suggestion": "git",
"severity": "medium",
"language": "en",
"installed": false,
"timestamp": "2025-02-16T12:53:00Z"
}

👨‍💻 Development

Clone repo:

git clone https://github.com/yourname/abuse-cli
cd abuse-cli
npm install

Run locally:

node index.js handle testcmd

📦 Publishing
npm version patch
npm publish --access public

📜 License

MIT License © 2025

❤️ Contribute

PRs, issues, and roast submissions are welcome.
