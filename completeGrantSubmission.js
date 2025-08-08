import { createClient } from '@supabase/supabase-js'
import puppeteer from 'puppeteer'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' })
  }

  const { grant_id } = req.body

  // Get the grant from Supabase
  const { data: grant, error } = await supabase
    .from('grants')
    .select('*')
    .eq('id', grant_id)
    .single()

  if (error || !grant) {
    return res.status(404).json({ error: 'Grant not found' })
  }

  if (grant.pdf_required === true) {
    return res.status(400).json({ error: 'Manual PDF submission required' })
  }

  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()

  try {
    await page.goto(grant.application_url, { waitUntil: 'networkidle0' })

    // Example: fill in form fields — change these as needed
    await page.type('input[name="org_name"]', 'Hearts in the Game')
    await page.type('input[name="contact_name"]', 'Tony Thompson')
    await page.type('input[name="email"]', 'tony@cospartans.com')
    await page.type('input[name="phone"]', '9708002524')
    await page.type('input[name="grant_amount"]', grant.requested_amount.toString())
    await page.type('textarea[name="justification"]', 'Funding will support mental health programs, equipment distribution, and youth sports access.')

    await page.click('button[type="submit"]')

    await browser.close()

    // Log submission
    await supabase.from('submissions').insert([
      {
        grant_id: grant_id,
        org_name: 'Hearts in the Game',
        contact_name: 'Tony Thompson',
        email: 'tony@cospartans.com',
        phone: '9708002524',
        status: 'submitted'
      }
    ])

    res.status(200).json({ message: 'Submission complete' })
  } catch (err) {
    await browser.close()
    res.status(500).json({ error: 'Failed to complete submission', details: err.message })
  }
}
