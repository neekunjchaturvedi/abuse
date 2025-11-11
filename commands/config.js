import { Command } from "commander";
import fs from "fs";
import os from "os";
import path from "path";
import chalk from "chalk";

const CONFIG_DIR = path.join(os.homedir(), ".abuse");
const CONFIG_PATH = path.join(CONFIG_DIR, "config.json");

const defaultConfig = {
  language: "en",
  severity: "medium",
  enabled: true,
  ai_enabled: false,
  ai_model: "gpt-4.1-mini",
  ai_provider: "openai",
  ai_endpoint: "",
  allow_in_scripts: false,
  exempt_commands: ["sudo", "ssh"],
  insult_style: "sarcastic",
  data_dir: "~/.abuse",
};

// Ensure config folder & file exist
function ensureConfigExists() {
  if (!fs.existsSync(CONFIG_DIR)) fs.mkdirSync(CONFIG_DIR, { recursive: true });

  if (!fs.existsSync(CONFIG_PATH)) {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(defaultConfig, null, 2));
  }
}

// Load config
function loadConfig() {
  ensureConfigExists();
  const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
  const data = JSON.parse(raw);
  return { ...defaultConfig, ...data }; // merge defaults + user config
}

// Save config
function saveConfig(config) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

export const configCommand = new Command("config")
  .description("⚙️ Manage Abuse CLI configuration.")
  .option("-s, --set <key=value>", "Set a configuration value")
  .option("-g, --get <key>", "Get a configuration value")
  .option("-r, --reset", "Reset config to defaults")
  .option("-p, --path", "Show config file path")
  .action((options) => {
    ensureConfigExists();
    let config = loadConfig();

    if (options.path) {
      console.log(CONFIG_PATH);
      return;
    }

    if (options.reset) {
      saveConfig(defaultConfig);
      console.log(chalk.yellowBright("🔄 Config reset to defaults."));
      return;
    }

    if (options.set) {
      const [key, value] = options.set.split("=");
      if (!key || value === undefined) {
        console.log(chalk.red("❌ Usage: abuse config --set key=value"));
        return;
      }

      config[key] = parseValue(value);
      saveConfig(config);
      console.log(chalk.green(`✅ Set ${key} = ${value}`));
    } else if (options.get) {
      console.log(config[options.get] ?? chalk.gray("⚠️ Not found"));
    } else {
      console.log(chalk.cyan("🧩 Current config:"));
      console.log(JSON.stringify(config, null, 2));
    }
  });

// Helper to auto-parse booleans, numbers, etc.
function parseValue(value) {
  if (value === "true") return true;
  if (value === "false") return false;
  if (!isNaN(value)) return Number(value);
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}
