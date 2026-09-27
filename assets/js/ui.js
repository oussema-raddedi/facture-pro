        // ===================== CONFIRM MODAL =====================
        window._confirmCallback = null;
        function showConfirmModal(title, msg, callback) {
            window._confirmCallback = callback;
            document.getElementById('confirmModalTitle').innerHTML = title;
            document.getElementById('confirmModalMsg').textContent = msg;
            document.getElementById('confirmModal').classList.add('active');
        }
        function closeConfirmModal() {
            document.getElementById('confirmModal').classList.remove('active');
        }
        function execConfirmModal() {
            document.getElementById('confirmModal').classList.remove('active');
            if (typeof window._confirmCallback === 'function') {
                window._confirmCallback();
            }
            window._confirmCallback = null;
        }

        // ===================== THEME =====================
        function toggleTheme() {
            document.body.classList.toggle('dark');
            localStorage.setItem('fp_dark', document.body.classList.contains('dark'));
        }
        if (localStorage.getItem('fp_dark') === 'true') document.body.classList.add('dark');

        // ===================== UI HELPERS =====================
        function showToast(message, type = 'success') {
            const container = document.getElementById('toastContainer');
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            toast.innerHTML = (type === 'success' ? '✅ ' : type === 'error' ? '❌ ' : type === 'warning' ? '⏰ ' : 'ℹ️ ') + message;
            container.appendChild(toast);
            setTimeout(() => toast.remove(), 6000);
        }

        // Toast ما تختفيش وحدها — تبقى حتى المستخدم يسكرها بزر ✕
        function showPersistentToast(message, type, onClose) {
            const container = document.getElementById('toastContainer');
            const toast = document.createElement('div');
            toast.className = `toast ${type} toast-persistent`;
            const icon = type === 'success' ? '✅ ' : type === 'error' ? '❌ ' : type === 'warning' ? '⏰ ' : 'ℹ️ ';
            toast.innerHTML = `<span style="flex:1;">${icon}${message}</span><span class="toast-close" role="button" aria-label="close">✕</span>`;
            toast.querySelector('.toast-close').addEventListener('click', () => {
                toast.remove();
                if (onClose) onClose();
            });
            container.appendChild(toast);
        }

        function switchTab(tab) {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            event.target.classList.add('active');
            document.getElementById('tab-' + tab).classList.add('active');
            if (tab === 'list') renderInvoiceList();
            if (tab === 'achats') renderAchatList();
            if (tab === 'dashboard') loadDashboard();
        }

        function formatDate(dateStr) {
            if (!dateStr) return '--/--/----';
            const d = new Date(dateStr);
            return d.toLocaleDateString(currentLang === 'en' ? 'en-US' : 'fr-FR');
        }

        function formatMoney(num) {
            return num.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' DT';
        }
