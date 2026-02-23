export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { orderId, customer, paymentMethod, status, value, utm_source, utm_medium, utm_campaign, utm_content, utm_term, src, sck, gatewayFeeInCents } = req.body;

  if (!orderId || !customer) {
    return res.status(400).json({ error: 'orderId e customer são obrigatórios' });
  }

  const apiToken = process.env.UTMIFY_API_TOKEN || '34XPAmpoZpwBebcNKgnPR7z2S39sdBzGcS';

  try {
    // Formatar data/hora em UTC (YYYY-MM-DD HH:MM:SS)
    const now = new Date();
    const createdAt = now.toISOString().replace('T', ' ').split('.')[0];
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
        ip: req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || null
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

    console.log('[track-event] Enviando para Utmify:', JSON.stringify(payload, null, 2));

    const response = await fetch('https://api.utmify.com.br/api-credentials/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-token': apiToken
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));

    console.log('[track-event] Resposta Utmify:', { 
      status: response.status, 
      data: data 
    });

    return res.status(200).json({
      success: response.ok,
      message: response.ok ? 'Pedido enviado para Utmify' : 'Erro ao enviar para Utmify',
      data: data
    });
  } catch (error) {
    console.error('[track-event] Erro:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Erro ao enviar pedido para Utmify',
      error: error.message
    });
  }
}
