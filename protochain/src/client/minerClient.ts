import dotenv from 'dotenv';
dotenv.config();

import axios from "axios";
import BlockInfo from "../lib/blockInfo";
import Block from "../lib/block";

const BLOCKCHAIN_SERVER = process.env.BLOCKCHAIN_SERVER;

const minerWallet = {
    privateKey: "12345",
    publicKey: `${process.env.MINER_WALLET}`
}

console.log("Logged as " + minerWallet.publicKey);

let totalMined = 0;

async function mine() {
    console.log("Getting next block info...")
    const { data } = await axios.get(`${BLOCKCHAIN_SERVER}blocks/next`);

    //if there are no transactions to be added to the block, try again in 5 seconds
    if(!data){
        console.log("No Tx found. Waiting...");
        return setTimeout(() => {
            mine();
        }, 5000);
    }

    const blockInfo = data as BlockInfo;

    const newBlock = Block.fromBlockInfo(blockInfo);

    //TODO: add rewards tx

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