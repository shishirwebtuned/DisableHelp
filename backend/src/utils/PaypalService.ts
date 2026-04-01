import axios from "axios";

const PAYPAL_CLIENT = process.env.PAYPAL_CLIENT_ID!;
const PAYPAL_SECRET = process.env.PAYPAL_CLIENT_SECRET!;
const PAYPAL_BASE_URL = process.env.PAYPAL_BASE_URL!;

export async function getPayPalAccessToken(): Promise<string> {
  const res = await axios({
    url: `${PAYPAL_BASE_URL}/v1/oauth2/token`,
    method: "post",
    auth: {
      username: PAYPAL_CLIENT,
      password: PAYPAL_SECRET,
    },
    params: {
      grant_type: "client_credentials",
    },
  });
  return res.data.access_token;
}

export async function createPayPalOrder(amount: number) {
  const token = await getPayPalAccessToken();
  const res = await axios({
    url: `${PAYPAL_BASE_URL}/v2/checkout/orders`,
    method: "post",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    data: {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "AUD",
            value: amount.toFixed(2),
          },
        },
      ],
    },
  });
  return res.data;
}

export async function capturePayPalOrder(orderId: string) {
  const token = await getPayPalAccessToken();
  const res = await axios({
    url: `${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
    method: "post",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return res.data;
}
