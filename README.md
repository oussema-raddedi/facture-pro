# FacturePro — Structure du projet

Application de gestion de factures (ventes) et d'achats fournisseurs,
avec chatbot intelligent (Gemini), OCR, dashboard et export PDF.

## Arborescence

```
FacturePro/
├── index.html                  # Page unique (SPA) — onglets, modals, chatbot
├── assets/
│   ├── css/
│   │   └── style.css           # Design system complet (glassmorphism, dark mode, print)
│   └── js/                     # Scripts charges DANS L'ORDRE (pas de modules ES)
│       ├── config.js           # Worker PDF.js + variables d'etat globales
│       ├── i18n.js             # Traductions FR/AR/EN + setLang/t/tf
│       ├── ui.js               # Toasts, modale de confirmation, theme, helpers (formatDate/Money)
│       ├── company.js          # Sauvegarde/chargement des infos entreprise (localStorage)
│       ├── db.js               # Couche donnees : API MySQL + cache local (fallback localStorage)
│       ├── invoice-form.js     # Formulaire de creation : articles, apercu live, save/reset/PDF
│       ├── invoices.js         # Liste, vue detaillee, edition des factures
│       ├── achats.js           # Achats : upload, OCR (Tesseract/pdf.js), devise/conversion
│       ├── dashboard.js        # Stats + graphiques Chart.js (CA, statuts, top clients...)
│       ├── pdf.js              # Generation PDF (html2canvas + jsPDF)
│       ├── chatbot.js          # Chatbot : commandes locales, wizard de creation, Gemini, recherche
│       ├── notifications.js    # Alertes d'echeances (factures en retard)
│       └── main.js             # Boot de l'application + raccourcis clavier
├── server/
│   └── server.js               # API REST Express + MySQL (optionnel — fallback local sinon)
├── .env.example                # Configuration BDD
└── package.json
```

## Lancement

### Mode 1 — Sans serveur (le plus simple)
Ouvrez simplement `index.html` dans un navigateur.
L'app detecte l'absence d'API et bascule en **mode local (localStorage)**.

### Mode 2 — Avec API MySQL
```bash
npm install
cp .env.example .env        # renseignez DB_USER / DB_PASSWORD
npm start                   # demarre http://localhost:3000
```

## Chatbot IA (Gemini)
1. Obtenez une cle gratuite : https://aistudio.google.com/apikey
2. Dans l'app : bouton 🤖 → ⚙️ API Key → collez la cle.
3. Le chatbot peut alors lire vos donnees et executer des actions
   (creer/modifier/supprimer des factures et achats).

## Notes techniques
- Les scripts ne sont **pas** des modules ES : ils partagent l'espace global
  et doivent rester charges dans l'ordre indique ci-dessus.
- Les fichiers achats (PDF/images) sont stockes en base64 — pensez a augmenter
  `max_allowed_packet` cote MySQL si besoin.
- `assets/js/config.js` doit rester le premier script (configure le worker pdf.js).
