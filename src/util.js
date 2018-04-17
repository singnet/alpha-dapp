export const NETWORKS = {
  1:  {
    name: "mainnet",
    etherscan: 'https://etherscan.io',
    infura: 'http://mainnet.infura.io',
  },
  3:  {
    name: "Ropsten",
    etherscan: 'https://ropsten.etherscan.io',
    infura: 'https://ropsten.infura.io',
  },
  4:  {
    name: "Rinkeby",
    etherscan: 'https://rinkeby.etherscan.io',
    infura: 'https://rinkeby.infura.io',
},
  42: {
    name: "Kovan",
    etherscan: 'https://kovan.etherscan.io',
    infura: 'https:/kovan.infura.io',
  },
};

export const AGENT_STATE = {
  "ENABLED":  0,
  "DISABLED": 1,
};

export class AGI {

  static toDecimal(agi) {
    return agi / 100000000;
  }
}