## 💀 Abuse — CLI Roasts

Abuse is a small command-line tool that responds to mistyped shell commands with a witty roast. It's configurable, multi-language ready, and intended for developers who like a little personality in their terminal.

## Highlights

- Playful roasts on invalid commands
- Fuzzy suggestions for likely intended commands
- Configurable "insult style" (sarcastic, friendly, badass)
- Adjustable severity levels (low, medium, high)
- Safe defaults: critical commands can be exempted

## Install

Install from npm (global):

```bash
npm install -g abuse-plus
```

After installation the `abuse` command is available system-wide.

## 🔌 Shell Integration (Recommended)

To automatically roast mistyped commands in your shell, run:

```bash
abuse shell --install
```

This will append a hook to your .bashrc / .zshrc that forwards failed commands to Abuse.

## Quick Usage

Handle a mistyped command (example):

```bash
abuse handle gti status
```

Example output:

> ❌ Command "gti" not found. \
> 💡 Did you mean: `git`?

Manage config:

```bash
abuse config --set severity=high
abuse config --get severity
abuse config --path
```

## Commands

- `abuse handle <attempt>` — Analyze a mistyped command and respond.
- `abuse config [--set|--get|--delete|--reset|--path|--open]` — Manage user configuration.
- `abuse analyze` — (dev) run suggestion engine diagnostics.

See `bin/abuse.js` and `commands/` for the implementation and options.

## Configuration

User config is stored at `~/.abuse/config.json`.

Example defaults:

```json
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
```

Config tips:

- `severity`: `low` | `medium` | `high` (default: `medium`)
- `insult_style`: `sarcastic` | `friendly` | `badass`
- `exempt_commands`: list commands that should never be roasted

## Severity & Styles

Severity levels control how aggressive the output is:

- `low` — gentle nudges
- `medium` — moderate sarcasm (default)
- `high` — strong roasts

Insult styles define tone:

- `sarcastic` — dry programmer humor
- `friendly` — light-hearted, safe
- `badass` — bold, action-movie style

## Data layout

The insult phrases live under `data/insults/<lang>/<style>/<level>.json`. Each file is an array of strings.

Example structure:

```
data/
└── insults/
		└── en(english)/
				├── sarcastic/
				│   ├── low.json
				│   ├── medium.json
				│   └── high.json
				├── friendly/
				│   ├── low.json
				│   ├── medium.json
				│   └── high.json
				└── badass/
					├── low.json
					├── medium.json
					└── high.json
			hi(hindi)/
				├── sarcastic/
				│   ├── low.json
				│   ├── medium.json
				│   └── high.json
				├── friendly/
				│   ├── low.json
				│   ├── medium.json
				│   └── high.json
				└── badass/
					├── low.json
					├── medium.json
					└── high.json
			te(telugu)/
				├── sarcastic/
				│   ├── low.json
				│   ├── medium.json
				│   └── high.json
				├── friendly/
				│   ├── low.json
				│   ├── medium.json
				│   └── high.json
				└── badass/
					├── low.json
					├── medium.json
					└── high.json
```

## Exempt Commands

By default, critical commands such as `sudo` and `ssh` are exempt. Add or modify exemptions via config:

```bash
abuse config --set exempt_commands='["sudo","git","npm"]'
```

## Suggestion Engine & Logging

The suggestion engine combines:

- local PATH scanning
- string-similarity matching
- shell completion lists (where available)

Roasts and suggestions are logged to `~/.abuse/logs.jsonl` as JSON lines with fields like `command`, `suggestion`, `insult`, `severity`, and `timestamp`.

## Development

Clone and run locally:

```bash
git clone https://github.com/neekunjchaturvedi/abuse
cd abuse
npm install
node bin/abuse.js handle testcmd
```

Project layout highlights:

- `bin/abuse.js` — CLI entrypoint
- `commands/` — command implementations (`handle`, `config`, `analyze`, etc.)
- `core/` — config and log managers, template engine
- `data/insults` — insult datasets

## Contributing

Contributions are welcome: bug reports, PRs, and new roast entries. Please:

1. Fork the repo
2. Create a descriptive branch
3. Add tests where applicable
4. Open a PR with a clear description

## License

MIT © 2025

## Contact

If you have questions or suggestions, open an issue or reach out via the repository.

#### https://github.com/neekunjchaturvedi/abuse

## Whats Tuning Up

```bash
Windows OS support
AI Integrations
Statistics
and much more
```

## What You can do

`Contribute towards Roasts for your prefered language`

`Come up with new ideas`

`Maybe just a correction in the code`
