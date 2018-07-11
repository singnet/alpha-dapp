let fs = require("fs-extra");
let path = require("path");
let Contract = require("truffle-contract");
let AgentFactoryJson = require("./../build/contracts/AgentFactory.json");
let AgentFactory = Contract(AgentFactoryJson);
let TokenJson = require("singularitynet-token-contracts/SingularityNetToken.json");
let Token = Contract(TokenJson);

let basePath = path.join(__dirname, "..");

module.exports = function(deployer, network, accounts) {
  Token.setProvider(web3.currentProvider);
  Token.defaults({ "from": accounts[0], "gas": 4000000 });
  AgentFactory.setProvider(web3.currentProvider);
  AgentFactory.defaults({ "from": accounts[0], "gas": 4000000 });
  deployer.deploy(Token, { "overwrite": false})
    .then(() => Token.deployed())
    .then(() => deployer.deploy(AgentFactory, Token.address, { "overwrite": false }))
    .then(() => AgentFactory.deployed())
    .then(agentFactoryInstance => {
      fs.writeJsonSync(
        path.join(basePath, "build", "contracts", "SingularityNetToken.json"),
        Object.assign({}, TokenJson, { "networks": { [web3.version.network]: { "events": {}, "links": {}, "address": Token.address, "transactionHash": "" } } })
      );
      fs.writeJsonSync(
        path.join(basePath, "build", "contracts", "AgentFactory.json"),
        Object.assign({}, AgentFactoryJson, { "networks": { [web3.version.network]: { "events": {}, "links": {}, "address": agentFactoryInstance.address, "transactionHash": "" } } })
      );
    });
};
