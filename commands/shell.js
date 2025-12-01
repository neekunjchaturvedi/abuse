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

    // ---------- 🐧 Bash
    const hookBash = `
# --- Abuse++ Hook (Bash/Zsh) ---
command_not_found_handle() {
  abuse handle "$*"
}`;
    // 🦊 Zsh ----------
    const hookZsh = `

command_not_found_handler() {
  abuse handle "$*"
}
# --------------------------------
`;

    // ---------- 🪟 PowerShell ----------
    const hookPowerShell = `
# --- Abuse Command Not Found Hook ---
function CommandNotFoundHandler(\$commandName, \$commandArgs) {
    abuse handle "\$commandName"
}
# -------------------------------------
`;

    // Determine which shell config file to patch
    let targetFile;
    let hookCode;

    if (shell.includes("bash")) {
      targetFile = path.join(home, ".bashrc");
      hookCode = hookBash;
    } else if (shell.includes("zsh")) {
      targetFile = path.join(home, ".zshrc");
      hookCode = hookZsh;
    } else if (process.platform === "win32") {
      const profileDir = path.join(home, "Documents", "PowerShell");
      fs.mkdirSync(profileDir, { recursive: true });
      targetFile = path.join(profileDir, "Microsoft.PowerShell_profile.ps1");
      hookCode = hookPowerShell;
    } else {
      console.log(chalk.red("⚠️ Unsupported shell."));
      return;
    }

    // ---------- INSTALL ----------
    if (opts.install) {
      fs.appendFileSync(targetFile, `\n${hookCode}`);
      console.log(chalk.green(`✅ Abuse hook installed in ${targetFile}`));
      console.log(
        chalk.yellow(
          "Restart your terminal or run: source ~/.zshrc / ~/.bashrc"
        )
      );
      return;
    }

    // ---------- UNINSTALL ----------
    if (opts.uninstall) {
      const content = fs.readFileSync(targetFile, "utf8");
      const cleaned = content.replace(hookCode, "");
      fs.writeFileSync(targetFile, cleaned);
      console.log(chalk.red(`❌ Abuse hook removed from ${targetFile}`));
      return;
    }

    console.log("Use --install or --uninstall");
  });
