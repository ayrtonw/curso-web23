import Block from "./block";
import Validation from './validation';

/**
 * Blockchain class
 */
export default class Blockchain {
    blocks: Block[];
    nextIndex: number = 0;
    static readonly DIFFICULTY_FACTOR = 5;
    

    /**
     * Creates a new Blockchain
     */
    constructor() {
        this.blocks = [new Block({
            index: this.nextIndex,
            previousHash: "",
            data: "Genesis Block"
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

    getDifficulty() : number{
        return Math.ceil(this.blocks.length / Blockchain.DIFFICULTY_FACTOR);
    }

    /**
     * Add block into the blockchain
     * @param block block to be added
     * @returns valitation with success true if the block is valid and false with a message if block is not valid
     */
    addBlock(block: Block): Validation {
        const lastBlock = this.getLastBlock();
        const validation = block.isValid(lastBlock.hash, lastBlock.index, this.getDifficulty());

        if (!validation.success)
            return new Validation(false, `Invalid block: ${validation.message}`);

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
        //Walks through blocks array backwards
        for (let i = this.blocks.length - 1; i > 0; i--) {
            const currentBlock = this.blocks[i];
            const previousBlock = this.blocks[i - 1];
            const validation = currentBlock.isValid(previousBlock.hash, previousBlock.index, this.getDifficulty());
            if (!validation.success)
                return new Validation(false, `Invalid block #${currentBlock.index}: ${validation.message}`);
        }
        return new Validation();
    }
}
