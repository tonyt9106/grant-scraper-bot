import axios from "axios";

// Environment variables
const keywords = process.env.KEYWORDS?.split(",") || [];
const webhook = process.env.LOVEABLE_WEBHOOK_URL;
const maxPerDay = parseInt(process.env.MAX_APPLICATIONS_PER_DAY || "200");

// Authorization token for Supabase webhook
const authToken = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkZGRxaWZibWNrd2p2aXJ3cGVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNTUzNzcsImV4cCI6MjA2NTYzMTM3N30.xF4Ltftrr-_nT0Pq7ahYUNNiJUhPjQg5RNsfHm83pgo";

// Main grant scraping function
async function scrapeGrants() {
  console.log("🔍 Scraping real grants...");

  try {
    const response = await axios.get("https://api.publicgrants.io/grants");
    const allGrants = response.data || [];

    const matching = allGrants.filter((grant) =>
      keywords.some((kw) =>
        grant.title.toLowerCase().includes(kw.trim().toLowerCase())
      )
    ).slice(0, maxPerDay);

    for (const grant of matching) {
      await axios.post(
        webhook,
        {
          title: grant.title,
          amount: grant.amount,
          link: grant.url,
        },
        {
          headers: {
            Authorization: authToken,
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log("✅ Grants sent to webhook.");
  } catch (err) {
    console.error("❌ Error scraping grants:", err.message);
  }
}

// Interval setup (15 minutes)
const interval = 15 * 60 * 1000;
scrapeGrants();
setInterval(scrapeGrants, interval);
