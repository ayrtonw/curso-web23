import { describe, test, expect, beforeAll } from '@jest/globals';
import Block from '../src/lib/block';
import BlockInfo from '../src/lib/blockInfo';

//cria suite de testes
describe("Block tests", () => {
    const exampledificult = 0;
    const exampledMiner = "ayrtonwallet-sample" 
    
    let genesis: Block;

    beforeAll(() => {
        genesis = new Block({
            data: "Genesis Block"
        } as Block);
    })

    test('Should not be valid (index not valid)', () => {
        const block = new Block({
            index: -1,
            previousHash: genesis.hash,
            data: "Block 2"
        } as Block);
        const validation = block.isValid(genesis.hash, genesis.index, exampledificult);

        expect(validation.success).toBeFalsy();
    });

    test('Should not be valid (empty hash)', () => {
        const block = new Block({
            index: 1,
            previousHash: genesis.hash,
            data: "Block 2",
        } as Block);

        block.mine(exampledificult, exampledMiner);
        block.hash = "";
        const validation = block.isValid(genesis.hash, genesis.index, exampledificult);

        expect(validation.success).toBeFalsy();
    });

    test('Should not be valid (no mined)', () => {
        const block = new Block({
            index: 1,
            previousHash: genesis.hash,
            data: "Block 2",
        } as Block);

        block.hash = "";
        const validation = block.isValid(genesis.hash, genesis.index, exampledificult);

        expect(validation.success).toBeFalsy();
    });

    test('Should not be valid (data not valid)', () => {
        const block = new Block({
            index: 1,
            previousHash: genesis.hash,
            data: ""
        } as Block);
        const validation = block.isValid(genesis.hash, genesis.index, exampledificult);

        expect(validation.success).toBeFalsy();
    });

    test('Should not be valid (timestamp not valid)', () => {
        const block = new Block({
            index: 1,
            previousHash: genesis.hash,
            data: "Block 2",
            timestamp: -1
        } as Block);      
        // //update hash after changing timestamp.
        // block.hash = block.getHash();
        const validation = block.isValid(genesis.hash, genesis.index, exampledificult);

        expect(validation.success).toBeFalsy();
    });

    test('Should not be valid (previous hash not valid)', () => {
        const block = new Block({
            index: 1,
            previousHash: 'hash1',
            data: 'Block 2'
        } as Block);
        const validation = block.isValid(genesis.hash, genesis.index, exampledificult);

        expect(validation.success).toBeFalsy();
    });

    test('Should be valid', () => {
        const block = new Block({
            index: 1,
            previousHash: genesis.hash,
            data: "BLock 2"
        } as Block);
        block.mine(exampledificult, exampledMiner);
        const validation = block.isValid(genesis.hash, genesis.index, exampledificult);   
        expect(validation.success).toBeTruthy();
    });

    test('Should create from blockinfo', () => {
        const block = Block.fromBlockInfo({
            data: 'Block 2',
            difficulty: exampledificult,
            feePerTx: 1,
            index: 1,
            maxDIfficulty: 62,
            previousHash: genesis.hash
        } as BlockInfo);

        block.mine(exampledificult, exampledMiner);
        const validation = block.isValid(genesis.hash, genesis.index, exampledificult);   
        expect(validation.success).toBeTruthy();
    });

    test('Should NOT be valid (fallbacks)', () => {
        const block = new Block();
        const validation = block.isValid(genesis.hash, genesis.index, exampledificult);

        expect(validation.success).toBeFalsy();
    });
})