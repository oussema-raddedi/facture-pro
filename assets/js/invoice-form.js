        // ===================== FORM =====================
        function addItem() {
            const tbody = document.getElementById('itemsBody');
            const tr = document.createElement('tr');
            tr.innerHTML = `<td class="item-desc"><input type="text" class="item-desc-input" placeholder="${t('desc')}" oninput="updatePreview()"></td>
                <td class="item-num"><input type="number" class="item-price" value="0" min="0" step="0.001" oninput="updatePreview()"></td>
                <td class="item-num"><input type="number" class="item-qty" value="1" min="1" oninput="updatePreview()"></td>
                <td class="item-total">0.000 DT</td>
                <td><button class="btn-remove-item" onclick="removeItem(this)">🗑️</button></td>`;
            tbody.appendChild(tr);
            updatePreview();
        }

        function removeItem(btn) {
            if (document.querySelectorAll('#itemsBody tr').length > 1) {
                btn.closest('tr').remove();
                updatePreview();
            }
        }

        function handleLogo(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(ev) {
                    currentLogo = ev.target.result;
                    document.getElementById('logoPreview').innerHTML = `<img src="${currentLogo}" style="max-width:80px;max-height:80px;">`;
                    document.getElementById('previewLogo').innerHTML = `<img src="${currentLogo}" style="max-width:50px;max-height:50px;border-radius:8px;">`;
                    saveCompanyInfo();
                };
                reader.readAsDataURL(file);
            }
        }

        function updatePreview() {
            document.getElementById('pCompName').textContent = document.getElementById('compName').value || t('yourCompany');
            document.getElementById('pCompEmail').textContent = document.getElementById('compEmail').value;
            document.getElementById('pCompPhone').textContent = document.getElementById('compPhone').value;
            document.getElementById('pCompAddress').textContent = document.getElementById('compAddress').value;
            const mf = document.getElementById('compMF').value;
            document.getElementById('pCompMF').textContent = mf ? 'MF: ' + mf : '';
            document.getElementById('pClientName').textContent = document.getElementById('clientName').value || t('clientName');
            document.getElementById('pClientEmail').textContent = document.getElementById('clientEmail').value;
            document.getElementById('pClientPhone').textContent = document.getElementById('clientPhone').value;
            document.getElementById('pClientAddress').textContent = document.getElementById('clientAddress').value;
            document.getElementById('pInvNum').textContent = document.getElementById('invNum').value;
            document.getElementById('pInvDate').textContent = formatDate(document.getElementById('invDate').value);
            document.getElementById('pInvDue').textContent = formatDate(document.getElementById('invDue').value);

            const rows = document.querySelectorAll('#itemsBody tr');
            let subtotal = 0;
            let pHtml = '';
            rows.forEach(row => {
                const desc = row.querySelector('.item-desc-input').value || t('desc');
                const price = parseFloat(row.querySelector('.item-price').value) || 0;
                const qty = parseInt(row.querySelector('.item-qty').value) || 1;
                const total = price * qty;
                subtotal += total;
                row.querySelector('.item-total').textContent = formatMoney(total);
                pHtml += `<tr><td>${desc}</td><td class="text-center">${formatMoney(price)}</td><td class="text-center">${qty}</td><td class="text-right">${formatMoney(total)}</td></tr>`;
            });
            document.getElementById('pItemsBody').innerHTML = pHtml || `<tr><td>${t('desc')}</td><td class="text-center">0.000 DT</td><td class="text-center">1</td><td class="text-right">0.000 DT</td></tr>`;

            const tvaRate = parseFloat(document.getElementById('tvaRate').value) || 0;
            const remiseRate = parseFloat(document.getElementById('remiseRate').value) || 0;
            const remiseAmount = subtotal * (remiseRate / 100);
            const afterRemise = subtotal - remiseAmount;
            const tvaAmount = afterRemise * (tvaRate / 100);
            const grandTotal = afterRemise + tvaAmount;

            document.getElementById('subtotal').textContent = formatMoney(subtotal);
            document.getElementById('tvaAmount').textContent = formatMoney(tvaAmount);
            document.getElementById('remiseAmount').textContent = '-' + formatMoney(remiseAmount);
            document.getElementById('grandTotal').textContent = formatMoney(grandTotal);
            document.getElementById('pSubtotal').textContent = formatMoney(subtotal);
            const pRemiseRow = document.getElementById('pRemiseRow');
            if (pRemiseRow) {
                if (remiseAmount > 0) { pRemiseRow.style.display = 'flex'; document.getElementById('pRemise').textContent = '-' + formatMoney(remiseAmount); }
                else { pRemiseRow.style.display = 'none'; }
            }
            document.getElementById('pTva').textContent = formatMoney(tvaAmount);
            document.getElementById('pGrandTotal').textContent = formatMoney(grandTotal);
            document.getElementById('pNotes').textContent = document.getElementById('notes').value;
        }

        document.getElementById('invDate').value = new Date().toISOString().split('T')[0];
        const due = new Date(); due.setDate(due.getDate() + 30);
        document.getElementById('invDue').value = due.toISOString().split('T')[0];
        document.getElementById('invNum').value = DB.getNextInvoiceNumero();
        loadCompanyInfo();
        updatePreview();

        // ===================== SAVE / PDF =====================
        function saveInvoice() {
            const items = [];
            document.querySelectorAll('#itemsBody tr').forEach(row => {
                const desc = row.querySelector('.item-desc-input').value;
                const price = parseFloat(row.querySelector('.item-price').value) || 0;
                const qty = parseInt(row.querySelector('.item-qty').value) || 1;
                if (desc) items.push({desc, price, qty});
            });
            const invoice = {
                numero: document.getElementById('invNum').value,
                compLogo: currentLogo,
                clientName: document.getElementById('clientName').value,
                clientEmail: document.getElementById('clientEmail').value,
                clientPhone: document.getElementById('clientPhone').value,
                clientAddress: document.getElementById('clientAddress').value,
                compName: document.getElementById('compName').value,
                compEmail: document.getElementById('compEmail').value,
                compPhone: document.getElementById('compPhone').value,
                compAddress: document.getElementById('compAddress').value,
                compMF: document.getElementById('compMF').value,
                date: document.getElementById('invDate').value,
                due: document.getElementById('invDue').value,
                items: items,
                tva: parseFloat(document.getElementById('tvaRate').value) || 0,
                remise: parseFloat(document.getElementById('remiseRate').value) || 0,
                notes: document.getElementById('notes').value,
                status: 'pending',
                total: parseFloat(document.getElementById('grandTotal').textContent.replace(/[^0-9.]/g, '')) || 0
            };
            if (!invoice.clientName) { showToast(t('enterClient'), 'error'); return; }
            if (DB.existsInvoiceByNumero(invoice.numero)) { showToast(t('duplicateInvoice'), 'error'); return; }
            DB.addInvoice(invoice);
            document.getElementById('saveStatus').textContent = '✅ ' + new Date().toLocaleTimeString();
            showToast(t('invoiceSaved') + ' ' + invoice.numero);
            document.getElementById('invNum').value = DB.getNextInvoiceNumero();
            updatePreview();
        }

        function resetForm() {
            if (confirm(t('reset') + '?')) {
                currentLogo = null;
                document.getElementById('logoPreview').innerHTML = '📷<br>Logo';
                document.getElementById('previewLogo').innerHTML = 'V';
                document.getElementById('clientName').value = '';
                document.getElementById('clientEmail').value = '';
                document.getElementById('clientPhone').value = '';
                document.getElementById('clientAddress').value = '';
                document.getElementById('itemsBody').innerHTML = `<tr><td class="item-desc"><input type="text" class="item-desc-input" placeholder="${t('desc')}" oninput="updatePreview()"></td><td class="item-num"><input type="number" class="item-price" value="0" min="0" step="0.001" oninput="updatePreview()"></td><td class="item-num"><input type="number" class="item-qty" value="1" min="1" oninput="updatePreview()"></td><td class="item-total">0.000 DT</td><td><button class="btn-remove-item" onclick="removeItem(this)">🗑️</button></td></tr>`;
                document.getElementById('tvaRate').value = 19;
                document.getElementById('remiseRate').value = 0;
                document.getElementById('invNum').value = DB.getNextInvoiceNumero();
                updatePreview();
                showToast(t('formReset'));
            }
        }

        function downloadPDF() {
            const items = [];
            document.querySelectorAll('#itemsBody tr').forEach(row => {
                const desc = row.querySelector('.item-desc-input').value;
                const price = parseFloat(row.querySelector('.item-price').value) || 0;
                const qty = parseInt(row.querySelector('.item-qty').value) || 1;
                if (desc) items.push({desc, price, qty});
            });
            const invoice = {
                numero: document.getElementById('invNum').value,
                compLogo: currentLogo,
                clientName: document.getElementById('clientName').value,
                clientEmail: document.getElementById('clientEmail').value,
                clientPhone: document.getElementById('clientPhone').value,
                clientAddress: document.getElementById('clientAddress').value,
                compName: document.getElementById('compName').value,
                compEmail: document.getElementById('compEmail').value,
                compPhone: document.getElementById('compPhone').value,
                compAddress: document.getElementById('compAddress').value,
                compMF: document.getElementById('compMF').value,
                date: document.getElementById('invDate').value,
                due: document.getElementById('invDue').value,
                items: items,
                tva: parseFloat(document.getElementById('tvaRate').value) || 0,
                remise: parseFloat(document.getElementById('remiseRate').value) || 0,
                notes: document.getElementById('notes').value
            };
            printInvoice(invoice);
        }
