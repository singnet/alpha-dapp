import React, { Component } from 'react'
import logo from './assets/logo/logo.svg'
import DocumentUploader from './DocumentUploader'
import JSONTree from 'react-json-tree'

import './App.css'

import { tokenAbi, tokenAddress, marketJobAbi } from './config'
import { 
  performJob,
  normalizeFile, 
  createMarketJob, 
  createSimpleMarketJob 
} from './utils'

const json = {
  array: [1, 2, 3],
  bool: true,
  object: {
    foo: 'bar'
  }
}

class App extends Component {

  state = {
    file: false,
    buttonVisible: false,
    result: false,
    web3: false,
    account: null
  }

  componentDidMount() {
    const { account } = this.state
    this.web3 = window.web3

    const that = this
    this.accountInterval = setInterval(function () {
      if (this.web3.eth.accounts[0] !== account) {
        that.setState({ account: this.web3.eth.accounts[0] })
      }
    }, 100)

    this.web3.version.getNetwork((err, netId) => {
      if (!err && netId === "42" && this.web3.eth.accounts[0]) {
        this.tokenContract = this.web3.eth.contract(tokenAbi).at(tokenAddress)
        this.setState({ web3: true, account: this.web3.eth.accounts[0] })
      }
    })
  }

  componentWillUnmount() {
    clearInterval(this.accountInterval)
  }

  getFile = () => {
    const { file } = this.state

    return file && [file]
  }

  setFile = async ({ name, preview, type }) => {
    const jobDesc = this.web3.fromAscii(preview)
    const blob = await normalizeFile(name,preview)
    try {
      await performJob(blob.payload,type)
    } catch(err) {
      console.error(err)
    }
   /*  this.setState({
      file: { name, payload: preview }
    }) */

    /*
      const { account } = this.state
      this.web3.eth.defaultAccount = this.web3.eth.coinbase
     createMarketJob(
      this.web3,
      {
        agent: this.account,
        token: tokenAddress,
        jobDesc
      },
      (err, result) => {
        if (err) return
        const watcher = setInterval(() => this.web3.eth.getTransactionReceipt(result.transactionHash, (err, receipt) => {
          console.log("Waiting a mined block to include your contract")
          if (receipt && receipt.contractAddress) {
            this.setState({
              file: { name, payload: preview },
              buttonVisible: true,
              contractAddress: receipt.contractAddress
            })
            console.log("Note that it might take 30 - 90 sceonds for the block to propagate befor it's visible in etherscan.io");
            clearInterval(watcher)

          }
        }),
          1000
        )
      }
    ) */
  }

  handleAnalysis = () => {
    //todo call the API 
    //web3 integration ?
    this.setState({ isLoading: true })
    this.timeout = setTimeout(() => {
      this.setState({ result: true, isLoading: false })
    }, 3000)

  }

  componentWillUnmount() {
    clearTimeout(this.timeout)
  }

  render() {
    const { file, web3, result, account, buttonVisible, isLoading, contractAddress } = this.state
    if (!web3) return <h1>Unlock Metamask and select the Kovan testnet</h1>
    const url = "http://kovan.etherscan.io/address/" + contractAddress
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to SingularityNET Alpha</h1>
        </header>
        <br />
        <h3>
          Your account: {account}
        </h3>
        <hr />
        <DocumentUploader
          file={file}
          fetching={false}
          editable={true}
          handleUpload={this.setFile}
          handleRemove={() => this.setState({ file: false })}
          error={''}
        />
        {
          contractAddress && <p>Contract address:  <a target="_blank" href={url}> {contractAddress} </a></p>
        }
        {
          buttonVisible &&
          <button
            type="sumbit"
            onClick={() => this.handleAnalysis()}
            className="btn btn-primary"
            disabled={false}
          >
            Analyze
            </button>
        }
        {
          isLoading &&
          <p>
            <br />
            <i className="fa fa-circle-o-notch fa-spin fa-5x"></i>
          </p>
        }
        {
          result && <JSONTree data={json} />
        }
      </div>
    );
  }
}

export default App;
