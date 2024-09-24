import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  gasReporter: {
    enabled:  false 
  },
  networks: {
    hardhat: {
      loggingEnabled: true,
    }
  }
};

export default config;
