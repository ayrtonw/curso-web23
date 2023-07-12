import Block from "./block";
import Validation from '../validation';
import BlockInfo from '../blockInfo'
import Transaction from "./transaction";
import TransactionType from "../transactionType";
import TransactionSearch from "../transactionSearch";
import TransactionInput from "./transactionInput";

/**
 * Mocked blockchain class
 */
export default class Blockchain {
    blocks: Block[];
    mempool: Transaction[];
    nextIndex: number = 0;

    /**
     * Creates a new mock Blockchain
     */
    constructor(miner: string) {
        this.blocks = [];
        this.mempool = [new Transaction()];

        this.blocks.push(new Block({
            index: 0,
            hash: 'samplehash',
            previousHash: "",
            miner,
            timestamp: Date.now()
        } as Block));
        this.nextIndex++
    }

    /**
     * Get last block
     * @returns Last block
     */
    getLastBlock(): Block {
        return this.blocks[this.blocks.length - 1];
    }

    /**
     * Add block into the blockchain
     * @param block block to be added
     * @returns valitation with success true if the block is valid and false with a message if block is not valid
     */
    addBlock(block: Block): Validation {
        if (block.index < 0) return new Validation(false, "Invalid mock block");

        this.blocks.push(block);
        this.nextIndex++;

        return new Validation();
    }

    addTransaction(transaction: Transaction): Validation {
        const validation = transaction.isValid();
        if (!validation.success)
            return validation;

        this.mempool.push(transaction);
        return new Validation();
    }

    getTransaction(hash: string): TransactionSearch {
        if (hash === "-1")
            return { mempoolIndex: -1, blockIndex: -1 } as TransactionSearch;

        return {
            mempoolIndex: 0,
            transaction: new Transaction()
        } as TransactionSearch
    }

    /**
     * Get specific block from blockchain
     * @param hash Hash to search
     * @returns Requested Block or undefined if not found
     */
    getBlock(hash: string): Block | undefined {
        if(!hash || hash === "-1") return undefined;
        return this.blocks.find(b => b.hash === hash);
    }

    isValid(): Validation {
        return new Validation();
    }

    getFeePerTx(): number {
        return 1;
    }

    getNextBlocks(): BlockInfo {
        return {
            transactions: this.mempool.slice(0,2),
            difficulty: 1,
            previousHash: this.getLastBlock().hash,
            index: this.blocks.length,
            feePerTx: this.getFeePerTx(),
            maxDIfficulty: 62
        } as BlockInfo
    }
}
