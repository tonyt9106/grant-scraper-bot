const axios = require('axios');
const fs = require('fs');

// Payload for search2 endpoint
const payload = {
  "oppStatuses": ["posted"],
  "keywords": ["youth", "sports", "nonprofit", "mental health", "equipment"],
  "fundingCategories": [],
  "agencies": [],
  "rows": 10
};

const fetchGrants = async () => {
  try {
    const response = await axios.post(
      'https://api.grants.gov/v1/api/search2',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (HeartsInTheGameBot/1.0)',
        }
      }
    );

    const results = response.data.opportunities || [];
    const timestamp = new Date().toISOString();
    const filename = `grants-${timestamp}.json`;

    fs.writeFileSync(filename, JSON.stringify(results, null, 2));
    console.log(`✅ Saved ${results.length} grants to ${filename}`);
  } catch (error) {
    console.error('❌ Error fetching grants:', error.message || error);
  }
};

fetchGrants();
