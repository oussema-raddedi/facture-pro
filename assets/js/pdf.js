        // ===================== PRINT PDF =====================
        function buildInvoicePrintHTML(inv) {
            let itemsHtml = '';
            let subtotal = 0;
            (inv.items || []).forEach(item => {
                const total = item.price * item.qty;
                subtotal += total;
                itemsHtml += `<tr><td>${item.desc || ''}</td><td class="text-center">${formatMoney(item.price)}</td><td class="text-center">${item.qty}</td><td class="text-right">${formatMoney(total)}</td></tr>`;
            });
            const remiseAmount = subtotal * ((inv.remise || 0) / 100);
            const afterRemise = subtotal - remiseAmount;
            const tvaAmount = afterRemise * ((inv.tva || 0) / 100);
            const grandTotal = afterRemise + tvaAmount;
            const remiseRow = (inv.remise || 0) > 0
                ? `<div class="preview-total-row"><span class="label">${t('discount')} (${inv.remise}%)</span><span class="value" style="color: var(--success);">-${formatMoney(remiseAmount)}</span></div>`
                : '';
            return `
            <div class="preview-header">
                <div class="preview-logo" style="overflow:hidden; background:${inv.compLogo ? 'white' : ''};">
                    ${inv.compLogo ? `<img src="${inv.compLogo}" style="max-width:100%;max-height:100%;object-fit:contain;">` : (inv.compName || 'FP').substring(0, 2).toUpperCase()}
                </div>
                <div class="preview-title">
                    <h2>${t('invoiceWord')}</h2>
                    <div class="inv-num">N° ${inv.numero}</div>
                    <div class="inv-date">${t('dateLabel')} ${formatDate(inv.date)}</div>
                    <div class="inv-date">${t('dueLabel')} ${formatDate(inv.due)}</div>
                </div>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:30px;">
                <div class="preview-section">
                    <h4>${t('from')}</h4>
                    <p style="font-size:18px; margin-bottom:4px;">${inv.compName || t('yourCompany')}</p>
                    ${inv.compEmail ? `<p style="font-size:13px; color:var(--text-muted);">📧 ${inv.compEmail}</p>` : ''}
                    ${inv.compPhone ? `<p style="font-size:13px; color:var(--text-muted);">📞 ${inv.compPhone}</p>` : ''}
                    ${inv.compAddress ? `<p style="font-size:13px; color:var(--text-muted);">📍 ${inv.compAddress}</p>` : ''}
                    ${inv.compMF ? `<p style="font-size:13px; color:var(--text-muted); margin-top:4px;">🆔 MF: ${inv.compMF}</p>` : ''}
                </div>
                <div class="preview-section" style="text-align:${currentLang === 'ar' ? 'left' : 'right'};">
                    <h4>${t('billTo')}</h4>
                    <p style="font-size:18px; margin-bottom:4px;">${inv.clientName}</p>
                    ${inv.clientEmail ? `<p style="font-size:13px; color:var(--text-muted);">📧 ${inv.clientEmail}</p>` : ''}
                    ${inv.clientPhone ? `<p style="font-size:13px; color:var(--text-muted);">📞 ${inv.clientPhone}</p>` : ''}
                    ${inv.clientAddress ? `<p style="font-size:13px; color:var(--text-muted);">📍 ${inv.clientAddress}</p>` : ''}
                </div>
            </div>
            <table class="preview-table">
                <thead><tr><th>${t('desc')}</th><th class="text-center">${t('unitPrice')}</th><th class="text-center">${t('qty')}</th><th class="text-right">${t('amount')}</th></tr></thead>
                <tbody>${itemsHtml}</tbody>
            </table>
            <div class="preview-totals">
                <div class="preview-total-row"><span class="label">${t('subtotal')}</span><span class="value">${formatMoney(subtotal)}</span></div>
                ${remiseRow}
                <div class="preview-total-row"><span class="label">TVA (${inv.tva || 0}%)</span><span class="value">${formatMoney(tvaAmount)}</span></div>
                <div class="preview-total-row grand"><span class="label">${t('grandTotal')}</span><span class="value" style="color:var(--primary); font-size:22px;">${formatMoney(grandTotal)}</span></div>
            </div>
            ${inv.notes ? `<div class="preview-notes"><h4>${t('notesConditions')}</h4><p>${inv.notes}</p></div>` : ''}
            <div style="text-align:center; margin-top:60px; color:var(--text-muted); font-size:12px;">${t('thankYou')}</div>
            `;
        }

        async function printInvoice(inv) {
            showToast('⏳ Génération PDF...', 'info');
            const container = document.getElementById('printOnly');
            container.style.display = 'block';
            container.style.position = 'fixed';
            container.style.left = '-9999px';
            container.style.top = '0';
            container.style.width = '794px';
            container.style.background = 'white';
            container.style.color = '#0f172a';
            container.style.zIndex = '-1';
            container.innerHTML = `
                <div style="font-family:Inter,Arial,sans-serif;background:white;color:#0f172a;padding:40px;width:714px;">
                    ${buildInvoicePrintHTML(inv)}
                </div>`;
            // Force colors for PDF
            container.querySelectorAll('*').forEach(el => {
                const s = el.style;
                if (!s.color || s.color === 'var(--text)' || s.color === '') s.color = '#0f172a';
                if (!s.background) s.background = 'white';
            });
            try {
                await new Promise(r => setTimeout(r, 300));
                const canvas = await html2canvas(container.firstElementChild, {
                    scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false
                });
                const imgData = canvas.toDataURL('image/jpeg', 0.95);
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
                const pdfW = pdf.internal.pageSize.getWidth();
                const pdfH = (canvas.height * pdfW) / canvas.width;
                pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH);
                pdf.save(`Facture_${inv.numero}.pdf`);
                showToast('✅ PDF téléchargé: ' + inv.numero);
            } catch(e) {
                console.error(e);
                // Fallback to print dialog
                window.print();
            } finally {
                container.style.display = 'none';
                container.style.position = '';
                container.style.left = '';
                container.style.top = '';
                container.style.width = '';
                container.style.zIndex = '';
            }
        }
