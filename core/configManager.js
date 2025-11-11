import fs from "fs";
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
  data_dir: "~/.abuse",
};

function ensureConfigExists() {
  const dir = path.dirname(CONFIG_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  if (!fs.existsSync(CONFIG_PATH)) {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(defaultConfig, null, 2));
  }
}

function loadConfig() {
  ensureConfigExists();
  try {
    const raw = fs.readFileSync(CONFIG_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return { ...defaultConfig, ...parsed };
  } catch (err) {
    console.error("⚠️ Failed to load config, using defaults:", err.message);
    return defaultConfig;
  }
}

function saveConfig(newConfig) {
  ensureConfigExists();
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(newConfig, null, 2));
}

function updateConfig(key, value) {
  const config = loadConfig();
  config[key] = value;
  saveConfig(config);
  console.log(`✅ Updated '${key}' to '${value}'`);
}

export { CONFIG_PATH, defaultConfig, loadConfig, saveConfig, updateConfig };
