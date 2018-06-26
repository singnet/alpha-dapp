import React from 'react';
import { abi as agentAbi } from 'singularitynet-alpha-blockchain/Agent.json';
import { abi as jobAbi } from 'singularitynet-alpha-blockchain/Job.json';
import Eth from 'ethjs';
import {Layout, Divider, Card, Icon, Spin, Alert, Row, Col, Button, Tag, message, Table, Collapse, Steps, Modal, Upload} from 'antd';
import { NETWORKS, AGENT_STATE, AGI } from '../util';
import {JsonRpcClient} from "../jsonrpc";
import abiDecoder from 'abi-decoder';


class Job extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      jobAddress:             undefined,
      jobPrice:               undefined,
      jobStep:                0,
      jobResult:              undefined,
      showModal:              false,
      modalFunctional:        undefined,
      waitingForMetaMask:     false,
    };

    this.fundJob       = this.fundJob.bind(this);
    this.approveTokens = this.approveTokens.bind(this);
    this.createJob     = this.createJob.bind(this);
    this.callApi       = this.callApi.bind(this);
    this.handleReject  = this.handleReject.bind(this);
    this.showModal     = this.showModal.bind(this);

    abiDecoder.addABI(agentAbi);
    abiDecoder.addABI(jobAbi);
  }

  componentDidMount() {
    this.jobDomNode.scrollIntoView();
  }

  nextJobStep() {
    this.clearModal();
    this.setState((prevState) => ({
      jobStep: prevState.jobStep + 1
    }));
  }

  showModal(modalFunctional) {
    this.setState({
      waitingForMetaMask: true,
      showModal: true,
      modalFunctional: modalFunctional,
    });
  }

  clearModal() {
    this.setState({
       showModal: false,
    });
  }

  handleReject(error) {
    console.log('User rejected transaction');
    console.log(error);
    this.clearModal();
  }

  createJob() {

    this.props.agent['contractInstance'].createJob({from: this.props.account}).then(response => {

      this.setState({
        waitingForMetaMask: false,
      });

      this.waitForTransaction(response).then(receipt => {

        let decodedLogs = abiDecoder.decodeLogs(receipt.logs);
        let createdEvent = decodedLogs.find(log => log.name == "JobCreated" && log.address == this.props.agent['contractInstance'].address);

        if(createdEvent) {

          let jobAddress = createdEvent.events.find(item => item.name == 'job').value;
          let jobPrice   = createdEvent.events.find(item => item.name == 'jobPrice').value;

          console.log('Job: ' + jobAddress + ' for price: ' + AGI.toDecimal(jobPrice) + ' AGI was created');

          this.setState((prevState) => ({
            jobAddress: jobAddress,
            jobPrice: jobPrice,
            jobInstance: window.ethjs.contract(jobAbi).at(jobAddress),
          }));

          this.nextJobStep();
        }
      });
    }).catch(this.handleReject);
  }

  approveTokens() {

    this.props.token.approve(this.state.jobAddress, this.state.jobPrice, {from: this.props.account}).then(response => {

      this.setState({
        waitingForMetaMask: false,
      });

      this.waitForTransaction(response).then(receipt => {
        console.log('ECR20 approve called with ' + AGI.toDecimal(this.state.jobPrice) + ' AGI for Job: ' + this.state.jobAddress);
        this.nextJobStep();
      });
    }).catch(this.handleReject);
  }

  fundJob() {

    this.state.jobInstance.fundJob({ from: this.props.account }).then(response => {

      this.setState({
        waitingForMetaMask: false,
      });

      this.waitForTransaction(response).then(receipt => {
        /**
         * Here we are waiting for the transaction to be mined 
         * But not checking if the execution is succesfull or not
         * 
         * For now It's important to enforce at least the `fundJob` step
         * 
         * For example in the approveTokens step, even if there is not enough balance
         * It will be succesfull anyway. This isn't good either if it used in combo 
         * with ERC20 decreaseApproval function can lead to other bugs 
         * https://github.com/OpenZeppelin/openzeppelin-solidity/issues/437
         * 
         * The createJob step will fail only if someone changes the parameters manually
         * or in absence of ethers for gas, but this is already enforced by MetaMask 
         */

        if (receipt.status === "0x1") {
          console.log('FundJob called on Job: ' + this.state.jobAddress);
          this.nextJobStep()
        } else {
            // TODO think a better way to show feedback to user
            this.handleReject('Transaction has not been executed! Check your AGI balance')
        }
      });
       // REFACTOR We should chain the promises, 
       // in order to use a single higl level `catch`
       // instead of a Matryoshka style promises  
    }).catch(this.handleReject);
  }

  callApi(methodName, params) {

    var addressBytes = [];
    for(var i=2; i< this.state.jobAddress.length-1; i+=2) {
      addressBytes.push(parseInt(this.state.jobAddress.substr(i, 2), 16));
    }

    window.ethjs.personal_sign(Eth.keccak256(addressBytes), this.props.account).then(signature => {

      this.setState({
        waitingForMetaMask: false,
      });

      let r = `0x${signature.slice(2, 66)}`;
      let s = `0x${signature.slice(66, 130)}`;
      let v = parseInt(signature.slice(130, 132), 16);

      this.props.agent.contractInstance.validateJobInvocation(this.state.jobAddress, v, r, s, {from: this.props.account}).then(validateJob => {
        console.log('job invocation validation returned: ' + validateJob[0]);

        let rpcClient = new JsonRpcClient({endpoint: this.props.agent.endpoint});

        params['job_address'] = this.state.jobAddress;
        params['job_signature'] = signature;
        rpcClient.request(methodName, params).then(rpcResponse => {

          console.log(rpcResponse);
          this.setState((prevState) => ({
            jobResult: rpcResponse,
          }));

          this.nextJobStep();

        }).catch(rpcError => {
          console.log(rpcError);
        });

      });
    }).catch(this.handleReject);
  }

  async waitForTransaction(hash) {
    let receipt;
    while(!receipt) {
      receipt = await window.ethjs.getTransactionReceipt(hash);
    }
    return receipt;
  }
  
  render() {

    let modal = type => 
      <Modal title={null} footer={null} closable={false} visible={this.state.showModal}>
        <Steps size="small" current={this.state.waitingForMetaMask ? 0 : 1}>
          <Steps.Step title='MetaMask' icon={this.state.waitingForMetaMask ? <Icon type="loading" /> : null} />
          <Steps.Step title={type[0].toUpperCase().concat(type.slice(1))} icon={!this.state.waitingForMetaMask ? <Icon type="loading" /> : null} />
        </Steps>
        <br/>
        {
          this.state.waitingForMetaMask ?
            <Alert description="Waiting for interaction with MetaMask to complete." />
            : <Alert description={'Waiting for ' + (type === 'blockchain' ? 'transaction to be mined on the blockchain.' : 'API response')} />
        }
      </Modal>
    
    let blockchainModal = () => modal('blockchain')
    let serviceModal = () => modal('service')

    let steps = [
      {
        title: 'Create Job',
        render: () => {
          return(
            <p>
              The first step in calling the Agent's API is to create a Job contract with the Agent. The Job contract stores the negotiated price in AGI tokens for
              calling the API. The negotiated price is based upon the 'current price' value stored in the Agent contract at the time the Job is created. Once a Job contract
              is created, tokens can be transferred to the Job to be held in escrow until the Agent has performed the work.
              <br/>
              <br/>
              <Button type="primary" onClick={() => {this.showModal(blockchainModal); this.createJob()}}>Create Job Contract</Button>
            </p>)
        }
      },
      {
        title: 'Approve Transfer',
        render: () => {
          return(
            <p>
              The second step in calling the Agent's API is to approve the Job contract to transfer AGI tokens on your behalf. The amount of AGI tokens that will be authorized
              is limited to the agreed upon price of services in the Job contract that was just created.
              <br/>
              <br/>
              <Button type="primary" onClick={() => {this.showModal(blockchainModal); this.approveTokens()}}>Approve AGI Transfer</Button>
            </p>)
          }
      },
      {
        title: 'Fund Job',
        render: () => {
          return(
            <p>
                Now that the token transfer has been approved, the third step is to fund the actual Job contract. This will cause the Job contract to transfer the AGI tokens that
                were just approved from your balance to the Job contracts address to be held in escrow until the Job is completed by the Agent performing the work.
                <br/>
                <br/>
                <Button type="primary" onClick={() => {this.showModal(blockchainModal); this.fundJob()}}>Fund Job Contract</Button>
            </p>)
        },
      },
      {
        
        title: 'Call API',
        render: () => {
          return(
            <p>
            Now that the Job contract has been funded you are able to call the API on the Agent. Agents
            take different inputs, so may have their own UI. Once you've provided inputs, click the
            "Call Agent API" button to initate the API call. This will prompt one further interaction with
            MetaMask to sign your API request before submitting the request to the Agent. This interaction
            does not initiate a transaction or transfer any additional funds.
            </p>
            )
        }
      },
      {
        
        title: 'Done',
        render: () => {
          return(
            <p>
            Your request has been completed.
            </p>
            )
        }
      }
    ];
    const CallComponent = this.props.callComponent;
    return(

      <React.Fragment>
        {
          this.state.showModal && this.state.modalFunctional()
        }

        <Card title={
          <React.Fragment>
            <Icon type="appstore-o" />
            <Divider type="vertical"/>
            Job
            <br/>
          </React.Fragment> }>

          <Divider orientation="left">Job Details</Divider>

          <table ref={jobDomNode => this.jobDomNode = jobDomNode}>
            <tbody>
              <tr>
                <td width="120px"><b>Agent:</b></td>
                <td>{this.props.agent.name}</td>
              </tr>
              <tr>
                <td><b>Current Price:</b></td>
                <td>{`${AGI.toDecimal(this.props.agent.currentPrice)} AGI`}</td>
              </tr>
              <tr>
                <td><b>Job Address:</b></td>
                <td>
                  {this.state.jobAddress ?
                    <Tag>
                      <a target="_blank" href={`${NETWORKS[this.props.network].etherscan}/address/${this.state.jobAddress}`}>
                        {this.state.jobAddress}
                      </a>
                    </Tag>
                    : '(not created)'}
                  </td>
              </tr>
              <tr>
                <td><b>Job Price:</b></td>
                <td>{this.state.jobPrice ? `${AGI.toDecimal(this.state.jobPrice)} AGI` : '(not created)'}</td>
              </tr>
              
            </tbody>
          </table>
          <br/>

          {
            (this.state.jobStep < steps.length) &&
              <React.Fragment>
                <Divider orientation="left">Job Progress</Divider>

                <Steps size="small" progressDot current={this.state.jobStep} >
                  {steps.map((step, i) => {return <Steps.Step title={step.title} key={`${i}-${step.title}`} /> })}
                </Steps>

                <div style={{ marginTop: '20px' }}>
                  {steps[this.state.jobStep].render()}
                </div>
              </React.Fragment>
          }
          {
            // Display service specific form submission or results display for the last two steps
            (this.state.jobStep >= (steps.length - 2)) &&
            <React.Fragment>
            <div>
            <Divider orientation="left">Service Call</Divider>
            <CallComponent callModal={serviceModal}  showModalCallback={this.showModal} callApiCallback={this.callApi} jobResult={this.state.jobResult}/>
            </div>
            </React.Fragment>
          }

        </Card>
      </React.Fragment>
    );
  }
}

export default Job;
