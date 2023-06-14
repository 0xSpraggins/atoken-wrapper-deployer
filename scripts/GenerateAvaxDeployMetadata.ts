import path from "path";
import { ethers, network } from "hardhat";
import { aaveAvalancheDeployment1 } from "../helpers/tokenRegistry";

import { Artifacts } from 'hardhat/internal/artifacts';
import * as txBuilderJson from "../txFiles/txbuilder_calldata.json";
import * as fs from "fs";

const artifactsPath = path.resolve('./artifacts')
const artifacts = new Artifacts(artifactsPath);
const tokenArtifact = artifacts.readArtifactSync("ERC20Upgradeable");

async function main(): Promise<void> {
    const balancerMultisig = "0x326A7778DB9B741Cb2acA0DE07b9402C7685dAc6";

    let [deployer] = await ethers.getSigners();

    if (deployer.address !== balancerMultisig) {
        deployer = await ethers.getImpersonatedSigner(balancerMultisig);
    }

    const referalCode: number = 2977;
    const proxyAdmin: string = await balancerMultisig;
    const _owner: string = proxyAdmin;

    const plannedDeployment = aaveAvalancheDeployment1;
    const tokens = plannedDeployment.Tokens;

    // If we are on a forked network we need to impersonate holders and transfer tokens to the deployer
    if (network.name === "hardhat") {
        //transafer Avax to the deployer
        for (let i = 0;i < tokens.length;i++) {
            const holder = await ethers.getImpersonatedSigner(tokens[i].forkHolder);
            await holder.sendTransaction({
                to: deployer.address,
                value: ethers.utils.parseEther("1")
            });
            const tokenContract = await ethers.getContractAt(tokenArtifact.abi, tokens[i].underlyingAddress, holder);
            await tokenContract.transfer(deployer.address, tokens[i].initialDeposit);
        }
    }

    const transactions = [];

    let vaultFactory = await ethers.getContractFactory("ATokenVault");

    console.log("Deploying contracts with the account:", deployer.address);

    const provider = await ethers.getContractAt("IPoolAddressesProvider", plannedDeployment.PoolAddressProvider);

    for (let i = 0;i < tokens.length;i++) {
        // Deploy the vault
        const vault = await vaultFactory.connect(deployer).deploy(
            tokens[i].underlyingAddress,
            referalCode,
            await provider.address
        );
        const vaultDeploymentTx = await vault.deployTransaction.wait();

        // Add the deployment transaction to the list of transactions
        transactions.push(vaultDeploymentTx);

        console.log("Vault deployed to:", await vault.address);
        // encode the initialize calldata
        const data = await vault.interface.encodeFunctionData("initialize", [
            _owner,
            0, // Fee
            tokens[i].shareName,
            tokens[i].shareSymbol,
            tokens[i].initialDeposit,
        ]);

        // Compute the address of the proxy
        const proxyAddress = await ethers.utils.getContractAddress(
            {
                from: await deployer.address,
                nonce: await deployer.getTransactionCount() + 1,
            }
        );
        console.log(`Proxy address: ${proxyAddress}`);
        const tokenContract = await ethers.getContractAt(tokenArtifact.abi, tokens[i].underlyingAddress);

        // Approve the proxy to spend the underlying asset and add the transaction to the list
        // @ts-ignore
        const approveTx = await tokenContract.connect(deployer).approve(proxyAddress, tokens[i].initialDeposit);
        transactions.push(approveTx);

        // Deploy the proxy
        const proxy = await ethers.deployContract("TransparentUpgradeableProxy", [
            await vault.address,
            proxyAdmin,
            data
        ], deployer);
        console.log("Proxy deployed");
        // Get the transaction data from the deployement and add it to the list
        const proxyDeploymentTx = await proxy.deployTransaction.wait();;
        transactions.push(proxyDeploymentTx);

        if (await proxy.address != proxyAddress) {
            throw new Error("Proxy address mismatch");
        } else {
            const vaultProxy = await ethers.getContractAt("ATokenVault", proxyAddress);
            console.log(`${await vaultProxy.name()} deployed to: ${await vaultProxy.address}`);
        }
    }

    // Create multisig payload
    const txBuilder = JSON.parse(JSON.stringify(txBuilderJson));
    txBuilder.meta.createdFromSafeAddress = balancerMultisig;
    // Add the transactions to the multisig payload
    for (let i = 0;i < transactions.length;i++) {
        if (i == 0) {
            txBuilder.transactions.shift();
        }
        txBuilder.transactions.push({
            to: transactions[i].to,
            value: 0,
            data: transactions[i].data,
        });
    }

    const modifiedJson = JSON.stringify(txBuilder);
    const outputFile = fs.openSync(path.resolve("./txFiles/aave_v3_wrapper_output.json"), "w");
    fs.writeFileSync(outputFile, modifiedJson);

    console.log("Deployment completed");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    });