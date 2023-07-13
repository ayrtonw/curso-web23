import { describe, test, expect, beforeAll, jest } from '@jest/globals';
import Block from '../src/lib/block';
import BlockInfo from '../src/lib/blockInfo';
import Transaction from '../src/lib/transaction';
import TransactionType from '../src/lib/transactionType';
import TransactionInput from '../src/lib/transactionInput';
import TransactionOutput from '../src/lib/transactionOutput';
import Wallet from '../src/lib/wallet';

//mock classes
jest.mock('../src/lib/transaction');
jest.mock('../src/lib/transactionInput');
jest.mock('../src/lib/transactionOutput');

//cria suite de testes
describe("Block tests", () => {
    const exampledificult = 1;
    let alice: Wallet;

    let genesis: Block;

    beforeAll(() => {
        alice = new Wallet();

        genesis = new Block({
            transactions: [new Transaction({
                txInputs: [new TransactionInput()]
            } as Transaction)]
        } as Block);
    })

    test('Should NOT be valid (index not valid)', () => {
        const block = new Block({
            index: -1,
            previousHash: genesis.hash,
            transactions: [new Transaction({
                txInputs: [new TransactionInput()]
            } as Transaction)]
        } as Block);

        //add fee transaction to the block.
        block.transactions.push(new Transaction({
            type: TransactionType.FEE,
            txOutputs: [new TransactionOutput()]
        } as Transaction));

        //regenerate block hash after adding fee transaction.
        block.hash = block.getHash();
        block.mine(exampledificult, alice.publicKey);

        const validation = block.isValid(genesis.hash, genesis.index, exampledificult);

        expect(validation.success).toBeFalsy();
    });

    test('Should not be valid (empty hash)', () => {
        const block = new Block({
            index: 1,
            previousHash: genesis.hash,
            transactions: [new Transaction({
                txInputs: [new TransactionInput()]
            } as Transaction)]
        } as Block);

        //add fee transaction to the block.
        block.transactions.push(new Transaction({
            type: TransactionType.FEE,
            txOutputs: [new TransactionOutput()]
        } as Transaction));

        //regenerate block hash after adding fee transaction.
        block.hash = block.getHash();

        block.mine(exampledificult, alice.publicKey);
        block.hash = "";
        const validation = block.isValid(genesis.hash, genesis.index, exampledificult);

        expect(validation.success).toBeFalsy();
    });

    test('Should not be valid (no mined)', () => {
        const block = new Block({
            index: 1,
            nonce: 0,
            miner: alice.publicKey,
            previousHash: genesis.hash,
            transactions: [new Transaction({
                txInputs: [new TransactionInput()]
            } as Transaction)]
        } as Block);

        //add fee transaction to the block.
        block.transactions.push(new Transaction({
            type: TransactionType.FEE,
            txOutputs: [new TransactionOutput()]
        } as Transaction));

        //regenerate block hash after adding fee transaction.
        block.hash = block.getHash();

        const validation = block.isValid(genesis.hash, genesis.index, exampledificult);

        expect(validation.success).toBeFalsy();
    });

    test('Should NOT be valid (txInput)', () => {
        const txInputs = [new TransactionInput()];
        txInputs[0].amount = -1;

        const block = new Block({
            index: 1,
            previousHash: genesis.hash,
            transactions: [new Transaction({
                txInputs
            } as Transaction)]
        } as Block);

        //add fee transaction to the block.
        block.transactions.push(new Transaction({
            type: TransactionType.FEE,
            txOutputs: [new TransactionOutput()]
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
                txInputs: [new TransactionInput()]
            } as Transaction)],
            timestamp: -1
        } as Block);

        //add fee transaction to the block.
        block.transactions.push(new Transaction({
            type: TransactionType.FEE,
            txOutputs: [new TransactionOutput()]
        } as Transaction));

        //regenerate block hash after adding fee transaction.
        block.hash = block.getHash();
        block.mine(exampledificult, alice.publicKey);

        const validation = block.isValid(genesis.hash, genesis.index, exampledificult);

        expect(validation.success).toBeFalsy();
    });

    test('Should NOT be valid (previous hash not valid)', () => {
        const block = new Block({
            index: 1,
            previousHash: 'hash1',
            transactions: [new Transaction({
                txInputs: [new TransactionInput()]
            } as Transaction)]
        } as Block);

        //add fee transaction to the block.
        block.transactions.push(new Transaction({
            type: TransactionType.FEE,
            txOutputs: [new TransactionOutput()]
        } as Transaction));

        //regenerate block hash after adding fee transaction.
        block.hash = block.getHash();
        block.mine(exampledificult, alice.publicKey);

        const validation = block.isValid(genesis.hash, genesis.index, exampledificult);

        expect(validation.success).toBeFalsy();
    });

    test('Should be valid', () => {
        const block = new Block({
            index: 1,
            previousHash: genesis.hash,
            transactions: [] as Transaction[]
        } as Block);

        //add fee transaction to the block.
        block.transactions.push(new Transaction({
            type: TransactionType.FEE,
            txOutputs: [new TransactionOutput({
                toAddress: alice.publicKey,
                amount: 1
            } as TransactionOutput)]
        } as Transaction));

        //regenerate block hash after adding fee transaction.
        block.hash = block.getHash();

        block.mine(exampledificult, alice.publicKey);
        const validation = block.isValid(genesis.hash, genesis.index, exampledificult);
        expect(validation.success).toBeTruthy();
    });

    test('Should NOT be valid (no fee)', () => {
        const block = new Block({
            index: 1,
            previousHash: genesis.hash,
            transactions: [new Transaction({
                txInputs: [new TransactionInput()]
            } as Transaction)]
        } as Block);

        block.mine(exampledificult, alice.publicKey);
        const validation = block.isValid(genesis.hash, genesis.index, exampledificult);
        expect(validation.success).toBeFalsy();
    });

    test('Should create from block info', () => {
        const block = Block.fromBlockInfo({
            transactions: [],
            difficulty: exampledificult,
            feePerTx: 1,
            index: 1,
            maxDIfficulty: 62,
            previousHash: genesis.hash
        } as BlockInfo);

        //add fee transaction to the block.
        block.transactions.push(new Transaction({
            type: TransactionType.FEE,
            txOutputs: [new TransactionOutput({
                toAddress: alice.publicKey,
                amount: 1
            }as TransactionOutput)]
        } as Transaction));

        //regenerate block hash after adding fee transaction.
        block.hash = block.getHash();

        block.mine(exampledificult, alice.publicKey);
        const validation = block.isValid(genesis.hash, genesis.index, exampledificult);
        expect(validation.success).toBeTruthy();
    });

    test('Should NOT be valid (fallbacks)', () => {
        const block = new Block();

        //add fee transaction to the block.
        block.transactions.push(new Transaction({
            type: TransactionType.FEE,
            txOutputs: [new TransactionOutput()]
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
                    txInputs: [new TransactionInput()]
                } as Transaction),
                new Transaction({
                    type: TransactionType.FEE,
                    txInputs: [new TransactionInput()]
                } as Transaction)
            ]
        } as Block);
        block.mine(exampledificult, alice.publicKey);
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
            txOutputs: [new TransactionOutput()]
        } as Transaction));

        //regenerate block hash after adding fee transaction.
        block.hash = block.getHash();

        block.mine(exampledificult, alice.publicKey);

        //make tx invalid on the mock class
        block.transactions[0].txOutputs[0].toAddress = ""

        const validation = block.isValid(genesis.hash, genesis.index, exampledificult);
        expect(validation.success).toBeFalsy();
    });
})