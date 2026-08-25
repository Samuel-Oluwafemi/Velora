declare module "@paystack/inline-js" {
  interface PaystackTransaction {
    reference: string;
    status: string;
    trans: string;
    transaction: string;
    message: string;
  }

  interface PaystackTransactionOptions {
    key: string;
    email: string;
    amount: number;
    currency?: string;
    firstName?: string;
    lastName?: string;
    reference?: string;

    onSuccess?: (transaction: PaystackTransaction) => void;

    onCancel?: () => void;
  }

  export default class Paystack {
    newTransaction(options: PaystackTransactionOptions): void;
  }
}