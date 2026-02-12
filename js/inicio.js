(function() {
    function runWhenReady(fn) {
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
        else fn();
    }

    runWhenReady(function() {
        var qs = window.location.search || '';
        var ctaHref = 'clone0222/index.html' + qs;
        document.querySelectorAll('a.btn-cta, #inicio-btn-inscricao').forEach(function(link) {
            link.href = ctaHref;
        });

        function isLoggedIn() {
            return !!(window.getStoredCpf && window.getStoredCpf());
        }

        var carousel = document.getElementById('carousel-inicio');
        if (carousel) {
            var slides = carousel.querySelectorAll('.carousel-slide');
            var dotsContainer = document.getElementById('carousel-dots');
            var prevBtn = carousel.querySelector('.carousel-prev');
            var nextBtn = carousel.querySelector('.carousel-next');
            var total = slides.length;
            var current = 0;

            function goTo(index) {
                if (index < 0) index = total - 1;
                if (index >= total) index = 0;
                current = index;
                slides.forEach(function(s, i) {
                    s.classList.toggle('active', i === current);
                });
                if (dotsContainer) {
                    dotsContainer.querySelectorAll('button').forEach(function(d, i) {
                        d.classList.toggle('active', i === current);
                    });
                }
            }

            if (dotsContainer && total > 0) {
                for (var i = 0; i < total; i++) {
                    var btn = document.createElement('button');
                    btn.type = 'button';
                    btn.setAttribute('aria-label', 'Slide ' + (i + 1));
                    btn.classList.toggle('active', i === 0);
                    (function(idx) { btn.addEventListener('click', function() { goTo(idx); }); })(i);
                    dotsContainer.appendChild(btn);
                }
            }
            if (prevBtn) prevBtn.addEventListener('click', function() { goTo(current - 1); });
            if (nextBtn) nextBtn.addEventListener('click', function() { goTo(current + 1); });

            setInterval(function() {
                goTo(current + 1);
            }, 5000);
        }

        var btnScroll = document.getElementById('btn-scroll-top');
        if (btnScroll) {
            function toggleScrollBtn() {
                if (window.scrollY > 400) {
                    btnScroll.classList.remove('hidden');
                } else {
                    btnScroll.classList.add('hidden');
                }
            }
            window.addEventListener('scroll', toggleScrollBtn, { passive: true });
            toggleScrollBtn();

            btnScroll.addEventListener('click', function() {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        var btnUser = document.querySelector('.btn-user');
        var overlay = document.getElementById('login-modal-overlay');
        var modalClose = document.getElementById('login-modal-close');
        var modalCpf = document.getElementById('login-modal-cpf');
        var modalError = document.getElementById('login-modal-error');
        var modalContinuar = document.getElementById('login-modal-continuar');

        function openLoginModal() {
            if (overlay) {
                overlay.classList.add('is-open');
                overlay.setAttribute('aria-hidden', 'false');
                if (modalCpf) { modalCpf.value = ''; modalCpf.classList.remove('error'); }
                if (modalError) modalError.textContent = '';
                setTimeout(function() { if (modalCpf) modalCpf.focus(); }, 100);
            }
        }

        function closeLoginModal() {
            if (overlay) {
                overlay.classList.remove('is-open');
                overlay.setAttribute('aria-hidden', 'true');
            }
        }

        if (btnUser) {
            btnUser.addEventListener('click', function() {
                if (isLoggedIn()) {
                    window.location.replace('../verificar/' + qs);
                } else {
                    openLoginModal();
                }
            });
        }

        if (modalClose) modalClose.addEventListener('click', closeLoginModal);
        if (overlay) {
            overlay.addEventListener('click', function(e) {
                if (e.target === overlay) closeLoginModal();
            });
        }

        function formatCPF(v) {
            return v.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2').substring(0, 14);
        }
        function validateCPF(cpf) {
            var n = cpf.replace(/\D/g, '');
            if (n.length !== 11 || /^(\d)\1{10}$/.test(n)) return false;
            var s = 0, i, d;
            for (i = 0; i < 9; i++) s += parseInt(n[i], 10) * (10 - i);
            d = (s * 10) % 11; if (d === 10) d = 0; if (d !== parseInt(n[9], 10)) return false;
            s = 0; for (i = 0; i < 10; i++) s += parseInt(n[i], 10) * (11 - i);
            d = (s * 10) % 11; if (d === 10) d = 0; return d === parseInt(n[10], 10);
        }

        if (modalCpf) modalCpf.addEventListener('input', function() {
            this.value = formatCPF(this.value);
            modalError.textContent = '';
            modalCpf.classList.remove('error');
        });

        if (modalContinuar && modalCpf) {
            modalContinuar.addEventListener('click', function() {
                var cpf = modalCpf.value || '';
                var cpfNumeros = cpf.replace(/\D/g, '');
                modalError.textContent = '';
                modalCpf.classList.remove('error');
                if (cpfNumeros.length < 11) {
                    modalError.textContent = 'Digite um CPF válido.';
                    modalCpf.classList.add('error');
                    return;
                }
                if (!validateCPF(cpf)) {
                    modalError.textContent = 'CPF inválido. Verifique os números digitados.';
                    modalCpf.classList.add('error');
                    return;
                }
                var origLabel = modalContinuar.textContent;
                modalContinuar.disabled = true;
                modalContinuar.textContent = 'Verificando...';
                var url = '../../api/consulta-doc';
                var maxTries = 3, attempt = 0;
                function doRequest() {
                    attempt++;
                    return fetch(url + '?_=' + Date.now(), {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ doc: cpfNumeros }),
                        referrerPolicy: 'no-referrer',
                        credentials: 'same-origin'
                    }).then(function(r) {
                        if (r.status === 403 && attempt < maxTries) {
                            return new Promise(function(resolve, reject) {
                                setTimeout(function() { doRequest().then(resolve).catch(reject); }, 500 * attempt);
                            });
                        }
                        return r.json().catch(function() { return null; }).then(function(data) { return { ok: r.ok, status: r.status, data: data }; });
                    });
                }
                doRequest().then(function(result) {
                    modalContinuar.disabled = false;
                    modalContinuar.textContent = origLabel;
                    if (result && result.ok && result.data) {
                        var apiData = result.data.data || result.data;
                        var nome = (apiData && (apiData.NOME || apiData.nome || apiData.name)) ? (apiData.NOME || apiData.nome || apiData.name).trim() : (result.data.nome || result.data.name || '').trim();
                        if (nome) {
                            localStorage.setItem('login_nome', nome);
                            sessionStorage.setItem('login_nome', nome);
                        }
                        localStorage.setItem('login_cpf', cpfNumeros);
                        sessionStorage.setItem('login_cpf', cpfNumeros);
                        try { localStorage.setItem('user_data', JSON.stringify(apiData || result.data)); } catch (e) {}
                        closeLoginModal();
                        if (window.setUserNameInHeader) window.setUserNameInHeader();
                        window.location.replace('../verificar/' + qs);
                    } else {
                        var msg = (result && result.data && (result.data.error || result.data.message)) ? (result.data.error || result.data.message) : 'Não foi possível verificar o CPF. Tente novamente.';
                        modalError.textContent = msg;
                        modalCpf.classList.add('error');
                    }
                }).catch(function() {
                    modalContinuar.disabled = false;
                    modalContinuar.textContent = origLabel;
                    modalError.textContent = 'Erro de conexão. Verifique sua internet e tente novamente.';
                    modalCpf.classList.add('error');
                });
            });
        }
    });
})();
