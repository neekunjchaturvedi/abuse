import fs from "fs-extra";
import path from "path";
import os from "os";
import chalk from "chalk";

export class LogManager {
  static file() {
    const dir = path.join(os.homedir(), ".abuse");
    const file = path.join(dir, "logs.jsonl");
    fs.ensureDirSync(dir);
    return file;
  }

  static log(entry) {
    const file = this.file();
    fs.appendFileSync(file, JSON.stringify(entry) + "\n");
  }

  static readLogs() {
    const file = this.file();
    if (!fs.existsSync(file)) return [];

    const lines = fs
      .readFileSync(file, "utf8")
      .trim()
      .split("\n")
      .filter(Boolean);

    return lines.map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return { error: "Invalid log line", raw: line };
      }
    });
  }

  static clear() {
    const file = this.file();
    if (fs.existsSync(file)) fs.unlinkSync(file);
  }

  static format(log) {
    return (
      chalk.gray("──────────────────────────────") +
      "\n" +
      chalk.cyan("🕒  ") +
      chalk.white(log.timestamp) +
      "\n" +
      chalk.yellow("💬  Command:   ") +
      chalk.white(log.command) +
      "\n" +
      chalk.red("💀  Insult:    ") +
      chalk.white(log.insult) +
      "\n" +
      chalk.magenta("🎚️  Severity:  ") +
      chalk.white(log.severity) +
      "\n" +
      chalk.blue("🌐  Language:  ") +
      chalk.white(log.language) +
      "\n" +
      chalk.green("⚙️  Installed: ") +
      chalk.white(log.installed) +
      "\n" +
      chalk.cyan("💡  Suggestion: ") +
      chalk.white(log.suggestion || "None") +
      "\n" +
      chalk.gray("──────────────────────────────")
    );
  }
}
