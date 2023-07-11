import { describe, test, expect, jest } from '@jest/globals';
import Transaction from '../src/lib/transaction';
import TransactionType from '../src/lib/transactionType';
import TransactionInput from '../src/lib/transactionInput';

//mock block class
jest.mock('../src/lib/transactionInput');

//cria suite de testes
describe("Transaction tests", () => {
    
    test('Should be valid (REGULAR default)', () => {
        const tx = new Transaction({
            txInput: new TransactionInput(),
            to: "sample-hash-to"  
        } as Transaction);
        const validation = tx.isValid();

        expect(validation.success).toBeTruthy();
    });

    test('Should NOT be valid (invalid hash)', () => {
        const tx = new Transaction({
            txInput: new TransactionInput(),
            to: "sample-hash-to",  
            type: TransactionType.REGULAR,
            timestamp: Date.now(),
            hash: 'invalid-hash-sample'
        } as Transaction);

        const validation = tx.isValid();

        expect(validation.success).toBeFalsy();
    });

    test('Should be valid (FEE)', () => {
        const tx = new Transaction({
            to: "sample-hash-to",  
            type: TransactionType.FEE
        } as Transaction);

        //make it undefined, FEE transactions don't need txInput
        tx.txInput = undefined;
        tx.hash= tx.getHash();

        const validation = tx.isValid();
        expect(validation.success).toBeTruthy();
    });   

    test('Should NOT be valid (invalid to)', () => {
        const tx = new Transaction();
        const validation = tx.isValid();
        expect(validation.success).toBeFalsy();
    });

    test('Should NOT be valid (invalid txInput)', () => {
        const tx = new Transaction({
            to: "sample-hash-to",
            txInput: new TransactionInput({
                amount: -10,
                fromAddres: "sample-hash-from",
                signature: "sample-signature"
            } as TransactionInput)
        } as Transaction);
        const validation = tx.isValid();
        expect(validation.success).toBeFalsy();
    });
})