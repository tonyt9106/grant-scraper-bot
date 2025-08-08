// Import dependencies
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import puppeteer from 'puppeteer';

// Supabase setup
const supabaseUrl = 'https://yxkjasitdmchcffcacnc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkZGRxaWZibWNrd2p2aXJ3cGVxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDA1NTM3NywiZXhwIjoyMDY1NjMxMzc3fQ.0useIzORL95US8WYaStmiqObw0b65GtXuVSXn0n1aVA'; // Replace with your actual Service Role key
const supabase = createClient(supabaseUrl, supabaseKey);

async function completeGrantSubmission() {
  console.log("Starting grant submission process...");

  try {
    // Launch browser
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Go to grant site
    await page.goto('https://example-grant-portal.com', { waitUntil: 'networkidle2' });

    // Fill in form fields
    await page.type('#organizationName', 'Hearts in the Game');
    await page.type('#contactName', 'Antonio Thompson');
    await page.type('#email', 'your-email@example.com');
    await page.type('#phone', '123-456-7890');

    // Upload required file (if applicable)
    // await page.setInputFiles('#fileUpload', './path/to/required-document.pdf');

    // Submit form
    await page.click('#submitButton');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // Confirmation
    const confirmationText = await page.$eval('#confirmationMessage', el => el.textContent);
    console.log("Form submitted successfully:", confirmationText);

    await browser.close();

    // Log submission to Supabase
    const { data, error } = await supabase
      .from('submissions')
      .insert([
        {
          grant_name: 'Example Grant Portal',
          submitted_by: 'Antonio Thompson',
          status: 'Submitted',
          confirmation_message: confirmationText,
          created_at: new Date().toISOString()
        }
      ]);

    if (error) {
      console.error("Error logging to Supabase:", error);
    } else {
      console.log("Logged to Supabase:", data);
    }

  } catch (err) {
    console.error("Error during grant submission:", err);
  }
}

// Run the grant submission function
completeGrantSubmission();
