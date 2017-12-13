import React, { Component } from 'react'
import { Persist } from 'react-persist'

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


const AMOUNT = 800000

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
    this.amount = new window.web3.BigNumber(AMOUNT)

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
    const jobDesc = this.web3.fromAscii(preview) 
    const {contractAddress} = this.state
    this.tokenContract.approve(contractAddress, AMOUNT, (err,allowance) => {
      this.setState({
        file: {name, payload:preview, type},
        buttonVisible:true,
        jobDesc
      })
    })
  }

  deposit() {
    this.marketContract.deposit(AMOUNT, console.log)
  }


  newJob = () => {
    const { account } = this.state
    const jobDesc = this.web3.fromAscii("ciao")

    createMarketJob(
      this.web3,
      {
        agent: account,
        token: tokenAddress,
        jobDesc
      },
      (err, result) => {
        if (err) return
        this.setState({ isLoading: true })
        const watcher = setInterval(() => this.web3.eth.getTransactionReceipt(result.transactionHash, (err, receipt) => {
          console.log("Waiting a mined block to include your contract")
          if (receipt && receipt.contractAddress) {
            this.marketContract = this.web3.eth.contract(marketJobAbi).at(receipt.contractAddress)
            this.setState({ 
              contractAddress: receipt.contractAddress, 
              isLoading:false, 
              jobDesc
            })
            console.log("Note that it might take 30 - 90 sceonds for the block to propagate befor it's visible in etherscan.io");
            clearInterval(watcher)
          }
        }),
          1000
        )
      }
    )
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
        this.setState({ contractAddress: result })
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
      this.setState({ 
        result: job.data.result, 
        buttonVisible: false, 
        isLoading: false 
      })
    } catch (err) {
      console.log('Error on analysis')
      return
    }
  }


  render() {
    const {
      file,
      result,
      account,
      jobDesc,
      isLoading,
      web3Injected,
      buttonVisible,
      contractAddress
    } = this.state

    if (!web3Injected) return <h1>Unlock Metamask and select the Kovan testnet</h1>
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
        {
          contractAddress &&
          <p>
            Job Contract:  <a target="_blank" href={url}> {contractAddress} </a>
          </p>
        }
        <hr />
        {
          !contractAddress &&
          <table className="table table-hover">
            <thead>
              <tr>
                <th>#</th>
                <th>Agent Address</th>
                <th>Service Offering</th>
                <th>Price per Unit</th>
                <th>-</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">deadbeef-aaaa-bbbb-cccc-111111111102</th>
                <td>Marco's Agent</td>
                <td>Image Analysis</td>
                <td>800000 COGS per second</td>
                <td>
                  <button
                    className="btn btn-primary"
                    type="sumbit"
                    onClick={() => this.newJob()}
                  >
                    HIRE
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        }
        {
          contractAddress && buttonVisible &&
          <button
            type="sumbit"
            onClick={() => this.deposit()}
            className="btn btn-primary"
            disabled={false}
          >
            Pay {AMOUNT} COGS
        </button>
        }
        {
          contractAddress &&
          <DocumentUploader
            file={file}
            fetching={false}
            editable={true}
            handleUpload={this.setFile}
            handleRemove={() => this.setState({ file: false })}
            error={''}
          />
        }
        {
          jobDesc && buttonVisible &&
          <p>
            Job Descriptor Hash: {jobDesc}
          </p>
        }
        {
          isLoading &&
          <p>
            Waiting a mined block to include your contract
            <br />
            <i className="fa fa-circle-o-notch fa-spin fa-5x"></i>
          </p>
        }
        {
          result && <JSONTree data={result[0]} />
        }
        <Persist
          name="alpha"
          data={this.state}
          debounce={300}
          onMount={data => this.setState(data)}
        />
      </div>
    );
  }
}

export default App;
