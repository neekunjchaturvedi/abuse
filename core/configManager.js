import fs from "fs-extra";
import path from "path";
import os from "os";

const CONFIG_PATH = path.join(os.homedir(), ".abuse", "config.json");

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
  data_dir: path.join(os.homedir(), ".abuse"),
};

function ensureConfigExists() {
  const dir = path.dirname(CONFIG_PATH);
  fs.ensureDirSync(dir);

  if (!fs.existsSync(CONFIG_PATH)) {
    fs.writeJsonSync(CONFIG_PATH, defaultConfig, { spaces: 2 });
  }
}

function loadConfig() {
  ensureConfigExists();
  try {
    const userConfig = fs.readJsonSync(CONFIG_PATH);
    return { ...defaultConfig, ...userConfig };
  } catch (err) {
    console.error(
      "⚠️ Failed to load config, resetting to defaults:",
      err.message
    );
    saveConfig(defaultConfig);
    return defaultConfig;
  }
}

function saveConfig(newConfig) {
  ensureConfigExists();
  fs.writeJsonSync(CONFIG_PATH, newConfig, { spaces: 2 });
}

function updateConfig(key, value) {
  const config = loadConfig();
  config[key] = value;
  saveConfig(config);
  console.log(`✅ Updated '${key}' to`, value);
}

export { CONFIG_PATH, defaultConfig, loadConfig, saveConfig, updateConfig };
