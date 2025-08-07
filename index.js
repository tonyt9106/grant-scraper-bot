import axios from "axios";

const keywords = process.env.KEYWORDS?.split(",") || [];
const webhook = process.env.LOVABLE_WEBHOOK_URL;
const maxPerDay = parseInt(process.env.MAX_APPLICATIONS_PER_DAY || "200");

// ✅ Debug log to confirm webhook is being picked up correctly
console.log("Using webhook:", webhook);

async function scrapeGrants() {
  console.log("🔍 Scraping real grants...");

  try {
    const response = await axios.get("https://api.publicgrants.io/grants"); // Placeholder API
    const allGrants = response.data || [];

    const matching = allGrants
      .filter((grant) =>
        keywords.some((kw) =>
          grant.title.toLowerCase().includes(kw.trim().toLowerCase())
        )
      )
      .slice(0, maxPerDay);

    for (const grant of matching) {
      await axios.post(webhook, {
        event: "grant_scraped",
        grant_name: grant.title,
        amount: grant.amount,
        link: grant.url,
        scraped_at: new Date().toISOString(),
        source: "AutoGrantBot",
      });
    }

    console.log(`✅ ${matching.length} grants sent to webhook.`);
  } catch (err) {
    console.error("❌ Error scraping grants:", err.message);
  }
}

// ⏰ Run every 15 minutes
const interval = 15 * 60 * 1000;
scrapeGrants();
setInterval(scrapeGrants, interval);
