        // ===================== ACHATS (PURCHASES) =====================
        function renderAchatList() {
            const search = document.getElementById('searchAchats')?.value?.toLowerCase() || '';
            let achats = DB.getAllAchats();
            if (search) achats = achats.filter(a => a.numero.toLowerCase().includes(search) || a.supplier.toLowerCase().includes(search) || (a.numeroFournisseur || '').toLowerCase().includes(search));
            const tbody = document.getElementById('achatTableBody');
            const empty = document.getElementById('achatEmpty');
            const container = document.getElementById('achatListContainer');

            if (achats.length === 0) {
                tbody.innerHTML = '';
                container.style.display = 'none';
                empty.style.display = 'block';
                return;
            }
            container.style.display = 'block';
            empty.style.display = 'none';

            tbody.innerHTML = achats.map(a => {
                const fileIcon = a.fileType?.includes('pdf') ? '📄' : '🖼️';
                return `<tr>
                    <td><strong>${a.numero}</strong></td>
                    <td>${a.numeroFournisseur ? `<span style="font-weight:600;color:var(--achat-color);">${a.numeroFournisseur}</span>` : '<span style="color:var(--text-muted);">—</span>'}</td>
                    <td>${a.supplier}</td>
                    <td>${formatDate(a.date)}</td>
                    <td><strong style="color:var(--achat-color);">${formatMoney(a.amount)}</strong></td>
                    <td>${fileIcon} ${a.fileName}</td>
                    <td class="actions">
                        <button class="btn btn-achat btn-sm" onclick="viewAchat(${a.id})">👁️</button>
                        <button class="btn btn-warning btn-sm" onclick="editAchat(${a.id})">✏️</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteAchat(${a.id})">🗑️</button>
                    </td>
                </tr>`;
            }).join('');
        }

        async function handleAchatUpload(event) {
            const file = event.target.files[0];
            if (!file) return;

            showToast('📄 Lecture du fichier...', 'info');

            const reader = new FileReader();
            reader.onload = async function(ev) {
                const fileData = ev.target.result;
                const fileType = file.type;

                // Try OCR/PDF extraction first
                let extractedInfo = await processAchatFile(file, fileData, fileType);

                // Fallback to filename if OCR fails
                if (!extractedInfo.supplier && !extractedInfo.amount) {
                    const fileName = file.name.replace(/\.[^/.]+$/, "");
                    const fallback = extractAchatInfoFromFileName(fileName);
                    extractedInfo = { ...fallback, ...extractedInfo };
                }

                // Show preview modal with extracted data
                showAchatPreviewModal(file, fileData, fileType, extractedInfo);
                event.target.value = '';
            };
            reader.readAsDataURL(file);
        }

        // ===================== OCR / PDF EXTRACTION =====================

        async function extractTextFromPDF(fileData) {
            try {
                const typedArray = new Uint8Array(atob(fileData.split(',')[1]).split('').map(c => c.charCodeAt(0)));
                const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
                let fullText = '';

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map(item => item.str).join(' ');
                    fullText += pageText + '\n';
                }

                return fullText;
            } catch (e) {
                console.error('PDF extraction error:', e);
                return '';
            }
        }

        async function extractTextFromImage(imageData) {
            try {
                const result = await Tesseract.recognize(
                    imageData,
                    'fra+ara+eng',
                    { logger: m => { /* silent */ } }
                );
                return result.data.text;
            } catch (e) {
                console.error('OCR error:', e);
                return '';
            }
        }

        function parseInvoiceData(text) {
            const data = {
                numero_facture: '',
                fournisseur: '',
                email: '',
                telephone: '',
                adresse: '',
                date_facture: '',
                date_echeance: '',
                montant_ht: '',
                remise: '',
                tva: '',
                total_ttc: '',
                notes: ''
            };

            if (!text) return data;

            const lines = text.split('\n').map(l => l.trim()).filter(l => l);
            const fullText = text.toLowerCase();

            // 1. Extract invoice number (INV-XXX, FAC-XXX, FACTURE N°, N° Facture, etc.)
            const numPatterns = [
                /(?:facture|invoice|fac|n°|#|num[ée]ro)[\s:]*([A-Z]{2,4}[-\s]?\d{2,6})/i,
                /([A-Z]{2,4}[-\s]?\d{2,6})/i,
                /n°\s*([\w-]+)/i,
                /num[ée]ro\s*[:\s]*([\w-]+)/i
            ];
            for (const pattern of numPatterns) {
                const match = text.match(pattern);
                if (match && match[1]) {
                    data.numero_facture = match[1].trim().toUpperCase();
                    break;
                }
            }

            // 2. Extract supplier from "DE", "FOURNISSEUR", "FROM", "SELLER" section
            let supplierFound = false;
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].toLowerCase();
                if (line.match(/^(de|from|fournisseur|seller|vendeur|exp[ée]diteur)\b/) || 
                    line.match(/\b(de|from|fournisseur|seller)\s*[:\-]?\s*$/i)) {
                    // Look at next few lines for supplier name
                    for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
                        const nextLine = lines[j].trim();
                        if (nextLine && !nextLine.match(/^(📧|📞|📍|✉|📠|📱|📲|☎|✆|📨|email|tel|t[ée]l|phone|adresse|address|mf|matricule|rc|rib)\b/i) &&
                            !nextLine.match(/^(date|n°|num|total|sous|tva|remise|ht|ttc)\b/i) &&
                            nextLine.length > 1 && nextLine.length < 100) {
                            data.fournisseur = nextLine.replace(/^[📧📞📍✉📠📱📲☎✆📨]+\s*/, '').trim();
                            supplierFound = true;
                            break;
                        }
                    }
                    if (supplierFound) break;
                }
            }

            // Alternative: look for company name in header (first 10 lines)
            if (!data.fournisseur) {
                for (let i = 0; i < Math.min(10, lines.length); i++) {
                    const line = lines[i].trim();
                    if (line && line.length > 2 && line.length < 60 &&
                        !line.match(/^(facture|invoice|date|n°|total|de|à|a|from|to|bill)\b/i) &&
                        !line.match(/^(📧|📞|📍|✉|📠|📱|📲|☎|✆|📨)\b/) &&
                        !line.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/) &&
                        !line.match(/^\d+[,\.]?\d*\s*(dt|dinar|tnd|€|$)/i)) {
                        data.fournisseur = line;
                        break;
                    }
                }
            }

            // 3. Extract email
            const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/);
            if (emailMatch) data.email = emailMatch[1];

            // 4. Extract phone (Tunisian or international)
            const phonePatterns = [
                /(?:tel|t[ée]l|phone|mobile|fax)\s*[:\-]?\s*([+\d\s().-]{8,20})/i,
                /([+\d\s]{8,20}\d{8})/,
                /(\+216\s*[\d\s]{8,12})/,
                /(\d{2}\s*\d{3}\s*\d{3})/,
                /(7[12569]\s*\d{3}\s*\d{3})/
            ];
            for (const pattern of phonePatterns) {
                const match = text.match(pattern);
                if (match && match[1]) {
                    const phone = match[1].replace(/\s+/g, ' ').trim();
                    if (phone.length >= 8) {
                        data.telephone = phone;
                        break;
                    }
                }
            }

            // 5. Extract address
            const addressPatterns = [
                /(?:adresse|address|adr\.?|lieu|local)\s*[:\-]?\s*(.+?)(?:\n|email|tel|t[ée]l|phone|mf|rc|rib)/i,
                /📍\s*(.+?)(?:\n|$)/,
                /(?:nabeul|tunis|sfax|sousse|bizerte|gabes|kairouan|monastir|mahdia|gafsa|tozeur|kebili|tataouine|beja|jendouba|kef|siliana|zaghouan|ben arous|ariana|manouba)/i
            ];
            for (const pattern of addressPatterns) {
                const match = text.match(pattern);
                if (match && match[1]) {
                    data.adresse = match[1].trim();
                    break;
                }
            }
            // If no address found, look for city names in text
            if (!data.adresse) {
                const cities = ['Nabeul', 'Tunis', 'Sfax', 'Sousse', 'Bizerte', 'Gabes', 'Kairouan', 'Monastir', 'Mahdia', 'Gafsa', 'Tozeur', 'Kebili', 'Tataouine', 'Beja', 'Jendouba', 'Kef', 'Siliana', 'Zaghouan', 'Ben Arous', 'Ariana', 'Manouba'];
                for (const city of cities) {
                    if (text.toLowerCase().includes(city.toLowerCase())) {
                        data.adresse = city;
                        break;
                    }
                }
            }

            // 6. Extract dates
            const datePatterns = [
                /(?:date\s*(?:d'[ée]mission|facture|document)?)\s*[:\-]?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
                /(?:[ée]mis[ée]|cr[ée][ée])\s*(?:le)?\s*[:\-]?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
                /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/
            ];
            for (const pattern of datePatterns) {
                const match = text.match(pattern);
                if (match && match[1]) {
                    data.date_facture = normalizeDate(match[1]);
                    break;
                }
            }

            // Due date
            const duePatterns = [
                /(?:[ée]ch[ée]ance|due|date\s*limite|date\s*de\s*paiement|paiement\s*avant)\s*[:\-]?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
                /(?:payable\s*(?:avant|le|avant\s*le))\s*[:\-]?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i
            ];
            for (const pattern of duePatterns) {
                const match = text.match(pattern);
                if (match && match[1]) {
                    data.date_echeance = normalizeDate(match[1]);
                    break;
                }
            }

            // 7. Extract amounts
            // Total TTC - look for final total
            const ttcPatterns = [
                /(?:total\s*ttc|ttc|total\s*g[ée]n[ée]ral|montant\s*total|total\s*à\s*payer|net\s*à\s*payer|total\s*final)\s*[:\-]?\s*([\d\s.,]+)/i,
                /(?:total|ttc)\s*[:\-]?\s*([\d\s.,]+)\s*(?:dt|dinar|tnd|€|$)/i,
                /([\d\s.,]+)\s*(?:dt|dinar|tnd)\s*(?:\s*ttc)?/i
            ];
            for (const pattern of ttcPatterns) {
                const match = text.match(pattern);
                if (match && match[1]) {
                    data.total_ttc = normalizeAmount(match[1]);
                    break;
                }
            }

            // TVA
            const tvaPatterns = [
                /(?:tva|taxe|t\.v\.a)\s*[:\-]?\s*\(?\s*(\d+[.,]?\d*)\s*%\s*\)?/i,
                /(?:tva|taxe)\s*[:\-]?\s*([\d\s.,]+)/i,
                /tva\s*\(?(\d+)\s*%\)?/i
            ];
            for (const pattern of tvaPatterns) {
                const match = text.match(pattern);
                if (match && match[1]) {
                    const val = parseFloat(match[1].replace(/\s/g, '').replace(',', '.'));
                    if (val > 0 && val < 100) data.tva = val.toString();
                    else if (val > 100) data.tva = '19'; // default
                    break;
                }
            }
            if (!data.tva) data.tva = '19'; // default Tunisian TVA

            // HT amount
            const htPatterns = [
                /(?:montant\s*ht|total\s*ht|ht|sous\s*total|sous-total|base\s*ht)\s*[:\-]?\s*([\d\s.,]+)/i,
                /(?:ht|h\.t\.)\s*[:\-]?\s*([\d\s.,]+)/i
            ];
            for (const pattern of htPatterns) {
                const match = text.match(pattern);
                if (match && match[1]) {
                    data.montant_ht = normalizeAmount(match[1]);
                    break;
                }
            }

            // Remise
            const remisePatterns = [
                /(?:remise|r[ée]duction|rabais|discount)\s*[:\-]?\s*([\d\s.,]+)/i,
                /(?:remise)\s*\(?(\d+[.,]?\d*)\s*%\)?/i
            ];
            for (const pattern of remisePatterns) {
                const match = text.match(pattern);
                if (match && match[1]) {
                    data.remise = normalizeAmount(match[1]);
                    break;
                }
            }

            // 8. Notes / conditions
            const notesPatterns = [
                /(?:notes?|conditions?|termes?|modalit[ée]s?)\s*[:\-]?\s*(.+?)(?:\n\n|$)/is,
                /(?:payable|paiement|r[èe]glement)\s*(.+?)(?:\n|$)/i
            ];
            for (const pattern of notesPatterns) {
                const match = text.match(pattern);
                if (match && match[1]) {
                    data.notes = match[1].trim().substring(0, 200);
                    break;
                }
            }

            // Clean up supplier name
            if (data.fournisseur) {
                data.fournisseur = data.fournisseur
                    .replace(/^(de|from|fournisseur|seller|vendeur)\s*[:\-]?\s*/i, '')
                    .replace(/\s+/g, ' ')
                    .trim();
            }

            // 9. Detect currency (devise)
            data.devise = 'TND';
            if (fullText.match(/€|euro|eur\b/i)) data.devise = 'EUR';
            else if (fullText.match(/\$|dollar|usd\b/i)) data.devise = 'USD';
            else if (fullText.match(/£|pound|gbp\b|sterling/i)) data.devise = 'GBP';
            else if (fullText.match(/dt\b|dinar|tnd\b/i)) data.devise = 'TND';

            return data;
        }

        function normalizeDate(dateStr) {
            // Convert various date formats to YYYY-MM-DD
            const parts = dateStr.split(/[\/\.\-]/);
            if (parts.length === 3) {
                let d, m, y;
                if (parts[2].length === 4) {
                    d = parts[0].padStart(2, '0');
                    m = parts[1].padStart(2, '0');
                    y = parts[2];
                } else if (parts[0].length === 4) {
                    y = parts[0];
                    m = parts[1].padStart(2, '0');
                    d = parts[2].padStart(2, '0');
                } else {
                    d = parts[0].padStart(2, '0');
                    m = parts[1].padStart(2, '0');
                    y = '20' + parts[2];
                }
                return `${y}-${m}-${d}`;
            }
            return dateStr;
        }

        function normalizeAmount(amountStr) {
            // Clean amount string and return as number string
            let cleaned = amountStr.replace(/\s/g, '').replace(',', '.');
            const num = parseFloat(cleaned);
            return isNaN(num) ? '' : num.toFixed(3);
        }

        // ===================== CURRENCY CONVERSION =====================
        const FALLBACK_RATES_TO_TND = { TND: 1, EUR: 3.35, USD: 3.07, GBP: 3.88 };
        let liveRatesToTND = null;

        async function fetchExchangeRates() {
            // Check cache (valid 6 hours)
            const cached = localStorage.getItem('fp_exchange_rates');
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    if (Date.now() - parsed.ts < 6 * 3600 * 1000) {
                        liveRatesToTND = parsed.rates;
                        return liveRatesToTND;
                    }
                } catch(e) {}
            }
            try {
                const res = await fetch('https://open.er-api.com/v6/latest/TND');
                if (res.ok) {
                    const data = await res.json();
                    if (data.rates) {
                        liveRatesToTND = {
                            TND: 1,
                            EUR: 1 / (data.rates.EUR || 0.2985),
                            USD: 1 / (data.rates.USD || 0.3257),
                            GBP: 1 / (data.rates.GBP || 0.2577)
                        };
                        localStorage.setItem('fp_exchange_rates', JSON.stringify({ ts: Date.now(), rates: liveRatesToTND }));
                        return liveRatesToTND;
                    }
                }
            } catch(e) {
                console.warn('Exchange rate fetch failed, using fallback rates:', e);
            }
            liveRatesToTND = FALLBACK_RATES_TO_TND;
            return liveRatesToTND;
        }

        function getRateToTND(devise) {
            const rates = liveRatesToTND || FALLBACK_RATES_TO_TND;
            return rates[devise] || 1;
        }

        function convertToTND(amount, devise) {
            if (!amount || devise === 'TND') return amount;
            return amount * getRateToTND(devise);
        }

        function getCurrencySymbol(devise) {
            return { TND: 'DT', EUR: '€', USD: '$', GBP: '£' }[devise] || devise;
        }

        async function processAchatFile(file, fileData, fileType) {
            showToast('🔍 Analyse du document en cours...', 'info');

            let extractedText = '';

            if (fileType.includes('pdf')) {
                extractedText = await extractTextFromPDF(fileData);
            } else if (fileType.includes('image')) {
                extractedText = await extractTextFromImage(fileData);
            }

            if (!extractedText || extractedText.trim().length < 10) {
                showToast('⚠️ Impossible de lire le document. Utilisation du nom de fichier.', 'error');
                return extractAchatInfoFromFileName(file.name.replace(/\.[^/.]+$/, ""));
            }

            const parsedData = parseInvoiceData(extractedText);

            // Log for debugging
            console.log('OCR Extracted Text:', extractedText.substring(0, 500));
            console.log('Parsed Data:', parsedData);

            return {
                supplier: parsedData.fournisseur,
                email: parsedData.email,
                phone: parsedData.telephone,
                address: parsedData.adresse,
                date: parsedData.date_facture,
                amount: parseFloat(parsedData.total_ttc) || parseFloat(parsedData.montant_ht) || 0,
                notes: parsedData.notes || `Facture ${parsedData.numero_facture || ''} - TVA ${parsedData.tva}%`,
                numero: parsedData.numero_facture,
                tva: parsedData.tva,
                remise: parsedData.remise,
                devise: parsedData.devise || 'TND',
                rawText: extractedText
            };
        }

        function extractAchatInfoFromFileName(fileName) {
            // Try to extract date, amount, supplier from filename
            // Patterns: "facture_2026-05-15_fournisseur_1250.50" or "achat_1500_dt_2026_05"
            const info = { supplier: '', amount: 0, date: '', notes: '' };

            // Extract date (YYYY-MM-DD or DD-MM-YYYY or YYYY_MM_DD)
            const dateMatch = fileName.match(/(\d{4})[-_](\d{2})[-_](\d{2})/);
            if (dateMatch) {
                info.date = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
            } else {
                const dateMatch2 = fileName.match(/(\d{2})[-_](\d{2})[-_](\d{4})/);
                if (dateMatch2) {
                    info.date = `${dateMatch2[3]}-${dateMatch2[2]}-${dateMatch2[1]}`;
                }
            }

            // Extract amount (number followed by dt, dinar, or just a large number)
            const amountMatch = fileName.match(/(\d+[.,]?\d*)\s*(dt|dinar|tnd|DT|TND)?/i);
            if (amountMatch) {
                info.amount = parseFloat(amountMatch[1].replace(',', '.')) || 0;
            }

            // Extract supplier name (text between underscores or after certain keywords)
            const parts = fileName.split(/[-_\s]+/);
            const supplierWords = parts.filter(p => 
                p.length > 2 && 
                !p.match(/^\d+$/) && 
                !p.match(/^(facture|achat|invoice|devis|bon|commande|202\d)$/i) &&
                !p.match(/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|janv|fév|mars|avr|mai|juin|juil|août|sept|oct|nov|déc)$/i)
            );
            if (supplierWords.length > 0) {
                info.supplier = supplierWords.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
            }

            return info;
        }

        function showAchatPreviewModal(file, fileData, fileType, extractedInfo) {
            const modalBody = document.getElementById('achatEditModalBody');
            const modal = document.getElementById('achatEditModal');

            // Store data temporarily
            window.tempAchatFile = { data: fileData, name: file.name, type: fileType };

            // Currency detection and conversion
            const detectedDevise = extractedInfo.devise || 'TND';
            const originalAmount = extractedInfo.amount || 0;
            const convertedTND = (detectedDevise !== 'TND' && originalAmount > 0)
                ? convertToTND(originalAmount, detectedDevise).toFixed(3)
                : (originalAmount || '');
            // Fetch live rates in background
            fetchExchangeRates().then(() => {
                if (document.getElementById('previewAchatDevise')) updateCurrencyConversion();
            });

            const isImage = fileType.includes('image');
            const previewHtml = isImage 
                ? `<img src="${fileData}" style="max-width:100%;max-height:300px;object-fit:contain;border-radius:8px;border:1px solid var(--border);">`
                : `<div style="padding:40px;text-align:center;background:var(--bg);border-radius:8px;border:1px solid var(--border);">
                    <div style="font-size:64px;margin-bottom:12px;">📄</div>
                    <div style="font-size:16px;font-weight:600;">${file.name}</div>
                    <div style="font-size:12px;color:var(--text-muted);margin-top:4px;">${(file.size / 1024).toFixed(1)} KB</div>
                   </div>`;

            // Determine source of extraction
            const hasOCRData = extractedInfo.rawText && extractedInfo.rawText.length > 10;
            const extractionSource = hasOCRData 
                ? '🔍 Analyse OCR du contenu du document'
                : '📁 Analyse du nom du fichier (OCR indisponible)';

            modalBody.innerHTML = `
                <div style="margin-bottom:20px;">
                    <h3 style="font-size:14px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">📎 Aperçu du fichier</h3>
                    <div style="background:var(--card-solid);border-radius:12px;border:1px solid var(--border);padding:16px;">
                        ${previewHtml}
                    </div>
                </div>

                <div style="margin-bottom:20px;">
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
                        <span style="font-size:20px;">🤖</span>
                        <div>
                            <h3 style="font-size:14px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;">📝 Informations extraites</h3>
                            <div style="font-size:11px;color:var(--achat-color);margin-top:2px;">${extractionSource}</div>
                        </div>
                    </div>
                    <div style="background:linear-gradient(135deg, var(--achat-light), transparent);border-radius:12px;border:1px solid rgba(139,92,246,0.2);padding:16px;">
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px;">
                            <div>🏢 <strong>Fournisseur:</strong> ${extractedInfo.supplier ? '<span style="color:var(--success)">✓ Détecté</span>' : '<span style="color:var(--danger)">✗ Non détecté</span>'}</div>
                            <div>📧 <strong>Email:</strong> ${extractedInfo.email ? '<span style="color:var(--success)">✓ ' + extractedInfo.email + '</span>' : '<span style="color:var(--text-muted)">-</span>'}</div>
                            <div>📞 <strong>Téléphone:</strong> ${extractedInfo.phone ? '<span style="color:var(--success)">✓ ' + extractedInfo.phone + '</span>' : '<span style="color:var(--text-muted)">-</span>'}</div>
                            <div>📍 <strong>Adresse:</strong> ${extractedInfo.address ? '<span style="color:var(--success)">✓ ' + extractedInfo.address + '</span>' : '<span style="color:var(--text-muted)">-</span>'}</div>
                            <div>📅 <strong>Date:</strong> ${extractedInfo.date ? '<span style="color:var(--success)">✓ ' + extractedInfo.date + '</span>' : '<span style="color:var(--text-muted)">-</span>'}</div>
                            <div>💰 <strong>Montant:</strong> ${extractedInfo.amount > 0 ? '<span style="color:var(--success)">✓ ' + formatMoney(extractedInfo.amount) + '</span>' : '<span style="color:var(--danger)">✗ Non détecté</span>'}</div>
                            ${extractedInfo.numero ? `<div>📄 <strong>N° Facture:</strong> <span style="color:var(--success)">${extractedInfo.numero}</span></div>` : ''}
                            ${extractedInfo.tva ? `<div>📊 <strong>TVA:</strong> <span style="color:var(--success)">${extractedInfo.tva}%</span></div>` : ''}
                        </div>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>${t('invoiceNum')} (Interne)</label>
                        <input type="text" id="previewAchatNumero" value="${DB.getNextAchatNumero()}" readonly style="background:var(--bg);color:var(--text-muted);">
                    </div>
                    <div class="form-group">
                        <label>N° Facture Fournisseur</label>
                        <input type="text" id="previewAchatNumeroFourn" value="${extractedInfo.numero || ''}" placeholder="Ex: FA-2026-001">
                    </div>
                </div>
                <div class="form-group">
                    <label>${t('supplier')} <span class="required">*</span></label>
                    <input type="text" id="previewAchatSupplier" value="${extractedInfo.supplier || ''}" placeholder="Nom du fournisseur">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>${t('dateLabel')}</label>
                        <input type="date" id="previewAchatDate" value="${extractedInfo.date || new Date().toISOString().split('T')[0]}">
                    </div>
                    <div class="form-group">
                        <label>💱 Devise</label>
                        <select id="previewAchatDevise" onchange="updateCurrencyConversion()" style="padding:10px;border-radius:8px;border:1.5px solid var(--border-strong);background:var(--bg);color:var(--text);font-size:13px;font-weight:600;">
                            <option value="TND" ${detectedDevise === 'TND' ? 'selected' : ''}>🇹🇳 TND (Dinar)</option>
                            <option value="EUR" ${detectedDevise === 'EUR' ? 'selected' : ''}>🇪🇺 EUR (Euro)</option>
                            <option value="USD" ${detectedDevise === 'USD' ? 'selected' : ''}>🇺🇸 USD (Dollar)</option>
                            <option value="GBP" ${detectedDevise === 'GBP' ? 'selected' : ''}>🇬🇧 GBP (Livre)</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>💰 Montant Original <span class="required">*</span></label>
                        <input type="number" id="previewAchatAmountOriginal" value="${extractedInfo.amount || ''}" step="0.001" placeholder="0.000" oninput="updateCurrencyConversion()">
                    </div>
                    <div class="form-group">
                        <label>🇹🇳 Montant en TND</label>
                        <input type="number" id="previewAchatAmount" value="${convertedTND}" step="0.001" style="font-weight:700;color:var(--success);background:rgba(16,185,129,0.06);border-color:rgba(16,185,129,0.3);" readonly>
                    </div>
                </div>
                <div id="currencyConversionInfo" style="display:${detectedDevise !== 'TND' ? 'block' : 'none'};background:linear-gradient(135deg,rgba(14,165,233,0.08),rgba(99,102,241,0.04));border-radius:10px;border:1px solid rgba(14,165,233,0.2);padding:12px;margin-bottom:12px;">
                    <div style="display:flex;align-items:center;gap:8px;">
                        <span style="font-size:22px;">💱</span>
                        <div>
                            <div style="font-size:13px;font-weight:700;color:var(--text);" id="conversionText">
                                ${detectedDevise !== 'TND' ? `${extractedInfo.amount || 0} ${getCurrencySymbol(detectedDevise)} × ${getRateToTND(detectedDevise).toFixed(4)} = <strong style="color:var(--success);">${convertedTND} DT</strong>` : ''}
                            </div>
                            <div style="font-size:11px;color:var(--text-muted);margin-top:2px;" id="conversionRate">
                                Taux: 1 ${detectedDevise} = ${getRateToTND(detectedDevise).toFixed(4)} TND
                            </div>
                        </div>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>${t('email')}</label>
                        <input type="email" id="previewAchatEmail" value="${extractedInfo.email || ''}" placeholder="fournisseur@email.com">
                    </div>
                    <div class="form-group">
                        <label>${t('phone')}</label>
                        <input type="text" id="previewAchatPhone" value="${extractedInfo.phone || ''}" placeholder="+216 XX XXX XXX">
                    </div>
                </div>
                <div class="form-group">
                    <label>${t('notes')}</label>
                    <textarea id="previewAchatNotes" placeholder="Notes sur cet achat...">${extractedInfo.notes || extractedInfo.numero ? 'Facture ' + extractedInfo.numero + ' - ' : ''}Achat importé depuis fichier: ${file.name}</textarea>
                </div>

                <div style="background:var(--bg);border-radius:8px;padding:12px;margin-top:12px;">
                    <div style="font-size:12px;color:var(--text-muted);display:flex;align-items:center;gap:6px;">
                        <span>💡</span>
                        <span><strong>Vérifiez et corrigez</strong> les informations avant de sauvegarder. Les champs détectés automatiquement sont pré-remplis. Si la devise est EUR/USD/GBP, le montant est converti en DT automatiquement.</span>
                    </div>
                </div>
            `;

            // Change modal title and buttons
            modal.querySelector('.modal-header h2').innerHTML = '📤 <span>Importer Achat</span>';
            const footer = modal.querySelector('.modal-footer');
            footer.innerHTML = `
                <button class="btn btn-outline" onclick="closeAchatPreviewModal()" data-i18n="cancel">Annuler</button>
                <button class="btn btn-achat" onclick="saveAchatFromPreview()">💾 <span>Importer & Sauvegarder</span></button>
            `;

            modal.classList.add('active');
        }

        function closeAchatPreviewModal() {
            document.getElementById('achatEditModal').classList.remove('active');
            window.tempAchatFile = null;
        }

        function updateCurrencyConversion() {
            const deviseEl = document.getElementById('previewAchatDevise');
            const origEl = document.getElementById('previewAchatAmountOriginal');
            const tndEl = document.getElementById('previewAchatAmount');
            const infoBox = document.getElementById('currencyConversionInfo');
            const convText = document.getElementById('conversionText');
            const convRate = document.getElementById('conversionRate');
            if (!deviseEl || !origEl || !tndEl) return;

            const devise = deviseEl.value;
            const orig = parseFloat(origEl.value) || 0;
            const rate = getRateToTND(devise);
            const tnd = devise === 'TND' ? orig : orig * rate;

            tndEl.value = tnd > 0 ? tnd.toFixed(3) : '';

            if (infoBox) infoBox.style.display = devise !== 'TND' ? 'block' : 'none';
            if (convText && devise !== 'TND') {
                const sym = getCurrencySymbol(devise);
                convText.innerHTML = `${orig} ${sym} &times; ${rate.toFixed(4)} = <strong style="color:var(--success);">${tnd.toFixed(3)} DT</strong>`;
            }
            if (convRate && devise !== 'TND') {
                convRate.textContent = `Taux: 1 ${devise} = ${rate.toFixed(4)} TND`;
            }
        }

        function saveAchatFromPreview() {
            if (!window.tempAchatFile) return;

            const supplier = document.getElementById('previewAchatSupplier').value.trim();
            const amountTND = parseFloat(document.getElementById('previewAchatAmount').value) || 0;
            const devise = document.getElementById('previewAchatDevise')?.value || 'TND';
            const origAmount = parseFloat(document.getElementById('previewAchatAmountOriginal')?.value) || 0;

            if (!supplier) { showToast(t('enterSupplier'), 'error'); return; }
            if (amountTND <= 0) { showToast(t('enterAmount'), 'error'); return; }

            let baseNotes = document.getElementById('previewAchatNotes').value;
            if (devise !== 'TND' && origAmount > 0) {
                const rate = getRateToTND(devise);
                baseNotes += `\n💱 Montant original: ${origAmount} ${getCurrencySymbol(devise)} (taux: 1 ${devise} = ${rate.toFixed(4)} DT)`;
            }

            const achat = {
                numero: document.getElementById('previewAchatNumero').value,
                numeroFournisseur: document.getElementById('previewAchatNumeroFourn')?.value?.trim() || '',
                supplier: supplier,
                supplierEmail: document.getElementById('previewAchatEmail').value,
                supplierPhone: document.getElementById('previewAchatPhone').value,
                date: document.getElementById('previewAchatDate').value,
                amount: amountTND,
                fileName: window.tempAchatFile.name,
                fileType: window.tempAchatFile.type,
                fileData: window.tempAchatFile.data,
                notes: baseNotes,
                status: 'completed'
            };

            DB.addAchat(achat);
            closeAchatPreviewModal();
            renderAchatList();
            loadDashboard();
            const deviseMsg = devise !== 'TND' ? ` (${origAmount} ${getCurrencySymbol(devise)} → ${amountTND.toFixed(3)} DT)` : '';
            showToast(t('achatSaved') + ' ' + achat.numero + deviseMsg);
        }

        function viewAchat(id) {
            const a = DB.getAchatById(id);
            if (!a) return;
            currentAchatId = id;
            const modalBody = document.getElementById('achatViewModalBody');
            const filePreview = a.fileData 
                ? (a.fileType?.includes('pdf') 
                    ? `<div style="padding:20px;background:var(--bg);border-radius:8px;text-align:center;"><div style="font-size:64px;margin-bottom:12px;">📄</div><div style="font-size:14px;color:var(--text-muted);">${a.fileName}</div><div style="margin-top:12px;"><a href="${a.fileData}" download="${a.fileName}" class="btn btn-achat btn-sm">📥 Télécharger</a></div></div>`
                    : `<img src="${a.fileData}" class="achat-file-preview" style="max-width:100%;max-height:400px;object-fit:contain;">`)
                : `<div class="empty-state"><div class="icon">📄</div><h3>Aucun fichier</h3></div>`;

            modalBody.innerHTML = `
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
                    <div class="view-invoice-section">
                        <h4>🏢 Fournisseur</h4>
                        <p style="font-size:18px;margin-bottom:4px;font-weight:700;">${a.supplier}</p>
                        ${a.supplierEmail ? `<p style="font-size:13px;color:var(--text-muted);">📧 ${a.supplierEmail}</p>` : ''}
                        ${a.supplierPhone ? `<p style="font-size:13px;color:var(--text-muted);">📞 ${a.supplierPhone}</p>` : ''}
                    </div>
                    <div class="view-invoice-section" style="text-align:${currentLang === 'ar' ? 'left' : 'right'};">
                        <h4>📄 Détails Facture</h4>
                        <p style="font-size:13px;color:var(--text-muted);">N° Interne: <strong>${a.numero}</strong></p>
                        ${a.numeroFournisseur ? `<p style="font-size:15px;font-weight:700;color:var(--achat-color);margin-top:4px;">N° Facture Fourn.: ${a.numeroFournisseur}</p>` : ''}
                        <p style="font-size:13px;color:var(--text-muted);margin-top:4px;">📅 ${formatDate(a.date)}</p>
                        <p style="font-size:28px;font-weight:800;color:var(--achat-color);margin-top:8px;">${formatMoney(a.amount)}</p>
                    </div>
                </div>
                ${a.notes ? `<div class="view-invoice-section" style="margin-bottom:16px;"><h4>📝 Notes / Produits</h4><p style="font-size:13px;color:var(--text-muted);white-space:pre-wrap;">${a.notes}</p></div>` : ''}
                <div class="view-invoice-section"><h4>📎 Fichier</h4>${filePreview}</div>
            `;
            document.getElementById('achatViewModal').classList.add('active');
        }

        function closeAchatViewModal() { document.getElementById('achatViewModal').classList.remove('active'); currentAchatId = null; }
        function deleteAchatFromView() { if (currentAchatId) { deleteAchat(currentAchatId); closeAchatViewModal(); } }
        function editAchatFromView() { if (currentAchatId) { closeAchatViewModal(); setTimeout(() => editAchat(currentAchatId), 300); } }

        function deleteAchat(id) {
            const a = DB.getAchatById(id);
            showConfirmModal(
                `🗑️ Supprimer l'achat <strong>${a?.numero || id}</strong> ?`,
                'Cette action est irréversible.',
                () => {
                    DB.deleteAchat(id);
                    renderAchatList();
                    loadDashboard();
                    showToast(t('achatDeleted'));
                }
            );
        }

        function editAchat(id) {
            const a = DB.getAchatById(id);
            if (!a) return;
            currentAchatId = id;
            const modalBody = document.getElementById('achatEditModalBody');
            modalBody.innerHTML = `
                <div class="form-row">
                    <div class="form-group"><label>${t('invoiceNum')} (Interne)</label><input type="text" id="editAchatNumero" value="${a.numero}"></div>
                    <div class="form-group"><label>N° Facture Fournisseur</label><input type="text" id="editAchatNumeroFourn" value="${a.numeroFournisseur || ''}" placeholder="Ex: FA-2026-001"></div>
                </div>
                <div class="form-group"><label>${t('supplier')}</label><input type="text" id="editAchatSupplier" value="${a.supplier}"></div>
                <div class="form-row">
                    <div class="form-group"><label>${t('email')}</label><input type="email" id="editAchatEmail" value="${a.supplierEmail || ''}"></div>
                    <div class="form-group"><label>${t('phone')}</label><input type="text" id="editAchatPhone" value="${a.supplierPhone || ''}"></div>
                </div>
                <div class="form-row">
                    <div class="form-group"><label>${t('dateLabel')}</label><input type="date" id="editAchatDate" value="${a.date}"></div>
                    <div class="form-group"><label>${t('grandTotal')}</label><input type="number" id="editAchatAmount" value="${a.amount}" step="0.001"></div>
                </div>
                <div class="form-group"><label>${t('notes')}</label><textarea id="editAchatNotes">${a.notes || ''}</textarea></div>
                <div class="form-group">
                    <label>${t('file')}</label>
                    <div class="file-upload-area" onclick="document.getElementById('editAchatFile').click()">
                        <span class="icon">📎</span>
                        <div>Cliquer pour changer le fichier</div>
                        <div style="font-size:12px;color:var(--text-muted);margin-top:4px;">${a.fileName}</div>
                        <input type="file" id="editAchatFile" accept=".pdf,.png,.jpg,.jpeg" style="display:none" onchange="handleEditAchatFile(event)">
                    </div>
                </div>
            `;
            document.getElementById('achatEditModal').classList.add('active');
        }

        let editAchatFileData = null;
        let editAchatFileName = null;
        let editAchatFileType = null;

        function handleEditAchatFile(event) {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(ev) {
                editAchatFileData = ev.target.result;
                editAchatFileName = file.name;
                editAchatFileType = file.type;
                showToast(t('uploadSuccess'));
            };
            reader.readAsDataURL(file);
        }

        function saveAchatEdit() {
            if (!currentAchatId) return;
            const supplier = document.getElementById('editAchatSupplier').value;
            const amount = parseFloat(document.getElementById('editAchatAmount').value) || 0;
            if (!supplier) { showToast(t('enterSupplier'), 'error'); return; }
            const data = {
                numero: document.getElementById('editAchatNumero').value,
                numeroFournisseur: document.getElementById('editAchatNumeroFourn')?.value?.trim() || '',
                supplier: supplier,
                supplierEmail: document.getElementById('editAchatEmail').value,
                supplierPhone: document.getElementById('editAchatPhone').value,
                date: document.getElementById('editAchatDate').value,
                amount: amount,
                notes: document.getElementById('editAchatNotes').value
            };
            if (editAchatFileData) {
                data.fileData = editAchatFileData;
                data.fileName = editAchatFileName;
                data.fileType = editAchatFileType;
            }
            DB.updateAchat(currentAchatId, data);
            closeAchatEditModal();
            renderAchatList();
            loadDashboard();
            showToast(t('achatUpdated'));
            editAchatFileData = null; editAchatFileName = null; editAchatFileType = null;
        }

        function closeAchatEditModal() { 
            document.getElementById('achatEditModal').classList.remove('active'); 
            currentAchatId = null;
            editAchatFileData = null; editAchatFileName = null; editAchatFileType = null;
            window.tempAchatFile = null;
        }
