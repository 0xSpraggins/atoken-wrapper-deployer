import path from "path";
import { ethers, network } from "hardhat";
import { getCreateAddress } from "ethers";
import { aaveAvalancheDeployment1 } from "../helpers/tokenRegistry";
import { Artifacts } from 'hardhat/internal/artifacts';
import * as txBuilder from "../txFiles/txbuilder_calldata.json";
import * as fs from "fs";

const artifactsPath = path.resolve('./artifacts')
const artifacts = new Artifacts(artifactsPath);

// Import txbuilder and pack all the data into a new json file called aave_v3_wrapperOutput.json

async function main(): Promise<void> {
    const referalCode: number = 2977;
    const proxyAdmin: string = "0x";
    const _owner: string = "0x";

    const plannedDeployment = aaveAvalancheDeployment1;
    const tokens = plannedDeployment.Tokens;

    const transactions = [];

    if (network.name != "avalanche") {
        throw new Error("Invalid network");
    } else {
        console.log("Deploying to Avalanche");
    }

    const [multisig] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", multisig.address);

    const balance = await ethers.provider.getBalance(multisig.address);

    console.log("Account balance:", balance.toString());

    for (let i = 0;i < plannedDeployment.Tokens.length;i++) {
        const vault = await ethers.deployContract("ATokenVault",
            [
                plannedDeployment.Tokens[i].underlyingAddress,
                referalCode,
                plannedDeployment.PoolAddressProvider
            ],
        );

        const vaultDeploymentTx = await vault.deploymentTransaction();
        transactions.push(vaultDeploymentTx);

        // initialize the new vaults
        const data = await vault.interface.encodeFunctionData("initialize", [
            _owner,
            0, // Fee
            tokens[i].shareName,
            tokens[i].shareSymbol,
            tokens[i].initialDeposit,
        ]);

        // Compute the address of the proxy
        const proxyAddress = await getCreateAddress(
            {
                from: multisig.address,
                nonce: await multisig.getNonce() + 1,
            }
        );

        const tokenArtifact = artifacts.readArtifactSync("ERC20Upgradeable");
        const tokenContract = await ethers.getContractAt(tokenArtifact.abi, tokens[i].underlyingAddress);

        console.log(tokenContract.address);

        // Approve the proxy to spend the underlying asset
        const approveTx = await tokenContract.approve(proxyAddress, tokens[i].initialDeposit);
        transactions.push(approveTx);

        console.log("Allowance for proxy: ", await tokenContract.allowance(multisig.address, proxyAddress));

        // Deploy the proxy
        const proxy = await ethers.deployContract("TransparentUpgradeableProxy", [
            vault.address,
            proxyAdmin,
            data
        ]);

        // Get the transaction data from the deployement
        const proxyDeploymentTx = await proxy.deploymentTransaction();
        transactions.push(proxyDeploymentTx);

        if (proxy.address.toString() != proxyAddress) {
            throw new Error("Proxy address mismatch");
        } else {
            console.log(`${await vault.name()} Proxy deployed at: ${proxy.address.toString()}`);
        }
    }

    // Create multisig payload
    const txBuilder = await JSON.parse("../scripts/txbuilder_calldata.json");
    txBuilder.meta.createdFromSafeAddress = multisig.address;

    // Add the transactions to the multisig payload
    for (let i = 0;i < transactions.length;i++) {
        if (i == 0) {
            txBuilder[0].to = transactions[i].receiver;
            txBuilder[0].data = transactions[i].input;
        } else {
            txBuilder.push({
                to: transactions[i].receiver,
                data: transactions[i].input
            });
        }
    }

    const modifiedJson = JSON.stringify(txBuilder);
    fs.writeFileSync("../scripts/aave_v3_wrapperOutput.json", modifiedJson);

    console.log("Deployment completed");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    });