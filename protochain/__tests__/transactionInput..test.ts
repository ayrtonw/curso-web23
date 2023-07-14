import { describe, test, expect, beforeAll } from '@jest/globals';
import TransactionInput from '../src/lib/transactionInput';
import Wallet from '../src/lib/wallet';
import TransactionOutput from '../src/lib/transactionOutput';

//cria suite de testes
describe("TransactionInput tests", () => {

    const exampleTx: string = "035e8bad4cab933a3b92d679fa1756da8f9deda2525fb66ca20d6477d2e092c7fe";
    let alice: Wallet, bob: Wallet;

    beforeAll(() => {
        alice = new Wallet();
        bob = new Wallet();
    })


    test('Should be valid', () => {
        const txInput = new TransactionInput({
            amount: 10,
            fromAddres: alice.publicKey,
            previousTx: "sample-hash"
        } as TransactionInput);

        txInput.sign(alice.privateKey);

        const validation = txInput.isValid();
        expect(validation.success).toBeTruthy();
    });

    test('Should NOT be valid (defauls)', () => {
        const txInput = new TransactionInput();

        txInput.sign(alice.privateKey);

        const validation = txInput.isValid();
        expect(validation.success).toBeFalsy();
    });

    test('Should NOT be valid (empty signature)', () => {
        const txInput = new TransactionInput({
            amount: 10,
            fromAddres: alice.publicKey,
            previousTx: "sample-hash"
        } as TransactionInput);

        const validation = txInput.isValid();
        expect(validation.success).toBeFalsy();
    });

    test('Should NOT be valid (negative amount)', () => {
        const txInput = new TransactionInput({
            amount: -10,
            fromAddres: alice.publicKey,
            previousTx: "sample-hash"
        } as TransactionInput);

        txInput.sign(alice.privateKey);

        const validation = txInput.isValid();
        expect(validation.success).toBeFalsy();
    });

    test('Should NOT be valid (invalid signature)', () => {
        const txInput = new TransactionInput({
            amount: 10,
            fromAddres: alice.publicKey,
            previousTx: "sample-hash"
        } as TransactionInput);

        txInput.sign(bob.privateKey);

        const validation = txInput.isValid();
        expect(validation.success).toBeFalsy();
    });

    test('Should NOT be valid (invalid previous tx)', () => {
        const txInput = new TransactionInput({
            amount: 10,
            fromAddres: alice.publicKey,
        } as TransactionInput);

        txInput.sign(alice.privateKey);

        const validation = txInput.isValid();
        expect(validation.success).toBeFalsy();
    });

    test('Should create from TXO', () => {
        const txi = TransactionInput.fromTxo({
            amount: 10,
            toAddress: alice.publicKey,
            tx: exampleTx
        } as TransactionOutput);

        txi.sign(alice.privateKey);

        txi.amount = 11;
        
        const result = txi.isValid();

        expect(result.success).toBeFalsy();
    })
})