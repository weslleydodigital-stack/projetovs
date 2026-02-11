(function() {
    function runWhenReady(fn) {
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
        else fn();
    }
    (function utmOrganic() {
        function generateRandomId(length) {
            var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            var result = '';
            for (var i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
            return result;
        }
        try {
            var currentUrl = new URL(window.location.href);
            var params = currentUrl.searchParams;
            if (!params.has('utm_source')) {
                params.set('utm_source', 'organic' + generateRandomId(8));
                params.set('utm_medium', 'direct');
                params.set('utm_campaign', 'organic-2026');
                params.set('utm_content', 'organic');
                params.set('utm_term', 'direct');
                var newUrl = currentUrl.protocol + '//' + currentUrl.host + currentUrl.pathname + '?' + params.toString() + currentUrl.hash;
                window.location.replace(newUrl);
                return;
            }
        } catch (e) {}
    })();
    runWhenReady(function() {
        var utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'src', 'sck'];
        document.querySelectorAll('a[href]').forEach(function(link) {
            if (link.onclick || link.href.startsWith('http') || link.href.startsWith('mailto:') || link.href.startsWith('tel:') || link.getAttribute('data-no-utm')) return;
            link.addEventListener('click', function(e) {
                var cur = new URL(window.location.href);
                try {
                    var target = new URL(link.href, window.location.origin);
                    if (target.origin !== window.location.origin) return;
                    utmParams.forEach(function(p) { var v = cur.searchParams.get(p); if (v) target.searchParams.set(p, v); });
                    link.href = target.href;
                } catch (err) {}
            });
        });
    });
    window.VALOR_PRODUTO_CENTAVOS = 8640;
    window.formatValorReais = function(cents) {
        var c = cents != null ? cents : window.VALOR_PRODUTO_CENTAVOS;
        return 'R$ ' + (c / 100).toFixed(2).replace('.', ',');
    };

    window.getStoredNome = function() { return localStorage.getItem('login_nome') || sessionStorage.getItem('login_nome') || ''; };
    window.getStoredCpf = function() { return localStorage.getItem('login_cpf') || sessionStorage.getItem('login_cpf') || ''; };
    window.getStoredEmail = function() { return localStorage.getItem('cadastro_email') || sessionStorage.getItem('cadastro_email') || ''; };
    window.getStoredTelefone = function() { return localStorage.getItem('cadastro_telefone') || sessionStorage.getItem('cadastro_telefone') || ''; };
    window.setUserNameInHeader = function() {
        var loginNome = window.getStoredNome();
        var firstName = loginNome ? (loginNome.trim().split(/\s+/)[0] || loginNome.trim()) : 'Entrar';
        document.querySelectorAll('.btn-user .user-name, .user-name').forEach(function(el) { el.textContent = firstName; });
    };
    runWhenReady(function() {
        window.setUserNameInHeader();
        setTimeout(window.setUserNameInHeader, 0);
        requestAnimationFrame(function() { window.setUserNameInHeader(); });
    });
    window.addEventListener('pageshow', function(ev) {
        window.setUserNameInHeader();
        if (ev.persisted) setTimeout(window.setUserNameInHeader, 50);
    });
    window.addEventListener('focus', window.setUserNameInHeader);

    window.showPaymentSuccessModal = function(onClose, options) {
        var overlay = document.getElementById('payment-success-modal-overlay');
        if (overlay) return;
        options = options || {};
        var title = options.title || 'Pagamento aprovado!';
        var msg = options.message;
        if (msg === undefined && options.hideEmailMessage !== true) msg = 'Um e-mail será enviado com as instruções para usar o aplicativo em até 48 horas.';
        var redirectUrl = options.redirectUrl || '';
        var autoRedirectMs = options.autoRedirectMs > 0 ? options.autoRedirectMs : 0;
        var qs = window.location.search || '';
        overlay = document.createElement('div');
        overlay.id = 'payment-success-modal-overlay';
        overlay.className = 'payment-success-overlay';
        overlay.innerHTML = '<div class="payment-success-modal">' +
            '<div class="payment-success-icon"><i class="fas fa-check-circle"></i></div>' +
            '<h2 class="payment-success-title">' + (title.replace(/</g, '&lt;').replace(/>/g, '&gt;')) + '</h2>' +
            (msg ? '<p class="payment-success-msg">' + (msg.replace(/</g, '&lt;').replace(/>/g, '&gt;')) + '</p>' : '') +
            '<button type="button" class="payment-success-btn" id="payment-success-btn-ok">OK</button>' +
            '</div>';
        document.body.appendChild(overlay);
        var autoRedirectTimer = null;
        function doRedirect() {
            if (redirectUrl) window.location.replace(redirectUrl + (qs ? (redirectUrl.indexOf('?') !== -1 ? '&' + qs.replace(/^\?/, '') : '?' + qs.replace(/^\?/, '')) : ''));
        }
        function closeModal() {
            if (autoRedirectTimer) clearTimeout(autoRedirectTimer);
            if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
            if (typeof onClose === 'function') onClose();
            else if (redirectUrl) doRedirect();
        }
        if (autoRedirectMs) autoRedirectTimer = setTimeout(closeModal, autoRedirectMs);
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) closeModal();
        });
        var btn = document.getElementById('payment-success-btn-ok');
        if (btn) btn.addEventListener('click', closeModal);
    };
})();
