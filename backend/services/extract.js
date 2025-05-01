const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 300;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= document.body.scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 300);
    });
  });
}

async function scrapeValorantMatches(username = "simon%23char") {
  const matchesURL = `https://tracker.gg/valorant/profile/riot/${username}/matches?platform=pc`;

  const browser = await puppeteer.launch({
    headless: "new", // full headless without flashing
    defaultViewport: null,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
  );

  try {
    await page.goto(matchesURL, { waitUntil: "networkidle0", timeout: 0 });
    await autoScroll(page);
    await new Promise((resolve) => setTimeout(resolve, 4000));

    const rawMatches = await page.evaluate(() => {
      const cards = document.querySelectorAll('[class*="match"]');
      return Array.from(cards)
        .map((card) => {
          const text = card.innerText;
          if (text?.includes("/") && text?.includes(":")) {
            return { raw: text };
          }
          return null;
        })
        .filter(Boolean);
    });

    const parsedMatches = rawMatches.map(({ raw }) => {
      const mapMatch = raw.match(
        /(Ascent|Lotus|Bind|Split|Haven|Pearl|Breeze|Fracture|Sunset|Icebox)/i
      );
      const scoreMatch = raw.match(/(\d+)\s*[:]\s*(\d+)/);
      const kdaMatch = raw.match(/(\d+)\s*\/\s*(\d+)\s*\/\s*(\d+)/);

      const map = mapMatch ? mapMatch[1] : null;
      const score = scoreMatch ? `${scoreMatch[1]} - ${scoreMatch[2]}` : null;
      const kda = kdaMatch
        ? `${kdaMatch[1]} / ${kdaMatch[2]} / ${kdaMatch[3]}`
        : null;

      let result = null;
      if (scoreMatch) {
        const us = parseInt(scoreMatch[1], 10);
        const them = parseInt(scoreMatch[2], 10);
        result = us > them ? "Victory" : "Defeat";
      }

      return { map, score, kda, result };
    });

    return parsedMatches;
  } catch (err) {
    console.error("Scraping failed:", err.message);
    return [];
  } finally {
    await browser.close();
  }
}

module.exports = scrapeValorantMatches;
