        // ===================== DATABASE (MySQL API + local cache) =====================
        const API_BASE = '/api';
        const DB = {
            invoices: [],
            achats: [],
            ready: false,

            async init() {
                try {
                    const [invoicesRes, achatsRes] = await Promise.all([
                        fetch(`${API_BASE}/invoices`),
                        fetch(`${API_BASE}/achats`)
                    ]);
                    if (!invoicesRes.ok || !achatsRes.ok) throw new Error('API unavailable');
                    this.invoices = await invoicesRes.json();
                    this.achats = await achatsRes.json();
                    this.ready = true;
                    showToast('Base MySQL connectée', 'success');
                } catch (error) {
                    console.error(error);
                    this.invoices = JSON.parse(localStorage.getItem('fp_invoices') || '[]');
                    this.achats = JSON.parse(localStorage.getItem('fp_achats') || '[]');
                    showToast('Mode local: MySQL/API indisponible', 'warning');
                }
            },

            async sync(endpoint, options, onSuccess) {
                try {
                    const response = await fetch(`${API_BASE}/${endpoint}`, {
                        headers: { 'Content-Type': 'application/json' },
                        ...options
                    });
                    if (!response.ok) throw new Error(await response.text());
                    if (response.status !== 204 && onSuccess) onSuccess(await response.json());
                } catch (error) {
                    console.error(error);
                    showToast('Erreur synchronisation MySQL', 'danger');
                }
            },

            getAllInvoices() { return [...this.invoices]; },
            saveInvoices(invoices) {
                this.invoices = invoices;
                localStorage.setItem('fp_invoices', JSON.stringify(invoices));
            },
            addInvoice(invoice) {
                const tempId = Date.now();
                const optimistic = { ...invoice, id: tempId, createdAt: new Date().toISOString() };
                this.saveInvoices([...this.invoices, optimistic]);
                this.sync('invoices', {
                    method: 'POST',
                    body: JSON.stringify(invoice)
                }, saved => {
                    this.saveInvoices(this.invoices.map(i => i.id === tempId ? saved : i));
                    renderInvoiceList();
                    loadDashboard();
                });
                return optimistic;
            },
            getInvoiceById(id) { return this.invoices.find(i => i.id == id); },
            getInvoiceByNumero(num) { return this.invoices.find(i => i.numero.toLowerCase().includes(num.toLowerCase())); },
            existsInvoiceByNumero(num, excludeId) {
                return this.invoices.some(i => i.numero.toLowerCase() === num.toLowerCase() && i.id != excludeId);
            },
            addDeletedNumero() {},
            getInvoicesByClient(name) { return this.invoices.filter(i => i.clientName.toLowerCase().includes(name.toLowerCase())); },
            updateInvoice(id, data) {
                const idx = this.invoices.findIndex(i => i.id == id);
                if (idx < 0) return null;
                const updated = { ...this.invoices[idx], ...data, updatedAt: new Date().toISOString() };
                const invoices = [...this.invoices];
                invoices[idx] = updated;
                this.saveInvoices(invoices);
                this.sync(`invoices/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify(updated)
                }, saved => {
                    this.saveInvoices(this.invoices.map(i => i.id == id ? saved : i));
                    renderInvoiceList();
                    loadDashboard();
                });
                return updated;
            },
            deleteInvoice(id) {
                const previous = [...this.invoices];
                this.saveInvoices(this.invoices.filter(i => i.id != id));
                this.sync(`invoices/${id}`, { method: 'DELETE' }, null).catch?.(() => this.saveInvoices(previous));
            },
            getNextInvoiceNumero() {
                const maxCurrent = this.invoices.reduce((m, i) => {
                    const n = parseInt(String(i.numero || '').replace(/\D/g, ''), 10) || 0;
                    return n > m ? n : m;
                }, 0);
                return 'INV-' + String(maxCurrent + 1).padStart(3, '0');
            },

            getAllAchats() { return [...this.achats]; },
            saveAchats(achats) {
                this.achats = achats;
                localStorage.setItem('fp_achats', JSON.stringify(achats));
            },
            addAchat(achat) {
                const tempId = Date.now();
                const optimistic = { ...achat, id: tempId, createdAt: new Date().toISOString() };
                this.saveAchats([...this.achats, optimistic]);
                this.sync('achats', {
                    method: 'POST',
                    body: JSON.stringify(achat)
                }, saved => {
                    this.saveAchats(this.achats.map(a => a.id === tempId ? saved : a));
                    renderAchatList();
                    loadDashboard();
                });
                return optimistic;
            },
            getAchatById(id) { return this.achats.find(a => a.id == id); },
            updateAchat(id, data) {
                const idx = this.achats.findIndex(a => a.id == id);
                if (idx < 0) return null;
                const updated = { ...this.achats[idx], ...data, updatedAt: new Date().toISOString() };
                const achats = [...this.achats];
                achats[idx] = updated;
                this.saveAchats(achats);
                this.sync(`achats/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify(updated)
                }, saved => {
                    this.saveAchats(this.achats.map(a => a.id == id ? saved : a));
                    renderAchatList();
                    loadDashboard();
                });
                return updated;
            },
            deleteAchat(id) {
                const previous = [...this.achats];
                this.saveAchats(this.achats.filter(a => a.id != id));
                this.sync(`achats/${id}`, { method: 'DELETE' }, null).catch?.(() => this.saveAchats(previous));
            },
            getNextAchatNumero() {
                const max = this.achats.reduce((m, a) => {
                    const n = parseInt(String(a.numero || '').replace(/\D/g, ''), 10) || 0;
                    return n > m ? n : m;
                }, 0);
                return 'ACH-' + String(max + 1).padStart(3, '0');
            }
        };

        function seedData() {
            if (DB.getAllInvoices().length === 0) {
                const demoInvoices = [
                    { id: 1, numero: 'INV-001', clientName: 'Ali Ben Salah', clientEmail: 'ali@email.com', clientPhone: '+216 20 123 456', clientAddress: 'Tunis, Tunisie', compName: 'Votre Entreprise', compEmail: '', compPhone: '', compAddress: '', compMF: '', date: '2026-05-10', due: '2026-06-09', items: [{desc: 'Développement Site Web', price: 800, qty: 1}, {desc: 'Hébergement 1 an', price: 150, qty: 1}], tva: 19, remise: 0, notes: 'Payable à réception', status: 'paid', total: 1131 },
                    { id: 2, numero: 'INV-002', clientName: 'Mohamed Trabelsi', clientEmail: 'mohamed@email.com', clientPhone: '+216 21 987 654', clientAddress: 'Sfax, Tunisie', compName: 'Votre Entreprise', compEmail: '', compPhone: '', compAddress: '', compMF: '', date: '2026-05-08', due: '2026-06-07', items: [{desc: 'Design Logo', price: 200, qty: 3}, {desc: 'Cartes Visite', price: 0.5, qty: 500}], tva: 19, remise: 0, notes: 'Payable à réception', status: 'pending', total: 1011.5 },
                    { id: 3, numero: 'INV-003', clientName: 'Société Tunisie Tech', clientEmail: 'contact@tunisietech.tn', clientPhone: '+216 71 123 456', clientAddress: 'Ariana, Tunisie', compName: 'Votre Entreprise', compEmail: '', compPhone: '', compAddress: '', compMF: '', date: '2026-05-05', due: '2026-06-04', items: [{desc: 'Licence ERP Pro', price: 500, qty: 5}, {desc: 'Formation', price: 300, qty: 3}], tva: 19, remise: 10, notes: 'Payable à réception', status: 'overdue', total: 3704.4 },
                    { id: 4, numero: 'INV-004', clientName: 'Ali Ben Salah', clientEmail: 'ali@email.com', clientPhone: '+216 20 123 456', clientAddress: 'Tunis, Tunisie', compName: 'Votre Entreprise', compEmail: '', compPhone: '', compAddress: '', compMF: '', date: '2026-04-15', due: '2026-05-15', items: [{desc: 'Maintenance mensuelle', price: 300, qty: 2}], tva: 19, remise: 5, notes: 'Payable à réception', status: 'paid', total: 678.3 },
                    { id: 5, numero: 'INV-005', clientName: 'Fatma Gharbi', clientEmail: 'fatma@email.com', clientPhone: '+216 22 456 789', clientAddress: 'Sousse, Tunisie', compName: 'Votre Entreprise', compEmail: '', compPhone: '', compAddress: '', compMF: '', date: '2026-04-20', due: '2026-05-20', items: [{desc: 'Consulting SEO', price: 450, qty: 4}], tva: 19, remise: 0, notes: 'Payable à réception', status: 'pending', total: 2142 }
                ];
                localStorage.setItem('fp_invoices', JSON.stringify(demoInvoices));
            }
            if (DB.getAllAchats().length === 0) {
                const demoAchats = [
                    { id: 101, numero: 'ACH-001', supplier: 'Fournisseur Office Depot', supplierEmail: 'contact@officedepot.tn', supplierPhone: '+216 71 111 222', date: '2026-05-01', amount: 450.5, fileName: 'facture_achat_001.pdf', fileType: 'pdf', fileData: null, notes: 'Achat matériel bureau', status: 'completed' },
                    { id: 102, numero: 'ACH-002', supplier: 'Société Tech Supply', supplierEmail: 'info@techsupply.tn', supplierPhone: '+216 71 333 444', date: '2026-05-05', amount: 1200, fileName: 'facture_achat_002.pdf', fileType: 'pdf', fileData: null, notes: 'Achat serveurs', status: 'completed' },
                    { id: 103, numero: 'ACH-003', supplier: 'Fournisseur Papeterie', supplierEmail: '', supplierPhone: '+216 20 555 666', date: '2026-04-20', amount: 85.3, fileName: 'facture_achat_003.pdf', fileType: 'pdf', fileData: null, notes: 'Papeterie mensuelle', status: 'completed' }
                ];
                localStorage.setItem('fp_achats', JSON.stringify(demoAchats));
            }
        }

        // ===================== DEFAULT COMPANY SEED =====================
        (function seedCompany() {
            // Always force-update address regardless of what's stored
            const existing = JSON.parse(localStorage.getItem('fp_company') || '{}');
            if (existing.name === 'TeknoIsland') {
                existing.address = "Avenue Habib Bourguiba, Hammamet, Nabeul";
                localStorage.setItem('fp_company', JSON.stringify(existing));
            }
            if (!localStorage.getItem('fp_company')) {
                const defaultCompany = {
                    name: "TeknoIsland",
                    email: "slimen.mami@teknoisland.com",
                    phone: "+216 23 340 187",
                    address: "Avenue Habib Bourguiba, Hammamet, Nabeul",
                    mf: "",
                    logo: "data:image/jpeg;base64,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"
                };
                localStorage.setItem('fp_company', JSON.stringify(defaultCompany));
            }
        })();
        seedData();

        let currentLogo = null;
        let editCurrentLogo = null;
        let currentAchatId = null;
        let currentViewId = null;
