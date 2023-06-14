import Safe, { CreateTransactionProps } from '@safe-global/protocol-kit'
import hre from 'hardhat';
import * as dotenv from 'dotenv'
import { MetaTransactionData, SafeTransactionData } from '@safe-global/safe-core-sdk-types';
// This file can be used to play around with the Safe Core SDK
import * as fs from 'fs';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers } from 'ethers';

dotenv.config()

async function main() {

    const safeAddress = "0x326A7778DB9B741Cb2acA0DE07b9402C7685dAc6";
    const privateKey = process.env.PRIVATE_KEY || "";

    const provider = new ethers.providers.JsonRpcProvider(process.env.AVALANCHE_TENDERLY_FORK || '');
    const impersonatedAccount = new hre.ethers.Wallet(privateKey, provider);
    console.log("AVAX Balance: ", (await provider.getBalance(safeAddress)).toString());
    // Impersonate the Safe
    const result = await hre.ethers.provider.send("hardhat_impersonateAccount", [safeAddress]);

    const impersonatedSafe = await hre.ethers.getSigner(safeAddress) as SignerWithAddress;
    console.log(impersonatedSafe.address);
    // Initialize the Safe SDK
    const safeSdk: Safe = await Safe.create({
        ethers,
        safeAddress,
        providerOrSigner: impersonatedSafe
    });

    const txData = JSON.parse(fs.readFileSync('./aave_v3_wrapper_output.json', 'utf-8'));
    //console.log(txData);
    const txs: SafeTransactionData[] = txData.transactions.map((tx: any) => {
        return {
            to: tx.to,
            value: tx.value,
            data: tx.data,
            operation: tx.operation ?? 0, // 0 is CALL, 1 is DELEGATECALL. If operation field is not present in your JSON file, it defaults to CALL
        };
    });

    const txProps: CreateTransactionProps = {
        safeTransactionData: txs,
    }



    // Sign the batched transaction with the impersonated Safe
    const safeTransaction = await safeSdk.createTransaction(txProps);



    console.log(`Transaction was executed. Receipt: ${safeTransaction}`);
}

main()