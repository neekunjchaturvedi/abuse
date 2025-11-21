import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class TemplateEngine {
  constructor(severity = "medium", style = "sarcastic", lang = "en") {
    const basePath = path.join(__dirname, "../data/insults");
    const file = path.join(basePath, lang, style, `${severity}.json`);

    if (fs.existsSync(file)) {
      this.insults = JSON.parse(fs.readFileSync(file, "utf8"));
    } else {
      console.log(
        `⚠️  No insult file found for ${lang}/${style}/${severity}. Using fallback.`
      );
      this.insults = ["You absolute genius, that's not even close."];
    }
  }

  generateInsult() {
    const pool = this.insults;
    return pool[Math.floor(Math.random() * pool.length)];
  }
}
