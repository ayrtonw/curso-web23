import { describe, test, expect, jest } from '@jest/globals';
import Block from '../src/lib/block';
import Blockchain from '../src/lib/blockchain';
import Transaction from '../src/lib/transaction';

//mock block class
jest.mock('../src/lib/block');
jest.mock('../src/lib/transaction');

//cria suite de testes
describe("Blockchain tests", () => {

    test('Should have genesis block', () => {
        const blockchain = new Blockchain();
        expect(blockchain.blocks.length).toEqual(1);
    });

    test('Should be valid (genesis)', () => {
        const blockchain = new Blockchain();
        expect(blockchain.isValid().success).toEqual(true);
    });

    test('Should be valid (two blocks)', () => {
        const blockchain = new Blockchain();
        blockchain.addBlock(new Block({
            index: 1,
            previousHash: blockchain.blocks[0].hash,
            transactions: [new Transaction({
                data: "tx2"
            } as Transaction)]
        } as Block));
        expect(blockchain.isValid().success).toEqual(true);
    });

    test('Should NOT be valid', () => {
        const blockchain = new Blockchain();

        const tx = new Transaction({
            data: "tx1"
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
        const blockchain = new Blockchain();

        const tx = new Transaction({
            data: "tx1",
            hash: "sample-hash-1"
        } as Transaction);

        const validation = blockchain.addTransaction(tx);

        expect(validation.success).toEqual(true);
    });

    test('Should NOT add transaction (invalid tx)', () => {
        const blockchain = new Blockchain();

        const tx = new Transaction({
            data: "",
            hash: "sample-hash-1"
        } as Transaction);

        const validation = blockchain.addTransaction(tx);

        expect(validation.success).toEqual(false);
    });

    test('Should NOT add transaction (duplicated in blockchain)', () => {
        const blockchain = new Blockchain();

        const tx = new Transaction({
            data: "tx1",
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

    test('Should NOT add transaction (duplicated in mempool)', () => {
        const blockchain = new Blockchain();

        const tx = new Transaction({
            data: "tx1",
            hash: "sample-hash-1"
        } as Transaction);

        //add transaction to the mempool
        blockchain.mempool.push(tx);

        //try to add the same transaction again to the blockchain mempool
        const validation = blockchain.addTransaction(tx);

        expect(validation.success).toEqual(false);
    });

    test('Should get transaction (mempool)', () => {
        const blockchain = new Blockchain();

        const tx = new Transaction({
            data: "tx1",
            hash: "sample-hash-123"
        } as Transaction);

        blockchain.mempool.push(tx);

        const result = blockchain.getTransaction("sample-hash-123");
        expect(result.mempoolIndex).toEqual(0);
    });

    test('Should get transaction (blockchain)', () => {
        const blockchain = new Blockchain();

        const tx = new Transaction({
            data: "tx1",
            hash: "sample-hash-123"
        } as Transaction);

        blockchain.blocks.push(new Block({
            transactions: [tx]
        } as Block));

        const result = blockchain.getTransaction("sample-hash-123");
        expect(result.blockIndex).toEqual(1);
    });

    test('Should NOT get transaction', () => {
        const blockchain = new Blockchain();
        const result = blockchain.getTransaction("sample-hash-not-added-to-mempool-or-blocks-123");
        expect(result.blockIndex).toEqual(-1);
        expect(result.mempoolIndex).toEqual(-1);
    });

    test('Should add block', () => {
        const blockchain = new Blockchain();

        const tx = new Transaction({
            data: "tx1"
        } as Transaction);

        blockchain.mempool.push(tx);

        const result = blockchain.addBlock(new Block({
            index: 1,
            previousHash: blockchain.blocks[0].hash,
            transactions: [tx]
        } as Block));
        expect(result.success).toEqual(true);
    });

    test('Should get block', () => {
        const blockchain = new Blockchain();
        const block = blockchain.getBlock(blockchain.blocks[0].hash);
        expect(block).toBeTruthy();
    });

    test('Should NOT add block', () => {
        const blockchain = new Blockchain();
        const result = blockchain.addBlock(new Block({
            index: -1,
            previousHash: blockchain.blocks[0].hash,
            transactions: [new Transaction({
                data: "tx1"
            } as Transaction)]
        } as Block));
        expect(result.success).toEqual(false);
    });

    test('Should get next block info', () => {
        const blockchain = new Blockchain();

        //add a sample transaction to the mempool
        blockchain.mempool.push(new Transaction());

        const info = blockchain.getNextBlocks();
        expect(info ? info.index : 0).toEqual(1);
    });

    test('Should NOT get next block info', () => {
        const blockchain = new Blockchain();
        const info = blockchain.getNextBlocks();
        expect(info).toBeNull();
    });

})