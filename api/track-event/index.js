export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { event, event_name, customer, order_id, value, timestamp } = req.body;

  if (!event || !event_name) {
    return res.status(400).json({ error: 'event e event_name são obrigatórios' });
  }

  const apiKey = 'aTLLR6l5R8WgvsBp9ASTuBnV6AkEymRq16gn';

  try {
    const response = await fetch('https://api.utmify.com.br/v1/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      },
      body: JSON.stringify({
        event,
        event_name,
        customer: customer || {},
        order_id: order_id || null,
        value: value || null,
        timestamp: timestamp || new Date().toISOString()
      })
    });

    const data = await response.json().catch(() => ({}));

    console.log('[track-event] Evento rastreado:', { 
      event, 
      event_name, 
      status: response.status, 
      response: data 
    });

    return res.status(200).json({
      success: true,
      message: 'Evento rastreado com sucesso',
      data: data
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
