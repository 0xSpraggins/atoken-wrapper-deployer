import { AaveWrapper, Token } from "./types";

const usdc: Token = {
    shareName: "Wrapped aUSDC",
    shareSymbol: "waUSDC",
    shareDecimals: 6,
    underlyingAddress: "0xda9d4f9b69ac6C22e444eD9aF0CfC043b7a7f53f",
    forkHolder: "",
    initialDeposit: BigInt(50 * 10 ** 6)
}

const usdt: Token = {
    shareName: "Wrapped aUSDT",
    shareSymbol: "waUSDT",
    shareDecimals: 6,
    underlyingAddress: "0x0Bd5F04B456ab34a2aB3e9d556Fe5b3A41A0BC8D",
    forkHolder: "",
    initialDeposit: BigInt(50 * 10 ** 6)
}

export const testDeployment: AaveWrapper = {
    LendingPool: "0xE7EC1B0015eb2ADEedb1B7f9F1Ce82F9DAD6dF08",
    PoolAddressProvider: "0x0496275d34753A48320CA58103d5220d394FF77F",
    Tokens: [usdc, usdt]
}

