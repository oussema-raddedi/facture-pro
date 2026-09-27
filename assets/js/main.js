        // ===================== INIT =====================
        async function bootApp() {
            await DB.init();
            applyTranslations();
            updateAiPanel();
            document.getElementById('invNum').value = DB.getNextInvoiceNumero();
            updatePreview();
            renderInvoiceList();
            renderAchatList();
            loadDashboard();
            setTimeout(checkDueDateNotifications, 1200);
            setInterval(checkDueDateNotifications, 60 * 60 * 1000);
        }

        bootApp();

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.getElementById('chatbotWindow').classList.remove('active');
                document.getElementById('chatSearchModal')?.classList.remove('active');
                closeModal();
                closeViewModal();
                closeAchatViewModal();
                closeAchatEditModal();
            }
        });
