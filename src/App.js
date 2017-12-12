import React, { Component } from 'react'
import logo from './assets/logo/logo.svg'
import DocumentUploader from './DocumentUploader'
import JSONTree from 'react-json-tree'

import './App.css'

import { tokenAbi, tokenAddress, agentAddress, marketJobAbi } from './config'
import {
  performJob,
  normalizeFile,
  createMarketJob,
  createSimpleMarketJob
} from './utils'


const AMOUNT = 800000000

class App extends Component {

  state = {
    file: false,
    buttonVisible: false,
    result: null,
    web3Injected: false,
    account: null
  }

  componentDidMount() {
    const { account } = this.state
    this.web3 = window.web3
    this.amount = new this.web3.BigNumber(AMOUNT)

    const that = this
    this.accountInterval = setInterval(function () {
      if (this.web3.eth.accounts[0] !== account) {
        that.setState({ account: this.web3.eth.accounts[0] })
      }
    }, 100)

    this.web3.version.getNetwork((err, netId) => {
      if (!err && netId === "42" && this.web3.eth.accounts[0]) {
        this.tokenContract = this.web3.eth.contract(tokenAbi).at(tokenAddress)
        this.setState({ web3Injected: true, account: this.web3.eth.accounts[0] })
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


  setFile = ({ name, preview, type }) => {
    const { account } = this.state
    const jobDesc = this.web3.fromAscii(preview)

    this.setState({
      file: { name, payload: preview, type },
      buttonVisible: true,
      isLoading: false
    })

    /*  createMarketJob(
       this.web3,
       {
         agent: account,
         token: tokenAddress,
         jobDesc
       },
       (err, result) => {
         if (err) return
         this.setState({isLoading:true})
         const watcher = setInterval(() => this.web3.eth.getTransactionReceipt(result.transactionHash, (err, receipt) => {
           console.log("Waiting a mined block to include your contract")
           if (receipt && receipt.contractAddress) {
             this.setState({
               file: { name, payload: preview, type },
               buttonVisible: true,
               isLoading: false,
               contractAddress: receipt.contractAddress
             })
             window.localStorage.setItem(
               account, 
               JSON.stringify({
                 address:receipt.contractAddress,
                 file: { name, payload: preview, type }
               })
             )
             console.log("Note that it might take 30 - 90 sceonds for the block to propagate befor it's visible in etherscan.io");
             clearInterval(watcher)
 
           }
         }),
           1000
         )
       }
     ) */
  }

  directTransfer = () => {
    this.tokenContract.transfer(
      agentAddress,
      this.amount,
      {
        from: this.web3.eth.accounts[0],
        gas: 65000
      },
      async (err, result) => {
        if (err) return
        this.setState({contractAddress:result})
        await this.handleAnalysis()
      }
    )
  }

  handleAnalysis = async () => {
    const { account, file } = this.state
    const { payload, type, name } = file
    //web3 integration 

    // call the API 
    this.setState({ isLoading: true })
    const blob = await normalizeFile(name, payload)
    try {
      const job = await performJob(blob.payload, type)
      console.log(job.data.result)
      this.setState({ result: job.data.result, buttonVisible:false, isLoading: false })
    } catch (err) {
      console.log('errr')
      //console.error(err)
      return
    }
  }


  render() {
    const { file, web3Injected, result, account, buttonVisible, isLoading, contractAddress } = this.state
    if (!web3Injected) return <h1>Unlock Metamask and select the Kovan testnet</h1>
    const url = "http://kovan.etherscan.io/tx/" + contractAddress
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
        {
          buttonVisible &&
          <button
            type="sumbit"
            onClick={() => this.directTransfer()}
            className="btn btn-primary"
            disabled={false}
          >
          Pay {AMOUNT} COGS
        </button>
        }
        <DocumentUploader
          file={file}
          fetching={false}
          editable={true}
          handleUpload={this.setFile}
          handleRemove={() => this.setState({ file: false })}
          error={''}
        />
        {
          contractAddress && <p>Transaction:  <a target="_blank" href={url}> {contractAddress} </a></p>
        }
        {
          isLoading &&
          <p>
            <br />
            Waiting a mined block to include your contract
            <i className="fa fa-circle-o-notch fa-spin fa-5x"></i>
          </p>
        }
        {
          result && <JSONTree data={result[0]} />
        }
      </div>
    );
  }
}

export default App;
