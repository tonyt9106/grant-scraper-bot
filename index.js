const axios = require('axios');

const GRANTS_API_URL = 'https://api.grants.gov/v1/api/search2';
const SUPABASE_WEBHOOK_URL = 'https://yxkjasitdmchcffcacnc.supabase.co/functions/v1/grant-webhook';

const payload = {
  "oppStatuses": ["posted"],
  "keywords": ["youth", "sports", "mental health", "equipment", "community"],
  "fundingCategories": [],
  "agencies": [],
  "rows": 20
};

const fetchAndSendGrants = async () => {
  try {
    const response = await axios.post(GRANTS_API_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (HeartsInTheGameBot/1.0)'
      }
    });

    const grants = response.data.opportunities || [];

    console.log(`✅ Found ${grants.length} grants`);

    for (const grant of grants) {
      const data = {
        grant_id: grant.opportunityId,
        title: grant.title,
        agency_code: grant.agencyCode,
        agency_name: grant.agencyName,
        open_date: grant.openDate,
        close_date: grant.closeDate,
        status: grant.opportunityStatus,
        url: `https://www.grants.gov/search-results-detail/${grant.opportunityId}`,
        raw_json: grant
      };

      try {
        await axios.post(SUPABASE_WEBHOOK_URL, data);
        console.log(`✅ Sent grant ${grant.opportunityId} to Supabase`);
      } catch (err) {
        console.error(`❌ Failed to send grant ${grant.opportunityId}:`, err.message);
      }
    }
  } catch (err) {
    console.error('❌ Error fetching grants:', err.message);
  }
};

fetchAndSendGrants();
