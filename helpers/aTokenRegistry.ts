type TokenAddresses = {
    Underlying: string;
    AToken: string;
}

type AaveAvalanche = {
    LendingPool: string;
    PoolAddressProvider: string;
    DAI: TokenAddresses;
}

const aaveAvalanche: AaveAvalanche = {
    LendingPool: "0x794a61358D6845594F94dc1DB02A252b5b4814aD",
    PoolAddressProvider: "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb",
    DAI: {
        Underlying: "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70",
        AToken: "0x82E64f49Ed5EC1bC6e43DAD4FC8Af9bb3A2312EE"
    }
}

