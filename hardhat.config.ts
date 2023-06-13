import * as dotenv from 'dotenv';

dotenv.config();

import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-ethers';

/** @type import('hardhat/config').HardhatUserConfig */
const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.8.10',
      },
      {
        version: '0.8.19',
      },
    ],
    settings: {
      optimizer: {
        enabled: true,
        runs: 10000000,
      },
    },
  },
  networks: {
    avalanche: {
      url: process.env.AVALANCHE_URL,
      accounts: [process.env.PRIVATE_KEY || ""],
      allowUnlimitedContractSize: true,
    },
    hardhat: {
      forking: {
        url: process.env.AVALANCHE_URL || '',
        blockNumber: 30879792,
      },
      allowUnlimitedContractSize: true,
    },
  },
};

export default config;