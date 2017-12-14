import React, { Component } from 'react'
import { Persist } from 'react-persist'

import logo from './assets/logo/logo.svg'
import ListOfAgents from './components/ListOfAgents'
import Transactions from './components/Transactions'
import ActiveTab from './components/ActiveTab'
import DropZone from './components/DropZone'
import Info from './components/Info'

import agentsJson from './agents.json'

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
    result: null,
    account: null,
    activeIndex: 0,
    escrowBalance: 0,
    accountBalance: 0,
    web3Injected: false,
    transactions: [],
    buttonVisible: false,
    dropZoneVisible: true
  }

  componentDidMount() {
    if (window.web3) {
      this.web3 = window.web3
      const that = this
      this.accountInterval = setInterval(function () {
        if (this.web3.eth.accounts[0] !== that.state.account) {
          console.log('Changed account', this.web3.eth.accounts[0], that.state.account)
          that.setState({ account: this.web3.eth.accounts[0] })
        }
      }, 100)

      this.web3.version.getNetwork((err, netId) => {
        if (!err && netId === "42" && this.state.account) {
          this.tokenContract = this.web3.eth.contract(tokenAbi).at(tokenAddress)
          this.accounBalanceInterval = setInterval(() => {
            this.tokenContract.balanceOf(
              this.state.account,
              (err, balance) => balance &&
                balance !== this.state.accountBalance &&
                this.setState({ web3Injected: true, accountBalance: balance })
            )
            if (this.state.contractAddress) {
              this.tokenContract.balanceOf(
                this.state.contractAddress,
                (err, balance) => balance &&
                  balance !== this.state.escrowBalance &&
                  this.setState({ web3Injected: true, escrowBalance: balance })
              )
            }
          }, 100)
        }
      })
    }
  }

  componentWillUnmount() {
    clearInterval(this.accountInterval)
    clearInterval(this.accounBalanceInterval)
  }

  getFile = () => {
    const { file } = this.state

    return file && [file]
  }


  setFile = ({ name, preview, type }) => {
    const jobDesc = this.web3.fromAscii(preview)
    const { contractAddress } = this.state
    this.tokenContract.approve(contractAddress, AMOUNT, (err, allowance) => {

      this.setState({
        file: { name, payload: preview, type },
        buttonVisible: true,
        jobDesc
      })
    })
  }

  deposit = () => {
    this.state.marketContract.deposit(AMOUNT, (err, result) => {
      if (!err && result) {
        this.handleAnalysis()
          .then(console.log)
          .catch(console.log)
      }
    })
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
          const marketContract = this.web3.eth.contract(marketJobAbi).at(receipt.contractAddress)
          this.setState({
            contractAddress: receipt.contractAddress,
            marketContract: marketContract,
            isLoading: false,
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
  const { account, file, transactions, contractAddress } = this.state
  const { payload, type, name } = file
  //web3 integration 

  // call the API 
  this.setState({ isLoading: true })
  const blob = await normalizeFile(name, payload)
  try {
    const job = await performJob(blob.payload, type)
    const txs = transactions.slice()
    txs.push({ from: account, to: contractAddress, result: job.data.result })
    this.setState({
      result: job.data.result,
      buttonVisible: false,
      dropZoneVisible: false,
      isLoading: false,
      transactions: txs
    })
  } catch (err) {
    console.log('Error on analysis')
    return
  }
}

flush = () => {
  this.setState({
    buttonVisible: false,
    dropZoneVisible: true,
    marketContract: null,
    contractAddress: null,
    result: null,
    file: false
  }, () => this.newJob())
}


render() {
  const {
    file,
    result,
    account,
    jobDesc,
    isLoading,
    activeIndex,
    transactions,
    web3Injected,
    escrowBalance,
    buttonVisible,
    accountBalance,
    contractAddress,
    dropZoneVisible
    } = this.state

  if (!web3Injected) return <h1>Unlock Metamask and select the Kovan testnet</h1>
  const url = "http://kovan.etherscan.io/address/" + contractAddress
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1 className="App-title">SingularityNET Alpha</h1>
      </header>
      <br />
      <Info
        url={url}
        account={account}
        contractAddress={contractAddress}
        accountBalance={accountBalance}
        escrowBalance={escrowBalance}
      />
      <hr />
      <ActiveTab
        tabs={["Buy", "Transactions"]}
        activeIndex={activeIndex}
        handleChangeTab={activeIndex => this.setState({ activeIndex })}
      />
      {
        isLoading &&
        <p>
          Waiting a mined block to include your contract
              <br />
          <i className="fa fa-circle-o-notch fa-spin fa-5x"></i>
        </p>
      }
      {!contractAddress && activeIndex === 0 && <ListOfAgents
        agents={agentsJson}
        onHire={this.newJob}
      />}
      {
        contractAddress && activeIndex === 0 && <DropZone
          file={file}
          result={result}
          amount={AMOUNT}
          onPay={this.deposit}
          onDrop={this.setFile}
          onNewJob={this.flush}
          buttonVisible={buttonVisible}
          dropZoneVisible={dropZoneVisible}
        />
      }
      {
        activeIndex === 1 && <Transactions data={transactions} />
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

export default App
