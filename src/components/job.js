import React from 'react';
import agentAbi from 'singularitynet-platform-contracts/abi/Agent.json';
import jobAbi from 'singularitynet-platform-contracts/abi/Job.json';
import Eth from 'ethjs';
import {Layout, Divider, Card, Icon, Spin, Alert, Row, Col, Button, Tag, message, Table, Collapse, Steps, Modal, Upload} from 'antd';
import { NETWORKS, ERROR_UTILS, AGENT_STATE, AGI } from '../util';
import {JsonRpcClient} from "../jsonrpc";
import abiDecoder from 'abi-decoder';
import md5 from 'md5';
import ProtoBuf from '../ProtoBuf';

// Version 1 of the Agent contract expects the signed 20-byte job address and we've hardcoded the
// checksum of the bytecode for this version below. Version 2 expects the signed 42-byte hex-encoded
// job address.
const oldSigAgentBytecodeChecksum = "f4b0a8064a38abaf2630f5f6bd0043c8";

class Job extends React.Component {

  constructor(props) {
    super(props);
    //Protobuf descriptor
    const { jsonDescriptor, agent }  = props;
    this.protobufClient = new ProtoBuf({ jsonDescriptor, endpoint:agent.endpoint });
    this.protobufClient.generateStubs();

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
    console.log(ERROR_UTILS.sanitizeError(error));
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

        console.log('FundJob called on Job: ' + this.state.jobAddress);
        this.nextJobStep();
      });
    
    }).catch(this.handleReject);
  }

  callApi(methodName, params, grpc) {
    let addressBytes = [];
    for(let i=2; i< this.state.jobAddress.length-1; i+=2) {
      addressBytes.push(parseInt(this.state.jobAddress.substr(i, 2), 16));
    }

    window.ethjs.getCode(this.props.agent.contractInstance.address).then((bytecode) => {
      let bcBytes = [];
      for (let i = 2; i < bytecode.length; i += 2) {
        bcBytes.push(parseInt(bytecode.substr(i, 2), 16));
      }

      let bcSum = md5(bcBytes);
      let sigPayload = bcSum === oldSigAgentBytecodeChecksum ? Eth.keccak256(addressBytes) : Eth.fromUtf8(this.state.jobAddress);

      window.ethjs.personal_sign(sigPayload, this.props.account).then(signature => {

        this.setState({
          waitingForMetaMask: false,
        });

        let r = `0x${signature.slice(2, 66)}`;
        let s = `0x${signature.slice(66, 130)}`;
        let v = parseInt(signature.slice(130, 132), 16);

        return this.props.agent.contractInstance.validateJobInvocation(this.state.jobAddress, v, r, s, {from: this.props.account}).then(validateJob => {
          console.log('job invocation validation returned: ' + validateJob[0]);

          
          // If agent is using old bytecode, put auth in params object. Otherwise, put auth in headers as new daemon
          // must be in use to support new signature scheme
          let callHeaders = bcSum === oldSigAgentBytecodeChecksum ? {} : {"snet-job-address": this.state.jobAddress,
          "snet-job-signature": signature};
          
          let addlParams = bcSum === oldSigAgentBytecodeChecksum ? {job_address: this.state.jobAddress,
            job_signature: signature} : {};
            
          
          if (grpc) {
            const ProtoBufClient = this.protobufClient;
            const currentMethod  = ProtoBufClient.services[ProtoBufClient.findServiceByMethod(methodName)].methods[methodName];

            return currentMethod.call(params).then(grpcResponse => {
              console.log(grpcResponse);
              
              this.setState((prevState) => ({
                jobResult: grpcResponse,
              }));

              this.nextJobStep();

            }).catch(grpcError => {
              console.error(grpcError);
              throw grpcError;
            });

          } else {
            let rpcClient = new JsonRpcClient({endpoint: this.props.agent.endpoint});
            rpcClient.request(methodName, Object.assign({}, params, addlParams), Object.assign({}, callHeaders)).then(rpcResponse => {

              console.log(rpcResponse);
              this.setState((prevState) => ({
                jobResult: rpcResponse,
              }));

              this.nextJobStep();

            }).catch(rpcError => {
              console.log(rpcError);
            });
          }

        });
      }).catch(this.handleReject);
    }).catch((error) => {
      console.log("getCode error", error);
    });
  }

  async waitForTransaction(hash) {
    let receipt;
    while(!receipt) {
      receipt = await window.ethjs.getTransactionReceipt(hash);
    }

    if (receipt.status === "0x0") {
      throw receipt
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
    
    let blockchainModal = () => modal('blockchain');
    let serviceModal = () => modal('service');

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
                      <a target="_blank" href={this.props.network && typeof NETWORKS[this.props.network] !== "undefined" ? `${NETWORKS[this.props.network].etherscan}/address/${this.state.jobAddress}` : undefined}>
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
            <CallComponent protobufClient={this.protobufClient} callModal={serviceModal}  showModalCallback={this.showModal} callApiCallback={this.callApi} jobResult={this.state.jobResult}/>
            </div>
            </React.Fragment>
          }

        </Card>
      </React.Fragment>
    );
  }
}

export default Job;
