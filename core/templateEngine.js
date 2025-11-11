import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

export class TemplateEngine {
  constructor(lang = "en", style = "sarcastic") {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const insultFile = path.resolve(
      __dirname,
      "../data/insults",
      lang,
      `${style}.json`
    );

    try {
      if (fs.existsSync(insultFile)) {
        this.insults = fs.readJSONSync(insultFile);
      } else {
        console.warn(
          `⚠️  No insult file found for ${lang}/${style}. Using fallback.`
        );
        this.insults = ["You absolute genius, that's not even close."];
      }
    } catch (err) {
      console.error("❌ Failed to load insult file:", err.message);
      this.insults = ["Your command broke faster than my patience."];
    }
  }

  generateInsult(severity = "medium", style = "sarcastic") {
    if (!Array.isArray(this.insults) || this.insults.length === 0) {
      return "You're doing great... somewhere else.";
    }

    // Optionally adjust by severity later
    const pool = this.insults;
    return pool[Math.floor(Math.random() * pool.length)];
  }
}
