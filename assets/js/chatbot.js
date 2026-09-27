        // ===================== CHATBOT (Enhanced Multi-language + Context + Creation) =====================
        function toggleChatbot() {
            document.getElementById('chatbotWindow').classList.toggle('active');
            document.getElementById('chatNotif').style.display = 'none';
        }

        function setChatContext(ctx) {
            chatContext = ctx;
            // Update quick buttons based on context
            const quickDiv = document.getElementById('chatQuickButtons');
            if (ctx === 'vente') {
                quickDiv.innerHTML = `
                    <button class="chat-quick-btn active" onclick="setChatContext('vente')">💰 Vente</button>
                    <button class="chat-quick-btn" onclick="setChatContext('achat')">🧾 Achat</button>
                    <button class="chat-quick-btn" onclick="setChatContext('create')">📝 Créer</button>
                    <button class="chat-quick-btn" onclick="sendQuick('ch7al bitbi3a')">📊 CA</button>
                    <button class="chat-quick-btn" onclick="sendQuick('kol l factures')">📋 Toutes</button>
                    <button class="chat-quick-btn" onclick="sendQuick('mzlt ma5lsiotch')">⏳ Impayées</button>
                    <button class="chat-quick-btn" onclick="sendQuick('5alsa')">✅ Payées</button>
                    <button class="chat-quick-btn" onclick="sendQuick('aide')">❓ Aide</button>
                `;
                addChat(`<strong>💰 Mode Vente activé</strong><br>Commandes rapides: CA, factures payées, impayées, en retard...`, false, 'vente-card');
            } else if (ctx === 'achat') {
                quickDiv.innerHTML = `
                    <button class="chat-quick-btn" onclick="setChatContext('vente')">💰 Vente</button>
                    <button class="chat-quick-btn active" onclick="setChatContext('achat')">🧾 Achat</button>
                    <button class="chat-quick-btn" onclick="setChatContext('create')">📝 Créer</button>
                    <button class="chat-quick-btn" onclick="sendQuick('ch7al achat')">📊 Achats</button>
                    <button class="chat-quick-btn" onclick="sendQuick('kol l achats')">📋 Tous</button>
                    <button class="chat-quick-btn" onclick="sendQuick('upload achat')">📤 Upload</button>
                    <button class="chat-quick-btn" onclick="sendQuick('aide')">❓ Aide</button>
                `;
                addChat(`<strong>🧾 Mode Achat activé</strong><br>Commandes rapides: total achats, liste, upload...`, false, 'achat-card');
            } else if (ctx === 'create') {
                quickDiv.innerHTML = `
                    <button class="chat-quick-btn" onclick="setChatContext('vente')">💰 Vente</button>
                    <button class="chat-quick-btn" onclick="setChatContext('achat')">🧾 Achat</button>
                    <button class="chat-quick-btn active" onclick="setChatContext('create')">📝 Créer</button>
                    <button class="chat-quick-btn" onclick="sendQuick('creer facture')">📝 Facture</button>
                    <button class="chat-quick-btn" onclick="sendQuick('upload achat')">📤 Achat</button>
                    <button class="chat-quick-btn" onclick="sendQuick('aide')">❓ Aide</button>
                `;
                addChat(`<strong>📝 Mode Création activé</strong><br>Créez une facture interactivement ou uploadez un achat.`, false, 'invoice-found');
            } else {
                quickDiv.innerHTML = `
                    <button class="chat-quick-btn" onclick="setChatContext('vente')">💰 Vente</button>
                    <button class="chat-quick-btn" onclick="setChatContext('achat')">🧾 Achat</button>
                    <button class="chat-quick-btn" onclick="setChatContext('create')">📝 Créer</button>
                    <button class="chat-quick-btn" onclick="sendQuick('aide')">❓ Aide</button>
                `;
            }
        }

        function addChat(text, isUser, type = '') {
            const div = document.createElement('div');
            div.className = `chat-msg ${isUser ? 'user' : 'bot'} ${type}`;
            div.innerHTML = text;
            document.getElementById('chatMessages').appendChild(div);
            document.getElementById('chatMessages').scrollTop = 999999;
        }

        function sendQuick(msg) {
            document.getElementById('chatInput').value = msg;
            sendChat();
        }

        async function handleChatFileUpload(event) {
            const file = event.target.files[0];
            if (!file) return;
            addChat(`📎 ${file.name}`, true);

            addChat(`🔍 <em>Analyse du document en cours...</em>`, false, 'info');

            const reader = new FileReader();
            reader.onload = async function(ev) {
                const fileData = ev.target.result;

                // OCR extraction
                let extractedInfo = await processAchatFile(file, fileData, file.type);

                // Fallback
                if (!extractedInfo.supplier && !extractedInfo.amount) {
                    const fallback = extractAchatInfoFromFileName(file.name.replace(/\.[^/.]+$/, ""));
                    extractedInfo = { ...fallback, ...extractedInfo };
                }

                const isImage = file.type.includes('image');
                const previewHtml = isImage 
                    ? `<img src="${fileData}" style="max-width:100%;max-height:200px;object-fit:contain;border-radius:8px;border:1px solid var(--border);margin:8px 0;">`
                    : `<div style="padding:16px;background:var(--bg);border-radius:8px;border:1px solid var(--border);text-align:center;margin:8px 0;"><div style="font-size:32px;">📄</div><div style="font-size:12px;">${file.name}</div></div>`;

                // Build info display
                let infoHtml = `<div style="padding:10px;background:var(--bg);border-radius:8px;border:1px solid var(--border);margin-top:8px;">`;
                infoHtml += `<strong>📝 Informations extraites du document :</strong><br>`;
                infoHtml += `🏢 <strong>Fournisseur:</strong> ${extractedInfo.supplier || '<span style="color:var(--danger)">Non détecté</span>'}<br>`;
                infoHtml += `📧 <strong>Email:</strong> ${extractedInfo.email || '-'}<br>`;
                infoHtml += `📞 <strong>Téléphone:</strong> ${extractedInfo.phone || '-'}<br>`;
                infoHtml += `📍 <strong>Adresse:</strong> ${extractedInfo.address || '-'}<br>`;
                infoHtml += `📅 <strong>Date:</strong> ${extractedInfo.date || '-'}<br>`;
                infoHtml += `💰 <strong>Montant TTC:</strong> ${extractedInfo.amount > 0 ? formatMoney(extractedInfo.amount) : '<span style="color:var(--danger)">Non détecté</span>'}<br>`;
                if (extractedInfo.numero) infoHtml += `📄 <strong>N° Facture:</strong> ${extractedInfo.numero}<br>`;
                if (extractedInfo.tva) infoHtml += `📊 <strong>TVA:</strong> ${extractedInfo.tva}%<br>`;
                infoHtml += `</div>`;

                addChat(
                    `<strong>📤 ${t('chatUploadAchat')}</strong><br>` +
                    `${previewHtml}` +
                    infoHtml +
                    `<br>` +
                    `<button class="chat-quick-btn" onclick="saveChatAchat('${file.name}', '${file.type}', '${btoa(fileData)}', '${btoa(JSON.stringify(extractedInfo))}')">✅ ${t('chatYes')} - Sauvegarder</button> ` +
                    `<button class="chat-quick-btn" onclick="openAchatPreviewFromChat('${file.name}', '${file.type}', '${btoa(fileData)}', '${btoa(JSON.stringify(extractedInfo))}')">✏️ Modifier avant sauvegarde</button>`,
                    false, 'achat-card'
                );
                event.target.value = '';
            };
            reader.readAsDataURL(file);
        }

        function saveChatAchat(fileName, fileType, fileDataB64, infoB64) {
            const fileData = atob(fileDataB64);
            const info = JSON.parse(atob(infoB64));

            const achat = {
                numero: DB.getNextAchatNumero(),
                supplier: info.supplier || fileName.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "),
                supplierEmail: '', supplierPhone: '',
                date: info.date || new Date().toISOString().split('T')[0],
                amount: info.amount || 0,
                fileName: fileName,
                fileType: fileType,
                fileData: fileData,
                notes: 'Uploadé depuis le chatbot',
                status: 'completed'
            };

            DB.addAchat(achat);
            renderAchatList();
            loadDashboard();
            addChat(`✅ <strong>${t('chatFileUploaded')}</strong><br><br>🧾 <strong>${achat.numero}</strong><br>🏢 ${achat.supplier}<br>💰 ${formatMoney(achat.amount)}<br>📅 ${formatDate(achat.date)}<br><br><button class="chat-quick-btn" onclick="viewAchat(${achat.id}); toggleChatbot();">👁️ ${t('viewDetails')}</button>`, false, 'achat-card');
        }

        function openAchatPreviewFromChat(fileName, fileType, fileDataB64, infoB64) {
            const fileData = atob(fileDataB64);
            const info = JSON.parse(atob(infoB64));
            const file = { name: fileName, type: fileType, size: 0 };
            showAchatPreviewModal(file, fileData, fileType, info);
            toggleChatbot();
        }

        function saveAiState() {
            localStorage.setItem('fp_ai_success', String(aiSuccessCount));
            localStorage.setItem('fp_ai_local',   String(aiLocalCount));
        }

        function updateAiPanel() {
            const stats = document.getElementById('aiTaskStats');
            const btn = document.getElementById('aiToggleBtn');
            if (btn) {
                if (aiEnabled) {
                    btn.textContent = '✨ Gemini ON';
                    btn.classList.add('on');
                    btn.style.background = 'linear-gradient(135deg,#6366f1,#8b5cf6)';
                    btn.style.color = 'white';
                } else {
                    btn.textContent = '✨ Gemini OFF';
                    btn.classList.remove('on');
                    btn.style.background = '';
                    btn.style.color = '';
                }
            }
            if (stats) {
                const hasKey = !!localStorage.getItem('fp_gemini_api_key');
                if (aiEnabled && hasKey) {
                    stats.innerHTML = `🚀 Gemini AI actif — <strong>${aiSuccessCount}</strong> طلب اليوم (يتجدد كل يوم)`;
                } else if (aiEnabled && !hasKey) {
                    stats.innerHTML = `⚠️ Gemini ON — <strong>مفتاح ناقص</strong> — اضغط ⚙️ API Key`;
                } else {
                    stats.innerHTML = `🔴 AI OFF — chatbot local uniquement`;
                }
            }
        }

        function toggleAiMode() {
            aiEnabled = !aiEnabled;
            localStorage.setItem('fp_ai_enabled', String(aiEnabled));
            const btn = document.getElementById('aiToggleBtn');
            if (btn) {
                if (aiEnabled) {
                    btn.textContent = '✨ Gemini ON';
                    btn.classList.add('on');
                    btn.style.background = 'linear-gradient(135deg,#6366f1,#8b5cf6)';
                    btn.style.color = 'white';
                } else {
                    btn.textContent = '✨ Gemini OFF';
                    btn.classList.remove('on');
                    btn.style.background = '';
                    btn.style.color = '';
                }
            }
            updateAiPanel();
            addChat(aiEnabled
                ? '🚀 <strong>Gemini AI activé</strong> — ذكاء اصطناعي مجاني، يتجدد كل يوم، عنده accès لكل البيانات.'
                : '🔴 <strong>Gemini AI désactivé</strong> — الchatbot يخدم بالأوامر المحلية فقط.',
                false, aiEnabled ? 'ai-card' : '');
        }
        function saveGeminiKey(value) { /* non utilisé */ }
        function saveGeminiModel(value) { /* non utilisé */ }

        function promptApiKey() {
            const current = localStorage.getItem('fp_gemini_api_key') || '';
            const key = prompt(
                '🔑 Clé API Gemini (مجانية — 1500 طلب/يوم يتجددو كل يوم)\n\n' +
                '📌 كيفاش تجيب المفتاح (دقيقة واحدة):\n' +
                '1. روح على: aistudio.google.com/apikey\n' +
                '2. سجّل بحساب Google\n' +
                '3. Create API Key\n' +
                '4. نسخ المفتاح وحطه هنا (يبدأ عادةً بـ AIza)\n',
                current
            );
            if (key === null) return;
            if (key.trim() === '') {
                localStorage.removeItem('fp_gemini_api_key');
                addChat('🔴 Clé API supprimée. Mode local activé.', false, 'error');
                if (aiEnabled) toggleAiMode();
            } else if (key.trim().length > 10) {
                localStorage.setItem('fp_gemini_api_key', key.trim());
                addChat('✅ <strong>Clé Gemini sauvegardée!</strong><br>🚀 مجاني — 1500 طلب/يوم يتجددو كل يوم<br>اضغط 🔍 Test باش تتأكد.', false, 'ai-card');
                if (!aiEnabled) toggleAiMode();
            } else {
                addChat('❌ Clé invalide.<br>روح على aistudio.google.com/apikey تجيب مفتاحك.', false, 'error');
            }
        }

        function countChatTask() { return true; } // Gemini — بدون task limit

        function getChatBusinessContext() {
            const invoices = DB.getAllInvoices();
            const achats = DB.getAllAchats();
            const totalVente = invoices.reduce((s, i) => s + (i.total || 0), 0);
            const totalAchat = achats.reduce((s, a) => s + (a.amount || 0), 0);
            const pending = invoices.filter(i => i.status === 'pending');
            const overdue = invoices.filter(i => i.status === 'overdue');
            return {
                lang: currentLang,
                context: chatContext,
                totals: {
                    invoices: invoices.length,
                    achats: achats.length,
                    totalVente,
                    totalAchat,
                    marge: totalVente - totalAchat,
                    pending: pending.length,
                    overdue: overdue.length
                },
                recentInvoices: invoices.slice(-8).map(i => ({ numero: i.numero, client: i.clientName, total: i.total, status: i.status, date: i.date, due: i.due })),
                recentAchats: achats.slice(-8).map(a => ({ numero: a.numero, fournisseur: a.supplier, total: a.amount, date: a.date }))
            };
        }

        function escapeChatHtml(text) {
            return String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
        }

        function extractGroqJson(text) {
            const cleaned = String(text || '').replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
            try { return JSON.parse(cleaned); } catch (e) {}
            const start = cleaned.indexOf('{');
            const end = cleaned.lastIndexOf('}');
            if (start >= 0 && end > start) {
                try { return JSON.parse(cleaned.slice(start, end + 1)); } catch (e) {}
            }
            return { type: 'answer', message: cleaned || '...' };
        }

        function findInvoiceSmart(params = {}) {
            const invoices = DB.getAllInvoices();
            const id = params.id;
            const numero = String(params.numero || params.invoiceNumber || '').toLowerCase().trim();
            const clientName = String(params.clientName || params.client || '').toLowerCase().trim();
            if (id) return invoices.find(i => i.id == id);
            if (numero) return invoices.find(i => String(i.numero || '').toLowerCase() === numero || String(i.numero || '').toLowerCase().includes(numero));
            if (clientName) {
                const found = invoices.filter(i => String(i.clientName || '').toLowerCase().includes(clientName));
                return found.length === 1 ? found[0] : null;
            }
            return null;
        }

        function buildInvoiceFromAi(params = {}) {
            const items = Array.isArray(params.items) ? params.items.map(item => ({
                desc: String(item.desc || item.description || 'Service'),
                price: Number(item.price || item.prix || 0),
                qty: Number(item.qty || item.quantity || item.quantite || 1)
            })).filter(item => item.desc && item.price > 0) : [];
            if (!params.clientName && !params.client) throw new Error('Nom client manquant.');
            if (items.length === 0) throw new Error('Articles/prix manquants.');

            const subtotal = items.reduce((s, item) => s + item.price * item.qty, 0);
            const tva = Number(params.tva ?? 19);
            const remise = Number(params.remise ?? 0);
            const afterRemise = subtotal - subtotal * (remise / 100);
            const total = afterRemise + afterRemise * (tva / 100);
            const today = new Date().toISOString().split('T')[0];
            const dueDefault = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            return {
                numero: params.numero || DB.getNextInvoiceNumero(),
                clientName: params.clientName || params.client,
                clientEmail: params.clientEmail || params.email || '',
                clientPhone: params.clientPhone || params.phone || '',
                clientAddress: params.clientAddress || params.address || '',
                compName: document.getElementById('compName').value || 'TeknoIsland',
                compEmail: document.getElementById('compEmail').value || '',
                compPhone: document.getElementById('compPhone').value || '',
                compAddress: document.getElementById('compAddress').value || '',
                compMF: document.getElementById('compMF').value || '',
                compLogo: currentLogo || null,
                date: params.date || today,
                due: params.due || params.dueDate || dueDefault,
                items,
                tva,
                remise,
                notes: params.notes || 'Facture créée via Groq Assistant',
                status: params.status || 'pending',
                total
            };
        }

        function executeGroqAction(action) {
            const name = action?.name || action?.action;
            const params = action?.params || action?.arguments || {};

            if (name === 'create_invoice') {
                const invoice = buildInvoiceFromAi(params);
                const saved = DB.addInvoice(invoice);
                renderInvoiceList();
                loadDashboard();
                document.getElementById('invNum').value = DB.getNextInvoiceNumero();
                return `✅ Facture créée: <strong>${saved.numero}</strong><br>👤 ${escapeChatHtml(saved.clientName)}<br>💰 <strong>${formatMoney(saved.total)}</strong><br><br><button class="chat-quick-btn" onclick="viewInvoice(${saved.id}); toggleChatbot();">👁️ Voir</button> <button class="chat-quick-btn" onclick="chatbotDownloadPDFByNum('${saved.numero}')">📄 PDF</button>`;
            }

            if (name === 'update_invoice') {
                const inv = findInvoiceSmart(params);
                if (!inv) throw new Error('Facture introuvable pour modification.');
                const updatedFields = { ...inv };
                if (params.clientName || params.client) updatedFields.clientName = params.clientName || params.client;
                if (params.clientEmail || params.email) updatedFields.clientEmail = params.clientEmail || params.email;
                if (params.clientPhone || params.phone) updatedFields.clientPhone = params.clientPhone || params.phone;
                if (params.clientAddress || params.address) updatedFields.clientAddress = params.clientAddress || params.address;
                if (params.status) updatedFields.status = params.status;
                if (params.date) updatedFields.date = params.date;
                if (params.due || params.dueDate) updatedFields.due = params.due || params.dueDate;
                if (params.notes) updatedFields.notes = params.notes;
                if (params.tva !== undefined) updatedFields.tva = Number(params.tva);
                if (params.remise !== undefined) updatedFields.remise = Number(params.remise);
                if (Array.isArray(params.items) && params.items.length) {
                    updatedFields.items = params.items.map(item => ({
                        desc: String(item.desc || item.description || 'Service'),
                        price: Number(item.price || item.prix || 0),
                        qty: Number(item.qty || item.quantity || item.quantite || 1)
                    })).filter(item => item.price > 0);
                }
                const subtotal = (updatedFields.items || []).reduce((s, item) => s + Number(item.price || 0) * Number(item.qty || 1), 0);
                const afterRemise = subtotal - subtotal * (Number(updatedFields.remise || 0) / 100);
                updatedFields.total = afterRemise + afterRemise * (Number(updatedFields.tva || 0) / 100);
                DB.updateInvoice(inv.id, updatedFields);
                renderInvoiceList();
                loadDashboard();
                return `✅ Facture modifiée: <strong>${updatedFields.numero}</strong><br>💰 Nouveau total: <strong>${formatMoney(updatedFields.total)}</strong><br><br><button class="chat-quick-btn" onclick="viewInvoice(${updatedFields.id}); toggleChatbot();">👁️ Voir</button>`;
            }

            if (name === 'delete_invoice') {
                const inv = findInvoiceSmart(params);
                if (!inv) throw new Error('Facture introuvable pour suppression.');
                DB.deleteInvoice(inv.id);
                renderInvoiceList();
                loadDashboard();
                return `🗑️ Facture supprimée: <strong>${inv.numero}</strong> — ${escapeChatHtml(inv.clientName || '')}`;
            }

            if (name === 'create_achat') {
                const amount = Number(params.amount || params.montant || params.total || 0);
                if (!params.supplier && !params.fournisseur) throw new Error('Fournisseur manquant.');
                if (amount <= 0) throw new Error('Montant achat manquant.');
                const achat = {
                    numero: params.numero || DB.getNextAchatNumero(),
                    numeroFournisseur: params.numeroFournisseur || params.invoiceNumber || '',
                    supplier: params.supplier || params.fournisseur,
                    supplierEmail: params.supplierEmail || params.email || '',
                    supplierPhone: params.supplierPhone || params.phone || '',
                    date: params.date || new Date().toISOString().split('T')[0],
                    amount,
                    fileName: params.fileName || '',
                    fileType: params.fileType || '',
                    fileData: null,
                    notes: params.notes || 'Achat créé via Groq Assistant',
                    status: 'completed'
                };
                const saved = DB.addAchat(achat);
                renderAchatList();
                loadDashboard();
                return `✅ Achat créé: <strong>${saved.numero}</strong><br>🏢 ${escapeChatHtml(saved.supplier)}<br>💸 <strong>${formatMoney(saved.amount)}</strong>`;
            }

            if (name === 'upload_achat') {
                document.getElementById('achatUploadInput')?.click();
                return '📤 Choisis le fichier achat à uploader. Après sélection, je vais l’analyser et te proposer la sauvegarde.';
            }

            if (name === 'open_invoice_edit') {
                const inv = findInvoiceSmart(params);
                if (!inv) throw new Error('Facture introuvable.');
                editInvoice(inv.id);
                toggleChatbot();
                return `✏️ Modification ouverte pour <strong>${inv.numero}</strong>.`;
            }

            throw new Error('Action Groq inconnue: ' + name);
        }

        function executeGroqPlan(plan) {
            if (!plan || plan.type === 'answer') {
                return escapeChatHtml(plan?.message || '...').replace(/\n/g, '<br>');
            }
            const actions = Array.isArray(plan.actions) ? plan.actions : [plan];
            const results = [];
            actions.forEach(action => results.push(executeGroqAction(action)));
            const intro = plan.message ? escapeChatHtml(plan.message).replace(/\n/g, '<br>') + '<br><br>' : '';
            return intro + results.join('<br><br>');
        }

        async function askGemini(msg) {
            const invoices = DB.getAllInvoices();
            const achats   = DB.getAllAchats();
            const totalVente = invoices.reduce((s,i) => s+(i.total||0), 0);
            const totalAchat = achats.reduce((s,a) => s+(a.amount||0), 0);
            const pending  = invoices.filter(i => i.status==='pending');
            const overdue  = invoices.filter(i => i.status==='overdue');
            const paid     = invoices.filter(i => i.status==='paid');

            const systemPrompt = `Tu es Gemini, l'agent intelligent de FacturePro. Tu peux lire les données et exécuter des actions dans l'application.

Réponds UNIQUEMENT en JSON valide, sans markdown, sans texte autour.

Schéma réponse:
1) Pour répondre seulement:
{"type":"answer","message":"..."}

2) Pour agir:
{"type":"actions","message":"...","actions":[{"name":"create_invoice","params":{...}}]}

Actions disponibles:
- create_invoice: params {clientName, clientEmail?, clientPhone?, clientAddress?, items:[{desc,price,qty}], tva?, remise?, date?, due?, notes?, status?}
- update_invoice: params {numero? OR id? OR clientName?, clientEmail?, clientPhone?, clientAddress?, items?, tva?, remise?, date?, due?, notes?, status?}
- delete_invoice: params {numero? OR id? OR clientName?}
- create_achat: params {supplier, supplierEmail?, supplierPhone?, amount, date?, numeroFournisseur?, notes?}
- upload_achat: params {}
- open_invoice_edit: params {numero? OR id? OR clientName?}

Règles:
- Si une action manque des champs obligatoires, retourne type answer et pose une question courte.
- N'invente jamais de client, montant, article ou numéro.
- Si l'utilisateur dit "supprime facture INV-..." ou équivalent, utilise delete_invoice directement.
- Si l'utilisateur dit "modifier facture ..." avec champs clairs, utilise update_invoice.
- Si l'utilisateur veut upload achat fichier, utilise upload_achat.
- Langue: réponds dans la langue de l'utilisateur, français ou darija tunisien.

=== DONNÉES TEMPS RÉEL ===
FACTURES VENTE (${invoices.length} total):
- CA total: ${totalVente.toFixed(3)} TND
- Payées: ${paid.length} | En attente: ${pending.length} | En retard: ${overdue.length}
- Liste: ${JSON.stringify(invoices.map(i=>({id:i.id,num:i.numero,client:i.clientName,email:i.clientEmail,phone:i.clientPhone,total:i.total,status:i.status,date:i.date,due:i.due,items:i.items})))}

ACHATS (${achats.length} total):
- Total: ${totalAchat.toFixed(3)} TND | Marge: ${(totalVente-totalAchat).toFixed(3)} TND
- Liste: ${JSON.stringify(achats.map(a=>({id:a.id,num:a.numero,fournisseur:a.supplier,montant:a.amount,date:a.date,notes:a.notes})))}`;

            const apiKey = localStorage.getItem('fp_gemini_api_key') || '';
            if (!apiKey) {
                throw new Error('Clé API Gemini manquante. Cliquez sur ⚙️ API Key pour configurer.');
            }

            const geminiModel = 'gemini-flash-latest';
            const geminiBody = {
                system_instruction: { parts: [{ text: systemPrompt }] },
                contents: [{ role: 'user', parts: [{ text: msg }] }]
            };

            async function callOnce() {
                let response;
                try {
                    // 1) نجربو السيرفر المحلي (src/server.js -> /api/ai/gemini) إذا كان خدام
                    //    أحسن طريقة: المفتاح ما يعديش لطرف ثالث
                    response = await fetch('/api/ai/gemini', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ apiKey, model: geminiModel, ...geminiBody })
                    });
                } catch (networkError) {
                    response = null;
                }

                if (!response || response.status === 404) {
                    // 2) fallback: ملف HTML وحدو بلا سيرفر (file:// أو static hosting)
                    //    Gemini native endpoint يقبل نداء مباشر من المتصفح (CORS OK)، بلا corsproxy
                    const directUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${encodeURIComponent(apiKey)}`;
                    response = await fetch(directUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(geminiBody)
                    });
                }
                return response;
            }

            // 503 = سيرفرات Gemini مزحومة مؤقتًا، نعاودو نحاولو بـ backoff قبل ما نستسلمو
            let response;
            let lastError = null;
            const delays = [800, 2000, 4000];
            for (let attempt = 0; attempt <= delays.length; attempt++) {
                response = await callOnce();
                if (response.ok || response.status !== 503) break;
                lastError = response;
                if (attempt < delays.length) {
                    await new Promise(r => setTimeout(r, delays[attempt]));
                }
            }

            if (!response.ok) {
                let detail = '';
                try { detail = (await response.json())?.error?.message || ''; } catch(e) {}
                throw new Error(`Gemini API error ${response.status}${detail ? ': ' + detail : ''}`);
            }
            const data = await response.json();
            const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('')?.trim() || '';
            return extractGroqJson(text);
        }

        async function testGeminiKey() {
            addChat('<em>🔍 Test Gemini AI...</em>', false, 'ai-card');
            try {
                const answer = await askGemini('قل جملة واحدة فقط: Gemini AI يخدم مزيان.');
                addChat('✅ ' + escapeChatHtml(answer?.message || 'Gemini AI OK'), false, 'ai-card');
            } catch (error) {
                console.error(error);
                addChat('❌ ' + escapeChatHtml(error.message), false, 'error');
            }
        }

        async function processChatWithAi(msg) {
            addChat('<em>✦ Gemini يجاوب...</em>', false, 'ai-card');
            try {
                const plan = await askGemini(msg);
                aiSuccessCount += 1;
                saveAiState();
                updateAiPanel();
                addChat(executeGroqPlan(plan), false, 'ai-card');
            } catch (error) {
                console.error(error);
                aiLocalCount += 1;
                saveAiState();
                updateAiPanel();
                addChat('⚠️ Gemini ما جاوبش مؤقتاً، باش نكمّل محليًا.<br><small style="color:var(--text-muted);">' + escapeChatHtml(error.message||'') + '</small>', false, 'error');
                processChat(msg);
            }
        }

        function showChatStats() {
            const invoices = DB.getAllInvoices();
            const achats = DB.getAllAchats();
            const totalVente = invoices.reduce((s, i) => s + (i.total || 0), 0);
            const totalAchat = achats.reduce((s, a) => s + (a.amount || 0), 0);
            addChat(
                `<strong>Statistique Chatbot</strong><br><br>` +
                `AI: <strong>${aiEnabled ? 'ON' : 'OFF'}</strong><br>` +
                `✦ Gemini AI actif — يتجدد كل يوم في منتصف الليل<br>` +
                `Réponses Gemini: <strong>${aiSuccessCount}</strong><br>` +
                `Réponses locales: <strong>${aiLocalCount}</strong><br>` +
                `<br>` +
                `Factures: <strong>${invoices.length}</strong> | Ventes: <strong>${formatMoney(totalVente)}</strong><br>` +
                `Achats: <strong>${achats.length}</strong> | Total achats: <strong>${formatMoney(totalAchat)}</strong><br>` +
                `Marge: <strong style="color:${totalVente - totalAchat >= 0 ? 'var(--success)' : 'var(--danger)'};">${formatMoney(totalVente - totalAchat)}</strong>`,
                false, 'ai-card'
            );
        }

        function sendChat() {
            const input = document.getElementById('chatInput');
            const msg = input.value.trim();
            if (!msg) return;
            addChat(msg, true);
            input.value = '';
            // If wizard is active, always use local processChat
            if (chatCreateState) {
                setTimeout(() => processChat(msg), 300);
                return;
            }
            // In local mode, keep the old guided wizard for creating invoices.
            const lower = msg.toLowerCase().trim();
            if (!aiEnabled && (lower.match(/(?:creer|create|jadid|new|créer)\s*(?:facture|invoice)?/) || lower === 'creer' || lower === 'créer')) {
                setTimeout(() => processChat(msg), 300);
                return;
            }
            if (aiEnabled && localStorage.getItem('fp_gemini_api_key')) {
                setTimeout(() => processChatWithAi(msg), 300);
            } else {
                setTimeout(() => processChat(msg), 300);
            }
        }

        // ===================== CHATBOT INVOICE CREATION WIZARD =====================
        // Steps: 0=clientName, 1=clientEmail, 2=clientPhone, 3=addingItems(loop),
        //        4=tva, 5=remise, 6=confirm

        function chatNavBtns(backStep, showBack = true) {
            let btns = '';
            if (showBack) btns += `<button class="chat-quick-btn" style="background:var(--card-solid);border:1.5px solid var(--border-strong);color:var(--text-muted);" onclick="chatGoBack(${backStep})">⬅️ Retour</button> `;
            btns += `<button class="chat-quick-btn" style="background:rgba(244,63,94,0.1);border:1.5px solid rgba(244,63,94,0.3);color:var(--danger);" onclick="cancelChatInvoice()">❌ Annuler</button>`;
            return btns;
        }

        function chatGoBack(toStep) {
            if (!chatCreateState) return;
            chatCreateState.step = toStep;
            const stepMsgs = {
                0: `👤 Nom du client ?<br><br>${chatNavBtns(0, false)}`,
                1: `📧 Email du client ? (ou <em>-</em> pour passer)<br><br>${chatNavBtns(0)}`,
                2: `📞 Téléphone du client ? (ou <em>-</em> pour passer)<br><br>${chatNavBtns(1)}`,
                3: `🛒 <strong>Produit / Service #${chatCreateState.data.items.length + 1}</strong><br>Format: <em>Description, Prix, Quantité</em><br><br>${chatNavBtns(2)}`,
                4: `📊 TVA (%) ? Exemple: <em>19</em><br><br>${chatNavBtns(3)}`,
                5: `🏷️ Remise (%) ? (0 si aucune)<br><br>${chatNavBtns(4)}`,
            };
            addChat(`↩️ <em>Retour à l'étape précédente</em><br><br>` + (stepMsgs[toStep] || ''), false, 'invoice-found');
        }

        // ===================== WIZARD BOTTOM BUTTONS =====================
        function showWizardBtns() {
            const retour = document.getElementById('chatWizardBtns');
            const annuler = document.getElementById('chatAnnulerBtn');
            if (retour) {
                retour.style.opacity = '1';
                retour.style.pointerEvents = 'auto';
                retour.style.cursor = 'pointer';
                retour.style.background = 'var(--bg)';
                retour.style.borderColor = 'var(--primary-400)';
                retour.style.color = 'var(--primary-600)';
            }
            if (annuler) {
                annuler.style.opacity = '1';
                annuler.style.pointerEvents = 'auto';
                annuler.style.cursor = 'pointer';
                annuler.style.background = 'rgba(244,63,94,0.12)';
                annuler.style.borderColor = 'rgba(244,63,94,0.5)';
            }
        }
        function hideWizardBtns() {
            const retour = document.getElementById('chatWizardBtns');
            const annuler = document.getElementById('chatAnnulerBtn');
            if (retour) {
                retour.style.opacity = '0.35';
                retour.style.pointerEvents = 'none';
                retour.style.cursor = 'not-allowed';
                retour.style.borderColor = 'var(--border-strong)';
                retour.style.color = 'var(--text-muted)';
            }
            if (annuler) {
                annuler.style.opacity = '0.35';
                annuler.style.pointerEvents = 'none';
                annuler.style.cursor = 'not-allowed';
                annuler.style.background = 'rgba(244,63,94,0.07)';
                annuler.style.borderColor = 'rgba(244,63,94,0.3)';
            }
        }
        function chatWizardBack() {
            if (!chatCreateState) return;
            const step = Math.floor(chatCreateState.step);
            if (step <= 0) { chatWizardCancel(); return; }
            const backTo = step >= 5 ? 4 : step >= 4 ? 3 : step >= 3 ? 2 : step >= 2 ? 1 : 0;
            chatGoBack(backTo);
        }
        function chatWizardCancel() {
            cancelChatInvoice();
            hideWizardBtns();
        }

        function processChatCreateInvoice(msg) {
            if (!chatCreateState) {
                chatCreateState = { step: 0, data: { items: [] } };
                addChat(`📝 <strong>Création de Facture</strong><br><br>👤 Nom du client ?<br><br>${chatNavBtns(0, false)}`, false, 'invoice-found');
                showWizardBtns();
                return true;
            }

            const state = chatCreateState;

            // ── Step 0: client name ─────────────────────────────────────
            if (state.step === 0) {
                if (!msg.trim()) { addChat('❌ Entrez le nom du client.', false, 'error'); return true; }
                state.data.clientName = msg.trim();
                state.step = 1;
                addChat(`👤 Client: <strong>${state.data.clientName}</strong><br><br>📧 Email du client ? (ou tapez <em>-</em> pour passer)<br><br>${chatNavBtns(0)}`, false, 'invoice-found');
                return true;
            }

            // ── Step 1: client email ────────────────────────────────────
            if (state.step === 1) {
                state.data.clientEmail = msg.trim() === '-' ? '' : msg.trim();
                state.step = 2;
                addChat(`📧 Email: <strong>${state.data.clientEmail || '—'}</strong><br><br>📞 Téléphone du client ? (ou <em>-</em> pour passer)<br><br>${chatNavBtns(1)}`, false, 'invoice-found');
                return true;
            }

            // ── Step 2: client phone ────────────────────────────────────
            if (state.step === 2) {
                state.data.clientPhone = msg.trim() === '-' ? '' : msg.trim();
                state.step = 3;
                addChat(`📞 Téléphone: <strong>${state.data.clientPhone || '—'}</strong><br><br>🛒 <strong>Produit / Service #${state.data.items.length + 1}</strong><br>Format: <em>Description, Prix, Quantité</em><br>Exemple: <em>Développement web, 500, 1</em><br><br>${chatNavBtns(2)}`, false, 'invoice-found');
                return true;
            }

            // ── Step 3: add items (loop) ────────────────────────────────
            if (state.step === 3) {
                const parts = msg.split(',').map(p => p.trim());
                if (parts.length < 2) {
                    addChat(`❌ Format incorrect. Exemple: <em>Développement web, 500, 1</em><br><br>${chatNavBtns(2)}`, false, 'error');
                    return true;
                }
                const desc = parts[0];
                const price = parseFloat(parts[1]) || 0;
                const qty = parseInt(parts[2]) || 1;
                if (!desc || price <= 0) {
                    addChat(`❌ Description et prix obligatoires.<br><br>${chatNavBtns(2)}`, false, 'error');
                    return true;
                }
                state.data.items.push({ desc, price, qty });
                const itemTotal = price * qty;
                let resp = `✅ Produit ajouté:<br>• <strong>${desc}</strong> — ${formatMoney(price)} × ${qty} = <strong>${formatMoney(itemTotal)}</strong><br><br>`;
                resp += `<button class="chat-quick-btn" onclick="chatAddAnotherItem()">➕ Ajouter un autre</button> `;
                resp += `<button class="chat-quick-btn" onclick="chatNextAfterItems()">➡️ Continuer</button> `;
                resp += `<button class="chat-quick-btn" style="background:rgba(244,63,94,0.1);border:1.5px solid rgba(244,63,94,0.3);color:var(--danger);" onclick="cancelChatInvoice()">❌ Annuler</button>`;
                addChat(resp, false, 'invoice-found');
                state.step = 3.5;
                return true;
            }

            // ── Step 4: TVA ─────────────────────────────────────────────
            if (state.step === 4) {
                const tva = parseFloat(msg.replace(/[^0-9.]/g, ''));
                state.data.tva = isNaN(tva) ? 19 : tva;
                state.step = 5;
                addChat(`📊 TVA: <strong>${state.data.tva}%</strong><br><br>🏷️ Remise (%) ? (0 si aucune)<br><br>${chatNavBtns(4)}`, false, 'invoice-found');
                return true;
            }

            // ── Step 5: Remise ───────────────────────────────────────────
            if (state.step === 5) {
                const remise = parseFloat(msg.replace(/[^0-9.]/g, ''));
                state.data.remise = isNaN(remise) ? 0 : remise;
                state.step = 6;
                chatShowSummary();
                return true;
            }

            return false;
        }

        function chatAddAnotherItem() {
            if (!chatCreateState) return;
            chatCreateState.step = 3;
            addChat(`🛒 <strong>Produit / Service #${chatCreateState.data.items.length + 1}</strong><br>Format: <em>Description, Prix, Quantité</em><br><br>${chatNavBtns(2)}`, false, 'invoice-found');
        }

        function chatNextAfterItems() {
            if (!chatCreateState) return;
            if (chatCreateState.data.items.length === 0) {
                addChat('❌ Ajoutez au moins un produit.', false, 'error');
                return;
            }
            chatCreateState.step = 4;
            addChat(`📊 TVA (%) ? Exemple: <em>19</em> (tapez 0 si exonéré)<br><br>${chatNavBtns(3)}`, false, 'invoice-found');
        }

        function chatShowSummary() {
            const state = chatCreateState;
            if (!state) return;
            const d = state.data;

            let subtotal = d.items.reduce((s, i) => s + i.price * i.qty, 0);
            const remiseAmt = subtotal * (d.remise / 100);
            const afterRemise = subtotal - remiseAmt;
            const tvaAmt = afterRemise * (d.tva / 100);
            const grandTotal = afterRemise + tvaAmt;

            let summary = `<strong>📋 Récapitulatif Facture</strong><br><br>`;
            summary += `👤 <strong>Client:</strong> ${d.clientName}`;
            if (d.clientEmail) summary += ` | 📧 ${d.clientEmail}`;
            if (d.clientPhone) summary += ` | 📞 ${d.clientPhone}`;
            summary += `<br><br>`;

            summary += `<strong>🛒 Produits:</strong><br>`;
            d.items.forEach(item => {
                summary += `• ${item.desc} — ${formatMoney(item.price)} × ${item.qty} = <strong>${formatMoney(item.price * item.qty)}</strong><br>`;
            });

            summary += `<br>Sous-total: ${formatMoney(subtotal)}<br>`;
            if (d.remise > 0) summary += `Remise (${d.remise}%): -${formatMoney(remiseAmt)}<br>`;
            summary += `TVA (${d.tva}%): ${formatMoney(tvaAmt)}<br>`;
            summary += `<strong style="color:var(--primary);font-size:16px;">Total TTC: ${formatMoney(grandTotal)}</strong><br><br>`;

            summary += `<button class="chat-quick-btn" onclick="confirmChatInvoice()">✅ Confirmer & Sauvegarder</button> `;
            summary += `<button class="chat-quick-btn" onclick="cancelChatInvoice()">❌ Annuler</button>`;

            addChat(summary, false, 'invoice-found');
        }

        function confirmChatInvoice() {
            if (!chatCreateState || chatCreateState.step !== 6) return;
            const state = chatCreateState;
            const d = state.data;

            let subtotal = d.items.reduce((s, i) => s + i.price * i.qty, 0);
            const remiseAmt = subtotal * (d.remise / 100);
            const afterRemise = subtotal - remiseAmt;
            const tvaAmt = afterRemise * (d.tva / 100);
            const grandTotal = afterRemise + tvaAmt;

            const invoice = {
                numero: DB.getNextInvoiceNumero(),
                clientName: d.clientName,
                clientEmail: d.clientEmail || '',
                clientPhone: d.clientPhone || '',
                clientAddress: '',
                compName: document.getElementById('compName').value || t('yourCompany'),
                compEmail: document.getElementById('compEmail').value,
                compPhone: document.getElementById('compPhone').value,
                compAddress: document.getElementById('compAddress').value,
                compMF: document.getElementById('compMF').value,
                compLogo: currentLogo || null,
                date: new Date().toISOString().split('T')[0],
                due: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
                items: d.items,
                tva: d.tva,
                remise: d.remise,
                notes: 'Facture créée via Assistant',
                status: 'pending',
                total: grandTotal
            };
            DB.addInvoice(invoice);
            renderInvoiceList();
            loadDashboard();

            addChat(`✅ <strong>Facture créée avec succès!</strong><br><br>📄 <strong>${invoice.numero}</strong><br>👤 ${invoice.clientName}<br>💰 <strong style="color:var(--primary)">${formatMoney(invoice.total)}</strong><br><br><button class="chat-quick-btn" onclick="chatbotDownloadPDFByNum('${invoice.numero}')">📄 Télécharger PDF</button> <button class="chat-quick-btn" onclick="viewInvoice(${invoice.id}); toggleChatbot();">👁️ Voir Facture</button>`, false, 'vente-card');

            chatCreateState = null;
            hideWizardBtns();
        }

        // ===================== CHAT SEARCH =====================
        let _chatSearchType = 'vente';

        function openChatSearch() {
            document.getElementById('chatSearchModal').classList.add('active');
            document.getElementById('chatSearchInput').value = '';
            document.getElementById('chatSearchResults').innerHTML = '<div style="color:var(--text-muted);text-align:center;padding:20px;">Tapez pour chercher...</div>';
            setTimeout(() => document.getElementById('chatSearchInput').focus(), 100);
        }

        function closeChatSearch() {
            document.getElementById('chatSearchModal').classList.remove('active');
        }

        function setChatSearchType(type) {
            _chatSearchType = type;
            ['vente','achat','all'].forEach(t => {
                const btn = document.getElementById('searchType' + t.charAt(0).toUpperCase() + t.slice(1));
                if (btn) {
                    if (t === type) {
                        btn.style.background = 'linear-gradient(135deg,#6366f1,#818cf8)';
                        btn.style.color = 'white';
                        btn.style.border = 'none';
                    } else {
                        btn.style.background = 'var(--card-solid)';
                        btn.style.color = 'var(--text-muted)';
                        btn.style.border = '1.5px solid var(--border-strong)';
                    }
                }
            });
            runChatSearch();
        }

        function runChatSearch() {
            const q = (document.getElementById('chatSearchInput').value || '').toLowerCase().trim();
            const container = document.getElementById('chatSearchResults');
            if (!q) {
                container.innerHTML = '<div style="color:var(--text-muted);text-align:center;padding:20px;">Tapez pour chercher...</div>';
                return;
            }

            let html = '';
            const invoices = DB.getAllInvoices();
            const achats = DB.getAllAchats();

            if (_chatSearchType === 'vente' || _chatSearchType === 'all') {
                const found = invoices.filter(i =>
                    i.numero.toLowerCase().includes(q) ||
                    (i.clientName || '').toLowerCase().includes(q) ||
                    (i.clientEmail || '').toLowerCase().includes(q) ||
                    (i.clientPhone || '').toLowerCase().includes(q)
                );
                if (found.length > 0) {
                    html += `<div style="font-size:11px;font-weight:700;color:var(--primary-600);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;padding:0 4px;">💰 Factures Vente (${found.length})</div>`;
                    found.forEach(inv => {
                        const stColor = inv.status === 'paid' ? '#10b981' : inv.status === 'overdue' ? '#f43f5e' : '#f59e0b';
                        const stIcon = inv.status === 'paid' ? '✅' : inv.status === 'overdue' ? '❌' : '⏳';
                        html += `<div onclick="closeChatSearch();viewInvoice(${inv.id});" style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;margin-bottom:6px;background:var(--card-solid);border-radius:10px;border:1px solid var(--border);cursor:pointer;transition:all 0.15s;" onmouseover="this.style.borderColor='#6366f1'" onmouseout="this.style.borderColor='var(--border)'">
                            <div>
                                <div style="font-weight:700;font-size:14px;">📄 ${inv.numero}</div>
                                <div style="font-size:12px;color:var(--text-muted);">👤 ${inv.clientName}</div>
                            </div>
                            <div style="text-align:right;">
                                <div style="font-weight:700;color:var(--primary-600);">${formatMoney(inv.total)}</div>
                                <div style="font-size:11px;color:${stColor};">${stIcon} ${formatDate(inv.date)}</div>
                            </div>
                        </div>`;
                    });
                }
            }

            if (_chatSearchType === 'achat' || _chatSearchType === 'all') {
                const found = achats.filter(a =>
                    a.numero.toLowerCase().includes(q) ||
                    (a.numeroFournisseur || '').toLowerCase().includes(q) ||
                    (a.supplier || '').toLowerCase().includes(q) ||
                    (a.supplierEmail || '').toLowerCase().includes(q)
                );
                if (found.length > 0) {
                    html += `<div style="font-size:11px;font-weight:700;color:#7c3aed;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;${_chatSearchType === 'all' ? 'margin-top:16px;' : ''}padding:0 4px;">🧾 Achats Fournisseur (${found.length})</div>`;
                    found.forEach(a => {
                        html += `<div onclick="closeChatSearch();viewAchat(${a.id});" style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;margin-bottom:6px;background:var(--card-solid);border-radius:10px;border:1px solid var(--border);cursor:pointer;transition:all 0.15s;" onmouseover="this.style.borderColor='#8b5cf6'" onmouseout="this.style.borderColor='var(--border)'">
                            <div>
                                <div style="font-weight:700;font-size:14px;">🧾 ${a.numero}${a.numeroFournisseur ? ' <span style=\"font-size:11px;color:#7c3aed;\">('+a.numeroFournisseur+')</span>' : ''}</div>
                                <div style="font-size:12px;color:var(--text-muted);">🏢 ${a.supplier}</div>
                            </div>
                            <div style="text-align:right;">
                                <div style="font-weight:700;color:#7c3aed;">${formatMoney(a.amount)}</div>
                                <div style="font-size:11px;color:var(--text-muted);">📅 ${formatDate(a.date)}</div>
                            </div>
                        </div>`;
                    });
                }
            }

            if (!html) {
                html = `<div style="text-align:center;padding:30px;color:var(--text-muted);">
                    <div style="font-size:36px;margin-bottom:8px;">🔍</div>
                    <div style="font-weight:600;">Aucun résultat pour "<strong>${q}</strong>"</div>
                    <div style="font-size:12px;margin-top:4px;">Essayez le numéro, nom client, ou fournisseur</div>
                </div>`;
            }
            container.innerHTML = html;
        }

        function cancelChatInvoice() {
            hideWizardBtns();
            chatCreateState = null;
            addChat(`❌ ${t('chatCancelled')}`, false, 'error');
        }

        function chatbotDownloadPDFByNum(num) {
            const inv = DB.getAllInvoices().find(i => i.numero === num);
            if (inv) printInvoice(inv);
        }

        function triggerChatSearch() {
            const input = document.getElementById('chatInput');
            const q = (input.value || '').trim();
            if (!q) {
                addChat(`🔎 <strong>${t('chatSearchTitle')}</strong><br>${t('chatSearchPrompt')}`, false, 'info');
                return;
            }
            addChat(`${t('chatSearchResults')} : <strong>${escapeChatHtml(q)}</strong>`, true);
            input.value = '';
            performChatbotSearch(q);
        }

        function performChatbotSearch(q) {
            const query = q.toLowerCase().trim();
            const invoices = DB.getAllInvoices();
            const achats = DB.getAllAchats();
            
            const foundInvoices = invoices.filter(i => {
                const idMatch = String(i.id) === query;
                const numMatch = String(i.numero).toLowerCase().includes(query);
                const nameMatch = (i.clientName || '').toLowerCase().includes(query);
                const emailMatch = (i.clientEmail || '').toLowerCase().includes(query);
                const phoneMatch = (i.clientPhone || '').toLowerCase().includes(query);
                return idMatch || numMatch || nameMatch || emailMatch || phoneMatch;
            });
            
            const foundAchats = achats.filter(a => {
                const idMatch = String(a.id) === query;
                const numMatch = String(a.numero).toLowerCase().includes(query);
                const numFournMatch = (a.numeroFournisseur || '').toLowerCase().includes(query);
                const supplierMatch = (a.supplier || '').toLowerCase().includes(query);
                const emailMatch = (a.supplierEmail || '').toLowerCase().includes(query);
                const phoneMatch = (a.supplierPhone || '').toLowerCase().includes(query);
                return idMatch || numMatch || numFournMatch || supplierMatch || emailMatch || phoneMatch;
            });
            
            if (foundInvoices.length === 0 && foundAchats.length === 0) {
                const noResultMsg = `❌ ${t('chatSearchNoResult')} "<strong>${escapeChatHtml(q)}</strong>" (Facture / Achat).`;
                addChat(noResultMsg, false, 'error');
                return;
            }
            
            let html = `🔎 <strong>${t('chatSearchResults')} "${escapeChatHtml(q)}" :</strong><br><br>`;
            
            if (foundInvoices.length > 0) {
                html += `<div style="font-size:11px;font-weight:700;color:var(--primary-600);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">${t('chatSearchInvoiceHeader')} (${foundInvoices.length})</div>`;
                foundInvoices.slice(0, 5).forEach(inv => {
                    const stColor = inv.status === 'paid' ? 'var(--success)' : inv.status === 'overdue' ? 'var(--danger)' : 'var(--warning)';
                    const stIcon = inv.status === 'paid' ? '✅' : inv.status === 'overdue' ? '❌' : '⏳';
                    
                    html += `<div style="padding:10px;background:var(--bg);border-radius:10px;border:1px solid var(--border);margin-bottom:8px;">
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <div>
                                <strong>📄 ${inv.numero}</strong> (ID: ${inv.id})<br>
                                <span style="font-size:12px;color:var(--text-muted);">👤 Client: ${inv.clientName}</span>
                            </div>
                            <div style="text-align:right;">
                                <strong style="color:var(--primary);">${formatMoney(inv.total)}</strong><br>
                                <span style="font-size:11px;color:${stColor};">${stIcon} ${formatDate(inv.date)}</span>
                            </div>
                        </div>
                        <div style="margin-top:8px;display:flex;gap:4px;">
                            <button class="chat-quick-btn" onclick="viewInvoice(${inv.id}); toggleChatbot();">👁️ ${t('viewDetails').split(' ')[0] || 'Voir'}</button>
                            <button class="chat-quick-btn" onclick="chatbotDownloadPDF(${inv.id})">📄 PDF</button>
                            <button class="chat-quick-btn" onclick="editInvoice(${inv.id}); toggleChatbot();">✏️ ${t('editInvoice').split(' ')[1] || 'Edit'}</button>
                        </div>
                    </div>`;
                });
                if (foundInvoices.length > 5) {
                    html += `<p style="font-size:11px;color:var(--text-muted);text-align:center;">+ ${foundInvoices.length - 5} ${t('availableInvoices').toLowerCase()}...</p>`;
                }
            }
            
            if (foundAchats.length > 0) {
                const marginTop = foundInvoices.length > 0 ? 'margin-top:16px;' : '';
                html += `<div style="font-size:11px;font-weight:700;color:#7c3aed;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;${marginTop}">${t('chatSearchAchatHeader')} (${foundAchats.length})</div>`;
                foundAchats.slice(0, 5).forEach(a => {
                    html += `<div style="padding:10px;background:var(--bg);border-radius:10px;border:1px solid var(--border);margin-bottom:8px;">
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <div>
                                <strong>🧾 ${a.numero}</strong> (ID: ${a.id})<br>
                                <span style="font-size:12px;color:var(--text-muted);">🏢 Fourn: ${a.supplier}</span><br>
                                ${a.numeroFournisseur ? `<span style="font-size:11px;color:#7c3aed;">N° Facture Fourn.: ${a.numeroFournisseur}</span>` : ''}
                            </div>
                            <div style="text-align:right;">
                                <strong style="color:#7c3aed;">${formatMoney(a.amount)}</strong><br>
                                <span style="font-size:11px;color:var(--text-muted);">📅 ${formatDate(a.date)}</span>
                            </div>
                        </div>
                        <div style="margin-top:8px;display:flex;gap:4px;">
                            <button class="chat-quick-btn" onclick="viewAchat(${a.id}); toggleChatbot();">👁️ ${t('viewDetails').split(' ')[0] || 'Voir'}</button>
                            <button class="chat-quick-btn" onclick="editAchat(${a.id}); toggleChatbot();">✏️ ${t('editAchat').split(' ')[0] || 'Edit'}</button>
                        </div>
                    </div>`;
                });
                if (foundAchats.length > 5) {
                    html += `<p style="font-size:11px;color:var(--text-muted);text-align:center;">+ ${foundAchats.length - 5} ${t('noAchats').split(' ')[1] || 'achats'}...</p>`;
                }
            }
            
            addChat(html, false, 'invoice-found');
        }

        function tryChatbotSearch(msg) {
            const query = msg.toLowerCase().trim();
            const invoices = DB.getAllInvoices();
            const achats = DB.getAllAchats();
            
            const foundInvoices = invoices.filter(i => {
                const idMatch = String(i.id) === query;
                const numMatch = String(i.numero).toLowerCase().includes(query);
                const nameMatch = (i.clientName || '').toLowerCase().includes(query);
                const emailMatch = (i.clientEmail || '').toLowerCase().includes(query);
                const phoneMatch = (i.clientPhone || '').toLowerCase().includes(query);
                return idMatch || numMatch || nameMatch || emailMatch || phoneMatch;
            });
            
            const foundAchats = achats.filter(a => {
                const idMatch = String(a.id) === query;
                const numMatch = String(a.numero).toLowerCase().includes(query);
                const numFournMatch = (a.numeroFournisseur || '').toLowerCase().includes(query);
                const supplierMatch = (a.supplier || '').toLowerCase().includes(query);
                const emailMatch = (a.supplierEmail || '').toLowerCase().includes(query);
                const phoneMatch = (a.supplierPhone || '').toLowerCase().includes(query);
                return idMatch || numMatch || numFournMatch || supplierMatch || emailMatch || phoneMatch;
            });
            
            if (foundInvoices.length > 0 || foundAchats.length > 0) {
                performChatbotSearch(msg);
                return true;
            }
            return false;
        }

        function processChat(msg) {
            const lower = msg.toLowerCase().trim();
            const invoices = DB.getAllInvoices();
            const achats = DB.getAllAchats();

            // Handle creation wizard
            if (chatCreateState) {
                if (lower.match(/^(annuler|cancel|إلغاء|non|no|لا)$/)) {
                    cancelChatInvoice();
                    return;
                }
                if (processChatCreateInvoice(msg)) return;
            }

            // Create invoice command
            if (lower.match(/(?:creer|create|jadid|new|إنشاء|فاتورة جديدة|créer)\s*(?:facture|invoice|فاتورة)?/) ||
                lower.match(/^(creer|create|jadid|new|إنشاء)$/)) {
                chatCreateState = null;
                chatCreateState = { step: 0, data: { items: [] } };
                addChat(`📝 <strong>${t('chatCreateInvoice')}</strong><br><br>${t('chatEnterClient')}`, false, 'invoice-found');
                showWizardBtns();
                return;
            }

            // Upload achat from chat
            if (lower.match(/(?:upload|uploader|رفع|uploadé|téléverser)\s*(?:achat|fournisseur|facture|purchase|file|fichier)?/)) {
                addChat(`📎 <strong>${t('chatUploadAchat')}</strong><br><br>Cliquez sur le bouton 📎 en bas pour uploader un fichier.`, false, 'achat-card');
                return;
            }

            // Number search
            const matchNum = lower.match(/(?:facture|invoice|فاتورة|fac|inv)\s*(?:numero|number|num|n°|#|رقم)?\s*(\d+)/) ||
                             lower.match(/^(\d+)$/) ||
                             lower.match(/#(\d+)/);
            if (matchNum) {
                const num = matchNum[1];
                const inv = invoices.find(i => i.numero.toLowerCase().includes(num));
                if (inv) {
                    let itemsHtml = '';
                    let subtotal = 0;
                    (inv.items || []).forEach(item => {
                        const lineTotal = item.price * item.qty;
                        subtotal += lineTotal;
                        itemsHtml += `• ${item.desc} — ${formatMoney(item.price)} × ${item.qty} = <strong>${formatMoney(lineTotal)}</strong><br>`;
                    });
                    const remiseAmt = subtotal * ((inv.remise || 0) / 100);
                    const afterRemise = subtotal - remiseAmt;
                    const tvaAmt = afterRemise * ((inv.tva || 0) / 100);
                    const grandTotal = afterRemise + tvaAmt;
                    const statusColor = inv.status === 'paid' ? 'var(--success)' : inv.status === 'overdue' ? 'var(--danger)' : 'var(--warning)';

                    let detailHtml = `<strong>📄 ${inv.numero}</strong><br><br>`;
                    detailHtml += `👤 <strong>${t('clientName')}:</strong> ${inv.clientName}<br>`;
                    detailHtml += `📅 <strong>${t('dateLabel')}</strong> ${formatDate(inv.date)} | <strong>${t('dueLabel')}</strong> ${formatDate(inv.due)}<br>`;
                    detailHtml += `📊 <strong>${t('status')}:</strong> <span style="color:${statusColor};font-weight:700;">${t(inv.status)}</span><br>`;
                    detailHtml += `💰 <strong>${t('grandTotal')}:</strong> <span style="color:${statusColor};font-weight:800;font-size:16px;">${formatMoney(inv.total)}</span><br><br>`;
                    detailHtml += `<strong>🛒 ${t('products')}:</strong><br><div style="margin:8px 0;padding:10px;background:var(--bg);border-radius:8px;border:1px solid var(--border);">${itemsHtml}</div>`;
                    detailHtml += `<strong>📊 ${t('breakdown')}:</strong><br>`;
                    detailHtml += `<div style="margin:8px 0;padding:10px;background:var(--bg);border-radius:8px;border:1px solid var(--border);">`;
                    detailHtml += `• ${t('subtotal')}: ${formatMoney(subtotal)}<br>`;
                    if (inv.remise > 0) detailHtml += `• ${t('discount')} (${inv.remise}%): <span style="color:var(--success);">-${formatMoney(remiseAmt)}</span><br>`;
                    detailHtml += `• TVA (${inv.tva || 0}%): ${formatMoney(tvaAmt)}<br>`;
                    detailHtml += `<strong>• ${t('grandTotal')}: <span style="color:var(--primary);">${formatMoney(grandTotal)}</span></strong>`;
                    detailHtml += `</div><br>`;
                    detailHtml += `<button class="chat-quick-btn" onclick="chatbotViewDetails(${inv.id})">🔍 ${t('viewDetails')}</button> `;
                    detailHtml += `<button class="chat-quick-btn" onclick="chatbotDownloadPDF(${inv.id})">📄 ${t('downloadPDF')}</button> `;
                    detailHtml += `<button class="chat-quick-btn" onclick="editInvoice(${inv.id}); toggleChatbot();">✏️ ${t('editInvoice').split(' ')[1] || 'Edit'}</button>`;
                    addChat(detailHtml, false, 'invoice-found');
                } else {
                    addChat(`❌ <strong>${t('notFound')}</strong> #${num}<br>${t('availableInvoices')}: ${invoices.map(i => i.numero).join(', ')}`, false, 'error');
                }
                return;
            }

            // Client search
            const matchClient = lower.match(/(?:facture|invoice|فاتورة|fac)\s*(?:mt3|mte3|de|du|of|client|ل|الزبون)?\s*(.+)/) ||
                                lower.match(/(?:client|customer|زبون)\s*(.+)/) ||
                                lower.match(/(.+)\s*(?:facture|invoice|فاتورة)/);
            if (matchClient) {
                const name = matchClient[1].trim();
                const found = invoices.filter(i => i.clientName.toLowerCase().includes(name));
                if (found.length > 0) {
                    let html = `<strong>🔍 ${found.length} ${t('invoices')} ${t('searchByClient')} "${name}":</strong><br><br>`;
                    found.forEach(inv => { html += `• <strong>${inv.numero}</strong> — ${inv.clientName} — ${formatMoney(inv.total)}<br>`; });
                    html += `<br><button class="chat-quick-btn" onclick="switchTab('list'); toggleChatbot();">📋 ${t('viewList')}</button>`;
                    addChat(html, false, 'invoice-found');
                } else {
                    addChat(`❌ ${t('notFound')} "${name}".<br>${t('clients')}: ${[...new Set(invoices.map(i => i.clientName))].join(', ')}`, false, 'error');
                }
                return;
            }

            // All invoices
            if (lower.match(/(?:kol|toutes|tout|all|جميع|كل|list|liste)\s*(?:l\s*)?(?:facture|invoice|فاتورة|fac)/) ||
                lower.match(/^(list|liste|all)$/)) {
                if (invoices.length === 0) { addChat('📭 ' + t('noInvoices'), false); return; }
                let html = `<strong>📋 ${invoices.length} ${t('allInvoices')}:</strong><br><br>`;
                invoices.forEach(inv => {
                    const st = inv.status === 'paid' ? '✅' : inv.status === 'overdue' ? '❌' : '⏳';
                    html += `${st} <strong>${inv.numero}</strong> — ${inv.clientName} — ${formatMoney(inv.total)}<br>`;
                });
                addChat(html, false, 'invoice-found');
                return;
            }

            // All achats
            if (lower.match(/(?:kol|toutes|tout|all|جميع|كل|list|liste)\s*(?:l\s*)?(?:achat|achats|purchase|مشتريات)/) ||
                lower.match(/^(achats|purchases|مشتريات)$/)) {
                if (achats.length === 0) { addChat('📭 ' + t('noAchats'), false); return; }
                let html = `<strong>🧾 ${achats.length} Achats:</strong><br><br>`;
                achats.forEach(a => {
                    html += `• <strong>${a.numero}</strong> — ${a.supplier} — <span style="color:var(--achat-color);">${formatMoney(a.amount)}</span><br>`;
                });
                addChat(html, false, 'achat-card');
                return;
            }

            // Sales / Revenue
            if (lower.match(/(?:vente|bitbi3a|mabi3|ch7al|total|ca|revenu|sales|revenue|إجمالي|مبيعات|bitbi3)/) && !lower.match(/(?:achat|purchase|مشتريات)/)) {
                const total = invoices.reduce((s, i) => s + (i.total || 0), 0);
                addChat(
                    `<strong>📊 ${t('totalSales')}</strong><br><br>` +
                    `💰 <strong>${t('totalRevenue')}:</strong> ${formatMoney(total)}<br>` +
                    `📄 <strong>${t('invoices')}:</strong> ${invoices.length}<br>` +
                    `✅ <strong>${t('paid')}:</strong> ${invoices.filter(i => i.status === 'paid').length}<br>` +
                    `⏳ <strong>${t('pending')}:</strong> ${invoices.filter(i => i.status === 'pending').length}<br>` +
                    `❌ <strong>${t('overdue')}:</strong> ${invoices.filter(i => i.status === 'overdue').length}<br><br>` +
                    `<em>${new Date().toLocaleString(currentLang === 'en' ? 'en-US' : 'fr-FR')}</em>`,
                    false, 'vente-card'
                );
                return;
            }

            // Achats total
            if (lower.match(/(?:achat|purchase|achats|مشتريات|ch7al achat|total achat)/)) {
                const total = achats.reduce((s, a) => s + (a.amount || 0), 0);
                addChat(
                    `<strong>🧾 ${t('totalAchats')}</strong><br><br>` +
                    `💰 <strong>Total:</strong> ${formatMoney(total)}<br>` +
                    `📄 <strong>Nombre:</strong> ${achats.length}<br><br>` +
                    `<em>${new Date().toLocaleString(currentLang === 'en' ? 'en-US' : 'fr-FR')}</em>`,
                    false, 'achat-card'
                );
                return;
            }

            // UNPAID / PENDING
            if (lower.match(/(?:mzlt|ma5lsiotch|ma5lsi|mazalt|mazlt|non\s*pay|pending|en\s*attente|معلقة|ما\s*زال|لم\s*تدفع|غير\s*مدفوعة|non\s*paid|impay|unpaid)/)) {
                const pending = invoices.filter(i => i.status === 'pending');
                if (pending.length === 0) { addChat('✅ ' + t('allPaid'), false); return; }
                let html = `<strong>⏳ ${pending.length} ${t('pendingInvoices')}:</strong><br><br>`;
                let totalPending = 0;
                pending.forEach(inv => {
                    totalPending += (inv.total || 0);
                    html += `• <strong>${inv.numero}</strong> — ${inv.clientName} — <strong>${formatMoney(inv.total)}</strong> — 📅 ${formatDate(inv.due)}<br>`;
                });
                html += `<br><strong>💰 ${t('totalPending')}: ${formatMoney(totalPending)}</strong>`;
                addChat(html, false, 'invoice-found');
                return;
            }

            // OVERDUE
            if (lower.match(/(?:data\s*mt3eha\s*oufe|data\s*oufe|retard|overdue|late|متأخرة|متأخر|فاتورة\s*متأخرة|en\s*retard|date\s*dépassée|expirée)/)) {
                const overdue = invoices.filter(i => i.status === 'overdue');
                if (overdue.length === 0) { addChat('✅ ' + t('noOverdue'), false); return; }
                let html = `<strong>❌ ${overdue.length} ${t('overdueInvoices')}:</strong><br><br>`;
                let totalOverdue = 0;
                overdue.forEach(inv => {
                    totalOverdue += (inv.total || 0);
                    const daysLate = Math.max(0, Math.floor((new Date() - new Date(inv.due)) / (1000 * 60 * 60 * 24)));
                    html += `• <strong>${inv.numero}</strong> — ${inv.clientName} — <strong style="color:var(--danger);">${formatMoney(inv.total)}</strong> — 📅 ${formatDate(inv.due)} (${daysLate}j retard)<br>`;
                });
                html += `<br><strong>💰 ${t('totalOverdue')}: <span style="color:var(--danger);">${formatMoney(totalOverdue)}</span></strong>`;
                addChat(html, false, 'error');
                return;
            }

            // PAID
            if (lower.match(/(?:5alsa|5alsin|khal|khals|pay|paid|مدفوعة|خالصة|خالص|payée|réglée|settled)/)) {
                const paid = invoices.filter(i => i.status === 'paid');
                if (paid.length === 0) { addChat('📭 ' + t('noPaid'), false); return; }
                let html = `<strong>✅ ${paid.length} ${t('paidInvoices')}:</strong><br><br>`;
                let totalPaid = 0;
                paid.forEach(inv => {
                    totalPaid += (inv.total || 0);
                    html += `• <strong>${inv.numero}</strong> — ${inv.clientName} — <strong style="color:var(--success);">${formatMoney(inv.total)}</strong> — 📅 ${formatDate(inv.date)}<br>`;
                });
                html += `<br><strong>💰 ${t('totalPaid')}: <span style="color:var(--success);">${formatMoney(totalPaid)}</span></strong>`;
                addChat(html, false, 'vente-card');
                return;
            }

            // ANALYZE / SUMMARY
            if (lower.match(/(?:chfema|ch\s*feha|analyze|analyse|résumé|summary|ملخص|وضع|état|statistique|stats|ch7al|combien)/) && 
                !lower.match(/(?:vente|bitbi3a|sales|revenue|إجمالي|مبيعات|achat|purchase)/)) {
                const total = invoices.reduce((s, i) => s + (i.total || 0), 0);
                const paid = invoices.filter(i => i.status === 'paid');
                const pending = invoices.filter(i => i.status === 'pending');
                const overdue = invoices.filter(i => i.status === 'overdue');
                const paidTotal = paid.reduce((s, i) => s + (i.total || 0), 0);
                const pendingTotal = pending.reduce((s, i) => s + (i.total || 0), 0);
                const overdueTotal = overdue.reduce((s, i) => s + (i.total || 0), 0);
                const achatTotal = achats.reduce((s, a) => s + (a.amount || 0), 0);

                const clientTotals = {};
                invoices.forEach(inv => { clientTotals[inv.clientName] = (clientTotals[inv.clientName] || 0) + (inv.total || 0); });
                const topClient = Object.entries(clientTotals).sort((a, b) => b[1] - a[1])[0];
                const avgInvoice = invoices.length > 0 ? total / invoices.length : 0;
                const profit = total - achatTotal;

                let html = `<strong>📊 ${t('analysisTitle')}</strong><br><br>`;
                html += `<div style="display:grid; grid-template-columns: 1fr 1fr; gap: 8px;">`;
                html += `<div>📄 <strong>${t('invoices')}:</strong> ${invoices.length}</div>`;
                html += `<div>💰 <strong>${t('totalRevenue')}:</strong> ${formatMoney(total)}</div>`;
                html += `<div>✅ <strong>${t('paid')}:</strong> ${paid.length} (${formatMoney(paidTotal)})</div>`;
                html += `<div>⏳ <strong>${t('pending')}:</strong> ${pending.length} (${formatMoney(pendingTotal)})</div>`;
                html += `<div>❌ <strong>${t('overdue')}:</strong> ${overdue.length} (${formatMoney(overdueTotal)})</div>`;
                html += `<div>📈 <strong>${t('avgInvoice')}:</strong> ${formatMoney(avgInvoice)}</div>`;
                html += `<div>🧾 <strong>Achats:</strong> ${achats.length}</div>`;
                html += `<div>💸 <strong>Total Achats:</strong> ${formatMoney(achatTotal)}</div>`;
                html += `</div>`;
                if (topClient) html += `<br>🏆 <strong>${t('topClient')}:</strong> ${topClient[0]} — ${formatMoney(topClient[1])}`;
                html += `<br>💹 <strong>Marge:</strong> <span style="color:${profit >= 0 ? 'var(--success)' : 'var(--danger)'};font-weight:800;">${formatMoney(profit)}</span>`;

                const paidRatio = invoices.length > 0 ? (paid.length / invoices.length * 100) : 0;
                const healthColor = paidRatio >= 70 ? 'var(--success)' : paidRatio >= 40 ? 'var(--warning)' : 'var(--danger)';
                html += `<br><br><strong>${t('healthScore')}:</strong> <span style="color:${healthColor};font-weight:800;font-size:18px;">${paidRatio.toFixed(0)}%</span>`;
                html += `<div style="background:var(--bg);border-radius:10px;overflow:hidden;height:10px;margin-top:8px;"><div style="width:${paidRatio}%;background:${healthColor};height:100%;transition:width 0.5s;"></div></div>`;

                addChat(html, false, 'vente-card');
                return;
            }

            // Help
            if (lower.match(/(?:aide|help|command|cmd|مساعدة|أوامر|commands)/)) {
                addChat(
                    `<strong>🆘 ${t('helpText')}</strong><br><br>` +
                    `• <em>"Facture numero 3"</em> / <em>"فاتورة رقم 3"</em><br>` +
                    `• <em>"Facture mt3 Ali"</em> / <em>"فاتورة علي"</em><br>` +
                    `• <em>"Kol l factures"</em> / <em>"جميع الفواتير"</em><br>` +
                    `• <em>"Ch7al bitbi3a"</em> / <em>"إجمالي المبيعات"</em><br>` +
                    `• <em>"Ch7al achat"</em> / <em>"إجمالي المشتريات"</em><br>` +
                    `• <em>"Creer facture"</em> — création interactive<br>` +
                    `• <em>"Upload achat"</em> — uploader facture fournisseur<br>` +
                    `• <em>"Mzlt ma5lsiotch"</em> — impayées<br>` +
                    `• <em>"5alsa"</em> — payées<br>` +
                    `• <em>"Chfema"</em> — analyse globale`,
                    false
                );
                return;
            }

            // Greetings
            if (lower.match(/^(salam|hello|hi|bonjour|مرحبا|سلام|hey)$/)) {
                addChat(`👋 ${t('chatWelcome')}<br><br>${t('chatConnected')}`, false);
                return;
            }

            // Tunisian dialect specific
            if (lower.match(/(?:chfema|ch\s*feha|شنوا|ش\s*فيها|وضع|etat)/)) {
                sendQuick('analyze');
                return;
            }

            if (tryChatbotSearch(msg)) {
                return;
            }

            addChat(`🤔 ${currentLang === 'ar' ? 'لم أفهم. اكتب "مساعدة" للأوامر.' : currentLang === 'en' ? 'I didn\'t understand. Type "help" for commands.' : 'Je n\'ai pas compris. Tapez "aide" pour les commandes.'}`, false);
        }

        function chatbotViewDetails(id) {
            const inv = DB.getInvoiceById(id);
            if (!inv) return;
            let itemsHtml = '';
            let subtotal = 0;
            (inv.items || []).forEach(item => {
                const lineTotal = item.price * item.qty;
                subtotal += lineTotal;
                itemsHtml += `<tr><td>${item.desc}</td><td class="text-center">${formatMoney(item.price)}</td><td class="text-center">${item.qty}</td><td class="text-right"><strong>${formatMoney(lineTotal)}</strong></td></tr>`;
            });
            const remiseAmt = subtotal * ((inv.remise || 0) / 100);
            const afterRemise = subtotal - remiseAmt;
            const tvaAmt = afterRemise * ((inv.tva || 0) / 100);
            const grandTotal = afterRemise + tvaAmt;

            let html = `<strong>🔍 ${t('invoiceDetails')} — ${inv.numero}</strong><br><br>`;
            html += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">`;
            html += `<div style="padding:10px;background:var(--bg);border-radius:8px;border:1px solid var(--border);">`;
            html += `<strong style="font-size:11px;color:var(--text-muted);text-transform:uppercase;">${t('from')}</strong><br>`;
            html += `<strong>${inv.compName || t('yourCompany')}</strong><br>`;
            if (inv.compEmail) html += `📧 ${inv.compEmail}<br>`;
            if (inv.compPhone) html += `📞 ${inv.compPhone}<br>`;
            if (inv.compAddress) html += `📍 ${inv.compAddress}<br>`;
            if (inv.compMF) html += `🆔 MF: ${inv.compMF}`;
            html += `</div>`;
            html += `<div style="padding:10px;background:var(--bg);border-radius:8px;border:1px solid var(--border);">`;
            html += `<strong style="font-size:11px;color:var(--text-muted);text-transform:uppercase;">${t('billTo')}</strong><br>`;
            html += `<strong>${inv.clientName}</strong><br>`;
            if (inv.clientEmail) html += `📧 ${inv.clientEmail}<br>`;
            if (inv.clientPhone) html += `📞 ${inv.clientPhone}<br>`;
            if (inv.clientAddress) html += `📍 ${inv.clientAddress}`;
            html += `</div></div>`;
            html += `<table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:13px;"><thead><tr style="border-bottom:2px solid var(--text);"><th style="text-align:left;padding:8px;font-size:11px;text-transform:uppercase;color:var(--text-muted);">${t('desc')}</th><th style="text-align:center;padding:8px;font-size:11px;text-transform:uppercase;color:var(--text-muted);">${t('unitPrice')}</th><th style="text-align:center;padding:8px;font-size:11px;text-transform:uppercase;color:var(--text-muted);">${t('qty')}</th><th style="text-align:right;padding:8px;font-size:11px;text-transform:uppercase;color:var(--text-muted);">${t('amount')}</th></tr></thead><tbody>${itemsHtml}</tbody></table>`;
            html += `<div style="padding:12px;background:var(--bg);border-radius:8px;border:1px solid var(--border);">`;
            html += `<div style="display:flex;justify-content:space-between;padding:4px 0;"><span>${t('subtotal')}</span><strong>${formatMoney(subtotal)}</strong></div>`;
            if (inv.remise > 0) html += `<div style="display:flex;justify-content:space-between;padding:4px 0;"><span>${t('discount')} (${inv.remise}%)</span><strong style="color:var(--success);">-${formatMoney(remiseAmt)}</strong></div>`;
            html += `<div style="display:flex;justify-content:space-between;padding:4px 0;"><span>TVA (${inv.tva || 0}%)</span><strong>${formatMoney(tvaAmt)}</strong></div>`;
            html += `<strong>• ${t('grandTotal')}: <span style="color:var(--primary);">${formatMoney(grandTotal)}</span></strong>`;
            html += `</div>`;
            if (inv.notes) html += `<br><strong>📝 ${t('notes')}:</strong><br><div style="padding:8px;background:var(--bg);border-radius:8px;border:1px solid var(--border);font-size:12px;color:var(--text-muted);">${inv.notes}</div>`;
            html += `<br><button class="chat-quick-btn" onclick="chatbotDownloadPDF(${inv.id})">📄 ${t('downloadPDF')}</button> `;
            html += `<button class="chat-quick-btn" onclick="editInvoice(${inv.id}); toggleChatbot();">✏️ ${t('editInvoice').split(' ')[1] || 'Edit'}</button>`;
            addChat(html, false, 'invoice-found');
        }

        function chatbotDownloadPDF(id) {
            const inv = DB.getInvoiceById(id);
            if (!inv) return;
            printInvoice(inv);
        }
