export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const orderId = req.query?.id;
  if (!orderId) {
    return res.status(400).json({ success: false, data: { is_paid: false, status: 'missing_id' } });
  }

  const publicKey = process.env.ANUBIS_PUBLIC_KEY;
  const secretKey = process.env.ANUBIS_SECRET_KEY;

  if (!publicKey || !secretKey) {
    return res.status(200).json({ success: true, data: { is_paid: false, status: 'pending' } });
  }

  const auth = Buffer.from(publicKey + ':' + secretKey).toString('base64');

  try {
    const response = await fetch(`https://api.anubispay.com.br/v1/transactions/${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      return res.status(200).json({ success: true, data: { is_paid: false, status: 'pending' } });
    }

    const data = await response.json().catch(() => ({}));
    const status = (data?.data?.status || data?.status || '').toLowerCase();
    const isPaid = status === 'paid' || status === 'approved' || status === 'completed' || data?.data?.is_paid === true;

    return res.status(200).json({
      success: true,
      data: {
        is_paid: isPaid,
        status: status || 'pending',
        order_id: orderId
      }
    });
  } catch (error) {
    return res.status(200).json({ success: true, data: { is_paid: false, status: 'pending' } });
  }
}
