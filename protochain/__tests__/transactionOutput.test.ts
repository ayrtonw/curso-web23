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
        const txInput = new TransactionOutput({
            amount: 10,
            toAddress: alice.publicKey,
            tx: "sample-hash"
        } as TransactionOutput);  

        const validation = txInput.isValid();
        expect(validation.success).toBeTruthy();
    });
})