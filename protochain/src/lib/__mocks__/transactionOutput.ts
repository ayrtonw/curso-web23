import Validation from "../validation";

/**
 * Mocked Transatcion Output class
 */
export default class TransactionOutput {
    toAddress: string;
    amount: number;
    tx?: string

    constructor(txOutput?: TransactionOutput) {
        this.toAddress = txOutput?.toAddress || "sample-tx-output-to-hash-from-mock-class";
        this.amount = txOutput?.amount || 10;
        this.tx = txOutput?.tx || "sample-tx-output-tx-hash-from-mock-class";
    }

    isValid(): Validation {
        if (this.amount < 1)
            return new Validation(false, "Negative amount.");

        return new Validation();
    }

    getHash(): string {
        return "sample-hash-from-mock-class"
    }
}