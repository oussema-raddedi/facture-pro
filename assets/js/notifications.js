        // ===================== NOTIFICATIONS: échéances =====================
        // ملاحظة: ما نستعملوش localStorage باش نخبيو التنبيه للأبد — كل ما تحل/trecharji الابليكاسيون
        // (ki t7el l'app) تعاود تطلعلك نفس التنبيهات إذا الفاتورة مازالت due/overdue وماهيش مخلصة.
        const activeNotificationFlags = new Set(); // يتفادى تكرار نفس التنبيه فـ نفس الجلسة كي تكون مفتوحة

        function checkDueDateNotifications() {
            const invoices = DB.getAllInvoices();
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            invoices.forEach(inv => {
                // برك الفواتير المتأخرة (en retard) — status = overdue
                if (!inv.due || inv.status !== 'overdue') return;
                const due = new Date(inv.due);
                due.setHours(0, 0, 0, 0);
                const diffDays = Math.round((due - today) / 86400000);
                const daysLate = Math.max(0, Math.abs(diffDays));

                const flagKey = 'overdue:' + inv.id;
                if (!activeNotificationFlags.has(flagKey)) {
                    activeNotificationFlags.add(flagKey);
                    const msg = tf('notifOverdue', { num: inv.numero, client: inv.clientName, days: daysLate });
                    showPersistentToast(msg, 'error', () => activeNotificationFlags.delete(flagKey));
                }
            });
        }
