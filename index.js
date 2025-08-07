import axios from "axios";

// Load environment variables
const keywords = process.env.KEYWORDS?.split(",") || [];
const webhook = process.env.LOVABLE_WEBHOOK_URL;
const maxPerDay = parseInt(process.env.MAX_APPLICATIONS_PER_DAY || "200");

// Simulated test API (replace later with real grants API)
const TEST_API_URL = "https://jsonplaceholder.typicode.com/posts";

async function scrapeGrants() {
  console.log("🔍 Scraping real grants...");

  try {
    // Get test data
    const response = await axios.get(TEST_API_URL);
    const allGrants = response.data || [];

    // Simulate matching with keywords
    const matching = allGrants.filter(grant =>
      keywords.some(kw =>
        grant.title?.toLowerCase().includes(kw.trim().toLowerCase())
      )
    ).slice(0, maxPerDay);

    // Send matching results to webhook
    for (const grant of matching) {
      await axios.post(webhook, {
        title: grant.title,
        amount: grant.amount || "Unknown",
        link: grant.url || `https://example.com/grants/${grant.id}`
      });
    }

    console.log(`✅ ${matching.length} Grants sent to webhook.`);
  } catch (err) {
    console.error("❌ Error scraping grants:", err.message);
  }
}

// Run every 15 minutes
const interval = 15 * 60 * 1000;
scrapeGrants();
setInterval(scrapeGrants, interval);
