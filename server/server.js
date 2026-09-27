/**
 * FacturePro — Serveur API (Node.js + Express + MySQL)
 * ----------------------------------------------------
 * Endpoints REST utilises par assets/js/db.js :
 *   GET    /api/invoices        -> liste des factures
 *   POST   /api/invoices        -> creer une facture
 *   PUT    /api/invoices/:id    -> modifier une facture
 *   DELETE /api/invoices/:id    -> supprimer une facture
 *   GET    /api/achats          -> liste des achats
 *   POST   /api/achats          -> creer un achat
 *   PUT    /api/achats/:id      -> modifier un achat
 *   DELETE /api/achats/:id      -> supprimer un achat
 *   POST   /api/ai/gemini       -> proxy optionnel pour Gemini (evite la cle cote client)
 *
 * Installation :
 *   npm install
 *   cp .env.example .env   (renseigner DB_* et PORT)
 *   npm run init-db        (cree les tables si elles n'existent pas)
 *   npm start
 *
 * L'application fonctionne aussi SANS ce serveur : db.js bascule
 * automatiquement en mode local (localStorage).
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json({ limit: '15mb' })); // les fichiers achat sont en base64

const PORT = process.env.PORT || 3000;
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'facturepro',
};

let pool;
async function getPool() {
    if (!pool) pool = mysql.createPool({ ...dbConfig, waitForConnections: true, connectionLimit: 10 });
    return pool;
}

// ---------- CRUD Factures ----------
app.get('/api/invoices', async (req, res) => {
    try {
        const [rows] = await (await getPool()).query('SELECT * FROM invoices ORDER BY id DESC');
        res.json(rows.map(r => ({ ...r, items: JSON.parse(r.items || '[]') })));
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/invoices', async (req, res) => {
    const b = req.body;
    try {
        const [r] = await (await getPool()).query(
            `INSERT INTO invoices (numero, clientName, clientEmail, clientPhone, clientAddress,
                                   compName, compEmail, compPhone, compAddress, compMF, compLogo,
                                   date, due, items, tva, remise, notes, status, total)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [b.numero, b.clientName, b.clientEmail || '', b.clientPhone || '', b.clientAddress || '',
             b.compName || '', b.compEmail || '', b.compPhone || '', b.compAddress || '', b.compMF || '', b.compLogo || null,
             b.date, b.due, JSON.stringify(b.items || []), b.tva || 0, b.remise || 0,
             b.notes || '', b.status || 'pending', b.total || 0]
        );
        res.status(201).json({ id: r.insertId, ...b });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/invoices/:id', async (req, res) => {
    const b = req.body;
    try {
        await (await getPool()).query(
            `UPDATE invoices SET numero=?, clientName=?, clientEmail=?, clientPhone=?, clientAddress=?,
                                 compName=?, compEmail=?, compPhone=?, compAddress=?, compMF=?, compLogo=?,
                                 date=?, due=?, items=?, tva=?, remise=?, notes=?, status=?, total=?,
                                 updatedAt=NOW() WHERE id=?`,
            [b.numero, b.clientName, b.clientEmail || '', b.clientPhone || '', b.clientAddress || '',
             b.compName || '', b.compEmail || '', b.compPhone || '', b.compAddress || '', b.compMF || '', b.compLogo || null,
             b.date, b.due, JSON.stringify(b.items || []), b.tva || 0, b.remise || 0,
             b.notes || '', b.status || 'pending', b.total || 0, req.params.id]
        );
        res.json({ id: Number(req.params.id), ...b });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/invoices/:id', async (req, res) => {
    try {
        await (await getPool()).query('DELETE FROM invoices WHERE id=?', [req.params.id]);
        res.status(204).send();
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ---------- CRUD Achats ----------
app.get('/api/achats', async (req, res) => {
    try {
        const [rows] = await (await getPool()).query('SELECT * FROM achats ORDER BY id DESC');
        res.json(rows);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/achats', async (req, res) => {
    const b = req.body;
    try {
        const [r] = await (await getPool()).query(
            `INSERT INTO achats (numero, numeroFournisseur, supplier, supplierEmail, supplierPhone,
                                 date, amount, fileName, fileType, fileData, notes, status)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
            [b.numero, b.numeroFournisseur || '', b.supplier, b.supplierEmail || '', b.supplierPhone || '',
             b.date, b.amount || 0, b.fileName || '', b.fileType || '', b.fileData || null, b.notes || '', b.status || 'completed']
        );
        res.status(201).json({ id: r.insertId, ...b });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/achats/:id', async (req, res) => {
    const b = req.body;
    try {
        await (await getPool()).query(
            `UPDATE achats SET numero=?, numeroFournisseur=?, supplier=?, supplierEmail=?, supplierPhone=?,
                               date=?, amount=?, fileName=?, fileType=?, fileData=?, notes=?, status=?, updatedAt=NOW()
             WHERE id=?`,
            [b.numero, b.numeroFournisseur || '', b.supplier, b.supplierEmail || '', b.supplierPhone || '',
             b.date, b.amount || 0, b.fileName || '', b.fileType || '', b.fileData || null, b.notes || '', b.status || 'completed', req.params.id]
        );
        res.json({ id: Number(req.params.id), ...b });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/achats/:id', async (req, res) => {
    try {
        await (await getPool()).query('DELETE FROM achats WHERE id=?', [req.params.id]);
        res.status(204).send();
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ---------- Proxy Gemini optionnel ----------
app.post('/api/ai/gemini', async (req, res) => {
    const { apiKey, model, system_instruction, contents } = req.body;
    if (!apiKey) return res.status(400).json({ error: 'apiKey manquant' });
    try {
        const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-flash-latest'}:generateContent?key=${encodeURIComponent(apiKey)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ system_instruction, contents }),
        });
        res.status(r.status).json(await r.json());
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ---------- Init DB ----------
app.post('/api/init-db', async (req, res) => {
    try {
        const p = await getPool();
        await p.query(`CREATE TABLE IF NOT EXISTS invoices (
            id INT AUTO_INCREMENT PRIMARY KEY,
            numero VARCHAR(50) NOT NULL, clientName VARCHAR(255), clientEmail VARCHAR(255),
            clientPhone VARCHAR(50), clientAddress TEXT, compName VARCHAR(255), compEmail VARCHAR(255),
            compPhone VARCHAR(50), compAddress TEXT, compMF VARCHAR(100), compLogo MEDIUMTEXT,
            date DATE, due DATE, items JSON, tva DECIMAL(5,2) DEFAULT 0, remise DECIMAL(5,2) DEFAULT 0,
            notes TEXT, status VARCHAR(20) DEFAULT 'pending', total DECIMAL(12,3) DEFAULT 0,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
        await p.query(`CREATE TABLE IF NOT EXISTS achats (
            id INT AUTO_INCREMENT PRIMARY KEY,
            numero VARCHAR(50) NOT NULL, numeroFournisseur VARCHAR(100), supplier VARCHAR(255),
            supplierEmail VARCHAR(255), supplierPhone VARCHAR(50), date DATE,
            amount DECIMAL(12,3) DEFAULT 0, fileName VARCHAR(255), fileType VARCHAR(50),
            fileData LONGTEXT, notes TEXT, status VARCHAR(20) DEFAULT 'completed',
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
        res.json({ ok: true, msg: 'Tables creees' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.listen(PORT, () => console.log(`FacturePro API -> http://localhost:${PORT}/api`));
