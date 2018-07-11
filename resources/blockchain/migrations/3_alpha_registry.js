let fs = require("fs-extra");
let path = require("path");
let Contract = require("truffle-contract");
let AlphaRegistryJson = require("./../build/contracts/AlphaRegistry.json");
let AlphaRegistry = Contract(AlphaRegistryJson);

let basePath = path.join(__dirname, "..");

module.exports = function(deployer, network, accounts) {
  AlphaRegistry.setProvider(web3.currentProvider);
  AlphaRegistry.defaults({ "from": accounts[0], "gas": 4000000 });
  deployer.deploy(AlphaRegistry, { "overwrite": false})
    .then(() => AlphaRegistry.deployed())
    .then(alphaRegistryInstance => {
      fs.writeJsonSync(
        path.join(basePath, "build", "contracts", "AlphaRegistry.json"),
        Object.assign({}, AlphaRegistryJson, { "networks": { [web3.version.network]: { "events": {}, "links": {}, "address": alphaRegistryInstance.address, "transactionHash": "" } } })
      );
    });
};
