import { env } from './env';

export const darajaConfig = {
  // Your Daraja API credentials
  consumerKey: env.MPESA_CONSUMER_KEY,
  consumerSecret: env.MPESA_CONSUMER_SECRET,
  passKey: env.MPESA_PASSKEY,
  shortCode: env.MPESA_BUSINESS_SHORT_CODE,
  
  // API endpoints
  endpoints: {
    sandbox: {
      auth: 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      stkPush: 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      stkQuery: 'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query'
    },
    production: {
      auth: 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      stkPush: 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      stkQuery: 'https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query'
    }
  },

  // Callback URLs - Update these with your actual callback URLs
  callbackUrl: env.MPESA_CALLBACK_URL || 'https://your-domain.com/api/mpesa/callback',
  timeoutUrl: env.MPESA_TIMEOUT_URL || 'https://your-domain.com/api/mpesa/timeout',

  // Environment
  isDevelopment: env.NODE_ENV !== 'production'
}; 
