/**
 * The BlockInfo Interface
 */
export default interface BlockInfo {
    index: number;
    previousHash: string;
    difficulty: number;
    maxDIfficulty: number;
    feePerTx: number;
    data: string;
}