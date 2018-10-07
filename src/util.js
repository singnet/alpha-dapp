const bitcoin = require("bitcoinjs-lib")

export const NETWORKS = {
  1: {
    name: "mainnet",
    etherscan: 'https://etherscan.io',
    infura: 'http://mainnet.infura.io',
  },
  3: {
    name: "Ropsten",
    etherscan: 'https://ropsten.etherscan.io',
    infura: 'https://ropsten.infura.io',
  },
  4: {
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
  "ENABLED": 0,
  "DISABLED": 1,
};

export const STRINGS = {
  "NULL_ADDRESS": "0x0000000000000000000000000000000000000000"
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
    const previewPrefix = addressToShorten.substring(0, previewLength);
    const previewSuffix = addressToShorten.substring(addressToShorten.length - previewLength);

    return `0x${previewPrefix}...${previewSuffix}`;
  }
}

const ERROR_MESSAGE = {
  reject: "User rejected transaction submission or message signing",
  failed: "Transaction mined, but not executed",
  internal: "Internal Server Error",
  unknown: "Unknown error"
};

const RPC_ERROR_BOUNDS = {
  internal: [-31099, -32100]
};

export class ERROR_UTILS {

  static sanitizeError(error) {
    if (typeof error === 'object' && error.hasOwnProperty("value")) {
      // It checks for rejection on both cases of message or transaction
      if (error.value.message.indexOf("User denied") != -1) {
        return ERROR_MESSAGE.reject;
      }

      //Checks for Internal server error 
      if (error.value.code > RPC_ERROR_BOUNDS.internal[0] && error.value.code < RPC_ERROR_BOUNDS.internal[1]) {
        return ERROR_MESSAGE.internal
      }
    }

    if (typeof error === 'object' && error.hasOwnProperty("status") && error.status === "0x0") {
      //This is the receipt
      return `${ERROR_MESSAGE.failed} TxHash: ${error.transactionHash}`
    }

    return ERROR_MESSAGE.unknown
  }

}



export const isValidAddress = (address, coin, network) => {

  if (coin === 'bitcoin') {
    network = network === 'testnet' ? bitcoin.networks.testnet : bitcoin.networks.bitcoin
    try {
      bitcoin.address.toOutputScript(address, network)
      return true
    } catch (e) {
      return false
    }
  }

  //TODO Add other future coins address validation here 

  return false
}