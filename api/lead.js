// Receives website inquiries and creates a lead in April's Lofty CRM.
// The Lofty key lives only in the LOFTY_API_KEY environment variable on Vercel.

const LOFTY_URL = 'https://api.lofty.com/v1.0/leads';
const MAX = { name: 120, contact: 200, area: 200, message: 3000, short: 80 };

const LEAD_TYPES = {
  'Buying': [2],
  'Selling': [1],
  'Buying and selling': [2, 1],
  'First home': [2],
  'Military relocation': [2],
  'New construction': [2],
  'Land': [2],
  'Investment property': [6],
};

const TIMEFRAMES = {
  'As soon as possible': '1-3',
  'Within 3 months': '1-3',
  '3 to 6 months': '3-6',
  '6 months or later': '6-12',
  'Still exploring': 'Just Looking',
  'Just curious for now': 'Just Looking',
  'Timing is uncertain': 'Just Looking',
};

const clean = (v, max) => String(v ?? '').replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, max);
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function splitName(full) {
  const parts = full.split(/\s+/).filter(Boolean);
  return { firstName: (parts.shift() || 'Website').slice(0, 30), lastName: parts.join(' ').slice(0, 30) };
}

function buildLead(f) {
  const { firstName, lastName } = splitName(f.name);
  const emails = [], phones = [];
  for (const v of [f.email, f.phone, f.contact]) {
    if (!v) continue;
    if (isEmail(v)) emails.push(v);
    else if (/\d{7,}/.test(v.replace(/\D/g, ''))) phones.push(v.replace(/[^\d+]/g, '').slice(0, 20));
  }

  const leadTypes = LEAD_TYPES[f.intent];
  const selling = leadTypes && leadTypes.includes(1);
  const timeframe = TIMEFRAMES[f.timeframe];

  const note = [
    'Website inquiry from apriljsellshomes.com',
    f.intent && `Interested in: ${f.intent}`,
    f.area && `${selling ? 'Property address' : 'Area'}: ${f.area}`,
    f.timeframe && `Timing: ${f.timeframe}`,
    f.message && `Message: ${f.message}`,
    f.page && `Sent from: ${f.page}`,
  ].filter(Boolean).join('\n');

  const lead = {
    firstName,
    lastName,
    emails,
    phones,
    source: 'apriljsellshomes.com',
    tagsAdd: ['Website', f.intent].filter(Boolean),
    content: note,
    leadAlert: true,
  };
  if (leadTypes) lead.leadTypes = leadTypes;
  if (timeframe) lead[selling && !leadTypes.includes(2) ? 'sellingTimeFrame' : 'buyingTimeFrame'] = timeframe;
  if (f.intent === 'First home') lead.fthb = 'Yes';
  if (selling && f.area) lead.property = { streetAddress: f.area };
  else if (f.area) {
    const m = f.area.match(/^(.+?),\s*([A-Z]{2})$/);
    lead.inquiry = { locations: [m ? { city: m[1], stateCode: m[2] } : { description: f.area }] };
  }
  return lead;
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const key = process.env.LOFTY_API_KEY;
  if (!key) return res.status(503).json({ ok: false, error: 'Lead service is not configured' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = null; } }
  if (!body || typeof body !== 'object') return res.status(400).json({ ok: false, error: 'Invalid request' });

  // Hidden field that people never see; bots that fill every input get a quiet success.
  if (clean(body.company, 200)) return res.status(200).json({ ok: true });

  const f = {
    name: clean(body.name, MAX.name),
    email: clean(body.email, MAX.contact),
    phone: clean(body.phone, MAX.short),
    contact: clean(body.contact, MAX.contact),
    intent: clean(body.intent, MAX.short),
    area: clean(body.area, MAX.area),
    timeframe: clean(body.timeframe, MAX.short),
    message: clean(body.message, MAX.message),
    page: clean(body.page, MAX.area),
  };
  if (!f.name) return res.status(400).json({ ok: false, error: 'Please include your name' });
  if (!f.email && !f.phone && !f.contact) return res.status(400).json({ ok: false, error: 'Please include a phone number or email' });

  try {
    const r = await fetch(LOFTY_URL, {
      method: 'POST',
      headers: { Authorization: `token ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(buildLead(f)),
      signal: AbortSignal.timeout(10000),
    });
    if (!r.ok) {
      const detail = (await r.text()).slice(0, 300);
      console.error('Lofty error', r.status, detail);
      return res.status(502).json({ ok: false, error: 'Lead service unavailable' });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Lofty request failed', err && err.message);
    return res.status(502).json({ ok: false, error: 'Lead service unavailable' });
  }
};

module.exports.buildLead = buildLead;
