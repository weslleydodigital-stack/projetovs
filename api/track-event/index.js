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

    console.log('[track-event] API Token:', apiToken.substring(0, 5) + '***');
    console.log('[track-event] Created At:', createdAt);
    console.log('[track-event] Approved Date:', approvedDate);
    console.log('[track-event] Order ID:', payload.orderId);
    console.log('[track-event] Payload:', JSON.stringify(payload, null, 2));

    const bodyStr = JSON.stringify(payload);
    console.log('[track-event] Body string length:', bodyStr.length);

    const response = await fetch('https://api.utmify.com.br/api-credentials/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-token': apiToken
      },
      body: bodyStr
    });

    const responseText = await response.text();
    console.log('[track-event] Response text:', responseText);
    
    let data = {};
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.log('[track-event] Erro ao fazer parse da resposta');
    }

    console.log('[track-event] Status Utmify:', response.status);
    console.log('[track-event] Success:', response.ok);

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
