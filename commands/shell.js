import { Command } from "commander";
import fs from "fs";
import os from "os";
import path from "path";
import chalk from "chalk";

export const shellCommand = new Command("shell")
  .description("Integrate Abuse into your shell (bash/zsh/powershell).")
  .option("--install", "Install the command-not-found handler")
  .option("--uninstall", "Remove the handler")
  .action((opts) => {
    const home = os.homedir();
    const shell = process.env.SHELL || "";

    const hookBashZsh = `
# --- Abuse command interception ---
command_not_found_handle() {
  abuse handle "$*"
}
# -----------------------------------
`;

    const hookPS = `
# --- Abuse command interception ---
function Resolve-AbuseCommand {
    param(\$cmd)
    abuse handle \$cmd
}
Register-EngineEvent PowerShell.OnCommandNotFound -SourceIdentifier AbuseNotFound -Action {
    Resolve-AbuseCommand \$Event.MessageData
}
# -----------------------------------
`;

    let targetFile;
    let hook;

    // Linux/mac
    if (shell.includes("bash")) {
      targetFile = path.join(home, ".bashrc");
      hook = hookBashZsh;
    } else if (shell.includes("zsh")) {
      targetFile = path.join(home, ".zshrc");
      hook = hookBashZsh;
    }
    // Windows
    else if (process.platform === "win32") {
      const profileDir = path.join(home, "Documents", "PowerShell");
      fs.mkdirSync(profileDir, { recursive: true });
      targetFile = path.join(profileDir, "Microsoft.PowerShell_profile.ps1");
      hook = hookPS;
    } else {
      console.log(chalk.red("⚠️ Unsupported shell."));
      return;
    }

    if (opts.install) {
      fs.appendFileSync(targetFile, `\n${hook}`);
      console.log(chalk.green(`✅ Abuse hook installed in ${targetFile}`));
      console.log(chalk.yellow("Restart your terminal to activate it."));
    } else if (opts.uninstall) {
      const rc = fs.readFileSync(targetFile, "utf8");
      const cleaned = rc.replace(hook, "");
      fs.writeFileSync(targetFile, cleaned);
      console.log(chalk.red(`❌ Abuse shell hook removed from ${targetFile}`));
    } else {
      console.log("Use --install or --uninstall");
    }
  });
