import { describe, test, expect, jest, beforeAll } from '@jest/globals';
import Block from '../src/lib/block';
import Blockchain from '../src/lib/blockchain';
import Transaction from '../src/lib/transaction';
import TransactionInput from '../src/lib/transactionInput';
import Wallet from '../src/lib/wallet';
import TransactionOutput from '../src/lib/transactionOutput';
import TransactionType from '../src/lib/transactionType';

//mock block class
jest.mock('../src/lib/block');
jest.mock('../src/lib/transaction');
jest.mock('../src/lib/transactionInput');

//cria suite de testes
describe("Blockchain tests", () => {

    let alice: Wallet;

    beforeAll(() => {
        alice = new Wallet();
    })

    test('Should have genesis block', () => {
        const blockchain = new Blockchain(alice.publicKey);
        expect(blockchain.blocks.length).toEqual(1);
    });

    test('Should be valid (genesis)', () => {
        const blockchain = new Blockchain(alice.publicKey);
        expect(blockchain.isValid().success).toEqual(true);
    });

    test('Should be valid (two blocks)', () => {
        const blockchain = new Blockchain(alice.publicKey);
        blockchain.addBlock(new Block({
            index: 1,
            previousHash: blockchain.blocks[0].hash,
            transactions: [new Transaction({
                txInputs: [new TransactionInput()]
            } as Transaction)]
        } as Block));
        expect(blockchain.isValid().success).toEqual(true);
    });

    test('Should NOT be valid', () => {
        const blockchain = new Blockchain(alice.publicKey);

        const tx = new Transaction({
            txInputs: [new TransactionInput()]
        } as Transaction);

        blockchain.mempool.push(tx);

        blockchain.addBlock(new Block({
            index: 1,
            previousHash: blockchain.blocks[0].hash,
            transactions: [tx]
        } as Block));

        //make mock block invalid
        blockchain.blocks[1].index = -1;

        expect(blockchain.isValid().success).toEqual(false);
    });

    test('Should add transaction', () => {
        const blockchain = new Blockchain(alice.publicKey);
        const txo = blockchain.blocks[0].transactions[0];

        const tx = new Transaction();
        tx.hash = "sample-hash";
        
        tx.txInputs = [new TransactionInput({
            amount: 10,
            previousTx: txo.hash,
            fromAddres: alice.publicKey,
            signature: "sample-signature"
        } as TransactionInput)];

        tx.txOutputs = [new TransactionOutput({
            amount: 10,
            toAddress: "sample-hash"
        } as TransactionOutput)];

        const validation = blockchain.addTransaction(tx);

        expect(validation.success).toEqual(true);
    });

    test('Should NOT add transaction (pending tx)', () => {
        const blockchain = new Blockchain(alice.publicKey);

        const tx = new Transaction({
            txInputs: [new TransactionInput()],
            hash: "sample-hash-1"
        } as Transaction);
        blockchain.addTransaction(tx);

        const tx2 = new Transaction({
            txInputs: [new TransactionInput()],
            hash: "sample-hash-2"
        } as Transaction);

        const validation = blockchain.addTransaction(tx2);

        expect(validation.success).toBeFalsy();
    });

    test('Should NOT add transaction (invalid tx)', () => {
        const blockchain = new Blockchain(alice.publicKey);

        const tx = new Transaction({
            txInputs: [new TransactionInput()],
            hash: "sample-hash-1",
            timestamp: -1
        } as Transaction);

        const validation = blockchain.addTransaction(tx);

        expect(validation.success).toEqual(false);
    });

    test('Should NOT add transaction (duplicated in blockchain)', () => {
        const blockchain = new Blockchain(alice.publicKey);

        const tx = new Transaction({
            txInputs: [new TransactionInput()],
            hash: "sample-hash-1"
        } as Transaction);

        //add transaction to the block and into the blockchain
        blockchain.blocks.push(new Block({
            transactions: [tx]
        } as Block));

        //try to add the same transaction again to the blockchain mempool
        const validation = blockchain.addTransaction(tx);

        expect(validation.success).toEqual(false);
    });

    test('Should get transaction (mempool)', () => {
        const blockchain = new Blockchain(alice.publicKey);

        const tx = new Transaction({
            txInputs: [new TransactionInput()],
            hash: "sample-hash-123"
        } as Transaction);

        blockchain.mempool.push(tx);

        const result = blockchain.getTransaction("sample-hash-123");
        expect(result.mempoolIndex).toEqual(0);
    });

    test('Should get transaction (blockchain)', () => {
        const blockchain = new Blockchain(alice.publicKey);

        const tx = new Transaction({
            txInputs: [new TransactionInput()],
            hash: "sample-hash-123"
        } as Transaction);

        blockchain.blocks.push(new Block({
            transactions: [tx]
        } as Block));

        const result = blockchain.getTransaction("sample-hash-123");
        expect(result.blockIndex).toEqual(1);
    });

    test('Should NOT get transaction', () => {
        const blockchain = new Blockchain(alice.publicKey);
        const result = blockchain.getTransaction("sample-hash-not-added-to-mempool-or-blocks-123");
        expect(result.blockIndex).toEqual(-1);
        expect(result.mempoolIndex).toEqual(-1);
    });

    test('Should add block', () => {
        const blockchain = new Blockchain(alice.publicKey);

        const tx = new Transaction({
            txInputs: [new TransactionInput()],
        } as Transaction);

        blockchain.mempool.push(tx);

        const result = blockchain.addBlock(new Block({
            index: 1,
            previousHash: blockchain.blocks[0].hash,
            transactions: [tx]
        } as Block));
        expect(result.success).toEqual(true);
    });

    test('Should NOT add block (invalid mempol)', () => {
        const blockchain = new Blockchain(alice.publicKey);
        blockchain.mempool.push(new Transaction());
        blockchain.mempool.push(new Transaction());

        const tx = new Transaction({
            txInputs: [new TransactionInput()],
        } as Transaction);

        const result = blockchain.addBlock(new Block({
            index: 1,
            previousHash: blockchain.blocks[0].hash,
            transactions: [tx]
        } as Block));
        expect(result.success).toBeFalsy();
    });

    test('Should get block', () => {
        const blockchain = new Blockchain(alice.publicKey);
        const block = blockchain.getBlock(blockchain.blocks[0].hash);
        expect(block).toBeTruthy();
    });

    test('Should NOT add block (invalid index)', () => {
        const blockchain = new Blockchain(alice.publicKey);
        blockchain.mempool.push(new Transaction())

        const block = new Block({
            index: -1,
            previousHash: blockchain.blocks[0].hash
        } as Block);

        //add fee transaction to the block.
        block.transactions.push(new Transaction({
            type: TransactionType.FEE,
            txOutputs: [new TransactionOutput({
                toAddress: alice.publicKey,
                amount: 1
            } as TransactionOutput)]
        } as Transaction));

        block.hash = block.getHash();

        const result = blockchain.addBlock(block);
        expect(result.success).toEqual(false);
    });

    test('Should get next block info', () => {
        const blockchain = new Blockchain(alice.publicKey);

        //add a sample transaction to the mempool
        blockchain.mempool.push(new Transaction());

        const info = blockchain.getNextBlocks();
        expect(info ? info.index : 0).toEqual(1);
    });

    test('Should NOT get next block info', () => {
        const blockchain = new Blockchain(alice.publicKey);
        const info = blockchain.getNextBlocks();
        expect(info).toBeNull();
    });

})