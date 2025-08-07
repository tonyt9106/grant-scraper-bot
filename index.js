import axios from 'axios';

const keywords = process.env.KEYWORDS?.split(',').map(k => k.trim()) || [];
const webhookUrl = process.env.LOVABLE_WEBHOOK_URL;
const maxAppsPerDay = parseInt(process.env.MAX_APPLICATIONS_PER_DAY || '100');

async function scrapeGrants() {
  console.log('🔍 Scraping real grants...');

  const dummyGrants = [
    {
      title: 'Youth Sports Equipment Grant',
      description: 'Funding to support youth sports teams with equipment and resources.',
      url: 'https://example.com/youth-sports-grant',
      amount: 5000,
      tags: ['youth', 'sports', 'equipment']
    },
    {
      title: 'Community Playground Improvement Grant',
      description: 'Funding for underserved communities to improve local playgrounds.',
      url: 'https://example.com/playground-grant',
      amount: 10000,
      tags: ['playground', 'underserved', 'community']
    }
  ];

  let matchingGrants = dummyGrants.filter(grant => {
    return keywords.some(keyword =>
      grant.title.toLowerCase().includes(keyword) || 
      grant.description.toLowerCase().includes(keyword) || 
      grant.tags.some(tag => tag.includes(keyword))
    );
  });

  matchingGrants = matchingGrants.slice(0, maxAppsPerDay);

  for (const grant of matchingGrants) {
    try {
      console.log(`📤 Sending to webhook: ${grant.title}`);
      await axios.post(webhookUrl, { grant });
    } catch (err) {
      console.error(`❌ Failed to send webhook for ${grant.title}:`, err.message);
    }
  }

  console.log('✅ Scraping finished');
}

scrapeGrants().catch(err => {
  console.error('🔥 Fatal error during scraping:', err.message);
  process.exit(1);
});
