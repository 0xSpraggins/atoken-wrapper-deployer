import { AaveAvalanche, Token } from "./types";

const frax: Token = {
    shareName: "Wrapped aFRAX",
    shareSymbol: "waFRAX",
    shareDecimals: 18,
    underlyingAddress: "0xD24C2Ad096400B6FBcd2ad8B24E7acBc21A1da64",
    forkHolder: "0x25d2fcd5f154dd3e24ccefb7dc63316891094822",
    initialDeposit: BigInt(50 * 10 ** 18)
}

const usdc: Token = {
    shareName: "Wrapped aUSDC",
    shareSymbol: "waUSDC",
    shareDecimals: 6,
    underlyingAddress: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
    forkHolder: "0x4aeFa39caEAdD662aE31ab0CE7c8C2c9c0a013E8",
    initialDeposit: BigInt(50 * 10 ** 6)
}

const usdt: Token = {
    shareName: "Wrapped aUSDT",
    shareSymbol: "waUSDT",
    shareDecimals: 6,
    underlyingAddress: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",
    forkHolder: "0x4aeFa39caEAdD662aE31ab0CE7c8C2c9c0a013E8",
    initialDeposit: BigInt(50 * 10 ** 6)
}
const btcB: Token = {
    shareName: "Wrapped aBTC.b",
    shareSymbol: "waBTC.b",
    shareDecimals: 8,
    underlyingAddress: "0x152b9d0FdC40C096757F570A51E494bd4b943E50",
    forkHolder: "0x96422b7d5cfec3eaf12d028abc6d11b554dd7486",
    initialDeposit: BigInt(3 * 10 ** 4)
}
const wavax: Token = {
    shareName: "Wrapped aWAVAX",
    shareSymbol: "waWAVAX",
    shareDecimals: 18,
    underlyingAddress: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
    forkHolder: "0xbbff2a8ec8d702e61faaccf7cf705968bb6a5bab",
    initialDeposit: BigInt(5 * 10 ** 18)
}

export const aaveAvalancheDeployment1: AaveAvalanche = {
    LendingPool: "0x794a61358D6845594F94dc1DB02A252b5b4814aD",
    PoolAddressProvider: "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb",
    Tokens: [frax, usdc, usdt, btcB, wavax]
}

