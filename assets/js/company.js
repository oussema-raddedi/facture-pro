        // ===================== COMPANY INFO (Auto-save) =====================
        function saveCompanyInfo() {
            const info = {
                name: document.getElementById('compName').value,
                email: document.getElementById('compEmail').value,
                phone: document.getElementById('compPhone').value,
                address: document.getElementById('compAddress').value,
                mf: document.getElementById('compMF').value,
                logo: currentLogo || null
            };
            localStorage.setItem('fp_company', JSON.stringify(info));
        }

        function loadCompanyInfo() {
            const info = JSON.parse(localStorage.getItem('fp_company') || '{}');
            if (info.name) document.getElementById('compName').value = info.name;
            if (info.email) document.getElementById('compEmail').value = info.email;
            if (info.phone) document.getElementById('compPhone').value = info.phone;
            if (info.address) document.getElementById('compAddress').value = info.address;
            if (info.mf) document.getElementById('compMF').value = info.mf;
            if (info.logo) {
                currentLogo = info.logo;
                document.getElementById('logoPreview').innerHTML = `<img src="${info.logo}" style="max-width:80px;max-height:80px;">`;
                document.getElementById('previewLogo').innerHTML = `<img src="${info.logo}" style="max-width:50px;max-height:50px;border-radius:8px;">`;
            }
        }
