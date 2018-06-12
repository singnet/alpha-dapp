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

export class FORMAT_UTILS {
  /**
   * Shortens a long ethereum address to a human-friendly abbreviated one. Assumes the address starts with '0x'.
   *
   * An address like 0x2ed982c220fed6c9374e63804670fc16bd481b8f provides no more value to a human than
   * a shortened version like 0x2ed9...1b8f. However, screen real estate is precious, especially to real users
   * and not developers with high-res monitors.
   */
  static toHumanFriendlyAddressPreview(address) {
    const addressPrefix = '0x';
    const previewLength = 4;

    const addressToShorten = address.startsWith(addressPrefix) ? address.substring(addressPrefix.length) : address;
    const previewPrefix    = addressToShorten.substring(0, previewLength);
    const previewSuffix    = addressToShorten.substring(addressToShorten.length - previewLength);

    return `0x${previewPrefix}...${previewSuffix}`;
  }
}