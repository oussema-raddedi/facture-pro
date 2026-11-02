        function buildInvoiceSummary(inv) {
            const invoiceItems = Array.isArray(inv.items) ? inv.items : [];
            const subtotal = invoiceItems.reduce((sum, item) => {
                const price = Number(item.price) || 0;
                const qty = Number(item.qty) || 1;
                return sum + (price * qty);
            }, 0);
            const remiseAmount = subtotal * ((Number(inv.remise) || 0) / 100);
            const afterRemise = subtotal - remiseAmount;
            const tvaAmount = afterRemise * ((Number(inv.tva) || 0) / 100);
            const grandTotal = afterRemise + tvaAmount;
            const productsLine = invoiceItems.length
                ? invoiceItems.map(item => {
                    const price = Number(item.price) || 0;
                    const qty = Number(item.qty) || 1;
                    const desc = item.desc || t('desc');
                    return `- ${desc} : ${qty} x ${formatMoney(price)} = ${formatMoney(price * qty)}`;
                }).join('\n')
                : '- Aucun article';

            return { subtotal, remiseAmount, tvaAmount, grandTotal, productsLine };
        }

        function sendInvoicePaymentEmail(inv) {
            const invoice = inv || DB.getInvoiceById(currentViewId);
            if (!invoice) return;

            const email = (invoice.clientEmail || '').trim();
            if (!email) {
                showToast('Aucun email client pour cette facture.', 'warning');
                return;
            }

            const summary = buildInvoiceSummary(invoice);
            const statusText = invoice.status === 'paid' ? 'payée' : invoice.status === 'pending' ? 'en attente' : 'en retard';
            const subject = `Facture ${invoice.numero} - ${statusText}`;
            const body = [
                `Bonjour ${invoice.clientName || 'Client'},`,
                '',
                `Votre facture ${invoice.numero} est ${statusText}.`,
                `Nom client : ${invoice.clientName || '-'}`,
                `Numéro facture : ${invoice.numero}`,
                `Date d'émission : ${invoice.date || '-'}`,
                `Date d'échéance : ${invoice.due || '-'}`,
                `Montant total : ${formatMoney(summary.grandTotal)}`,
                `TVA : ${formatMoney(summary.tvaAmount)}`,
                `Remise : ${formatMoney(summary.remiseAmount)}`,
                '',
                'Produits :',
                summary.productsLine,
                '',
                'Merci pour votre confiance.',
                'Cordialement.'
            ].join('\n');

            const mailUrl = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            window.location.href = mailUrl;
            showToast('Email préparé pour le client.', 'success');
        }

        function sendInvoiceEmailFromView() {
            if (!currentViewId) return;
            const invoice = DB.getInvoiceById(currentViewId);
            if (!invoice) return;
            sendInvoicePaymentEmail(invoice);
        }
