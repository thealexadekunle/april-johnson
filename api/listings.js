// Returns April's active and sold listings from Lofty for the website.
// Responses are cached at Vercel's edge so visitors never wait on Lofty.

const LOFTY_URL = 'https://api.lofty.com/v1.0/listing';
const SOLD_LIMIT = 12;

const num = (v) => { const n = Number(String(v ?? '').replace(/[^\d.]/g, '')); return Number.isFinite(n) && n > 0 ? n : undefined; };
const title = (s) => String(s || '').trim().toLowerCase().replace(/\b([a-z])/g, (m) => m.toUpperCase()).replace(/\b(Sw|Se|Nw|Ne|N\/a)\b/g, (m) => m.toUpperCase());
const SUFFIX = { drive: 'dr', road: 'rd', street: 'st', avenue: 'ave', lane: 'ln', circle: 'cir', court: 'ct', trail: 'trl', 'lee road': 'lee rd' };
const addrKey = (s) => { let k = String(s || '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim(); for (const [a, b] of Object.entries(SUFFIX)) k = k.replace(new RegExp(`\\b${a}\\b`, 'g'), b); return k.replace(/\b(\w+)s\b/g, '$1'); };

const list = (node) => (node && Array.isArray(node.list) ? node.list : Array.isArray(node) ? node : node && typeof node === 'object' ? Object.values(node).find(Array.isArray) || [] : []);

function normalize(x, sold) {
  const street = sold ? x.streetAddress : x.listingStreetName;
  const type = x.propertyTypePrimary || '';
  const land = /land/i.test(type);
  const lotSqft = num(x.totalAvailableAcres);
  const photo = (x.pictureList || []).find((p) => typeof p === 'string' && p.startsWith('https://'));
  const zip = Array.isArray(x.listingZipcode) ? x.listingZipcode[0] : x.listingZipcode;
  const place = sold ? (x.county ? `${title(x.county)} County` : '') : [x.listingCity, [x.listingState, zip].filter(Boolean).join(' ')].filter(Boolean).join(', ');
  return {
    key: addrKey(street),
    status: sold ? 'Sold' : (x.listingStatus || 'Active'),
    street: title(String(street || '').replace(/^N\/A\s+/i, '')) + (/^N\/A\s+/i.test(street || '') ? (land ? ' (lot)' : '') : ''),
    place,
    price: num(sold ? x.soldPrice || x.price : x.price),
    beds: land ? undefined : num(x.beds ?? x.bedrooms),
    baths: land ? undefined : num(x.baths ?? x.bathrooms),
    sqft: land || !(num(x.sqft) > 200) ? undefined : num(x.sqft),
    acres: land && lotSqft ? Math.round((lotSqft / 43560) * 100) / 100 : undefined,
    type: x.propertyTypeSecondary || type,
    photo: photo || '',
    photos: (x.pictureList || []).length,
    mls: x.mlsListingId || '',
    office: /^1st class r/i.test(x.agentOrgName || '') ? '1st Class Real Estate Excellence' : title(x.agentOrgName || '').replace(/\bKw\b/, 'KW'),
    date: sold ? String(x.soldDate || '').slice(0, 10) : '',
  };
}

function dedupe(items) {
  const seen = new Map();
  for (const it of items) {
    const prev = seen.get(it.key);
    if (!prev || it.photos > prev.photos || (!prev.office && it.office)) seen.set(it.key, { ...it, office: it.office || (prev && prev.office) || '' });
  }
  return [...seen.values()];
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ ok: false }); }
  const key = process.env.LOFTY_API_KEY;
  if (!key) return res.status(503).json({ ok: false, error: 'not-configured' });

  let r, text;
  try {
    r = await fetch(`${LOFTY_URL}?agentListings=true&limit=50`, { headers: { Authorization: `token ${key}` }, signal: AbortSignal.timeout(10000) });
    text = await r.text();
  } catch (err) {
    console.error('Lofty listings request failed', err && err.message);
    return res.status(502).json({ ok: false, error: 'unreachable', active: [], sold: [] });
  }
  if (!r.ok) {
    console.error('Lofty listings error', r.status, text.slice(0, 300));
    res.setHeader('Cache-Control', 's-maxage=300');
    return res.status(200).json({ ok: false, error: r.status === 403 ? 'no-permission' : 'lofty-error', active: [], sold: [] });
  }

  let data; try { data = JSON.parse(text); } catch { data = {}; }
  const order = { Active: 0, 'Coming Soon': 1, Pending: 2 };
  const active = dedupe(list(data.listIng).map((x) => normalize(x, false)).filter((x) => x.key))
    .sort((a, b) => (order[a.status] ?? 3) - (order[b.status] ?? 3) || (b.price || 0) - (a.price || 0));
  const sold = dedupe(list(data.soldListing).map((x) => normalize(x, true)).filter((x) => x.key))
    .sort((a, b) => b.date.localeCompare(a.date)).slice(0, SOLD_LIMIT);

  const strip = ({ key: _k, photos: _p, ...rest }) => rest;
  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600');
  return res.status(200).json({ ok: true, updated: new Date().toISOString(), active: active.map(strip), sold: sold.map(strip) });
};
