import TransactionOutput from '../transactionOutput';
import Validation from '../validation';

/**
 * Mocked transactionInput class
 */
export default class TransactionInput {
    fromAddres: string;
    amount: number;
    signature: string;
    previousTx: string;

    /**
     * Creates a new TransactionInput
     * @param txInput the tx input data
     */
    constructor(txInput?: TransactionInput) {
        this.previousTx = txInput?.previousTx || "sample-previous-tx-from-mock-class";
        this.fromAddres = txInput?.fromAddres || "sample-from-address-from-mock-class";
        this.amount = txInput?.amount || 10;
        this.signature = txInput?.signature || "sample-signature-from-mock-class";
    }

    /**
     * Generates the tx input signature
     * @param privateKey The 'from' private key
     */
    sign(privateKey: string): void {
        this.signature = "sample-signature-from-mock-class"
    }

    /**
     * Generate and returns the tx input hash
     * @returns The tx input hash
     */
    getHash(): string {
        return "sample-hash-from-mock-class"
    }

    /**
     * Validates if the tx input is ok
     * @returns Returns a validation result object
     */
    isValid(): Validation {
        if (!this.previousTx || !this.signature)
            return new Validation(false, "Signrature and previous TX are required.");

        if (this.amount < 1)
            return new Validation(false, "Amout must be greater than zero.");

        return new Validation();
    }
}