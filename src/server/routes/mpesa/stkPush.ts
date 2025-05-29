import axios from "axios";
import moment from "moment";
import * as dotenv from "dotenv";
import { Pool } from "pg";

// Load environment variables from .env file
dotenv.config();

// Secure credentials via environment variables
const consumerKey = process.env.DARAJA_CONSUMER_KEY!;
const consumerSecret = process.env.DARAJA_CONSUMER_SECRET!;
const shortCode = process.env.DARAJA_SHORTCODE!;
const passkey = process.env.DARAJA_PASSKEY!;
const callbackURL = process.env.DARAJA_CALLBACK_URL!;

// Use production endpoint
const baseURL = "https://api.safaricom.co.ke";

// PostgreSQL pool for saving payment records
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Get access token
async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
  const { data } = await axios.get(
    `${baseURL}/oauth/v1/generate?grant_type=client_credentials`,
    { headers: { Authorization: `Basic ${auth}` } }
  );
  return data.access_token;
}

// Initiate STK Push and save to DB
export async function stkPush(
  phoneNumber: string,
  amount: number
): Promise<any> {
  const accessToken = await getAccessToken();
  const timestamp = moment().format("YYYYMMDDHHmmss");
  const password = Buffer.from(shortCode + passkey + timestamp).toString("base64");

  const payload = {
    BusinessShortCode: shortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: amount,
    PartyA: phoneNumber,
    PartyB: shortCode,
    PhoneNumber: phoneNumber,
    CallBackURL: callbackURL,
    AccountReference: "Account", // Customize as needed
    TransactionDesc: "Payment",  // Customize as needed
  };

  const { data } = await axios.post(
    `${baseURL}/mpesa/stkpush/v1/processrequest`,
    payload,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  // Save payment request to DB
  await pool.query(
    `INSERT INTO public.stk_push_requests
      (phone_number, amount, checkout_request_id, merchant_request_id, status)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      phoneNumber,
      amount,
      data.CheckoutRequestID,
      data.MerchantRequestID,
      "Pending"
    ]
  );

  return data;
}