import DodoPayments from "dodopayments";

// Lazy initialization to avoid build-time errors when env vars not set
let clientInstance: DodoPayments | null = null;

const getClient = (): DodoPayments => {
  if (!clientInstance) {
    if (!process.env.DODO_PAYMENTS_API_URL || !process.env.DODO_PAYMENTS_API_KEY) {
      throw new Error('DODO_PAYMENTS_API_URL and DODO_PAYMENTS_API_KEY must be defined');
    }
    clientInstance = new DodoPayments({
      baseURL: process.env.DODO_PAYMENTS_API_URL,
      bearerToken: process.env.DODO_PAYMENTS_API_KEY,
    });
  }
  return clientInstance;
};

// Export proxy for backward compatibility
const client = new Proxy({} as DodoPayments, {
  get(_, prop) {
    return getClient()[prop as keyof DodoPayments];
  }
});

export default client;
