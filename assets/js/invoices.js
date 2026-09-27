        // ===================== INVOICE LIST =====================
        function renderInvoiceList() {
            const search = document.getElementById('searchInvoices')?.value?.toLowerCase() || '';
            let invoices = DB.getAllInvoices();
            if (search) invoices = invoices.filter(i => i.numero.toLowerCase().includes(search) || i.clientName.toLowerCase().includes(search));
            const tbody = document.getElementById('invoiceTableBody');
            if (invoices.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" class="empty-state"><div class="icon">📭</div><h3>${t('noInvoices')}</h3></td></tr>`;
                return;
            }
            tbody.innerHTML = invoices.map(inv => {
                const statusClass = inv.status === 'paid' ? 'status-paid' : inv.status === 'overdue' ? 'status-overdue' : 'status-pending';
                const statusText = t(inv.status);
                return `<tr>
                    <td><strong>${inv.numero}</strong></td>
                    <td>${inv.clientName}</td>
                    <td>${formatDate(inv.date)}</td>
                    <td>${formatDate(inv.due)}</td>
                    <td><strong>${formatMoney(inv.total)}</strong></td>
                    <td><span class="status-pill ${statusClass}">${statusText}</span></td>
                    <td class="actions">
                        <button class="btn btn-primary btn-sm" onclick="viewInvoice(${inv.id})">👁️</button>
                        <button class="btn btn-warning btn-sm" onclick="editInvoice(${inv.id})">✏️</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteInvoice(${inv.id})">🗑️</button>
                    </td>
                </tr>`;
            }).join('');
        }

        function deleteInvoice(id) {
            const inv = DB.getInvoiceById(id);
            showConfirmModal(
                `🗑️ Supprimer la facture <strong>${inv?.numero || id}</strong> ?`,
                'Cette action est irréversible.',
                () => {
                    DB.deleteInvoice(id);
                    renderInvoiceList();
                    loadDashboard();
                    showToast(t('invoiceDeleted'));
                }
            );
        }

        // ===================== VIEW INVOICE =====================
        function viewInvoice(id) {
            const inv = DB.getInvoiceById(id);
            if (!inv) return;
            currentViewId = id;
            const modalBody = document.getElementById('viewModalBody');

            let itemsHtml = '';
            let subtotal = 0;
            (inv.items || []).forEach(item => {
                const total = item.price * item.qty;
                subtotal += total;
                itemsHtml += `<tr><td>${item.desc}</td><td class="text-center">${formatMoney(item.price)}</td><td class="text-center">${item.qty}</td><td class="text-right">${formatMoney(total)}</td></tr>`;
            });

            const remiseAmount = subtotal * ((inv.remise || 0) / 100);
            const afterRemise = subtotal - remiseAmount;
            const tvaAmount = afterRemise * ((inv.tva || 0) / 100);
            const grandTotal = afterRemise + tvaAmount;

            modalBody.innerHTML = `
                <div class="view-invoice-header">
                    <div style="display:flex; align-items:center; gap:16px;">
                        <div style="width:60px;height:60px;border-radius:12px;overflow:hidden;background:${inv.compLogo ? 'white' : 'linear-gradient(135deg, #6366f1, #8b5cf6)'};display:flex;align-items:center;justify-content:center;color:white;font-size:28px;font-weight:800;">
                            ${inv.compLogo ? `<img src="${inv.compLogo}" style="max-width:100%;max-height:100%;object-fit:contain;">` : (inv.compName || 'FP').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <div style="font-size: 32px; font-weight: 800; color: var(--primary);">${inv.numero}</div>
                            <div style="color: var(--text-muted); margin-top: 4px;">${formatDate(inv.date)} → ${formatDate(inv.due)}</div>
                        </div>
                        <div class="status-pill ${inv.status === 'paid' ? 'status-paid' : inv.status === 'overdue' ? 'status-overdue' : 'status-pending'}" style="font-size: 14px; padding: 8px 16px;">
                            ${t(inv.status)}
                        </div>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
                    <div class="view-invoice-section">
                        <h4 data-i18n="from">De</h4>
                        <p style="font-size: 18px; margin-bottom: 4px;">${inv.compName || t('yourCompany')}</p>
                        ${inv.compEmail ? `<p style="font-size: 13px; color: var(--text-muted);">📧 ${inv.compEmail}</p>` : ''}
                        ${inv.compPhone ? `<p style="font-size: 13px; color: var(--text-muted);">📞 ${inv.compPhone}</p>` : ''}
                        ${inv.compAddress ? `<p style="font-size: 13px; color: var(--text-muted);">📍 ${inv.compAddress}</p>` : ''}
                        ${inv.compMF ? `<p style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">🆔 MF: ${inv.compMF}</p>` : ''}
                    </div>
                    <div class="view-invoice-section" style="text-align: ${currentLang === 'ar' ? 'left' : 'right'};">
                        <h4 data-i18n="billTo">Facturer à</h4>
                        <p style="font-size: 18px; margin-bottom: 4px;">${inv.clientName}</p>
                        ${inv.clientEmail ? `<p style="font-size: 13px; color: var(--text-muted);">📧 ${inv.clientEmail}</p>` : ''}
                        ${inv.clientPhone ? `<p style="font-size: 13px; color: var(--text-muted);">📞 ${inv.clientPhone}</p>` : ''}
                        ${inv.clientAddress ? `<p style="font-size: 13px; color: var(--text-muted);">📍 ${inv.clientAddress}</p>` : ''}
                    </div>
                </div>
                <table class="view-items-table">
                    <thead><tr><th data-i18n="desc">Description</th><th class="text-center" data-i18n="unitPrice">Prix Unitaire</th><th class="text-center" data-i18n="qty">Qté</th><th class="text-right" data-i18n="amount">Montant</th></tr></thead>
                    <tbody>${itemsHtml}</tbody>
                </table>
                <div class="view-totals-box">
                    <div class="view-total-row"><span class="label" data-i18n="subtotal">Sous-total</span><span class="value">${formatMoney(subtotal)}</span></div>
                    ${inv.remise > 0 ? `<div class="view-total-row"><span class="label">${t('discount')} (${inv.remise}%)</span><span class="value" style="color: var(--success);">-${formatMoney(remiseAmount)}</span></div>` : ''}
                    <div class="view-total-row"><span class="label">TVA (${inv.tva || 0}%)</span><span class="value">${formatMoney(tvaAmount)}</span></div>
                    <div class="view-total-row grand"><span class="label" data-i18n="grandTotal">Total TTC</span><span class="value">${formatMoney(grandTotal)}</span></div>
                </div>
                ${inv.notes ? `<div class="view-invoice-section" style="margin-top: 24px;"><h4 data-i18n="notesConditions">Notes & Conditions</h4><p style="font-size: 13px; color: var(--text-muted);">${inv.notes}</p></div>` : ''}
            `;
            document.getElementById('viewModal').classList.add('active');
        }

        function closeViewModal() { document.getElementById('viewModal').classList.remove('active'); currentViewId = null; }
        function editFromView() { if (currentViewId) { closeViewModal(); setTimeout(() => editInvoice(currentViewId), 300); } }
        function printViewInvoice() { if (!currentViewId) return; const inv = DB.getInvoiceById(currentViewId); if (!inv) return; closeViewModal(); printInvoice(inv); }

        // ===================== EDIT INVOICE =====================
        let editingId = null;
        let editingItems = [];
        let editingTva = 0;
        let editingRemise = 0;

        function editInvoice(id) {
            const inv = DB.getInvoiceById(id);
            if (!inv) return;
            editingId = id;
            editingItems = JSON.parse(JSON.stringify(inv.items || []));
            editingTva = inv.tva || 0;
            editingRemise = inv.remise || 0;
            editCurrentLogo = inv.compLogo || null;

            const modalBody = document.getElementById('editModalBody');
            modalBody.innerHTML = `
                <div class="form-row">
                    <div class="form-group"><label>${t('invoiceNum')}</label><input type="text" id="editNumero" value="${inv.numero}"></div>
                    <div class="form-group"><label>${t('status')}</label>
                        <select id="editStatus">
                            <option value="pending" ${inv.status === 'pending' ? 'selected' : ''}>${t('pending')}</option>
                            <option value="paid" ${inv.status === 'paid' ? 'selected' : ''}>${t('paid')}</option>
                            <option value="overdue" ${inv.status === 'overdue' ? 'selected' : ''}>${t('overdue')}</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group" style="flex:1;"><label>${t('companyName')}</label><input type="text" id="editCompName" value="${inv.compName || ''}"></div>
                    <div class="form-group" style="display:flex; flex-direction:column; align-items:center; gap:6px;">
                        <label>Logo</label>
                        <div class="logo-upload" id="editLogoUpload" onclick="document.getElementById('editLogoInput').click()" style="width:80px;height:80px;">
                            <span id="editLogoPreview">📷<br>Logo</span>
                            <input type="file" id="editLogoInput" accept="image/*" style="display:none" onchange="handleEditLogo(event)">
                        </div>
                    </div>
                </div>
                <div class="form-group"><label>${t('clientName')} <span class="required">*</span></label><input type="text" id="editClient" value="${inv.clientName}"></div>
                <div class="form-row">
                    <div class="form-group"><label>${t('email')}</label><input type="email" id="editEmail" value="${inv.clientEmail || ''}"></div>
                    <div class="form-group"><label>${t('phone')}</label><input type="text" id="editPhone" value="${inv.clientPhone || ''}"></div>
                </div>
                <div class="form-group"><label>${t('billingAddress')}</label><input type="text" id="editAddress" value="${inv.clientAddress || ''}"></div>
                <div class="form-row">
                    <div class="form-group"><label>${t('issueDate')}</label><input type="date" id="editDate" value="${inv.date}"></div>
                    <div class="form-group"><label>${t('dueDate')}</label><input type="date" id="editDue" value="${inv.due}"></div>
                </div>
                <div style="margin-top: 20px;">
                    <label style="font-size: 13px; font-weight: 600; margin-bottom: 8px; display: block;">${t('invoiceDetails')}</label>
                    <table class="items-table">
                        <thead><tr><th>${t('desc')}</th><th>${t('price')}</th><th>${t('qty')}</th><th>${t('total')}</th><th></th></tr></thead>
                        <tbody id="editItemsBody"></tbody>
                    </table>
                    <button class="btn-add-item" onclick="addEditItem()">➕ ${t('addItem')}</button>
                </div>
                <div class="totals" style="margin-top: 20px;">
                    <div class="total-row"><span class="label">${t('subtotal')}</span><span class="value" id="editSubtotal">0.000 DT</span></div>
                    <div class="total-row"><span class="label">TVA <input type="number" id="editTva" class="tva-input" value="${editingTva}" min="0" max="100" oninput="updateEditTotals()"> %</span><span class="value" id="editTvaAmount">0.000 DT</span></div>
                    <div class="total-row"><span class="label">${t('discount')} <input type="number" id="editRemise" class="tva-input" value="${editingRemise}" min="0" max="100" oninput="updateEditTotals()"> %</span><span class="value" id="editRemiseAmount" style="color: var(--success);">-0.000 DT</span></div>
                    <div class="total-row grand-total"><span class="label">${t('grandTotal')}</span><span class="value" id="editGrandTotal">0.000 DT</span></div>
                </div>
                <div class="form-group" style="margin-top: 20px;"><label>${t('notes')}</label><textarea id="editNotes">${inv.notes || ''}</textarea></div>
            `;
            renderEditItems();
            updateEditTotals();
            if (inv.compLogo) {
                document.getElementById('editLogoPreview').innerHTML = `<img src="${inv.compLogo}" style="max-width:70px;max-height:70px;object-fit:contain;">`;
            }
            document.getElementById('editModal').classList.add('active');
        }

        function renderEditItems() {
            const tbody = document.getElementById('editItemsBody');
            tbody.innerHTML = editingItems.map((item, idx) => `
                <tr>
                    <td class="item-desc"><input type="text" value="${item.desc}" onchange="updateEditItem(${idx}, 'desc', this.value)" placeholder="${t('desc')}"></td>
                    <td class="item-num"><input type="number" value="${item.price}" min="0" step="0.001" onchange="updateEditItem(${idx}, 'price', this.value)"></td>
                    <td class="item-num"><input type="number" value="${item.qty}" min="1" onchange="updateEditItem(${idx}, 'qty', this.value)"></td>
                    <td class="item-total">${formatMoney(item.price * item.qty)}</td>
                    <td><button class="btn-remove-item" onclick="removeEditItem(${idx})">🗑️</button></td>
                </tr>
            `).join('');
        }

        function addEditItem() { editingItems.push({desc: '', price: 0, qty: 1}); renderEditItems(); updateEditTotals(); }
        function handleEditLogo(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(ev) { editCurrentLogo = ev.target.result; document.getElementById('editLogoPreview').innerHTML = `<img src="${editCurrentLogo}" style="max-width:70px;max-height:70px;object-fit:contain;">`; };
                reader.readAsDataURL(file);
            }
        }
        function removeEditItem(idx) { if (editingItems.length > 1) { editingItems.splice(idx, 1); renderEditItems(); updateEditTotals(); } }
        function updateEditItem(idx, field, value) {
            if (field === 'price') editingItems[idx].price = parseFloat(value) || 0;
            else if (field === 'qty') editingItems[idx].qty = parseInt(value) || 1;
            else editingItems[idx].desc = value;
            renderEditItems(); updateEditTotals();
        }
        function updateEditTotals() {
            let subtotal = 0;
            editingItems.forEach(item => { subtotal += (item.price * item.qty); });
            editingTva = parseFloat(document.getElementById('editTva')?.value) || 0;
            editingRemise = parseFloat(document.getElementById('editRemise')?.value) || 0;
            const remiseAmount = subtotal * (editingRemise / 100);
            const afterRemise = subtotal - remiseAmount;
            const tvaAmount = afterRemise * (editingTva / 100);
            const grandTotal = afterRemise + tvaAmount;
            document.getElementById('editSubtotal').textContent = formatMoney(subtotal);
            document.getElementById('editTvaAmount').textContent = formatMoney(tvaAmount);
            document.getElementById('editRemiseAmount').textContent = '-' + formatMoney(remiseAmount);
            document.getElementById('editGrandTotal').textContent = formatMoney(grandTotal);
        }

        function saveEdit() {
            if (!editingId) return;
            const clientName = document.getElementById('editClient').value;
            if (!clientName) { showToast(t('enterClient'), 'error'); return; }
            let subtotal = 0;
            editingItems.forEach(item => { subtotal += (item.price * item.qty); });
            const remiseAmount = subtotal * (editingRemise / 100);
            const afterRemise = subtotal - remiseAmount;
            const tvaAmount = afterRemise * (editingTva / 100);
            const grandTotal = afterRemise + tvaAmount;
            const newNumero = document.getElementById('editNumero').value.trim();
            if (DB.existsInvoiceByNumero(newNumero, editingId)) { showToast(t('duplicateInvoice'), 'error'); return; }
            const data = {
                numero: newNumero, clientName: clientName, compName: document.getElementById('editCompName').value,
                compLogo: editCurrentLogo, clientEmail: document.getElementById('editEmail').value,
                clientPhone: document.getElementById('editPhone').value, clientAddress: document.getElementById('editAddress').value,
                date: document.getElementById('editDate').value, due: document.getElementById('editDue').value,
                status: document.getElementById('editStatus').value, notes: document.getElementById('editNotes').value,
                items: editingItems, tva: editingTva, remise: editingRemise, total: grandTotal
            };
            DB.updateInvoice(editingId, data);
            closeModal();
            renderInvoiceList();
            loadDashboard();
            showToast(t('invoiceUpdated'));
            editingId = null; editingItems = [];
        }

        function closeModal() { 
            document.getElementById('editModal').classList.remove('active'); 
            editingId = null; editingItems = []; editCurrentLogo = null;
            document.getElementById('editLogoPreview').innerHTML = '📷<br>Logo';
        }

        function downloadInvoicePDF() {
            if (!editingId) return;
            const inv = DB.getInvoiceById(editingId);
            if (!inv) return;
            closeModal();
            printInvoice(inv);
        }
