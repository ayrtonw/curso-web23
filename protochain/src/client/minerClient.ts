import dotenv from 'dotenv';
dotenv.config();

import axios from "axios";
import BlockInfo from "../lib/blockInfo";
import Block from "../lib/block";
import Wallet from '../lib/wallet';
import Transaction from '../lib/transaction';
import TransactionType from '../lib/transactionType';
import TransactionOutput from '../lib/transactionOutput';
import Blockchain from '../lib/blockchain';

const BLOCKCHAIN_SERVER = process.env.BLOCKCHAIN_SERVER;

const minerWallet = new Wallet(process.env.MINER_WALLET);

console.log("Logged as " + minerWallet.publicKey);

let totalMined = 0;

function getRewardTx(blockInfo: BlockInfo, nextBlock: Block): Transaction | undefined {
    let amount = 0;

    //check if is still possible to get rewards per block mined.
    if (blockInfo.difficulty <= blockInfo.maxDIfficulty)
        amount += Blockchain.getRewardAmount(blockInfo.difficulty);

    const fees = nextBlock.transactions.map(tx => tx.getFee()).reduce((a, b) => a + b);
    const feeCheck = nextBlock.transactions.length * blockInfo.feePerTx;

    if (fees < feeCheck) {
        console.log("Low fees. Awaiting next block.")
        setTimeout(() => {
            mine();
        }, 5000);

        return;
    }

    amount += fees;

    const txo = new TransactionOutput({
        toAddress: minerWallet.publicKey,
        amount: amount
    } as TransactionOutput);

    return Transaction.fromReward(txo);
}

async function mine() {
    console.log("Getting next block info...")
    const { data } = await axios.get(`${BLOCKCHAIN_SERVER}blocks/next`);

    //if there are no transactions to be added to the block, try again in 5 seconds
    if (!data) {
        console.log("No Tx found. Waiting...");
        return setTimeout(() => {
            mine();
        }, 5000);
    }

    const blockInfo = data as BlockInfo;

    const newBlock = Block.fromBlockInfo(blockInfo);

    //transaction fee to the miner.
    const tx = getRewardTx(blockInfo, newBlock);
    if(!tx) return;
    newBlock.transactions.push(tx);

    newBlock.miner = minerWallet.publicKey;

    //regenerate hash because of previus transaction added to the block.
    newBlock.hash = newBlock.getHash();

    console.log("Start mining block #" + blockInfo.index);
    newBlock.mine(blockInfo.difficulty, minerWallet.publicKey);

    console.log('Block mined! Sending to blockchain...');

    try {
        await axios.post(`${BLOCKCHAIN_SERVER}blocks/`, newBlock);
        console.log("Block sent and accepted!");
        totalMined++;
        console.log("Total mined blocks: " + totalMined);
    } catch (err: any) {
        console.error(err.response ? err.response.data : err.message);
    }

    setTimeout(() => {
        mine();
    }, 1000);
}

mine();