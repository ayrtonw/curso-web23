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
    const exampledificult: number = 1;
    const exampleFee: number = 1;
    const exampleTx: string = "035e8bad4cab933a3b92d679fa1756da8f9deda2525fb66ca20d6477d2e092c7fe"
    let alice: Wallet, bob: Wallet;

    let genesis: Block;

    beforeAll(() => {
        alice = new Wallet();
        bob = new Wallet();

        genesis = new Block({
            transactions: [new Transaction({
                txInputs: [new TransactionInput()]
            } as Transaction)]
        } as Block);
    })

    function getFullBlock(): Block {
        //build sample txIn
        const txIn = new TransactionInput({
            amount: 10,
            fromAddres: alice.publicKey,
            previousTx: exampleTx
        } as TransactionInput);

        txIn.sign(alice.privateKey);

        //build sample txOut
        const txOut = new TransactionOutput({
            amount: 10,
            toAddress: bob.publicKey
        } as TransactionOutput);

        //build regutar tx
        const tx = new Transaction({
            txInputs: [txIn],
            txOutputs: [txOut]
        } as Transaction);

        //build fee tx
        const txFee = new Transaction({
            type: TransactionType.FEE,
            txOutputs: [new TransactionOutput({
                amount: 1,
                toAddress: alice.publicKey
            } as TransactionOutput)]
        } as Transaction);

        //generate block
        const block = new Block({
            index: 1,
            transactions: [tx, txFee],
            previousHash: genesis.hash
        } as Block);

        //mine block
        block.mine(exampledificult, alice.publicKey);

        return block;
    }

    test('Should NOT be valid (index not valid)', () => {
        const block = getFullBlock();
        block.index = -1;

        const validation = block.isValid(genesis.hash, genesis.index, exampledificult, exampleFee);

        expect(validation.success).toBeFalsy();
    });

    test('Should not be valid (empty hash)', () => {
        const block = getFullBlock();
        block.hash = "";

        const validation = block.isValid(genesis.hash, genesis.index, exampledificult, exampleFee);

        expect(validation.success).toBeFalsy();
    });

    test('Should not be valid (no mined)', () => {
        const block = getFullBlock();
        block.nonce = 0;

        const validation = block.isValid(genesis.hash, genesis.index, exampledificult, exampleFee);

        expect(validation.success).toBeFalsy();
    });
 
    test('Should NOT be valid (timestamp not valid)', () => {
        const block = getFullBlock();
        block.timestamp = -1;
        block.mine(exampledificult, alice.publicKey);

        const validation = block.isValid(genesis.hash, genesis.index, exampledificult, exampleFee);

        expect(validation.success).toBeFalsy();
    });

    test('Should NOT be valid (previous hash not valid)', () => {
        const block = getFullBlock();
        block.previousHash = "sample-fake-hash";
        block.mine(exampledificult, alice.publicKey);

        const validation = block.isValid(genesis.hash, genesis.index, exampledificult, exampleFee);

        expect(validation.success).toBeFalsy();
    });

    test('Should be valid', () => {
        const block = getFullBlock();
        const validation = block.isValid(genesis.hash, genesis.index, exampledificult, exampleFee);
        expect(validation.success).toBeTruthy();
    });

    test('Should NOT be valid (different hash)', () => {
        const block = getFullBlock();

        //change hash to make block invalid
        block.hash = "sample-fake-hash"

        const validation = block.isValid(genesis.hash, genesis.index, exampledificult, exampleFee);
        expect(validation.success).toBeFalsy();
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
        const validation = block.isValid(genesis.hash, genesis.index, exampledificult, exampleFee);
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
        const tx = new Transaction({
            type: TransactionType.FEE,
            txOutputs: [new TransactionOutput({
                toAddress: alice.publicKey,
                amount: 1
            } as TransactionOutput)]
        } as Transaction);

        block.transactions.push(tx);

        //regenerate block hash after adding fee transaction.
        block.hash = block.getHash();

        block.mine(exampledificult, alice.publicKey);
        const validation = block.isValid(genesis.hash, genesis.index, exampledificult, exampleFee);
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

        const validation = block.isValid(genesis.hash, genesis.index, exampledificult, exampleFee);

        expect(validation.success).toBeFalsy();
    });

    test('Should NOT be valid (2 FEE transactions)', () => {
        const block = getFullBlock();

        //add seccond fee transaction
        const tx = new Transaction({
            type: TransactionType.FEE,
            txOutputs: [new TransactionOutput()]
        } as Transaction);
        tx.txInputs = undefined;

        block.transactions.push(tx);

        block.mine(exampledificult, alice.publicKey);

        const validation = block.isValid(genesis.hash, genesis.index, exampledificult, exampleFee);
        expect(validation.success).toBeFalsy();
    });

    test('Should NOT be valid (invalid tx)', () => {
        const block = getFullBlock();
        block.transactions[0].timestamp = -1;
        block.hash = block.getHash();
        block.mine(exampledificult, alice.publicKey);

        const validation = block.isValid(genesis.hash, genesis.index, exampledificult, exampleFee);
        expect(validation.success).toBeFalsy();
    });
})