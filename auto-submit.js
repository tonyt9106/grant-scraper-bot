import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const SUPABASE_URL = 'https://yxkjasitdmchcffcacnc.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const grant_id = req.body.grant_id;

  const { data: grant, error } = await supabase
    .from('grants')
    .select('*')
    .eq('id', grant_id)
    .single();

  if (error || !grant) {
    return res.status(400).json({ error: 'Grant not found' });
  }

  if (grant.pdf_required === true) {
    return res.status(400).json({ error: 'Manual PDF submission required' });
  }

  const payload = {
    nonprofit_name: 'Hearts in the Game',
    ein: 'XX-0000000',
    contact_email: 'tony@cospartans.com',
    grant_name: grant.grant_name,
    source: grant.source,
    justification: 'Funding will support mental health programs, equipment distribution, and youth sports access.',
    requested_amount: grant.requested_amount
  };

  try {
    const response = await axios.post(grant.application_url, payload);

    await supabase.from('submissions').insert({
      status: 'submitted',
      receipt_id: response.data.receipt_id || null,
      payload: payload,
      response: response.data
      // submitted_at will auto-fill from default timestamp
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    await supabase.from('submissions').insert({
      status: 'failed',
      receipt_id: null,
      payload: payload,
      response: { error: err.message }
    });

    return res.status(500).json({ error: 'Submission failed', detail: err.message });
  }
};
