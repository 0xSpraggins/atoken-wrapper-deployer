import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract, ContractFactory, getCreateAddress } from "ethers";
import { ethers } from "hardhat";

let mockDai: Contract;
let mockADai: Contract;
let vaultFactory: ContractFactory<any[], Contract>;
let mockADaiVaultProxy;
let mockAavePool: Contract;
let mockAavePoolProvider: Contract;
let signer: SignerWithAddress;
let initialDeposit = ethers.parseEther("50");

describe("ATokenVault", function () {
    beforeEach(async function () {
        signer = (await ethers.getSigners())[0];

        mockDai = await ethers.deployContract("MockDAI");
        console.log(await mockDai.getAddress());
        mockADai = await ethers.deployContract("MockAToken", [await mockDai.getAddress()]);
        mockAavePool = await ethers.deployContract("MockAavePool", [await mockADai.getAddress()]);
        mockAavePoolProvider = await ethers.deployContract("MockAavePoolAddressesProvider", [await mockAavePool.getAddress()]);

        vaultFactory = await ethers.getContractFactory("ATokenVault");
    });

    it("Should deploy the vault", async function () {
        const vault = await vaultFactory.deploy(await mockADai.getAddress(), 2977, await mockAavePoolProvider.getAddress());
        console.log(await vault.getAddress());

        const proxyAddress = await getCreateAddress(
            {
                from: await signer.getAddress(),
                nonce: await signer.getNonce() + 1,
            }
        );

        //await mockAavePool.supply(await mockDai.getAddress(), ethers.parseEther("1000"), ethers.getAddress("0x01"), initialDeposit)

        const data = await vault.interface.encodeFunctionData("initialize", [
            await signer.getAddress(),
            0, // Fee
            "Wrapped aDAI",
            "waDAI",
            initialDeposit,
        ]);

        await mockDai.mint(await signer.getAddress(), initialDeposit);

        await mockDai.approve(proxyAddress, initialDeposit);

        const proxy = await ethers.deployContract("TransparentUpgradeableProxy", [
            await vault.getAddress(),
            await signer.getAddress(),
            data
        ]);

        const vaultProxy = await ethers.getContractAt("ATokenVault", proxyAddress);

        expect(await vaultProxy.name()).to.equal("Wrapped aDAI");
        expect(await vaultProxy.symbol()).to.equal("waDAI");
    });
});