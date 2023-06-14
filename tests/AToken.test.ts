import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract, ContractFactory } from "ethers";
import { ethers } from "hardhat";

let mockDai: Contract;
let mockADai: Contract;
let vaultFactory: ContractFactory;
let mockAavePool: Contract;
let mockAavePoolProvider: Contract;
let signer: SignerWithAddress;
let initialDeposit = ethers.utils.parseEther("50");

describe("ATokenVault", function () {
    beforeEach(async function () {
        signer = (await ethers.getSigners())[0];

        mockDai = await ethers.deployContract("MockDAI");
        mockADai = await ethers.deployContract("MockAToken", [await mockDai.address]);
        mockAavePool = await ethers.deployContract("MockAavePool", [await mockADai.address]);
        mockAavePoolProvider = await ethers.deployContract("MockAavePoolAddressesProvider", [await mockAavePool.address]);

        vaultFactory = await ethers.getContractFactory("ATokenVault");
    });

    it("Should deploy the vault", async function () {
        const vault = await vaultFactory.deploy(await mockADai.address, 2977, await mockAavePoolProvider.address);

        const proxyAddress = await ethers.utils.getContractAddress(
            {
                from: await signer.address,
                nonce: await signer.getTransactionCount() + 1,
            }
        );

        //await mockAavePool.supply(await mockDai.address, ethers.parseEther("1000"), ethers.getAddress("0x01"), initialDeposit)

        const data = await vault.interface.encodeFunctionData("initialize", [
            await signer.address,
            0, // Fee
            "Wrapped aDAI",
            "waDAI",
            initialDeposit,
        ]);

        await mockDai.mint(await signer.address, initialDeposit);

        await mockDai.approve(proxyAddress, initialDeposit);

        const proxy = await ethers.deployContract("TransparentUpgradeableProxy", [
            await vault.address,
            await signer.address,
            data
        ]);

        const vaultProxy = await ethers.getContractAt("ATokenVault", proxyAddress);

        expect(await vaultProxy.name()).to.equal("Wrapped aDAI");
        expect(await vaultProxy.symbol()).to.equal("waDAI");
    });
});