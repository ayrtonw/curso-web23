import { describe, test, expect, beforeAll } from '@jest/globals';
import TransactionOutput from '../src/lib/transactionOutput';
import Wallet from '../src/lib/wallet';

//cria suite de testes
describe("TransactionOutput tests", () => {

    let alice: Wallet, bob: Wallet;

    beforeAll(() => {
        alice = new Wallet();
        bob = new Wallet();
    })

    test('Should be valid', () => {
        const txOutput = new TransactionOutput({
            amount: 10,
            toAddress: alice.publicKey,
            tx: "sample-hash"
        } as TransactionOutput);  

        const validation = txOutput.isValid();
        expect(validation.success).toBeTruthy();
    });

    test('Should NOT be valid (default)', () => {
        const txOutput = new TransactionOutput();  
        const validation = txOutput.isValid();
        expect(validation.success).toBeFalsy();
    });

    test('Should NOT be valid', () => {
        const txOutput = new TransactionOutput({
            amount: -10,
            toAddress: alice.publicKey,
            tx: "sample-hash"
        } as TransactionOutput);  

        const validation = txOutput.isValid();
        expect(validation.success).toBeFalsy();
    });

    test('Should get hash', () => {
        const txOutput = new TransactionOutput({
            amount: 10,
            toAddress: alice.publicKey,
            tx: "sample-hash"
        } as TransactionOutput);  

        const hash = txOutput.getHash();
        expect(hash).toBeTruthy();
    });
})