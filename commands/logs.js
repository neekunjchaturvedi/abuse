import { Command } from "commander";
import { LogManager } from "../core/logManager.js";

export const logsCommand = new Command("logs")
  .description("🪵 View or clear abuse CLI logs.")
  .argument("[count]", "Number of recent logs to show", null)
  .option("--clear", "Clear all logs")
  .action((count, options) => {
    if (options.clear) {
      LogManager.clear();
      console.log("🧹 Logs cleared!");
      return;
    }

    const logs = LogManager.readLogs();

    if (!logs.length) {
      console.log("📭 No logs found.");
      return;
    }

    let selectedLogs = logs;

    if (count !== null) {
      const n = parseInt(count, 10);
      if (!isNaN(n) && n > 0) {
        selectedLogs = logs.slice(-n);
      }
    }

    console.log(`📜 Showing ${selectedLogs.length} log(s):\n`);

    for (const log of selectedLogs) {
      console.log(LogManager.format(log));
      console.log(); // spacing
    }
  });
