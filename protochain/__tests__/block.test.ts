import { describe, test, expect, beforeAll, jest } from '@jest/globals';
import Block from '../src/lib/block';
import BlockInfo from '../src/lib/blockInfo';
import Transaction from '../src/lib/transaction';
import TransactionType from '../src/lib/transactionType';
import TransactionInput from '../src/lib/transactionInput';

//mock classes
jest.mock('../src/lib/transaction');
jest.mock('../src/lib/transactionInput');

//cria suite de testes
describe("Block tests", () => {
    const exampledificult = 1;
    const exampledMiner = "ayrtonwallet-sample"

    let genesis: Block;

    beforeAll(() => {
        genesis = new Block({
            transactions: [new Transaction({
                txInput: new TransactionInput()
            } as Transaction)]
        } as Block);
    })

    test('Should NOT be valid (index not valid)', () => {
        const block = new Block({
            index: -1,
            previousHash: genesis.hash,
            transactions: [new Transaction({
                txInput: new TransactionInput()
            } as Transaction)]
        } as Block);

        //add fee transaction to the block.
        block.transactions.push(new Transaction({
            type: TransactionType.FEE,
            to: exampledMiner
        } as Transaction));

        //regenerate block hash after adding fee transaction.
        block.hash = block.getHash();
        block.mine(exampledificult, exampledMiner);

        const validation = block.isValid(genesis.hash, genesis.index, exampledificult);

        expect(validation.success).toBeFalsy();
    });

    test('Should not be valid (empty hash)', () => {
        const block = new Block({
            index: 1,
            previousHash: genesis.hash,
            transactions: [new Transaction({
                txInput: new TransactionInput()
            } as Transaction)]
        } as Block);

        //add fee transaction to the block.
        block.transactions.push(new Transaction({
            type: TransactionType.FEE,
            to: exampledMiner
        } as Transaction));

        //regenerate block hash after adding fee transaction.
        block.hash = block.getHash();

        block.mine(exampledificult, exampledMiner);
        block.hash = "";
        const validation = block.isValid(genesis.hash, genesis.index, exampledificult);

        expect(validation.success).toBeFalsy();
    });

    test('Should not be valid (no mined)', () => {
        const block = new Block({
            index: 1,
            nonce: 0,
            miner: exampledMiner,
            previousHash: genesis.hash,
            transactions: [new Transaction({
                txInput: new TransactionInput()
            } as Transaction)]
        } as Block);

        //add fee transaction to the block.
        block.transactions.push(new Transaction({
            type: TransactionType.FEE,
            to: exampledMiner
        } as Transaction));

        //regenerate block hash after adding fee transaction.
        block.hash = block.getHash();

        const validation = block.isValid(genesis.hash, genesis.index, exampledificult);

        expect(validation.success).toBeFalsy();
    });

    test('Should NOT be valid (txInput)', () => {
        const txInput = new TransactionInput();
        txInput.amount = -1;

        const block = new Block({
            index: 1,
            previousHash: genesis.hash,
            transactions: [new Transaction({
                txInput
            } as Transaction)]
        } as Block);

        //add fee transaction to the block.
        block.transactions.push(new Transaction({
            type: TransactionType.FEE,
            to: exampledMiner
        } as Transaction));

        //regenerate block hash after adding fee transaction.
        block.hash = block.getHash();

        const validation = block.isValid(genesis.hash, genesis.index, exampledificult);

        expect(validation.success).toBeFalsy();
    });

    test('Should NOT be valid (timestamp not valid)', () => {
        const block = new Block({
            index: 1,
            previousHash: genesis.hash,
            transactions: [new Transaction({
                txInput: new TransactionInput()
            } as Transaction)],
            timestamp: -1
        } as Block);

        //add fee transaction to the block.
        block.transactions.push(new Transaction({
            type: TransactionType.FEE,
            to: exampledMiner
        } as Transaction));

        //regenerate block hash after adding fee transaction.
        block.hash = block.getHash();
        block.mine(exampledificult, exampledMiner);

        const validation = block.isValid(genesis.hash, genesis.index, exampledificult);

        expect(validation.success).toBeFalsy();
    });

    test('Should NOT be valid (previous hash not valid)', () => {
        const block = new Block({
            index: 1,
            previousHash: 'hash1',
            transactions: [new Transaction({
                txInput: new TransactionInput()
            } as Transaction)]
        } as Block);

        //add fee transaction to the block.
        block.transactions.push(new Transaction({
            type: TransactionType.FEE,
            to: exampledMiner
        } as Transaction));

        //regenerate block hash after adding fee transaction.
        block.hash = block.getHash();
        block.mine(exampledificult, exampledMiner);

        const validation = block.isValid(genesis.hash, genesis.index, exampledificult);

        expect(validation.success).toBeFalsy();
    });

    test('Should be valid', () => {
        const block = new Block({
            index: 1,
            previousHash: genesis.hash,
            transactions: [new Transaction({
                txInput: new TransactionInput()
            } as Transaction)]
        } as Block);

        //add fee transaction to the block.
        block.transactions.push(new Transaction({
            type: TransactionType.FEE,
            to: exampledMiner
        } as Transaction));

        //regenerate block hash after adding fee transaction.
        block.hash = block.getHash();

        block.mine(exampledificult, exampledMiner);
        const validation = block.isValid(genesis.hash, genesis.index, exampledificult);
        expect(validation.success).toBeTruthy();
    });

    test('Should NOT be valid (no fee)', () => {
        const block = new Block({
            index: 1,
            previousHash: genesis.hash,
            transactions: [new Transaction({
                txInput: new TransactionInput()
            } as Transaction)]
        } as Block);

        block.mine(exampledificult, exampledMiner);
        const validation = block.isValid(genesis.hash, genesis.index, exampledificult);
        expect(validation.success).toBeFalsy();
    });

    test('Should create from block info', () => {
        const block = Block.fromBlockInfo({
            transactions: [new Transaction({
                txInput: new TransactionInput()
            } as Transaction)],
            difficulty: exampledificult,
            feePerTx: 1,
            index: 1,
            maxDIfficulty: 62,
            previousHash: genesis.hash
        } as BlockInfo);

        //add fee transaction to the block.
        block.transactions.push(new Transaction({
            type: TransactionType.FEE,
            to: exampledMiner
        } as Transaction));

        //regenerate block hash after adding fee transaction.
        block.hash = block.getHash();

        block.mine(exampledificult, exampledMiner);
        const validation = block.isValid(genesis.hash, genesis.index, exampledificult);
        expect(validation.success).toBeTruthy();
    });

    test('Should NOT be valid (fallbacks)', () => {
        const block = new Block();

        //add fee transaction to the block.
        block.transactions.push(new Transaction({
            type: TransactionType.FEE,
            to: exampledMiner
        } as Transaction));

        //regenerate block hash after adding fee transaction.
        block.hash = block.getHash();

        const validation = block.isValid(genesis.hash, genesis.index, exampledificult);

        expect(validation.success).toBeFalsy();
    });

    test('Should NOT be valid (2 FEE transactions)', () => {
        const block = new Block({
            index: 1,
            previousHash: genesis.hash,
            transactions: [
                new Transaction({
                    type: TransactionType.FEE,
                    txInput: new TransactionInput()
                } as Transaction),
                new Transaction({
                    type: TransactionType.FEE,
                    txInput: new TransactionInput()
                } as Transaction)
            ]
        } as Block);
        block.mine(exampledificult, exampledMiner);
        const validation = block.isValid(genesis.hash, genesis.index, exampledificult);
        expect(validation.success).toBeFalsy();
    });

    test('Should NOT be valid (invalid tx)', () => {
        const block = new Block({
            index: 1,
            previousHash: genesis.hash,
            transactions: [new Transaction()]
        } as Block);

        //add fee transaction to the block.
        block.transactions.push(new Transaction({
            type: TransactionType.FEE,
            to: exampledMiner
        } as Transaction));

        //regenerate block hash after adding fee transaction.
        block.hash = block.getHash();

        block.mine(exampledificult, exampledMiner);

        //make tx invalid on the mock class
        block.transactions[0].to = ""

        const validation = block.isValid(genesis.hash, genesis.index, exampledificult);
        expect(validation.success).toBeFalsy();
    });
})