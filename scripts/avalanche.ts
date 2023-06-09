import { ethers, network } from "hardhat";


async function main(): Promise<void> {
    if (network.name != "avalanche") {
        throw new Error("Invalid network");
    } else {
        console.log("Deploying to Avalanche");
    }

    const [multisig] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", multisig.address);

    const balance = await ethers.provider.getBalance(multisig.address);

    console.log("Account balance:", balance.toString());


}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    });