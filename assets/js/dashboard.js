        // ===================== DASHBOARD =====================
        let revenueChartInstance = null;
        let statusChartInstance = null;
        let trendChartInstance = null;
        let achatChartInstance = null;
        let compareChartInstance = null;

        function getFilteredInvoices() {
            let invoices = DB.getAllInvoices();
            const year = document.getElementById('filterYear')?.value;
            const month = document.getElementById('filterMonth')?.value;
            const day = document.getElementById('filterDay')?.value;
            if (year) invoices = invoices.filter(i => i.date && i.date.startsWith(String(year)));
            if (month) {
                const mStr = String(month).padStart(2, '0');
                invoices = invoices.filter(i => i.date && i.date.substring(5, 7) === mStr);
            }
            if (day) {
                const dStr = String(day).padStart(2, '0');
                invoices = invoices.filter(i => i.date && i.date.substring(8, 10) === dStr);
            }
            return invoices;
        }

        function getFilteredAchats() {
            let achats = DB.getAllAchats();
            const year = document.getElementById('filterYear')?.value;
            const month = document.getElementById('filterMonth')?.value;
            const day = document.getElementById('filterDay')?.value;
            if (year) achats = achats.filter(a => a.date && a.date.startsWith(String(year)));
            if (month) {
                const mStr = String(month).padStart(2, '0');
                achats = achats.filter(a => a.date && a.date.substring(5, 7) === mStr);
            }
            if (day) {
                const dStr = String(day).padStart(2, '0');
                achats = achats.filter(a => a.date && a.date.substring(8, 10) === dStr);
            }
            return achats;
        }

        function clearDashFilters() {
            document.getElementById('filterYear').value = '';
            document.getElementById('filterMonth').value = '';
            document.getElementById('filterDay').value = '';
            loadDashboard();
        }

        function loadDashboard() {
            const invoices = getFilteredInvoices();
            const achats = getFilteredAchats();
            const total = invoices.reduce((s, i) => s + (i.total || 0), 0);
            const achatTotal = achats.reduce((s, a) => s + (a.amount || 0), 0);

            document.getElementById('dashCount').textContent = invoices.length;
            document.getElementById('dashTotal').textContent = formatMoney(total);
            document.getElementById('dashPaid').textContent = invoices.filter(i => i.status === 'paid').length;
            document.getElementById('dashPending').textContent = invoices.filter(i => i.status === 'pending').length;
            document.getElementById('dashAchatCount').textContent = achats.length;
            document.getElementById('dashAchatTotal').textContent = formatMoney(achatTotal);

            const tbody = document.getElementById('dashTableBody');
            if (invoices.length === 0) { 
                document.getElementById('dashEmpty').style.display = 'block'; 
                tbody.innerHTML = ''; 
                return; 
            }
            document.getElementById('dashEmpty').style.display = 'none';
            tbody.innerHTML = invoices.slice(0, 10).map(inv => `<tr><td>${inv.numero}</td><td>${inv.clientName}</td><td>${formatDate(inv.date)}</td><td><strong>${formatMoney(inv.total)}</strong></td><td><button class="btn btn-primary btn-sm" onclick="viewInvoice(${inv.id})">👁️</button> <button class="btn btn-warning btn-sm" onclick="editInvoice(${inv.id})">✏️</button> <button class="btn btn-danger btn-sm" onclick="deleteInvoice(${inv.id})">🗑️</button></td></tr>`).join('');

            // Revenue by month
            const monthData = {};
            invoices.forEach(inv => {
                if (!inv.date) return;
                const month = inv.date.substring(0, 7);
                monthData[month] = (monthData[month] || 0) + (inv.total || 0);
            });
            const sortedMonths = Object.keys(monthData).sort();
            const revenueValues = sortedMonths.map(m => monthData[m]);

            // Achat by month
            const achatMonthData = {};
            achats.forEach(a => {
                if (!a.date) return;
                const month = a.date.substring(0, 7);
                achatMonthData[month] = (achatMonthData[month] || 0) + (a.amount || 0);
            });
            const sortedAchatMonths = Object.keys(achatMonthData).sort();
            const achatValues = sortedAchatMonths.map(m => achatMonthData[m]);

            // Status distribution
            const statusCounts = { paid: 0, pending: 0, overdue: 0 };
            invoices.forEach(inv => { if (statusCounts[inv.status] !== undefined) statusCounts[inv.status]++; });

            // Top clients
            const clientStats = {};
            invoices.forEach(inv => {
                if (!clientStats[inv.clientName]) {
                    clientStats[inv.clientName] = { name: inv.clientName, count: 0, total: 0 };
                }
                clientStats[inv.clientName].count++;
                clientStats[inv.clientName].total += (inv.total || 0);
            });
            const topClients = Object.values(clientStats).sort((a, b) => b.total - a.total).slice(0, 5);
            const topClientsBody = document.getElementById('topClientsBody');
            topClientsBody.innerHTML = topClients.map((c, idx) => {
                const pct = total > 0 ? ((c.total / total) * 100).toFixed(1) : 0;
                return `<tr><td><strong>#${idx + 1}</strong></td><td>${c.name}</td><td>${c.count}</td><td><strong>${formatMoney(c.total)}</strong></td><td><div style="background: var(--bg); border-radius: 10px; overflow: hidden; height: 8px;"><div style="width: ${pct}%; background: var(--primary); height: 100%;"></div></div> ${pct}%</td></tr>`;
            }).join('');

            // Monthly trend
            const now = new Date();
            const trendMonths = [];
            const trendRevenue = [];
            const trendCount = [];
            const trendAchats = [];
            const yearFilter = document.getElementById('filterYear')?.value;
            const monthFilter = document.getElementById('filterMonth')?.value;

            if (yearFilter && monthFilter) {
                const key = `${yearFilter}-${monthFilter}`;
                trendMonths.push(new Date(yearFilter, parseInt(monthFilter)-1, 1).toLocaleDateString(currentLang === 'en' ? 'en-US' : 'fr-FR', { month: 'short', year: '2-digit' }));
                trendRevenue.push(monthData[key] || 0);
                trendCount.push(invoices.filter(inv => inv.date && inv.date.startsWith(key)).length);
                trendAchats.push(achatMonthData[key] || 0);
            } else if (yearFilter) {
                for (let m = 1; m <= 12; m++) {
                    const key = `${yearFilter}-${String(m).padStart(2, '0')}`;
                    trendMonths.push(new Date(yearFilter, m-1, 1).toLocaleDateString(currentLang === 'en' ? 'en-US' : 'fr-FR', { month: 'short' }));
                    trendRevenue.push(monthData[key] || 0);
                    trendCount.push(invoices.filter(inv => inv.date && inv.date.startsWith(key)).length);
                    trendAchats.push(achatMonthData[key] || 0);
                }
            } else {
                for (let i = 5; i >= 0; i--) {
                    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                    const key = d.toISOString().substring(0, 7);
                    trendMonths.push(d.toLocaleDateString(currentLang === 'en' ? 'en-US' : 'fr-FR', { month: 'short', year: '2-digit' }));
                    trendRevenue.push(monthData[key] || 0);
                    trendCount.push(invoices.filter(inv => inv.date && inv.date.startsWith(key)).length);
                    trendAchats.push(achatMonthData[key] || 0);
                }
            }

            renderCharts(sortedMonths, revenueValues, statusCounts, trendMonths, trendRevenue, trendCount, sortedAchatMonths, achatValues, trendAchats);
        }

        function renderCharts(monthLabels, revenueData, statusData, trendLabels, trendRevenue, trendCount, achatLabels, achatData, trendAchats) {
            const isDark = document.body.classList.contains('dark');
            const textColor = isDark ? '#94a3b8' : '#64748b';
            const gridColor = isDark ? '#334155' : '#e2e8f0';

            // Revenue Bar Chart
            const revCtx = document.getElementById('revenueChart');
            if (revCtx) {
                if (revenueChartInstance) revenueChartInstance.destroy();
                revenueChartInstance = new Chart(revCtx, {
                    type: 'bar',
                    data: {
                        labels: monthLabels.map(m => {
                            const d = new Date(m + '-01');
                            return d.toLocaleDateString(currentLang === 'en' ? 'en-US' : 'fr-FR', { month: 'short', year: '2-digit' });
                        }),
                        datasets: [{ label: t('totalRevenue'), data: revenueData, backgroundColor: 'rgba(99, 102, 241, 0.7)', borderColor: '#6366f1', borderWidth: 1, borderRadius: 6 }]
                    },
                    options: {
                        responsive: true, maintainAspectRatio: false,
                        plugins: { legend: { display: false }, tooltip: { callbacks: { label: function(context) { return formatMoney(context.raw); } } } },
                        scales: { y: { beginAtZero: true, ticks: { color: textColor }, grid: { color: gridColor } }, x: { ticks: { color: textColor }, grid: { display: false } } }
                    }
                });
            }

            // Achat Bar Chart
            const achatCtx = document.getElementById('achatChart');
            if (achatCtx) {
                if (achatChartInstance) achatChartInstance.destroy();
                achatChartInstance = new Chart(achatCtx, {
                    type: 'bar',
                    data: {
                        labels: achatLabels.map(m => {
                            const d = new Date(m + '-01');
                            return d.toLocaleDateString(currentLang === 'en' ? 'en-US' : 'fr-FR', { month: 'short', year: '2-digit' });
                        }),
                        datasets: [{ label: t('totalAchats'), data: achatData, backgroundColor: 'rgba(139, 92, 246, 0.7)', borderColor: '#8b5cf6', borderWidth: 1, borderRadius: 6 }]
                    },
                    options: {
                        responsive: true, maintainAspectRatio: false,
                        plugins: { legend: { display: false }, tooltip: { callbacks: { label: function(context) { return formatMoney(context.raw); } } } },
                        scales: { y: { beginAtZero: true, ticks: { color: textColor }, grid: { color: gridColor } }, x: { ticks: { color: textColor }, grid: { display: false } } }
                    }
                });
            }

            // Status Doughnut Chart
            const statusCtx = document.getElementById('statusChart');
            if (statusCtx) {
                if (statusChartInstance) statusChartInstance.destroy();
                statusChartInstance = new Chart(statusCtx, {
                    type: 'doughnut',
                    data: {
                        labels: [t('paid'), t('pending'), t('overdue')],
                        datasets: [{ data: [statusData.paid, statusData.pending, statusData.overdue], backgroundColor: ['#10b981', '#f59e0b', '#ef4444'], borderWidth: 0 }]
                    },
                    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: textColor, padding: 20 } } } }
                });
            }

            // Vente vs Achat comparison
            const compareCtx = document.getElementById('compareChart');
            if (compareCtx) {
                if (compareChartInstance) compareChartInstance.destroy();
                // Merge all months
                const allMonths = [...new Set([...monthLabels, ...achatLabels])].sort();
                const venteData = allMonths.map(m => monthLabels.includes(m) ? revenueData[monthLabels.indexOf(m)] : 0);
                const achatDataMerged = allMonths.map(m => achatLabels.includes(m) ? achatData[achatLabels.indexOf(m)] : 0);

                compareChartInstance = new Chart(compareCtx, {
                    type: 'bar',
                    data: {
                        labels: allMonths.map(m => {
                            const d = new Date(m + '-01');
                            return d.toLocaleDateString(currentLang === 'en' ? 'en-US' : 'fr-FR', { month: 'short', year: '2-digit' });
                        }),
                        datasets: [
                            { label: t('totalRevenue'), data: venteData, backgroundColor: 'rgba(99, 102, 241, 0.7)', borderColor: '#6366f1', borderWidth: 1, borderRadius: 6 },
                            { label: t('totalAchats'), data: achatDataMerged, backgroundColor: 'rgba(139, 92, 246, 0.7)', borderColor: '#8b5cf6', borderWidth: 1, borderRadius: 6 }
                        ]
                    },
                    options: {
                        responsive: true, maintainAspectRatio: false,
                        plugins: { legend: { position: 'bottom', labels: { color: textColor, padding: 20 } }, tooltip: { callbacks: { label: function(context) { return context.dataset.label + ': ' + formatMoney(context.raw); } } } },
                        scales: { y: { beginAtZero: true, ticks: { color: textColor }, grid: { color: gridColor } }, x: { ticks: { color: textColor }, grid: { display: false } } }
                    }
                });
            }

            // Trend Line Chart
            const trendCtx = document.getElementById('trendChart');
            if (trendCtx) {
                if (trendChartInstance) trendChartInstance.destroy();
                trendChartInstance = new Chart(trendCtx, {
                    type: 'line',
                    data: {
                        labels: trendLabels,
                        datasets: [
                            { label: t('totalRevenue'), data: trendRevenue, borderColor: '#6366f1', backgroundColor: 'rgba(99, 102, 241, 0.1)', fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#6366f1' },
                            { label: t('totalAchats'), data: trendAchats, borderColor: '#8b5cf6', backgroundColor: 'rgba(139, 92, 246, 0.1)', fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#8b5cf6' },
                            { label: t('invoices'), data: trendCount, borderColor: '#10b981', backgroundColor: 'transparent', borderDash: [5, 5], tension: 0.4, pointRadius: 3, yAxisID: 'y1' }
                        ]
                    },
                    options: {
                        responsive: true, maintainAspectRatio: false,
                        interaction: { mode: 'index', intersect: false },
                        plugins: {
                            legend: { position: 'bottom', labels: { color: textColor, padding: 20 } },
                            tooltip: { callbacks: { label: function(context) { if (context.dataset.label === t('totalRevenue') || context.dataset.label === t('totalAchats')) { return context.dataset.label + ': ' + formatMoney(context.raw); } return context.dataset.label + ': ' + context.raw; } } }
                        },
                        scales: {
                            y: { beginAtZero: true, ticks: { color: textColor }, grid: { color: gridColor } },
                            y1: { beginAtZero: true, position: 'right', ticks: { color: textColor }, grid: { display: false } },
                            x: { ticks: { color: textColor }, grid: { display: false } }
                        }
                    }
                });
            }
        }
