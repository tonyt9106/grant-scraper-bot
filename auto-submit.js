import { createClient } from "@supabase/supabase-js";
import axios from "axios";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      grant_id,
      grant_name,
      source,
      award_amount: requested_amount
    } = req.body || {};

    if (!grant_id) {
      return res.status(400).json({ error: "Missing grant_id" });
    }

    // Prevent auto-submitting PDF-required items (optional)
    const { data: grant, error: gErr } = await supabase
      .from("grants")
      .select("id, pdf_required")
      .eq("id", grant_id)
      .maybeSingle();

    if (gErr) throw gErr;
    if (grant?.pdf_required) {
      return res.status(200).json({ skipped: true, reason: "PDF required" });
    }

    // Build application payload
    const payload = {
      nonprofit_name: "Hearts in the Game",
      ein: "XX-XXXXXXX",
      contact_email: "tony@cospartans.com",
      grant_name,
      source,
      justification:
        "Funding will support mental health programs, equipment distribution, and leadership development.",
      requested_amount: Number(requested_amount) || null,
    };

    // ---- Submit to the target system (replace with real endpoint) ----
    // const submitRes = await axios.post("https://REAL_ENDPOINT/submit", payload);
    // const receiptId = submitRes.data?.receiptId || null;

    // For now, simulate success + a receipt id
    const receiptId = "RCPT-" + Math.random().toString(36).slice(2, 10);

    // Mark grant as submitted
    await supabase
      .from("grants")
      .update({ status: "submitted", submitted_at: new Date().toISOString() })
      .eq("id", grant_id);

    // Insert a permanent record
    await supabase.from("submissions").insert({
      grant_id,
      grant_name,
      source,
      requested_amount,
      status: "submitted",
      receipt_id: receiptId,
      payload,
      response: { ok: true, receiptId }
    });

    return res.status(200).json({
      ok: true,
      message: "Grant submitted",
      receiptId
    });
  } catch (err) {
    // Save a failed record too
    try {
      const b = req.body || {};
      await supabase.from("submissions").insert({
        grant_id: b.grant_id || "unknown",
        grant_name: b.grant_name || null,
        source: b.source || null,
        requested_amount: b.award_amount || null,
        status: "failed",
        receipt_id: null,
        payload: b,
        response: { ok: false, error: String(err?.message || err) }
      });
    } catch (_) {}

    return res.status(500).json({ ok: false, error: err?.message || String(err) });
  }
}
