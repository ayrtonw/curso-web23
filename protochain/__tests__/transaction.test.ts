import { describe, test, expect, jest } from '@jest/globals';
import Transaction from '../src/lib/transaction';
import TransactionType from '../src/lib/transactionType';
import TransactionInput from '../src/lib/transactionInput';
import TransactionOutput from '../src/lib/transactionOutput';

//mock block class
jest.mock('../src/lib/transactionInput');
jest.mock('../src/lib/transactionOutput');

//cria suite de testes
describe("Transaction tests", () => {

    const exampledificult: number = 1;
    const exampleFee: number = 1;

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
})