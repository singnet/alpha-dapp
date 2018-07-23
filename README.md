# AGI Alpha Dapp

This Dapp allows you to browse the list of SingularityNET Agents from the SingularityNET Registry and call them to provide a Service.
The Dapp uses the SingularityNET contracts deployed on the Kovan testnet.

To get Kovan AGI to use the Dapp you can use the official [SingularityNET AGI Faucet](https://faucet.singularitynet.io/).
To get Kovan ETH to pay for gas costs you should refer to [this repo](https://github.com/kovan-testnet/faucet).

## How to call a Service
The DApp can currently only interact with services that match the API of the example service. This will change in the future as we support a generic mechanism to declaratively describe a service's API. In the interim, steps [11, 14] are specific to the example service's input and output format.  
These instructions can also be found at the [SingularityNET Community Wiki](https://github.com/singnet/wiki/wiki/Getting-Started-%5BAlpha%5D#calling-a-service-using-the-dapp)

1. Get [Ether](https://github.com/kovan-testnet/faucet) and [AGI](https://faucet.singularitynet.io/) on the Kovan network
2. Navigate to the SingularityNET alpha [dapp](http://alpha.singularitynet.io/)
3. Unlock MetaMask
4. Click the "Create Job" button to the right of the "Alpha TensorFlow Agent"
5. Click the "Create Job Contract" button at the bottom of the "Job" pane
6. Click the "SUBMIT" button in the "CONFIRM TRANSACTION" dialogue
7. Click the "Approve AGI Transfer" button at the bottom of the "Job" pane
8. Click the "SUBMIT" button in the "CONFIRM TRANSACTION" dialogue
9. Click the "Fund Job Contract" button at the bottom of the "Job" pane
10. Click the "SUBMIT" button in the "CONFIRM TRANSACTION" dialogue
11. Use the file uploader to upload an image of your choice
12. Click the "Call Agent API" button at the bottom of the "Job" pane
13. Click the "Sign" button in the "CONFIRM TRANSACTION" dialogue
14. View the predictions and confidences for the image classification in the "Job" pane

## Development instructions
* Install [Node.js and npm](https://nodejs.org/)
* `npm install` to get dependencies
* `npm run serve` to serve the application locally and watch source files for modifications

### Deployment instructions
* `npm run build` builds the application distributable files to the `dist` directory
* `npm run deploy`; the target S3 Bucket for the deployment and its region are specified as command line parameters in the package.json file npm script

### Additional commands
* `npm run build-analyze` shows the size of the application's bundle components; the original size, the parsed size (uglified + tree-shaken) and the gzipped size
* `npm run serve-dist` serves the `dist` directory locally
