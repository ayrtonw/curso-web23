import { describe, test, expect, beforeAll } from '@jest/globals';
import Block from '../src/lib/block';

//cria suite de testes
describe("Block tests", () => {

    let genesis: Block;

    beforeAll(() => {
        genesis = new Block(0, "", "Gebesis Block");
    })

    test('Should not be valid (index not valid)', () => {
        const block = new Block(-1, genesis.hash, "hash2");
        const validation = block.isValid(genesis.hash, genesis.index);

        expect(validation.success).toBeFalsy();
    });

    test('Should not be valid (hash not valid)', () => {
        const block = new Block(1, genesis.hash, "hash2");
        block.hash = "";
        const validation = block.isValid(genesis.hash, genesis.index);

        expect(validation.success).toBeFalsy();
    });

    test('Should not be valid (data not valid)', () => {
        const block = new Block(1, genesis.hash, "");
        const validation = block.isValid(genesis.hash, genesis.index);

        expect(validation.success).toBeFalsy();
    });

    test('Should not be valid (timestamp not valid)', () => {
        const block = new Block(1, genesis.hash, "hash2");
        block.timestamp = -1;
        //update hash after changing timestamp.
        block.hash = block.getHash();
        const validation = block.isValid(genesis.hash, genesis.index);

        expect(validation.success).toBeFalsy();
    });

    test('Should not be valid (previous hash not valid)', () => {
        const block = new Block(1, "hash1", "hash2");
        const validation = block.isValid(genesis.hash, genesis.index);

        expect(validation.success).toBeFalsy();
    });

    test('Should be valid', () => {
        const block = new Block(1, genesis.hash, "hash2");
        const validation = block.isValid(genesis.hash, genesis.index);

        expect(validation.success).toBeTruthy();
    });
})