import { Command } from "commander";
import fs from "fs";
import os from "os";
import path from "path";
import chalk from "chalk";
import { execSync } from "child_process";

const CONFIG_DIR = path.join(os.homedir(), ".abuse");
const CONFIG_PATH = path.join(CONFIG_DIR, "config.json");

// ENUMS
const VALID_SEVERITIES = ["low", "medium", "high"];
const VALID_STYLES = ["sarcastic", "friendly", "badass"];

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

// Ensure config exists
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
  return { ...defaultConfig, ...data };
}

// Save config
function saveConfig(config) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

// Smart parser
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

// Validate enums
function validateEnum(key, value) {
  if (key === "severity") {
    if (!VALID_SEVERITIES.includes(value)) {
      console.log(chalk.red(`❌ Invalid severity: "${value}"`));
      console.log(chalk.yellow(`➡️  Allowed: ${VALID_SEVERITIES.join(", ")}`));
      return false;
    }
  }

  if (key === "insult_style") {
    if (!VALID_STYLES.includes(value)) {
      console.log(chalk.red(`❌ Invalid insult_style: "${value}"`));
      console.log(chalk.yellow(`➡️  Allowed: ${VALID_STYLES.join(", ")}`));
      return false;
    }
  }

  return true;
}

export const configCommand = new Command("config")
  .description("⚙️ Manage Abuse CLI configuration.")
  .option("-s, --set <key=value>", "Set a configuration value")
  .option("-g, --get <key>", "Get a configuration value")
  .option("-d, --delete <key>", "Delete a config key")
  .option("-r, --reset", "Reset config to defaults")
  .option("-p, --path", "Show config file path")
  .option("-o, --open", "Open config file in editor")
  .action((options) => {
    ensureConfigExists();
    let config = loadConfig();

    // PATH
    if (options.path) {
      console.log(CONFIG_PATH);
      return;
    }

    // OPEN
    if (options.open) {
      const editor = process.env.EDITOR || "nano";
      console.log(chalk.green(`📝 Opening config with: ${editor}`));
      try {
        execSync(`${editor} "${CONFIG_PATH}"`, { stdio: "inherit" });
      } catch (err) {
        console.error(chalk.red("❌ Failed to open editor:", err.message));
      }
      return;
    }

    // RESET
    if (options.reset) {
      saveConfig(defaultConfig);
      console.log(chalk.yellowBright("🔄 Config reset to defaults."));
      return;
    }

    // DELETE
    if (options.delete) {
      const key = options.delete;
      if (!(key in config)) {
        console.log(chalk.red(`❌ Key '${key}' does not exist in config.`));
        return;
      }
      delete config[key];
      saveConfig(config);
      console.log(chalk.green(`🗑️ Deleted key '${key}' from config.`));
      return;
    }

    // SET
    if (options.set) {
      const [key, valueRaw] = options.set.split("=");

      if (!key || valueRaw === undefined) {
        console.log(chalk.red("❌ Usage: abuse config --set key=value"));
        return;
      }

      const value = parseValue(valueRaw);

      // ENUM VALIDATION
      if (!validateEnum(key, value)) return;

      config[key] = value;
      saveConfig(config);
      console.log(chalk.green(`✅ Set ${key} = ${value}`));
      return;
    }

    // GET
    if (options.get) {
      const key = options.get;
      if (!(key in config)) {
        console.log(chalk.gray("⚠️ Key not found"));
        return;
      }
      console.log(config[key]);
      return;
    }

    // SHOW FULL CONFIG
    console.log(chalk.cyan("🧩 Current config:"));
    console.log(JSON.stringify(config, null, 2));
  });
