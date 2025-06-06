import { darajaConfig } from '@/config/daraja';

class DarajaService {
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  private async getAccessToken(): Promise<string> {
    try {
      // Check if we have a valid token
      if (this.accessToken && Date.now() < this.tokenExpiry) {
        return this.accessToken;
      }

      // Create auth string using browser's btoa function
      const auth = btoa(
        `${darajaConfig.consumerKey}:${darajaConfig.consumerSecret}`
      );

      // Get new token
      const response = await fetch(
        darajaConfig.isDevelopment 
          ? darajaConfig.endpoints.sandbox.auth 
          : darajaConfig.endpoints.production.auth,
        {
          method: 'GET',
          headers: {
            Authorization: `Basic ${auth}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.errorMessage || 'Failed to get access token');
      }

      // Set token and expiry (token expires in 1 hour)
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000);

      return this.accessToken;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  }

  private generateTimestamp(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hour}${minute}${second}`;
  }

  private generatePassword(timestamp: string): string {
    const str = `${darajaConfig.shortCode}${darajaConfig.passKey}${timestamp}`;
    return btoa(str);
  }

  public async initiateSTKPush(
    phoneNumber: string,
    amount: number,
    accountReference: string
  ): Promise<any> {
    try {
      const token = await this.getAccessToken();
      const timestamp = this.generateTimestamp();
      const password = this.generatePassword(timestamp);

      const requestBody = {
        BusinessShortCode: darajaConfig.shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.ceil(amount),
        PartyA: phoneNumber,
        PartyB: darajaConfig.shortCode,
        PhoneNumber: phoneNumber,
        CallBackURL: darajaConfig.callbackUrl,
        AccountReference: accountReference,
        TransactionDesc: 'NNECFA Registration Payment'
      };

      const response = await fetch(
        darajaConfig.isDevelopment 
          ? darajaConfig.endpoints.sandbox.stkPush 
          : darajaConfig.endpoints.production.stkPush,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.errorMessage || 'STK push request failed');
      }

      return {
        success: true,
        checkout_request_id: data.CheckoutRequestID,
        merchant_request_id: data.MerchantRequestID,
        response_code: data.ResponseCode,
        response_description: data.ResponseDescription,
        customer_message: data.CustomerMessage
      };
    } catch (error) {
      console.error('Error initiating STK push:', error);
      throw error;
    }
  }

  public async querySTKStatus(checkoutRequestId: string): Promise<any> {
    try {
      const token = await this.getAccessToken();
      const timestamp = this.generateTimestamp();
      const password = this.generatePassword(timestamp);

      const requestBody = {
        BusinessShortCode: darajaConfig.shortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId
      };

      const response = await fetch(
        darajaConfig.isDevelopment 
          ? darajaConfig.endpoints.sandbox.stkQuery 
          : darajaConfig.endpoints.production.stkQuery,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.errorMessage || 'STK query request failed');
      }

      return data;
    } catch (error) {
      console.error('Error querying STK status:', error);
      throw error;
    }
  }
}

export const darajaService = new DarajaService(); 
