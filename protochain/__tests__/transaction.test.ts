import { describe, test, expect } from '@jest/globals';
import Transaction from '../src/lib/transaction';
import TransactionType from '../src/lib/transactionType';

//cria suite de testes
describe("Transaction tests", () => {
    
    test('Should be valid (REGULAR default)', () => {
        const tx = new Transaction({
            data: "tx sample"
        } as Transaction);
        const validation = tx.isValid();

        expect(validation.success).toBeTruthy();
    });

    test('Should NOT be valid (invalid hash)', () => {
        const tx = new Transaction({
            data: "tx sample",
            type: TransactionType.REGULAR,
            timestamp: Date.now(),
            hash: 'invalid-hash-sample'
        } as Transaction);

        const validation = tx.isValid();

        expect(validation.success).toBeFalsy();
    });

    test('Should be valid (FEE)', () => {
        const tx = new Transaction({
            data: "tx sample",
            type: TransactionType.FEE
        } as Transaction);
        const validation = tx.isValid();

        expect(validation.success).toBeTruthy();
    });   

    test('Should NOT be valid (invalid data)', () => {
        const tx = new Transaction();

        const validation = tx.isValid();

        expect(validation.success).toBeFalsy();
    });

    

})