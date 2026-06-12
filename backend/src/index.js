require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/ads', require('./routes/ads'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/admin', require('./routes/admin'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Public web view for sharing ads (no auth required)
app.get('/ads/:id', async (req, res) => {
  const prisma = require('./lib/prisma');
  try {
    const ad = await prisma.transportAd.findUnique({
      where: { id: req.params.id },
      include: { transporter: true },
    });
    if (!ad) {
      return res.status(404).send('<h1>Annonce introuvable</h1>');
    }
    const name = ad.transporter?.fullName ?? 'Transporteur';
    const date = new Date(ad.flightDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta property="og:title" content="Voyage ${ad.departureCity} → ${ad.arrivalCity} — Qui Go au Bled"/>
  <meta property="og:description" content="${name} peut transporter jusqu'à ${ad.maxWeightKg}kg à ${ad.pricePerKg}€/kg le ${date}."/>
  <title>Voyage ${ad.departureCity} → ${ad.arrivalCity} — Qui Go au Bled</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5;color:#222;padding:16px}
    .card{background:#fff;border-radius:12px;padding:20px;margin-bottom:16px;box-shadow:0 1px 4px rgba(0,0,0,.08)}
    h1{font-size:1.3rem;margin-bottom:4px;color:#2563eb}
    .sub{color:#666;font-size:.9rem;margin-bottom:16px}
    .row{display:flex;align-items:center;gap:8px;margin-bottom:10px}
    .label{font-size:.8rem;color:#888;text-transform:uppercase;letter-spacing:.5px}
    .value{font-size:1rem;font-weight:600}
    .badge{display:inline-block;background:#2563eb;color:#fff;border-radius:20px;padding:4px 12px;font-size:.85rem;font-weight:600}
    .cta{display:block;text-align:center;margin-top:24px;background:#2563eb;color:#fff;text-decoration:none;padding:14px;border-radius:10px;font-size:1rem;font-weight:600}
    .footer{text-align:center;color:#999;font-size:.8rem;margin-top:20px}
  </style>
</head>
<body>
  <div class="card">
    <h1>✈️ ${ad.departureCity} → ${ad.arrivalCity}</h1>
    <p class="sub">Publié par <strong>${name}</strong></p>
    <div class="row">
      <span class="label">Date</span>
      <span class="value">${date}</span>
      ${ad.flightTime ? `<span style="color:#666">à ${ad.flightTime}</span>` : ''}
    </div>
    <div class="row">
      <span class="label">Poids max</span>
      <span class="value">${ad.maxWeightKg} kg</span>
    </div>
    <div class="row">
      <span class="label">Prix / kg</span>
      <span class="badge">${ad.pricePerKg} €</span>
    </div>
    ${ad.description ? `<p style="margin-top:12px;color:#444;font-size:.95rem">${ad.description}</p>` : ''}
  </div>
  <a class="cta" href="https://quigoaubled.up.railway.app/">
    🔒 Connecte-toi pour sécuriser l'envoi du colis
  </a>
  <p class="footer">Qui Go au Bled — Transportez vos colis en toute confiance</p>
</body>
</html>`;
    return res.send(html);
  } catch (e) {
    return res.status(500).send('<h1>Erreur serveur</h1>');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 API running on http://localhost:${PORT}/api`);
});
