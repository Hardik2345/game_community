const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

// Utility: calculate stats
const calcStatsFromMatches = (matches) => {
  const total = matches.length;
  const wins = matches.filter((m) => m.result === "Victory").length;
  const avgKDA =
    matches.reduce((acc, m) => {
      const [k, d, a] = m.kda?.split(" / ").map(Number) || [0, 1, 0];
      return acc + (k + a) / d;
    }, 0) / total;

  return {
    winPercentage: Math.round((wins / total) * 100),
    kdaRatio: +avgKDA.toFixed(2),
    matchesPlayed: total,
    rating: Math.round(avgKDA * 100),
  };
};

// Listen for message from parent
process.on("message", async ({ riotId }) => {
  const encodedId = encodeURIComponent(riotId);
  const url = `https://tracker.gg/valorant/profile/riot/${encodedId}/matches`;

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 0 });

    // Scroll to load matches
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

    // Scrape matches
    const rawMatches = await page.evaluate(() => {
      const matchElements = document.querySelectorAll('[class*="match"]');
      return Array.from(matchElements).map((el) => el.innerText);
    });

    const parsedMatches = rawMatches
      .map((text) => {
        const map = (text.match(
          /(Ascent|Lotus|Bind|Split|Haven|Pearl|Breeze|Fracture|Sunset|Icebox)/i
        ) || [])[0];
        const score = (text.match(/(\d+)\s*[:]\s*(\d+)/) || [])
          .slice(1)
          .join(" - ");
        const kdaMatch = text.match(/(\d+)\s*\/\s*(\d+)\s*\/\s*(\d+)/);
        const kda = kdaMatch
          ? `${kdaMatch[1]} / ${kdaMatch[2]} / ${kdaMatch[3]}`
          : null;
        const result =
          kda && score
            ? parseInt(score.split(" - ")[0]) > parseInt(score.split(" - ")[1])
              ? "Victory"
              : "Defeat"
            : null;

        return { map, score, kda, result };
      })
      .filter((m) => m.kda && m.result);

    await browser.close();

    if (parsedMatches.length === 0) {
      process.send({ success: false, error: "No matches found." });
    } else {
      const stats = calcStatsFromMatches(parsedMatches);
      process.send({ success: true, stats });
    }

    process.exit();
  } catch (error) {
    process.send({ success: false, error: error.message });
    process.exit(1);
  }
});
