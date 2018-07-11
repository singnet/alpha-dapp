const fs = require("fs-extra");
const path = require("path");

const basePath = path.join(__dirname, "..", "..", "..");
const modulesPath = path.join(basePath, "node_modules");
const testModulesPath = path.join(basePath, "blockchain", "build", "npm-module");
const modulesBackupPath = path.join(basePath, "blockchain", ".modules-backup");

const modulePaths = [
  [
    path.join(modulesPath, "singularitynet-alpha-blockchain"),
    path.join(testModulesPath, "singularitynet-alpha-blockchain")
  ],
  [
    path.join(modulesPath, "singularitynet-token-contracts"),
    path.join(testModulesPath, "singularitynet-token-contracts")
  ]
];

Promise.all(
  modulePaths
    .reduce((acc, [ source, destination ]) => [ acc[0].concat(source), acc[1].concat(destination) ], [ [], [] ])
    .map(arr => Promise.all(arr.map(fs.pathExists)))
)
  .then(([ sources, destinations ]) => {
    sources.forEach((source, index) => {
      const moduleSourcePath = modulePaths[index][0];
      const moduleDestinationPath = modulePaths[index][1];
      if (!source) { throw `source path ${moduleSourcePath} does not exist`; }
      if (!destinations[index]) { throw `destination path ${moduleDestinationPath} does not exist`; }

      fs.copySync(moduleSourcePath, path.join(modulesBackupPath, path.basename(moduleSourcePath)));
      fs.removeSync(moduleSourcePath);
      fs.ensureSymlinkSync(path.relative(path.join(moduleSourcePath, ".."), moduleDestinationPath), moduleSourcePath);
    });
  })
  .catch(console.error);
