import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const SUPABASE_URL = 'https://yxkjasitdmchcffcacnc.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Securely store this in Render
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Entry point for webhook
export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { grant_id } = req.body;

  // Fetch grant data from Supabase
  const { data: grant, error } = await supabase
    .from('grants')
    .select('*')
    .eq('id', grant_id)
    .single();

  if (error || !grant) {
    return res.status(404).json({ error: 'Grant not found' });
  }

  if (grant.pdf_required === true) {
    return res.status(400).json({ error: 'Manual PDF submission required' });
  }

  // Build the grant application payload
  const applicationPayload = {
    nonprofit_name: 'Hearts in the Game',
    ein: 'XX-XXXXXXX', // Replace with actual EIN
    contact_email: 'tony@cospartans.com',
    grant_name: grant.grant_name,
    source: grant.source,
    justification:
      'Funding will support mental health programs, equipment distribution, and safe play spaces for underserved youth across Colorado.',
    requested_amount: grant.award_amount,
    deadline: grant.deadline,
  };

  try {
    // Simulated submission (replace with actual grant portal endpoint)
    const response = await axios.post('https://autogrant-api.com/submit', applicationPayload);

    // Update grant status in Supabase
    await supabase
      .from('grants')
      .update({
        status: 'SUBMITTED',
        date_submitted: new Date().toISOString(),
      })
      .eq('id', grant_id);

    return res.status(200).json({ message: 'Submitted successfully', id: grant_id });
  } catch (err) {
    console.error('Submission failed:', err.message);
    return res.status(500).json({ error: 'Submission failed', details: err.message });
  }
};
