const fse = require("fs-extra");
const path = require("path");

const basePath = path.join(__dirname, "..");
const npmModulePath = path.join(basePath, "build", "npm-module");

const mapFiles = {
    "build/contracts/SingularityNetToken.json": {
        "abi": "singularitynet-token-contracts/abi/SingularityNetToken.json",
        "networks": "singularitynet-token-contracts/networks/SingularityNetToken.json"
    },
    "build/contracts/AgentFactory.json": {
        "abi": "singularitynet-alpha-blockchain/abi/AgentFactory.json",
        "networks": "singularitynet-alpha-blockchain/networks/AgentFactory.json"
    },
    "build/contracts/AlphaRegistry.json": {
        "abi": "singularitynet-alpha-blockchain/abi/AlphaRegistry.json",
        "networks": "singularitynet-alpha-blockchain/networks/AlphaRegistry.json"
    },
    "build/contracts/Registry.json": {
        "networks": "singularitynet-alpha-blockchain/networks/Registry.json"
    },
    "build/contracts/IRegistry.json": {
        "abi": "singularitynet-alpha-blockchain/abi/Registry.json"
    },
    "build/contracts/Agent.json": {
        "abi": "singularitynet-alpha-blockchain/abi/Agent.json"
    },
    "build/contracts/Job.json": {
        "abi": "singularitynet-alpha-blockchain/abi/Job.json"
    }
};

fse.removeSync(npmModulePath);
fse.mkdirsSync(npmModulePath);

for (let sourceFile in mapFiles) {
    if (mapFiles[sourceFile] !== null && typeof mapFiles[sourceFile] === "object") {
        for (key in mapFiles[sourceFile]) {
            let destFile = path.join(npmModulePath, mapFiles[sourceFile][key]);
            let destParent = path.resolve(destFile, "../");
            fse.mkdirsSync(destParent);
            fse.writeJsonSync(destFile, fse.readJsonSync(path.join(basePath, sourceFile))[key]);
        }
    } else {
        let destFile = path.join(npmModulePath, mapFiles[sourceFile]);
        let destParent = path.resolve(destFile, "../");
        fse.mkdirsSync(destParent);
        fse.copySync(path.join(basePath, sourceFile), destFile);
    }
}
