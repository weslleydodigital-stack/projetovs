(function() {
    function runWhenReady(fn) {
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
        else fn();
    }
    runWhenReady(function() {
        var userNameEl = document.getElementById('user-name');
        var userCpfEl = document.getElementById('user-cpf');
        var userBirthEl = document.getElementById('user-birth');
        var resultNameEl = document.getElementById('result-name');
        var resultCpfEl = document.getElementById('result-cpf');
        var loadingPhase = document.getElementById('loading-phase');
        var resultPhase = document.getElementById('result-phase');
        var statesList = document.getElementById('states-list');

        var nome = typeof window.getStoredNome === 'function' ? window.getStoredNome() : '';
        var cpf = typeof window.getStoredCpf === 'function' ? window.getStoredCpf() : '';
        var cpfFormatted = cpf.length === 11 ? cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : cpf || '—';
        var userData = null;
        try { userData = JSON.parse(localStorage.getItem('user_data') || 'null'); } catch (e) {}
        var nasc = (userData && (userData.NASC || userData.nasc || '')) || '22/04/1975';

        if (userNameEl) userNameEl.textContent = nome || '—';
        if (userCpfEl) userCpfEl.textContent = cpfFormatted !== '—' ? cpfFormatted : '—';
        if (userBirthEl) userBirthEl.textContent = nasc || '—';
        if (resultNameEl) resultNameEl.textContent = nome || '—';
        if (resultCpfEl) resultCpfEl.textContent = cpfFormatted !== '—' ? cpfFormatted : '—';

        var states = [
            { name: 'Acre', vagas: 8 },
            { name: 'Alagoas', vagas: 12 },
            { name: 'Amapá', vagas: 6 },
            { name: 'Amazonas', vagas: 10 },
            { name: 'Bahia', vagas: 24 },
            { name: 'Ceará', vagas: 18 },
            { name: 'Distrito Federal', vagas: 14 },
            { name: 'Espírito Santo', vagas: 12 },
            { name: 'Goiás', vagas: 16 },
            { name: 'Maranhão', vagas: 14 },
            { name: 'Mato Grosso', vagas: 10 },
            { name: 'Mato Grosso do Sul', vagas: 8 },
            { name: 'Minas Gerais', vagas: 28 },
            { name: 'Pará', vagas: 16 },
            { name: 'Paraíba', vagas: 10 },
            { name: 'Paraná', vagas: 22 },
            { name: 'Pernambuco', vagas: 18 },
            { name: 'Piauí', vagas: 10 },
            { name: 'Rio de Janeiro', vagas: 26 },
            { name: 'Rio Grande do Norte', vagas: 10 },
            { name: 'Rio Grande do Sul', vagas: 20 },
            { name: 'Rondônia', vagas: 6 },
            { name: 'Roraima', vagas: 4 },
            { name: 'Santa Catarina', vagas: 16 },
            { name: 'São Paulo', vagas: 36 },
            { name: 'Sergipe', vagas: 8 },
            { name: 'Tocantins', vagas: 10 }
        ];

        if (statesList) {
            states.forEach(function(s) {
                var item = document.createElement('div');
                item.className = 'state-item';
                var link = document.createElement('a');
                link.href = '../chat/index.html?estado=' + encodeURIComponent(s.name) + (window.location.search ? '&' + window.location.search.slice(1) : '');
                link.className = 'btn-iniciar';
                link.textContent = 'Iniciar Processo';
                link.addEventListener('click', function() {
                    try { localStorage.setItem('chat_estado', s.name); } catch (e) {}
                });
                item.innerHTML = '<div class="state-info"><span class="state-name">DETRAN ' + s.name + '</span><span class="state-vagas">' + s.vagas + ' vagas</span></div>';
                item.appendChild(link);
                statesList.appendChild(item);
            });
        }

        var steps = document.querySelectorAll('.verification-item[data-step]');
        var stepIndex = 0;
        function completeNext() {
            if (stepIndex < steps.length) {
                steps[stepIndex].classList.remove('pending');
                steps[stepIndex].classList.add('completed');
                steps[stepIndex].querySelector('.verification-icon').classList.remove('loading');
                steps[stepIndex].querySelector('.verification-icon').innerHTML = '<i class="fas fa-check"></i>';
                steps[stepIndex].querySelector('.verification-icon').classList.remove('dots-loader');
                stepIndex++;
                if (stepIndex < steps.length) {
                    var iconEl = steps[stepIndex].querySelector('.verification-icon');
                    iconEl.classList.add('loading', 'dots-loader');
                    iconEl.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="dot"></span>';
                    setTimeout(completeNext, 2400);
                } else {
                    setTimeout(showResult, 1000);
                }
            }
        }
        function showResult() {
            if (loadingPhase) loadingPhase.classList.add('hidden');
            if (resultPhase) resultPhase.classList.remove('hidden');
        }
        setTimeout(function() {
            if (steps.length) {
                var iconEl = steps[0].querySelector('.verification-icon');
                iconEl.classList.add('loading', 'dots-loader');
                iconEl.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="dot"></span>';
            }
            setTimeout(completeNext, 2800);
        }, 1200);
    });
})();
