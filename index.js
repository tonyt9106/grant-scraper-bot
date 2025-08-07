import axios from "axios";

const keywords = process.env.KEYWORDS?.split(",") || [];
const webhook = process.env.LOVABLE_WEBHOOK_URL;
const maxPerDay = parseInt(process.env.MAX_APPLICATIONS_PER_DAY || "200");

async function scrapeGrants() {
  console.log("Scraping real grants...");

  try {
    const response = await axios.get("https://api.publicgrants.io/grants"); // Replace this with real API later
    const allGrants = response.data || [];

    const matching = allGrants
      .filter(grant =>
        keywords.some(kw =>
          grant.title.toLowerCase().includes(kw.trim().toLowerCase())
        )
      )
      .slice(0, maxPerDay);

    for (const grant of matching) {
      await axios.post(webhook, {
        title: grant.title,
        amount: grant.amount,
        link: grant.url,
      });
    }

    console.log("✅ Grants sent to webhook.");
  } catch (err) {
    console.error("❌ Error scraping grants:", err.message);
  }
}

const interval = 15 * 60 * 1000;
scrapeGrants();
setInterval(scrapeGrants, interval);

