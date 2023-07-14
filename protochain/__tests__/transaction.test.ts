import { describe, test, expect, jest, beforeAll } from '@jest/globals';
import Transaction from '../src/lib/transaction';
import TransactionType from '../src/lib/transactionType';
import TransactionInput from '../src/lib/transactionInput';
import TransactionOutput from '../src/lib/transactionOutput';
import Wallet from '../src/lib/wallet';

//mock block class
jest.mock('../src/lib/transactionInput');
jest.mock('../src/lib/transactionOutput');

//cria suite de testes
describe("Transaction tests", () => {

    const exampledificult: number = 1;
    const exampleFee: number = 1;
    const exampleTx: string = "035e8bad4cab933a3b92d679fa1756da8f9deda2525fb66ca20d6477d2e092c7fe";
    let alice: Wallet, bob: Wallet;

    beforeAll(() => {
        alice = new Wallet();
        bob = new Wallet();
    })

    test('Should be valid (REGULAR default)', () => {
        const tx = new Transaction({
            txInputs: [new TransactionInput()],
            txOutputs: [new TransactionOutput()]
        } as Transaction);
        const validation = tx.isValid(exampledificult, exampleFee);

        expect(validation.success).toBeTruthy();
    });

    test('Should NOT be valid (txo hash != tx hash)', () => {
        const tx = new Transaction({
            txInputs: [new TransactionInput()],
            txOutputs: [new TransactionOutput()]
        } as Transaction);

        tx.txOutputs[0].tx = "sample-wrong-hash"

        const validation = tx.isValid(exampledificult, exampleFee);
        expect(validation.success).toBeFalsy();
    });

    test('Should NOT be valid (inputs < outputs)', () => {
        const tx = new Transaction({
            txInputs: [new TransactionInput({
                amount: 1
            } as TransactionInput)],
            txOutputs: [new TransactionOutput({
                amount: 2
            } as TransactionOutput)]
        } as Transaction);

        const validation = tx.isValid(exampledificult, exampleFee);
        expect(validation.success).toBeFalsy();
    });

    test('Should NOT be valid (invalid hash)', () => {
        const tx = new Transaction({
            txInputs: [new TransactionInput()],
            txOutputs: [new TransactionOutput()],
            type: TransactionType.REGULAR,
            timestamp: Date.now(),
            hash: 'invalid-hash-sample'
        } as Transaction);

        const validation = tx.isValid(exampledificult, exampleFee);

        expect(validation.success).toBeFalsy();
    });

    test('Should be valid (FEE)', () => {
        const tx = new Transaction({
            txOutputs: [new TransactionOutput()],
            type: TransactionType.FEE
        } as Transaction);

        //make it undefined, FEE transactions don't need txInput
        tx.txInputs = undefined;
        tx.hash = tx.getHash();

        const validation = tx.isValid(exampledificult, exampleFee);
        expect(validation.success).toBeTruthy();
    });

    test('Should NOT be valid (invalid to)', () => {
        const tx = new Transaction();
        const validation = tx.isValid(exampledificult, exampleFee);
        expect(validation.success).toBeFalsy();
    });

    test('Should NOT be valid (invalid txInput)', () => {
        const tx = new Transaction({
            txOutputs: [new TransactionOutput()],
            txInputs: [new TransactionInput({
                amount: -10,
                fromAddres: "sample-hash-from",
                signature: "sample-signature"
            } as TransactionInput)]
        } as Transaction);
        const validation = tx.isValid(exampledificult, exampleFee);
        expect(validation.success).toBeFalsy();
    });

    test('Should get fee', () => {
        const txIn = new TransactionInput({
            amount: 11,
            fromAddres: alice.publicKey,
            previousTx: exampleTx
        } as TransactionInput);

        txIn.sign(alice.privateKey);

        const txOut = new TransactionOutput({
            amount: 10,
            toAddress: bob.publicKey
        } as TransactionOutput);

        const tx = new Transaction({
            txInputs: [txIn],
            txOutputs: [txOut]
        } as Transaction);

        const result = tx.getFee();

        expect(result).toBeGreaterThan(0);
    });

    test('Should get zero fee', () => {
        const tx = new Transaction();
        tx.txInputs = undefined;
        const result = tx.getFee();

        expect(result).toEqual(0);
    });

    test('Should create from reward', () => {
        const tx = Transaction.fromReward({
            amount: 10,
            toAddress: alice.publicKey,
            tx: exampleTx
        }as TransactionOutput);

        const result = tx.isValid(exampledificult, exampleFee);

        expect(result.success).toBeTruthy();
    });

    test('Should NOT be valid (fee excess)', () => {
        const txOut = new TransactionOutput({
            amount: Number.MAX_VALUE,
            toAddress: bob.publicKey
        } as TransactionOutput);

        const tx = new Transaction({
            type: TransactionType.FEE,
            txOutputs: [txOut]
        } as Transaction);

        const result = tx.isValid(exampledificult, exampleFee);

        expect(result.success).toBeFalsy();
    });
})