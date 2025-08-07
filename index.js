const axios = require("axios");

const KEYWORDS = process.env.KEYWORDS?.split(",").map(k => k.trim().toLowerCase()) || [];
const WEBHOOK_URL = process.env.LOVABLE_WEBHOOK_URL;
const MAX_APPLICATIONS = parseInt(process.env.MAX_APPLICATIONS_PER_DAY || "200");

// ✅ TEMP TEST FEED — replace with real API later
const GRANT_FEED_URL = "https://gist.githubusercontent.com/tonyt9106/9b7686452e3a0dcbbe9cf3c0a6bda1b1/raw/sample-grants.json";

async function fetchGrants() {
  try {
    console.log("🔍 Scraping real grants...");
    const response = await axios.get(GRANT_FEED_URL);
    const allGrants = response.data;

    const matchedGrants = allGrants.filter(grant =>
      KEYWORDS.some(keyword => grant.title.toLowerCase().includes(keyword))
    );

    console.log(`✅ ${matchedGrants.length} matching grants found.`);

    let sentCount = 0;
    for (const grant of matchedGrants) {
      if (sentCount >= MAX_APPLICATIONS) {
        console.log("🚫 Reached max daily application limit.");
        break;
      }

      const payload = {
        event: "grant_scraped",
        grant_name: grant.title,
        amount: grant.amount,
        url: grant.url,
        scraped_at: new Date().toISOString(),
        source: "sample-grants.json"
      };

      try {
        const res = await axios.post(WEBHOOK_URL, payload, {
          headers: {
            "Content-Type": "application/json"
          }
        });
        console.log(`📤 Sent grant to webhook: ${grant.title}`);
        sentCount++;
      } catch (err) {
        console.error("❌ Failed to POST to webhook:", err.message);
      }
    }

    console.log(`✅ Done. ${sentCount} grants sent to webhook.`);

  } catch (err) {
    console.error("❌ Error scraping grants:", err.message);
  }
}

fetchGrants();
