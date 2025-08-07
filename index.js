// index.js
const axios = require('axios');
const fetch = require('node-fetch'); // In case of alternate fetch logic
require('dotenv').config();

// === CONFIG ===

// Replace this with an actual live feed; using Grants.gov public sample for now
const GRANT_API_URL = 'https://api.sam.gov/opportunities/v2/search?limit=20&api_key=INSERT_YOUR_KEY_HERE&sort=-modifiedDate&status=active&type=forecast';

// Replace this with your actual Supabase webhook endpoint
const WEBHOOK_URL = 'https://yxkjasitdmchcffcacnc.supabase.co/functions/v1/vapi-webhook';

// === Fetch grants ===
async function fetchGrants() {
  try {
    const res = await axios.get(GRANT_API_URL);
    const data = res.data;
    const grants = data.opportunities || data.results || [];

    console.log(`✅ Pulled ${grants.length} grant listings`);
    return grants;
  } catch (error) {
    console.error('❌ Error fetching grants:', error.message);
    return [];
  }
}

// === Basic filter for qualifying grants ===
function qualifies(grant) {
  const amount = parseFloat(grant.estimatedFunding || grant.amount || 0);
  return amount >= 500;
}

// === Submit webhook for each application ===
async function applyToGrant(grant) {
  const payload = {
    event: 'grant_applied',
    grant_id: grant.id || grant.opportunityID || grant.noticeId || 'unknown',
    title: grant.title || grant.opportunityTitle || grant.description || 'Untitled',
    amount: grant.estimatedFunding || grant.amount || 'Unknown',
    agency: grant.agency || grant.department || 'N/A',
    url: grant.url || grant.opportunityLink || 'N/A',
    source: GRANT_API_URL
  };

  console.log(`📤 Applying to: ${payload.title}`);

  try {
    const res = await axios.post(WEBHOOK_URL, payload);
    console.log(`✅ Webhook sent. Status: ${res.status}`);
  } catch (error) {
    console.error('❌ Webhook failed:', error.message);
  }
}

// === Main logic ===
(async () => {
  console.log('🚀 Starting grant scraper...');
  const grants = await fetchGrants();

  for (const grant of grants) {
    if (qualifies(grant)) {
      await applyToGrant(grant);
    } else {
      console.log(`⚠️ Skipped: ${grant.title || 'No title'} (Below $500)`);
    }
  }

  console.log('🎯 Grant scraping session complete.');
})();
