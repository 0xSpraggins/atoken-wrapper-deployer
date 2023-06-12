type Token = {
    shareName: string;
    shareSymbol: string;
    shareDecimals: number;
    underlyingAddress: string;
    initialDeposit: number;
}

type AaveAvalanche = {
    LendingPool: string;
    PoolAddressProvider: string;
    Tokens: Token[];
}

export { Token, AaveAvalanche };