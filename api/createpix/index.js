export default async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { cpf, nome, email } = req.body;

  const publicKey = process.env.ANUBIS_PUBLIC_KEY;
  const secretKey = process.env.ANUBIS_SECRET_KEY;

  const auth = Buffer.from(publicKey + ':' + secretKey).toString('base64');

  try {

    const response = await fetch('https://api.anubispay.com.br/v1/transactions', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: 2990, // valor em centavos (R$29,90)
        paymentMethod: "pix",
        customer: {
          name: nome,
          email: email,
          document: {
            type: "cpf",
            number: cpf.replace(/\D/g, "")
          }
        },
        items: [
          {
            title: "Produto Digital",
            quantity: 1,
            unitPrice: 2990
          }
        ]
      })
    });

    const data = await response.json();

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: 'Erro ao criar PIX' });
  }
}
