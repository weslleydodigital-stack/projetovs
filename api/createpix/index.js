export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const publicKey = process.env.ANUBIS_PUBLIC_KEY;
  const secretKey = process.env.ANUBIS_SECRET_KEY;

  if (!publicKey || !secretKey) {
    console.error('[createpix] ANUBIS_PUBLIC_KEY ou ANUBIS_SECRET_KEY não configuradas nas variáveis de ambiente');
    return res.status(500).json({
      success: false,
      message: 'Configuração do servidor incompleta. Verifique as variáveis de ambiente na Vercel.',
      error: 'missing_credentials'
    });
  }

  const { cpf, nome, email, amount } = req.body;
  const amountCents = amount && Number(amount) > 0 ? Number(amount) : 8640;

  // Validações básicas
  const cpfLimpo = String(cpf || '').replace(/\D/g, '');
  if (!cpfLimpo || cpfLimpo.length !== 11) {
    return res.status(400).json({
      success: false,
      message: 'CPF inválido. Deve conter 11 dígitos.',
      error: 'invalid_cpf'
    });
  }

  if (!nome || nome.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Nome inválido. Deve ter pelo menos 2 caracteres.',
      error: 'invalid_name'
    });
  }

  console.log('[createpix] Dados recebidos:', { cpf: cpfLimpo.substring(0,3) + '***', nome, email, amount, amountCents });

  const auth = Buffer.from(publicKey + ':' + secretKey).toString('base64');

  const requestBody = {
    amount: amountCents,
    paymentMethod: "pix",
    customer: {
      name: nome.trim(),
      email: email || 'cliente@pagamentos.com.br',
      document: {
        type: "cpf",
        number: cpfLimpo
      }
    },
    items: [
      {
        title: "Taxas Administrativas CNH",
        quantity: 1,
        unitPrice: amountCents
      }
    ]
  };

  console.log('[createpix] Enviando para Anubis:', JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch('https://api.anubispay.com.br/v1/transactions', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json().catch(() => ({}));

    console.log('[createpix] Resposta Anubis - Status:', response.status, 'Data:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: data?.message || data?.error || 'Erro ao criar transação PIX',
        data: data
      });
    }

    const pixCode = data?.data?.pix_code || data?.data?.pix?.qrcode || data?.pix_code || data?.pix?.qrcode || '';
    const orderId = data?.data?.order_id || data?.data?.id || data?.order_id || data?.id || '';

    return res.status(200).json({
      success: true,
      data: {
        pix_code: pixCode,
        order_id: orderId,
        orderId: orderId,
        pix: data?.data?.pix || data?.pix
      }
    });
  } catch (error) {
    console.error('[createpix] Erro:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Erro ao conectar com o gateway de pagamento',
      error: 'internal_error'
    });
  }
}
