let fs = require("fs-extra");
let path = require("path");
let Contract = require("truffle-contract");
let RegistryJson = require("./../build/contracts/Registry.json");
let Registry = Contract(RegistryJson);

let basePath = path.join(__dirname, "..");

module.exports = function(deployer, network, accounts) {
  Registry.setProvider(web3.currentProvider);
  Registry.defaults({ "from": accounts[0], "gas": 6000000 });
  deployer.deploy(Registry)
    .then(() => Registry.deployed())
    .then(registryInstance => {
      fs.writeJsonSync(
        path.join(basePath, "build", "contracts", "Registry.json"),
        Object.assign({}, RegistryJson, { "networks": { [web3.version.network]: { "events": {}, "links": {}, "address": registryInstance.address, "transactionHash": "" } } })
      );
    });
};
