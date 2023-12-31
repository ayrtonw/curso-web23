import Transaction from './transaction';
import Validation from '../validation';

/**
 *  Mocked block class
 */
export default class Block {
    index: number;
    timestamp: number;
    hash: string;
    previousHash: string;
    transactions: Transaction[];
    miner: string;

    /**
     * Creates a new mock block
     * @param block The mock block data
     */
    constructor(block?: Block) {
        this.index = block?.index || 0;
        this.timestamp = block?.timestamp || Date.now();
        this.previousHash = block?.previousHash || "";
        this.transactions = block?.transactions || [] as Transaction[];
        this.miner = block?.miner || "sample-miner-hash"
        this.hash = block?.hash || this.getHash();
    }

    mine(difficulty: number, miner: string) {
        this.miner = miner;
    }

    /**
     * Generate the hash
     * @returns sha256 hash that was generated
     */
    getHash(): string {
        return this.hash || "samplehash";
    }

    /**
     * Validates the mock block
     * @param previousHash Previous hash
     * @param previousIndex Previous index
     * @returns Returns if the mock block is valid
     */
    isValid(previousHash: string, previousIndex: number, feePerTx: number): Validation {
        if (!previousHash || previousIndex < 0 || this.index < 0 || feePerTx < 1)
            return new Validation(false, "Invalid mock block.");

        return new Validation();
    }
}