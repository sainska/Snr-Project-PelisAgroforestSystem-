const getEnvironmentVariable = (environmentVariable: string): string => {
  const unvalidatedEnvironmentVariable = import.meta.env[environmentVariable];
  if (!unvalidatedEnvironmentVariable) {
    return '';
  }
  return unvalidatedEnvironmentVariable;
};

export const env = {
  MPESA_CONSUMER_KEY: getEnvironmentVariable('VITE_MPESA_CONSUMER_KEY'),
  MPESA_CONSUMER_SECRET: getEnvironmentVariable('VITE_MPESA_CONSUMER_SECRET'),
  MPESA_PASSKEY: getEnvironmentVariable('VITE_MPESA_PASSKEY'),
  MPESA_BUSINESS_SHORT_CODE: getEnvironmentVariable('VITE_MPESA_BUSINESS_SHORT_CODE'),
  MPESA_CALLBACK_URL: getEnvironmentVariable('VITE_MPESA_CALLBACK_URL'),
  MPESA_TIMEOUT_URL: getEnvironmentVariable('VITE_MPESA_TIMEOUT_URL'),
  NODE_ENV: import.meta.env.MODE
}; 
