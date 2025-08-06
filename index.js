import axios from "axios";

const keywords = process.env.KEYWORDS?.split(",") || [];
const webhook = process.env.LOVABLE_WEBHOOK_URL;
const maxPerDay = parseInt(process.env.MAX_APPLICATIONS_PER_DAY || "200");

async function scrapeGrants() {
  try {
    console.log("Scraping grants...");

    const fakeGrants = [
      { title: "Youth Football Gear Grant", amount: "$1,000" },
      { title: "Playground Equipment Mini Grant", amount: "$500" },
    ];

    const matching = fakeGrants.filter(grant =>
      keywords.some(kw => grant.title.toLowerCase().includes(kw.trim().toLowerCase()))
    ).slice(0, maxPerDay);

    for (const grant of matching) {
     await axios.post(webhook, {
  title: grant.title,
  amount: grant.amount
});

    console.log("Done.");
  } catch (e) {
    console.error("Scraper failed:", e.message);
  }
}
const interval = 15 * 60 * 1000;
scrapeGrants();
setInterval(scrapeGrants, interval);

