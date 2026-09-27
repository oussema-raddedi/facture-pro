// ===================== I18N =====================
        const i18n = {
            fr: {
                appName: "FacturePro", appSubtitle: "🌐 Gestion Factures & Achats",
                assistant: "Assistant Pro", print: "Imprimer",
                tabCreate: "📝 Créer Facture", tabList: "📋 Mes Factures", tabAchats: "🧾 Achats", tabDashboard: "📊 Dashboard",
                yourCompany: "🏢 Votre Entreprise", companyName: "Nom de l'entreprise",
                email: "Email", phone: "Téléphone", address: "Adresse", taxId: "Matricule Fiscale",
                clientInfo: "👤 Informations Client", clientName: "Nom du client",
                billingAddress: "Adresse de facturation", invoiceDetails: "📄 Détails de la Facture",
                invoiceNum: "N° Facture", issueDate: "Date d'émission", dueDate: "Date d'échéance",
                item: "Article", price: "Prix (DT)", qty: "Qté", total: "Total", addItem: "Ajouter un article",
                subtotal: "Sous-total", discount: "Remise", grandTotal: "Total TTC", notes: "Notes / Conditions",
                livePreview: "Aperçu en Direct", updated: "Mis à jour", invoiceWord: "FACTURE",
                dateLabel: "Date:", dueLabel: "Échéance:", from: "De", billTo: "Facturer à",
                desc: "Description", unitPrice: "Prix Unitaire", amount: "Montant",
                notesConditions: "Notes & Conditions", thankYou: "Merci pour votre confiance!",
                downloadPDF: "Télécharger PDF", saveSQL: "Sauvegarder", reset: "Réinitialiser",
                myInvoices: "📋 Mes Factures", newInvoice: "Nouvelle", search: "Rechercher...",
                status: "Statut", actions: "Actions", paid: "Payée", pending: "En attente", overdue: "En retard",
                sqlDashboard: "📊 Dashboard", refresh: "Actualiser",
                invoicesInDB: "Factures", totalRevenue: "CA Ventes (DT)",
                paidInvoices: "Payées", pendingInvoices: "En attente",
                noData: "Aucune donnée", clickRefresh: "Cliquez sur Actualiser pour charger les données",
                assistantPro: "Assistant Pro", online: "En ligne",
                chatWelcome: "Salam! 👋", chatConnected: "Que puis-je faire pour vous? Essayez:",
                editInvoice: "✏️ Modifier la Facture", cancel: "Annuler", save: "Enregistrer",
                invoiceSaved: "Facture sauvegardée!", invoiceDeleted: "Facture supprimée", invoiceUpdated: "Facture modifiée!",
                formReset: "Formulaire réinitialisé", enterClient: "Veuillez entrer le nom du client",
                notFound: "Aucune facture trouvée", availableInvoices: "Factures disponibles",
                totalSales: "CA Total", invoices: "Factures", clients: "Clients",
                allInvoices: "Toutes les factures", noInvoices: "Aucune facture", clientsOverdue: "Clients en retard",
                helpText: "Commandes disponibles", searchByNum: "Chercher par numéro",
                searchByClient: "Chercher par client", viewList: "Voir la liste",
                createNew: "Créer une facture", openForm: "Ouvrir le formulaire",
                pdfGenerated: "PDF généré!", pdfDownloaded: "PDF téléchargé:",
                viewInvoice: "👁️ Voir la Facture", close: "Fermer",
                revenueByMonth: "📈 CA Ventes par Mois", statusDistribution: "📊 Répartition Statuts",
                topClients: "🏆 Top Clients", monthlyTrend: "📉 Tendance Mensuelle",
                allPaid: "Toutes les factures sont payées!",
                totalPending: "Total en attente",
                noOverdue: "Aucune facture en retard",
                overdueInvoices: "Factures en retard",
                totalOverdue: "Total en retard",
                noPaid: "Aucune facture payée",
                totalPaid: "Total payé",
                viewDetails: "Voir détails",
                products: "Produits",
                breakdown: "Détail calcul",
                invoiceDetails: "Détails facture",
                filterYear: "Année", filterMonth: "Mois", filterDay: "Jour", filterAll: "Tous", clearFilters: "Effacer",
                analysisTitle: "Analyse Globale",
                avgInvoice: "Moyenne/facture",
                topClient: "Meilleur client",
                healthScore: "Santé financière",
                delete: "Supprimer",
                duplicateInvoice: "❌ Ce numéro est déjà utilisé ou a été supprimé — numéros non réutilisables",
                // Achats
                tabAchats: "🧾 Achats",
                uploadAchat: "Uploader Facture",
                supplier: "Fournisseur",
                file: "Fichier",
                noAchats: "Aucun achat",
                uploadDesc: "Uploader une facture fournisseur pour commencer",
                achatsInDB: "Achats",
                totalAchats: "Total Achats (DT)",
                achatByMonth: "📉 Achats par Mois",
                venteVsAchat: "📊 Ventes vs Achats",
                viewAchat: "Voir Achat",
                editAchat: "Modifier Achat",
                achatSaved: "Achat sauvegardé!",
                achatDeleted: "Achat supprimé",
                achatUpdated: "Achat modifié!",
                enterSupplier: "Veuillez entrer le nom du fournisseur",
                enterAmount: "Veuillez entrer un montant",
                uploadSuccess: "Fichier uploadé avec succès!",
                chatCreateInvoice: "Créer facture interactive",
                chatUploadAchat: "Uploader achat",
                chatInvoiceCreated: "Facture créée avec succès!",
                chatInvoicePDF: "Voici votre PDF:",
                chatEnterClient: "Quel est le nom du client?",
                chatEnterAmount: "Quel est le montant total?",
                chatEnterDesc: "Description des articles (séparés par virgule):",
                chatConfirm: "Confirmer la création?",
                chatYes: "Oui",
                chatNo: "Non",
                chatCancelled: "Création annulée",
                chatFileUploaded: "Fichier uploadé et sauvegardé dans Achats!",
                chatSearchPrompt: "Veuillez saisir un terme à rechercher (ID, nom, N° de facture ou N° d'achat) puis cliquez sur 🔍.",
                chatSearchResults: "Résultats de recherche pour",
                chatSearchTitle: "Rechercher une facture ou un achat",
                chatSearchNoResult: "Aucun résultat trouvé pour",
                chatSearchInvoiceHeader: "💰 Factures Vente trouvées",
                chatSearchAchatHeader: "🧾 Achats Fournisseur trouvés",
                notifOverdue: "La facture <strong>{num}</strong> ({client}) a dépassé sa date d'échéance de {days} jour(s) !",
                notifDue3: "Rappel : la facture <strong>{num}</strong> ({client}) arrive à échéance {when} ({date})",
                notifWhenToday: "aujourd'hui",
                notifWhenTomorrow: "demain",
                notifWhenInDays: "dans {days} jours"
            },
            ar: {
                appName: "فاتورة برو", appSubtitle: "🌐 إدارة الفواتير والمشتريات",
                assistant: "المساعد الذكي", print: "طباعة",
                tabCreate: "📝 إنشاء فاتورة", tabList: "📋 فواتيري", tabAchats: "🧾 المشتريات", tabDashboard: "📊 لوحة التحكم",
                yourCompany: "🏢 شركتك", companyName: "اسم الشركة",
                email: "البريد", phone: "الهاتف", address: "العنوان", taxId: "الرقم الجبائي",
                clientInfo: "👤 معلومات الزبون", clientName: "اسم الزبون",
                billingAddress: "عنوان الفوترة", invoiceDetails: "📄 تفاصيل الفاتورة",
                invoiceNum: "رقم الفاتورة", issueDate: "تاريخ الإصدار", dueDate: "تاريخ الاستحقاق",
                item: "المنتج", price: "السعر (دت)", qty: "الكمية", total: "المجموع", addItem: "إضافة منتج",
                subtotal: "المجموع الفرعي", discount: "التخفيض", grandTotal: "الإجمالي", notes: "ملاحظات / شروط",
                livePreview: "معاينة مباشرة", updated: "محدث", invoiceWord: "فاتورة",
                dateLabel: "التاريخ:", dueLabel: "الاستحقاق:", from: "من", billTo: "فاتورة إلى",
                desc: "الوصف", unitPrice: "سعر الوحدة", amount: "المبلغ",
                notesConditions: "ملاحظات وشروط", thankYou: "شكراً لثقتكم!",
                downloadPDF: "تحميل PDF", saveSQL: "حفظ", reset: "إعادة تعيين",
                myInvoices: "📋 فواتيري", newInvoice: "جديدة", search: "بحث...",
                status: "الحالة", actions: "إجراءات", paid: "مدفوعة", pending: "معلقة", overdue: "متأخرة",
                sqlDashboard: "📊 لوحة التحكم", refresh: "تحديث",
                invoicesInDB: "فواتير", totalRevenue: "إجمالي المبيعات (دت)",
                paidInvoices: "مدفوعة", pendingInvoices: "معلقة",
                noData: "لا توجد بيانات", clickRefresh: "اضغط تحديث لتحميل البيانات",
                assistantPro: "المساعد الذكي", online: "متصل",
                chatWelcome: "سلام! 👋", chatConnected: "أنا متصل بقاعدة البيانات. جرب:",
                editInvoice: "✏️ تعديل الفاتورة", cancel: "إلغاء", save: "حفظ",
                invoiceSaved: "تم حفظ الفاتورة!", invoiceDeleted: "تم حذف الفاتورة", invoiceUpdated: "تم تعديل الفاتورة!",
                formReset: "تم إعادة التعيين", enterClient: "أدخل اسم الزبون",
                notFound: "لم يتم العثور على فاتورة", availableInvoices: "الفواتير المتاحة",
                totalSales: "إجمالي المبيعات", invoices: "فواتير", clients: "زبائن",
                allInvoices: "جميع الفواتير", noInvoices: "لا توجد فواتير", clientsOverdue: "زبائن متأخرون",
                helpText: "الأوامر المتاحة", searchByNum: "البحث برقم", searchByClient: "البحث بالزبون",
                viewList: "عرض القائمة", createNew: "إنشاء فاتورة جديدة", openForm: "فتح النموذج",
                pdfGenerated: "تم إنشاء PDF!", pdfDownloaded: "تم تحميل PDF:",
                viewInvoice: "👁️ عرض الفاتورة", close: "إغلاق",
                revenueByMonth: "📈 الإيرادات الشهرية", statusDistribution: "📊 توزيع الحالات",
                topClients: "🏆 أفضل الزبائن", monthlyTrend: "📉 الاتجاه الشهري",
                allPaid: "جميع الفواتير مدفوعة!",
                totalPending: "المجموع المعلق",
                noOverdue: "لا توجد فواتير متأخرة",
                overdueInvoices: "فواتير متأخرة",
                totalOverdue: "المجموع المتأخر",
                noPaid: "لا توجد فواتير مدفوعة",
                totalPaid: "المجموع المدفوع",
                viewDetails: "عرض التفاصيل",
                products: "المنتجات",
                breakdown: "تفاصيل الحساب",
                invoiceDetails: "تفاصيل الفاتورة",
                filterYear: "السنة", filterMonth: "الشهر", filterDay: "اليوم", filterAll: "الكل", clearFilters: "مسح",
                analysisTitle: "تحليل شامل",
                avgInvoice: "متوسط/فاتورة",
                topClient: "أفضل زبون",
                healthScore: "الصحة المالية",
                delete: "حذف",
                duplicateInvoice: "رقم الفاتورة موجود مسبقاً",
                tabAchats: "🧾 المشتريات",
                uploadAchat: "رفع فاتورة",
                supplier: "المورد",
                file: "الملف",
                noAchats: "لا توجد مشتريات",
                uploadDesc: "ارفع فاتورة مورد للبدء",
                achatsInDB: "المشتريات",
                totalAchats: "إجمالي المشتريات (دت)",
                achatByMonth: "📉 المشتريات الشهرية",
                venteVsAchat: "📊 المبيعات vs المشتريات",
                viewAchat: "عرض الشراء",
                editAchat: "تعديل الشراء",
                achatSaved: "تم حفظ الشراء!",
                achatDeleted: "تم حذف الشراء",
                achatUpdated: "تم تعديل الشراء!",
                enterSupplier: "أدخل اسم المورد",
                enterAmount: "أدخل المبلغ",
                uploadSuccess: "تم رفع الملف بنجاح!",
                chatCreateInvoice: "إنشاء فاتورة تفاعلية",
                chatUploadAchat: "رفع فاتورة شراء",
                chatInvoiceCreated: "تم إنشاء الفاتورة بنجاح!",
                chatInvoicePDF: "إليك الـ PDF:",
                chatEnterClient: "ما اسم الزبون؟",
                chatEnterAmount: "ما المبلغ الإجمالي؟",
                chatEnterDesc: "وصف المنتجات (مفصولة بفاصلة):",
                chatConfirm: "تأكيد الإنشاء؟",
                chatYes: "نعم",
                chatNo: "لا",
                chatCancelled: "تم إلغاء الإنشاء",
                chatFileUploaded: "تم رفع الملف وحفظه في المشتريات!",
                chatSearchPrompt: "يرجى كتابة كلمة البحث (معرّف ID، اسم، رقم الفاتورة أو رقم الشراء) ثم الضغط على 🔍.",
                chatSearchResults: "نتائج البحث عن",
                chatSearchTitle: "البحث عن فاتورة أو شراء",
                chatSearchNoResult: "لم يتم العثور على نتائج لـ",
                chatSearchInvoiceHeader: "💰 فواتير المبيعات الموجودة",
                chatSearchAchatHeader: "🧾 فواتير المشتريات الموجودة",
                notifOverdue: "الفاتورة <strong>{num}</strong> ({client}) تعدّى تاريخ خلاصها بـ {days} يوم!",
                notifDue3: "تذكير: الفاتورة <strong>{num}</strong> ({client}) موعد خلاصها {when} ({date})",
                notifWhenToday: "اليوم",
                notifWhenTomorrow: "غدوة",
                notifWhenInDays: "فـ {days} أيام"
            },
            en: {
                appName: "FacturePro", appSubtitle: "🌐 Invoice & Purchase Manager",
                assistant: "Pro Assistant", print: "Print",
                tabCreate: "📝 Create Invoice", tabList: "📋 My Invoices", tabAchats: "🧾 Purchases", tabDashboard: "📊 Dashboard",
                yourCompany: "🏢 Your Company", companyName: "Company Name",
                email: "Email", phone: "Phone", address: "Address", taxId: "Tax ID",
                clientInfo: "👤 Client Information", clientName: "Client Name",
                billingAddress: "Billing Address", invoiceDetails: "📄 Invoice Details",
                invoiceNum: "Invoice #", issueDate: "Issue Date", dueDate: "Due Date",
                item: "Item", price: "Price (DT)", qty: "Qty", total: "Total", addItem: "Add Item",
                subtotal: "Subtotal", discount: "Discount", grandTotal: "Grand Total", notes: "Notes / Terms",
                livePreview: "Live Preview", updated: "Updated", invoiceWord: "INVOICE",
                dateLabel: "Date:", dueLabel: "Due:", from: "From", billTo: "Bill To",
                desc: "Description", unitPrice: "Unit Price", amount: "Amount",
                notesConditions: "Notes & Conditions", thankYou: "Thank you for your business!",
                downloadPDF: "Download PDF", saveSQL: "Save", reset: "Reset",
                myInvoices: "📋 My Invoices", newInvoice: "New", search: "Search...",
                status: "Status", actions: "Actions", paid: "Paid", pending: "Pending", overdue: "Overdue",
                sqlDashboard: "📊 Dashboard", refresh: "Refresh",
                invoicesInDB: "Invoices", totalRevenue: "Total Revenue (DT)",
                paidInvoices: "Paid", pendingInvoices: "Pending",
                noData: "No Data", clickRefresh: "Click Refresh to load data",
                assistantPro: "Pro Assistant", online: "Online",
                chatWelcome: "Hi! 👋", chatConnected: "How can I help you? Try:",
                editInvoice: "✏️ Edit Invoice", cancel: "Cancel", save: "Save",
                invoiceSaved: "Invoice saved!", invoiceDeleted: "Invoice deleted", invoiceUpdated: "Invoice updated!",
                formReset: "Form reset", enterClient: "Please enter client name",
                notFound: "No invoice found", availableInvoices: "Available invoices",
                totalSales: "Total Sales", invoices: "Invoices", clients: "Clients",
                allInvoices: "All invoices", noInvoices: "No invoices", clientsOverdue: "Overdue clients",
                helpText: "Available commands", searchByNum: "Search by number", searchByClient: "Search by client",
                viewList: "View list", createNew: "Create new invoice", openForm: "Open form",
                pdfGenerated: "PDF generated!", pdfDownloaded: "PDF downloaded:",
                viewInvoice: "👁️ View Invoice", close: "Close",
                revenueByMonth: "📈 Revenue by Month", statusDistribution: "📊 Status Distribution",
                topClients: "🏆 Top Clients", monthlyTrend: "📉 Monthly Trend",
                allPaid: "All invoices are paid!",
                totalPending: "Total pending",
                noOverdue: "No overdue invoices",
                overdueInvoices: "Overdue invoices",
                totalOverdue: "Total overdue",
                noPaid: "No paid invoices",
                totalPaid: "Total paid",
                viewDetails: "View Details",
                products: "Products",
                breakdown: "Breakdown",
                invoiceDetails: "Invoice Details",
                filterYear: "Year", filterMonth: "Month", filterDay: "Day", filterAll: "All", clearFilters: "Clear",
                analysisTitle: "Global Analysis",
                avgInvoice: "Average/invoice",
                topClient: "Top client",
                healthScore: "Financial Health",
                delete: "Delete",
                duplicateInvoice: "❌ This number was already used or deleted — invoice numbers cannot be reused",
                tabAchats: "🧾 Purchases",
                uploadAchat: "Upload Invoice",
                supplier: "Supplier",
                file: "File",
                noAchats: "No purchases",
                uploadDesc: "Upload a supplier invoice to get started",
                achatsInDB: "Purchases",
                totalAchats: "Total Purchases (DT)",
                achatByMonth: "📉 Purchases by Month",
                venteVsAchat: "📊 Sales vs Purchases",
                viewAchat: "View Purchase",
                editAchat: "Edit Purchase",
                achatSaved: "Purchase saved!",
                achatDeleted: "Purchase deleted",
                achatUpdated: "Purchase updated!",
                enterSupplier: "Please enter supplier name",
                enterAmount: "Please enter amount",
                uploadSuccess: "File uploaded successfully!",
                chatCreateInvoice: "Create invoice interactively",
                chatUploadAchat: "Upload purchase invoice",
                chatInvoiceCreated: "Invoice created successfully!",
                chatInvoicePDF: "Here is your PDF:",
                chatEnterClient: "What is the client name?",
                chatEnterAmount: "What is the total amount?",
                chatEnterDesc: "Items description (comma separated):",
                chatConfirm: "Confirm creation?",
                chatYes: "Yes",
                chatNo: "No",
                chatCancelled: "Creation cancelled",
                chatFileUploaded: "File uploaded and saved to Purchases!",
                chatSearchPrompt: "Please enter a search term (ID, name, invoice # or purchase #) then click 🔍.",
                chatSearchResults: "Search results for",
                chatSearchTitle: "Search Invoice or Purchase",
                chatSearchNoResult: "No results found for",
                chatSearchInvoiceHeader: "💰 Sales Invoices found",
                chatSearchAchatHeader: "🧾 Supplier Purchases found",
                notifOverdue: "Invoice <strong>{num}</strong> ({client}) is {days} day(s) overdue!",
                notifDue3: "Reminder: Invoice <strong>{num}</strong> ({client}) is due {when} ({date})",
                notifWhenToday: "today",
                notifWhenTomorrow: "tomorrow",
                notifWhenInDays: "in {days} days"
            }
        };

        let currentLang = localStorage.getItem('fp_lang') || 'fr';
        let chatContext = 'general'; // general, vente, achat, create
        let chatCreateState = null; // { step: 0, data: {} }
        let aiEnabled = localStorage.getItem('fp_ai_enabled') !== 'false'; // Claude ON par défaut
        let aiSuccessCount = 0;
        let aiLocalCount = 0;

        // ── تجديد يومي في منتصف الليل ──
        (function dailyReset() {
            const today = new Date().toISOString().slice(0, 10);
            if (localStorage.getItem('fp_ai_day') !== today) {
                localStorage.setItem('fp_ai_day', today);
                localStorage.setItem('fp_ai_success', '0');
                localStorage.setItem('fp_ai_local', '0');
            }
            aiSuccessCount = parseInt(localStorage.getItem('fp_ai_success') || '0', 10);
            aiLocalCount  = parseInt(localStorage.getItem('fp_ai_local')   || '0', 10);
        })();

        function setLang(lang) {
            currentLang = lang;
            localStorage.setItem('fp_lang', lang);
            document.documentElement.lang = lang;
            document.body.dir = lang === 'ar' ? 'rtl' : 'ltr';
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
            event.target.classList.add('active');
            applyTranslations();
            renderInvoiceList();
            renderAchatList();
            loadDashboard();
            updatePreview();
        }

        function t(key) {
            return i18n[currentLang]?.[key] || i18n['fr'][key] || key;
        }

        // ترجمة مع تعويض متغيرات: tf('notifOverdue', { num: '001', client: 'Ali', days: 3 })
        function tf(key, vars) {
            let str = t(key);
            Object.keys(vars || {}).forEach(k => {
                str = str.replaceAll('{' + k + '}', vars[k]);
            });
            return str;
        }

        function applyTranslations() {
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                if (i18n[currentLang]?.[key]) el.textContent = i18n[currentLang][key];
            });
            document.getElementById('btnDownloadPDF').textContent = '📄 ' + t('downloadPDF');
            document.getElementById('btnSaveSQL').textContent = '💾 ' + t('saveSQL');
            document.getElementById('btnReset').textContent = '🔄 ' + t('reset');
            document.getElementById('searchInvoices').placeholder = t('search');
            document.getElementById('searchAchats').placeholder = t('search');
            document.getElementById('chatInput').placeholder = currentLang === 'ar' ? 'اكتب رسالتك...' : currentLang === 'en' ? 'Type your message...' : 'Écrivez votre message...';
            document.getElementById('filterYear').placeholder = t('filterYear');
            document.getElementById('filterMonth').placeholder = t('filterMonth');
            document.getElementById('filterDay').placeholder = t('filterDay');
        }
