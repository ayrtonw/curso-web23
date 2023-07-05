import Block from "./block";
import Validation from '../validation';
import BlockInfo from '../blockInfo'

/**
 * Mocked blockchain class
 */
export default class Blockchain {
    blocks: Block[];
    nextIndex: number = 0;

    /**
     * Creates a new mock Blockchain
     */
    constructor() {
        this.blocks = [new Block({
            index: 0,
            hash: 'samplehash',
            previousHash: "",
            data: "Genesis Block",
            timestamp: Date.now()
        } as Block)];
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
        if(block.index < 0) return new Validation(false,"Invalid mock block");
        
        this.blocks.push(block);
        this.nextIndex++;

        return new Validation();
    }

    /**
     * Get specific block from blockchain
     * @param hash Hash to search
     * @returns Requested Block or undefined if not found
     */
    getBlock(hash: string): Block | undefined {
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
            data: new Date().toString(),
            difficulty: 0,
            previousHash: this.getLastBlock().hash,
            index: 1,
            feePerTx: this.getFeePerTx(),
            maxDIfficulty: 62
        } as BlockInfo
    }
}
