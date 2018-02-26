import React, { Component } from 'react'
import { Persist } from 'react-persist'

import ListOfAgents from './components/ListOfAgents'
import Transactions from './components/Transactions'
import ActiveTab from './components/ActiveTab'
import DropZone from './components/DropZone'
import Metamask from './components/Metamask'
import Info from './components/Info'

import logo from './assets/logo/logo.svg'
import agentsJson from './agents.json'

import './App.css'

import pkg from '../package.json'

import { tokenAbi, tokenAddress, marketJobAbi } from './config'
import {
  performJob,
  normalizeFile,
  createMarketJob
} from './utils'


const milliseconds = 10 ** 3

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
    console.log(`Version ${pkg.version}`)
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
              (err, balance) => {
                !err && balance && balance !== this.state.accountBalance &&
                this.setState({ web3Injected: true, accountBalance: balance })
              }
            )
            //when someone initate a contract
            if (this.state.contractAddress) {
              this.tokenContract.balanceOf(
                this.state.contractAddress,
                (err, balance) => balance &&
                  !err && balance !== this.state.escrowBalance &&
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

  watcher = (tx, cb) => {

    this.w = setInterval(
      () => this.web3.eth.getTransactionReceipt(
        tx,
        (err, receipt) => {
          if (err) return
          if (!err && receipt) {
            cb(receipt)
            clearInterval(this.w)
          }
        }),
      500
    )
  }

  getFile = () => {
    const { file } = this.state

    return file && [file]
  }

  setFile = ({ name, preview, type }) => {
    const { contractAddress, agent } = this.state
    this.tokenContract.approve(contractAddress, agent.amount * milliseconds, (err, allowance) => {
      if (err) return
      this.setState({ isLoading: true })
      if (allowance)
        this.watcher(
          allowance,
          (receipt) => {
            this.setState({
              isLoading: false,
              file: { name, payload: preview, type },
              buttonVisible: true
            })
          }
        )

    })
  }

  deposit = () => {
    const {
      agent,
      account,
      transactions,
      contractAddress,
      marketContract
    } = this.state

    marketContract.deposit(agent.amount * milliseconds, (err, result) => {
      if (err) return
      this.setState({ isLoading: true })
      this.handleAnalysis()
        .then((job) => {
          const txs = transactions.slice()
          txs.push({
            from: account,
            to: contractAddress,
            result: job.data.result
          })
          this.watcher(
            result,
            (receipt) => {
              //@todo Kovan misses the status property in the transaction
              //Hack: we are going to check if there are more than 0 logs in the receipt
              //this issue has been closed https://github.com/MetaMask/metamask-extension/issues/2730
              if (Number(receipt.status) === 1) {
                this.setState({
                  result: job.data.result,
                  buttonVisible: false,
                  dropZoneVisible: false,
                  isLoading: false,
                  transactions: txs
                })
              } else {
                alert('Not enough funds! ')
                this.flush()
              }
            } 
          )
        
        })
        .catch(console.log)
    })
  }


  newJob = (agent) => {
    const { account } = this.state
    const jobDesc = this.web3.fromAscii("0x0")

    createMarketJob(
      this.web3,
      {
        agent: account,
        amount: agent.amount,
        token: tokenAddress,
        jobDesc
      },
      (err, result) => {
        if (err) return
        this.setState({ isLoading: true })
        this.watcher(
          result.transactionHash,
          (receipt) => {
            const marketContract = this.web3.eth.contract(marketJobAbi).at(receipt.contractAddress)
            this.setState({
              contractAddress: receipt.contractAddress,
              marketContract: marketContract,
              isLoading: false,
              jobDesc,
              agent
            })
          }
        )
      }
    )
  }

  handleAnalysis = async () => {
    const { file } = this.state
    const { payload, type, name } = file
    //web3 integration 

    try {
      const blob = await normalizeFile(name, payload)
      return await performJob(blob.payload, type)
    } catch (err) {
      console.log('Error on analysis')
      return new Error()
    }
  }

  flush = () => {
    this.setState({
      buttonVisible: false,
      dropZoneVisible: true,
      marketContract: null,
      contractAddress: null,
      isLoading: false,
      result: null,
      file: false
    })
  }


  render() {
    const {
      file,
      agent,
      result,
      account,
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

    if (!web3Injected || !account) return <Metamask />
    const url = "http://kovan.etherscan.io/address/" + contractAddress
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} alt="logo" />
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
        <div className="container">
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
              amount={agent.amount * milliseconds}
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
        </div>
        <Persist
          name="alpha"
          data={{ transactions }}
          debounce={100}
          onMount={data => this.setState({ transactions })}
        />
      </div>
    );
  }
}

export default App
