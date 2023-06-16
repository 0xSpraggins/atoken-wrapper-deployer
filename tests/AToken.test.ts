import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract, ContractFactory, getCreateAddress } from "ethers";
import { ethers } from "hardhat";

let mockDai: Contract;
let mockADai: Contract;
let vaultFactory: ContractFactory;
let mockADaiVaultProxy;
let mockAavePool: Contract;
let mockAavePoolProvider: Contract;
let signer: SignerWithAddress;
let rando: SignerWithAddress;
let initialPoolBalance = ethers.parseEther("1000");
let initialDeposit = ethers.parseEther("50");

describe("ATokenVault", function () {
    beforeEach(async function () {
        [signer, rando] = (await ethers.getSigners());

        mockDai = await ethers.deployContract("MockDAI");
        mockADai = await ethers.deployContract("MockAToken", [await mockDai.getAddress()]);
        mockAavePool = await ethers.deployContract("MockAavePool", [await mockADai.getAddress()]);
        mockAavePoolProvider = await ethers.deployContract("MockAavePoolAddressesProvider", [await mockAavePool.getAddress()]);

        vaultFactory = await ethers.getContractFactory("ATokenVault");
    });

    it("Should deploy the vault", async function () {
        const vault = await vaultFactory.deploy(await mockADai.getAddress(), 2977, await mockAavePoolProvider.getAddress());

        const proxyAddress = await getCreateAddress(
            {
                from: await signer.getAddress(),
                nonce: await signer.getNonce() + 1,
            }
        );
        console.log("rando address", await rando.getAddress());
        await mockDai.mint(await rando.getAddress(), initialPoolBalance);
        await mockDai.connect(rando).approve(await mockAavePool.getAddress(), initialPoolBalance);
        await mockAavePool.connect(rando).supply(await mockDai.getAddress(), initialPoolBalance, await rando.getAddress(), 0);
        console.log("pool supplied");

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

        expect(await proxy.name()).to.equal("Wrapped aDAI");
        expect(await proxy.symbol()).to.equal("waDAI");
    });
});