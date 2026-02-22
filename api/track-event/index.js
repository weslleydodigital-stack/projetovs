export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { event, event_name, customer, order_id, value, timestamp } = req.body;

  if (!event || !event_name) {
    return res.status(400).json({ error: 'event e event_name são obrigatórios' });
  }

  const apiKey = 'RwVYnky6xlTJdprIsCKxI5CIzbciIscNInrJ';
  const pixelId = '699b51a7de1e462f7d88c9aa';

  try {
    const payload = {
      event,
      event_name,
      customer: customer || {},
      order_id: order_id || null,
      value: value || null,
      timestamp: timestamp || new Date().toISOString()
    };

    console.log('[track-event] Enviando payload:', JSON.stringify(payload, null, 2));

    // Tentar com Authorization Bearer
    const response = await fetch('https://api.utmify.com.br/v1/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));

    console.log('[track-event] Resposta Utmify:', { 
      status: response.status, 
      data: data 
    });

    if (!response.ok) {
      console.error('[track-event] Erro na resposta:', data);
      // Tentar com X-API-Key se Bearer falhar
      const response2 = await fetch('https://api.utmify.com.br/v1/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: JSON.stringify(payload)
      });

      const data2 = await response2.json().catch(() => ({}));
      
      console.log('[track-event] Resposta com X-API-Key:', { 
        status: response2.status, 
        data: data2 
      });

      return res.status(200).json({
        success: true,
        message: 'Evento rastreado',
        data: data2,
        pixel_id: pixelId
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Evento rastreado com sucesso',
      data: data,
      pixel_id: pixelId
    });
  } catch (error) {
    console.error('[track-event] Erro:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Erro ao rastrear evento',
      error: error.message
    });
  }
}
