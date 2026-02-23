export default async function handler(req, res) {
  console.log('[track-pix] Requisição recebida:', req.method);
  
  if (req.method !== 'POST') {
    console.log('[track-pix] Método não é POST');
    return res.status(405).json({ error: 'Método não permitido' });
  }

  console.log('[track-pix] Body recebido:', JSON.stringify(req.body, null, 2));

  const { orderId, customer, paymentMethod, status, value, utm_source, utm_medium, utm_campaign, utm_content, utm_term, src, sck, gatewayFeeInCents } = req.body;

  console.log('[track-pix] Validando dados...');
  if (!orderId) {
    console.log('[track-pix] Erro: orderId ausente');
    return res.status(400).json({ error: 'orderId é obrigatório' });
  }
  if (!customer) {
    console.log('[track-pix] Erro: customer ausente');
    return res.status(400).json({ error: 'customer é obrigatório' });
  }

  console.log('[track-pix] Dados validados com sucesso');

  const apiToken = process.env.UTMIFY_API_TOKEN || 'SjbauUaraKBvALL1UlvLQ5lGs9s9vtsDXkvq';
  console.log('[track-pix] API Token sendo usado:', apiToken ? apiToken.substring(0, 5) + '***' : 'NÃO DEFINIDA');

  try {
    // Formatar data/hora em UTC (YYYY-MM-DD HH:MM:SS)
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');
    const createdAt = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    const approvedDate = status === 'paid' ? createdAt : null;

    // Calcular valores em centavos
    const totalPriceInCents = Math.round((value || 37.49) * 100);
    const gatwayFee = gatewayFeeInCents || 0;
    const userCommission = totalPriceInCents - gatwayFee;

    const payload = {
      orderId: orderId || `pix-${Date.now()}`,
      platform: 'CNH-Brasil',
      paymentMethod: paymentMethod || 'pix',
      status: status || 'waiting_payment', // 'waiting_payment' | 'paid' | 'refused' | 'refunded' | 'chargedback'
      createdAt: createdAt,
      approvedDate: approvedDate,
      refundedAt: null,
      customer: {
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || null,
        document: customer.document || null,
        country: 'BR',
        ip: null
      },
      products: [
        {
          id: orderId || `pix-${Date.now()}`,
          name: 'Taxas Administrativas CNH',
          planId: null,
          planName: null,
          quantity: 1,
          priceInCents: totalPriceInCents
        }
      ],
      trackingParameters: {
        src: src || null,
        sck: sck || null,
        utm_source: utm_source || null,
        utm_medium: utm_medium || null,
        utm_campaign: utm_campaign || null,
        utm_content: utm_content || null,
        utm_term: utm_term || null
      },
      commission: {
        totalPriceInCents: totalPriceInCents,
        gatewayFeeInCents: gatwayFee,
        userCommissionInCents: userCommission
      },
      isTest: false
    };

    console.log('[track-pix] API Token sendo usado:', apiToken.substring(0, 5) + '***');
    console.log('[track-pix] Created At:', createdAt);
    console.log('[track-pix] Approved Date:', approvedDate);
    console.log('[track-pix] Order ID:', payload.orderId);
    console.log('[track-pix] Payload:', JSON.stringify(payload, null, 2));

    const bodyStr = JSON.stringify(payload);
    console.log('[track-pix] Body string length:', bodyStr.length);

    console.log('[track-pix] Iniciando requisição para Utmify...');
    const response = await fetch('https://api.utmify.com.br/api-credentials/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-token': apiToken
      },
      body: bodyStr
    });

    console.log('[track-pix] Requisição completada');
    console.log('[track-pix] Status Utmify:', response.status);
    console.log('[track-pix] Headers resposta:', JSON.stringify(Object.fromEntries(response.headers.entries())));

    const responseText = await response.text();
    console.log('[track-pix] Response text:', responseText);
    
    let data = {};
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.log('[track-pix] Erro ao fazer parse da resposta:', e.message);
    }

    console.log('[track-pix] Success:', response.ok);
    console.log('[track-pix] Resposta completa:', JSON.stringify(data, null, 2));

    return res.status(200).json({
      success: response.ok,
      message: response.ok ? 'Pedido enviado para Utmify' : 'Erro ao enviar para Utmify',
      data: data,
      status: response.status
    });
  } catch (error) {
    console.error('[track-pix] ERRO na função:', error.message);
    console.error('[track-pix] Stack:', error.stack);
    return res.status(500).json({
      success: false,
      message: 'Erro ao enviar pedido para Utmify',
      error: error.message
    });
  }
}
