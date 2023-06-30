import { describe, test, expect } from '@jest/globals';
import Block from '../src/lib/block';
import Blockchain from '../src/lib/blockchain';

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
        blockchain.addBlock(new Block(1, blockchain.blocks[0].hash, "Block 2"));
        expect(blockchain.isValid().success).toEqual(true);
    });

    test('Should NOT be valid', () => {
        const blockchain = new Blockchain();
        blockchain.addBlock(new Block(1, blockchain.blocks[0].hash, "Block 2"));
        blockchain.blocks[1].data = "a transfer 2 to b";
        expect(blockchain.isValid().success).toEqual(false);
    });
   
    test('Should add block', () => {
        const blockchain = new Blockchain();
        const result = blockchain.addBlock(new Block(1, blockchain.blocks[0].hash, "Block 2"));
        expect(result.success).toEqual(true);
    });

    test('Should NOT add block', () => {
        const blockchain = new Blockchain();
        const result = blockchain.addBlock(new Block(-1, blockchain.blocks[0].hash, "Block 2"));
        expect(result.success).toEqual(false);
    });

})