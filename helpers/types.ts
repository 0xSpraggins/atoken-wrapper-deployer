import { BigNumberish } from "ethers";

type Token = {
    shareName: string;
    shareSymbol: string;
    shareDecimals: number;
    underlyingAddress: string;
    forkHolder: string;
    initialDeposit: BigInt;
}

type AaveWrapper = {
    LendingPool: string;
    PoolAddressProvider: string;
    Tokens: Token[];
}

export { Token, AaveWrapper };