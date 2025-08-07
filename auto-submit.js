import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { grant_id } = req.body;

  const { data: grant, error } = await supabase
    .from('grants')
    .select('*')
    .eq('id', grant_id)
    .single();

  if (error || !grant) {
    return res.status(404).json({ error: 'Grant not found' });
  }

  if (grant.pdf_required === true) {
    return res.status(400).json({ error: 'Manual submission required for this grant' });
  }

  const application = {
    nonprofit_name: 'Hearts in the Game',
    ein: 'YOUR_EIN_HERE',
    mission_statement: 'We empower Colorado’s youth through sports...',
    requested_amount: grant.award_amount,
    grant_name: grant.grant_name,
    contact_email: 'your@email.com',
    custom_fields: {
      justification: 'Funding will support mental health initiatives, youth leadership programs, and sports equipment purchases for underserved communities.',
    },
  };

  try {
    const response = await axios.post('https://autogrant-api.com/submit', application);

    await supabase
      .from('grants')
      .update({
        status: 'SUBMITTED',
        date_submitted: new Date().toISOString(),
      })
      .eq('id', grant_id);

    return res.status(200).json({ message: 'Grant submitted successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to submit grant', details: err.message });
  }
};
