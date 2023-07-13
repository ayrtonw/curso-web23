import Block from "./block";
import Validation from './validation';
import BlockInfo from './blockInfo';
import Transaction from "./transaction";
import TransactionType from "./transactionType";
import TransactionSearch from "./transactionSearch";
import TransactionOutput from "./transactionOutput";
import TransactionInput from "./transactionInput";

/**
 * Blockchain class
 */
export default class Blockchain {
    blocks: Block[];
    mempool: Transaction[];
    nextIndex: number = 0;
    static readonly DIFFICULTY_FACTOR = 5;
    static readonly TX_PER_BLOCK = 2;
    static readonly MAX_DIFFICULTY = 62;

    /**
     * Creates a new Blockchain
     */
    constructor(miner: string) {
        this.blocks = [];
        this.mempool = [];

        const genesis = this.createGenesis(miner);
        this.blocks.push(genesis);
        this.nextIndex++
    }

    createGenesis(miner: string): Block {
        const amount = 10; //TODO: calcular a recompensa

        const tx = new Transaction({
            type: TransactionType.FEE,
            txOutputs: [new TransactionOutput({
                amount,
                toAddress: miner
            } as TransactionOutput)]
        } as Transaction);

        tx.hash = tx.getHash();
        tx.txOutputs[0].tx = tx.hash;

        const block = new Block();
        block.transactions = [tx];
        block.mine(this.getDifficulty(), miner);

        return block;
    }

    /**
     * Get last block
     * @returns Last block
     */
    getLastBlock(): Block {
        return this.blocks[this.blocks.length - 1];
    }

    getDifficulty(): number {
        return Math.ceil(this.blocks.length / Blockchain.DIFFICULTY_FACTOR) + 1;
    }

    addTransaction(transaction: Transaction): Validation {
        if (transaction.txInputs && transaction.txInputs.length) {
            const from = transaction.txInputs[0].fromAddres;
            const pendingTx = this.mempool
                .filter(tx => tx.txInputs && tx.txInputs.length)
                .map(tx => tx.txInputs)
                .flat()
                .filter(txi => txi!.fromAddres === from);

            if (pendingTx && pendingTx.length)
                return new Validation(false, `This wallet has a pending transaction.`);

            //validate UTXO
            const utxo = this.getUtxo(from);
            for (let i = 0; i < transaction.txInputs.length; i++) {
                const txi = transaction.txInputs[i];
                if (utxo.findIndex(txo => txo.tx === txi.previousTx && txo.amount >= txi.amount) === -1)
                    return new Validation(false, "Invalid tx: the TXO is already spent or unexistent");
            }
        }

        //TODO: fazer versao final que valida as taxas.
        const validation = transaction.isValid();
        if (!validation.success)
            return new Validation(false, "Invalid tx: " + validation.message);

        //check if there is already a transaction with the same hash in the blockchain.
        if (this.blocks.some(b => b.transactions.some(tx => tx.hash === transaction.hash)))
            return new Validation(false, "Duplicated tx in blockchain.");

        this.mempool.push(transaction);
        return new Validation(true, transaction.hash);
    }

    /**
     * Add block into the blockchain
     * @param block block to be added
     * @returns valitation with success true if the block is valid and false with a message if block is not valid
     */
    addBlock(block: Block): Validation {
        const nextBlock = this.getNextBlocks();
        if (!nextBlock)
            return new Validation(false, "There is no next block info.");

        const validation = block.isValid(nextBlock.previousHash, nextBlock.index - 1, nextBlock.difficulty);
        if (!validation.success)
            return new Validation(false, `Invalid block: ${validation.message}`);

        //get transactions from block, only transactions with fees.
        const txs = block.transactions.filter(tx => tx.type !== TransactionType.FEE).map(tx => tx.hash);

        //filter mempool for transactions that were included in the block.
        const newMempool = this.mempool.filter(tx => !txs.includes(tx.hash));

        //additional validation to avoid miners forging transactions
        if (newMempool.length + txs.length !== this.mempool.length)
            return new Validation(false, "Invalid tx in block: mempool");

        //remove transactions from mempool because block is valid and it is going to be added to the blockchain.
        this.mempool = newMempool;

        this.blocks.push(block);
        this.nextIndex++;

        return new Validation(true, block.hash);
    }

    /**
     * Get specific block from blockchain
     * @param hash Hash to search
     * @returns Requested Block or undefined if not found
     */
    getBlock(hash: string): Block | undefined {
        return this.blocks.find(b => b.hash === hash);
    }

    getTransaction(hash: string): TransactionSearch {
        const mempoolIndex = this.mempool.findIndex(tx => tx.hash === hash);
        if (mempoolIndex !== -1)
            return {
                mempoolIndex,
                transaction: this.mempool[mempoolIndex]
            } as TransactionSearch;

        const blockIndex = this.blocks.findIndex(b => b.transactions.some(tx => tx.hash === hash));
        if (blockIndex !== -1)
            return {
                blockIndex,
                transaction: this.blocks[blockIndex].transactions.find(tx => tx.hash === hash)
            } as TransactionSearch;


        return { blockIndex: -1, mempoolIndex: -1 } as TransactionSearch
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

    getFeePerTx(): number {
        return 1;
    }

    getNextBlocks(): BlockInfo | null {

        //return null if there is no tx in mempool
        if (!this.mempool || !this.mempool.length)
            return null;

        const transactions = this.mempool.slice(0, Blockchain.TX_PER_BLOCK);

        const difficulty = this.getDifficulty();
        const previousHash = this.getLastBlock().hash;
        const index = this.blocks.length;
        const feePerTx = this.getFeePerTx();
        const maxDIfficulty = Blockchain.MAX_DIFFICULTY;

        return {
            transactions,
            difficulty,
            previousHash,
            index,
            feePerTx,
            maxDIfficulty
        } as BlockInfo
    }

    getTxInputs(wallet: string): (TransactionInput | undefined)[] {
        return this.blocks
            .map(b => b.transactions)
            .flat()
            .filter(tx => tx.txInputs && tx.txInputs.length)
            .map(tx => tx.txInputs)
            .flat()
            .filter(txi => txi!.fromAddres === wallet);
    }

    getTxOutputs(wallet: string): TransactionOutput[] {
        return this.blocks
            .map(b => b.transactions)
            .flat()
            .filter(tx => tx.txOutputs && tx.txOutputs.length)
            .map(tx => tx.txOutputs)
            .flat()
            .filter(txo => txo.toAddress === wallet);
    }

    getUtxo(wallet: string): TransactionOutput[] {
        const txIns = this.getTxInputs(wallet);
        const txOuts = this.getTxOutputs(wallet);

        //wallet never spent before
        if (!txIns || !txIns.length) return txOuts;

        txIns.forEach(txi => {
            const index = txOuts.findIndex(txo => txo.amount === txi!.amount);
            txOuts.splice(index, 1);
        })

        return txOuts;
    }

    getBalance(wallet: string): number {
        const utxo = this.getUtxo(wallet);

        if (!utxo || !utxo.length) return 0;

        return utxo.reduce((a, b) => a + b.amount, 0);
    }
}
