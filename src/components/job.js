import React from 'react';
import { abi as agentAbi } from 'singularitynet-alpha-blockchain/Agent.json';
import { abi as jobAbi } from 'singularitynet-alpha-blockchain/Job.json';
import Eth from 'ethjs';
import {Layout, Divider, Card, Icon, Spin, Alert, Row, Col, Button, Tag, message, Table, Collapse, Steps, Modal, Upload, notification} from 'antd';
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
      showError:              false,
      waitingForMetaMask:     false,
      file:                   undefined,
      fileUploaded:           false,
      fileReader:             undefined,
    };

    this.fundJob       = this.fundJob.bind(this);
    this.approveTokens = this.approveTokens.bind(this);
    this.createJob     = this.createJob.bind(this);
    this.callApi       = this.callApi.bind(this);
    this.handleReject  = this.handleReject.bind(this);

    abiDecoder.addABI(agentAbi);
    abiDecoder.addABI(jobAbi);
  }

  handleReject() {
    this.setState({ showModal: !this.state.showModal })
  }

  createJob() {

    this.setState({
      showModal: true,
      waitingForMetaMask: true,
    });

    this.props.agent['contractInstance'].createJob({from: this.props.account})
      .then(response => {
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
              showModal: false,
              jobStep: prevState.jobStep + 1,
              jobAddress: jobAddress,
              jobPrice: jobPrice,
              jobInstance: window.ethjs.contract(jobAbi).at(jobAddress),
            }));
          }
        });
      })
      .catch(err => {
        console.log(err)
        this.handleReject() 
      })
  }

  approveTokens() {

    this.setState({
      showModal: true,
      waitingForMetaMask: true,
    });

    this.props.token.approve(this.state.jobAddress, this.state.jobPrice, {from: this.props.account})
      .then(response => {
        this.setState({
          waitingForMetaMask: false,
        });

        this.waitForTransaction(response).then(receipt => {
          console.log('ECR20 approve called with ' + AGI.toDecimal(this.state.jobPrice) + ' AGI for Job: ' + this.state.jobAddress);

          this.setState((prevState) => ({
            showModal: false,
            jobStep: prevState.jobStep + 1,
          }));

        });
      })
      .catch(err => {
        console.log(err)
        this.handleReject() 
      })
  }

  fundJob() {

    this.setState({
      showModal: true,
      waitingForMetaMask: true,
    });

    this.state.jobInstance.fundJob({from: this.props.account})
      .then(response => {
        this.setState({
          waitingForMetaMask: false,
        });

        this.waitForTransaction(response).then(receipt => {
          console.log('FundJob called on Job: ' + this.state.jobAddress);

          this.setState((prevState) => ({
            showModal: false,
            jobStep: prevState.jobStep + 1,
          }));

        });
      })
      .catch(err => {
        console.log(err)
        this.handleReject() 
      })
  }

  callApi() {

    this.setState({
      showModal: true,
      waitingForMetaMask: true,
    });

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

        rpcClient.request("classify", {
          job_address: this.state.jobAddress,
          job_signature: signature,

          image: this.state.fileReader.result.split(',')[1],
          image_type: this.state.file.type.split('/')[1],
        }).then(rpcResponse => {

          console.log(rpcResponse);

          let jobKeys = Object.keys(rpcResponse).map(item => {
            return {
              title: item,
              dataIndex: item,
              key: item,
            }
          });

          let jobResult = {};
          Object.keys(rpcResponse).forEach(item => {
            jobResult[item] = rpcResponse[item].toString();
          });

          this.setState((prevState) => ({
            showModal: false,
            jobStep: prevState.jobStep + 1,
            jobKeys: jobKeys,
            jobResult: [jobResult],
          }));

        }).catch(rpcError => {
          console.log(rpcError);
        });

      });
    });
  }

  async waitForTransaction(hash) {
    let receipt;
    while(!receipt) {
      receipt = await window.ethjs.getTransactionReceipt(hash);
    }
    return receipt;
  }

  processFile(file) {
    let reader = new FileReader();

    reader.onload = (e => {
      this.setState({
        fileUploaded: true,
        file: file,
        fileReader: reader,
      });
    });

    reader.readAsDataURL(file);
  }

  componentWillReceiveProps(nextProps) {
    if ((this.props.online && !nextProps.online) || this.props.account && !nextProps.account) {
      this.setState({ showModal: false })
      if (!this.state.showError) {
        notification.error({
          message: 'Connection lost',
          description: 'Connection was lost while handling your request; please try again when connection is restored',
          duration: 0,
          key: 'errorNotification'
        });
        this.setState({ showError: true });
      }
    } else if (
      !this.props.online && this.props.account && nextProps.online ||
      this.props.online && !this.props.account && nextProps.account ||
      !this.props.account && !this.props.online && nextProps.online && nextProps.account
    ) {
      notification.close('errorNotification');
      this.setState({ showError: false });
    }
  }

  render() {
    if (this.props.online && this.props.account) {
      return(
        <React.Fragment>
          {
          this.state.showModal &&
            <Modal title={null} footer={null} closable={false} visible={this.state.showModal}>
              <Steps size="small" current={this.state.waitingForMetaMask ? 0 : 1}>
                <Steps.Step title='MetaMask' icon={this.state.waitingForMetaMask ? <Icon type="loading" /> : null} />
                <Steps.Step title='Blockchain' icon={!this.state.waitingForMetaMask ? <Icon type="loading" /> : null} />
              </Steps>
              <br/>
              {
                this.state.waitingForMetaMask ?
                  <Alert description="Waiting for interaction with MetaMask to complete." />
                  : <Alert description="Waiting for transaction to be mined on the blockchain." />
              }
            </Modal>
          }

          <Card title={
            <React.Fragment>
              <Icon type="appstore-o" />
              <Divider type="vertical"/>
              Job
              <br/>
            </React.Fragment> }>

            <Divider orientation="left">Job Details</Divider>

            <table>
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
                <tr>
                  <td><b>File:</b></td>
                  <td>{this.state.file ? `${this.state.file.name}` : '(not uploaded)'}</td>
                </tr>
              </tbody>
            </table>
            <br/>

            {
              this.state.jobStep < 4 &&
                <React.Fragment>
                  <Divider orientation="left">Job Progress</Divider>

                  <Steps size="small" progressDot current={this.state.jobStep} >
                    <Steps.Step title='Create Job' />
                    <Steps.Step title='Approve Transfer' />
                    <Steps.Step title='Fund Job' />
                    <Steps.Step title='Call API' />
                  </Steps>
                </React.Fragment>
            }

            <div style={{ marginTop: '20px' }}>
              { this.state.jobStep == 0 &&
                <div>
                  <p>
                    The first step in calling the Agent's API is to create a Job contract with the Agent. The Job contract stores the negotiated price in AGI tokens for
                    calling the API. The negotiated price is based upon the 'current price' value stored in the Agent contract at the time the Job is created. Once a Job contract
                    is created, tokens can be transferred to the Job to be held in escrow until the Agent has performed the work.
                  </p>
                  <br/>
                  <br/>
                  <Button type="primary" onClick={this.createJob}>Create Job Contract</Button>
                </div>
              }
              { this.state.jobStep == 1 &&
                <div>
                  <p>
                    The second step in calling the Agent's API is to approve the Job contract to transfer AGI tokens on your behalf. The amount of AGI tokens that will be authorized
                    is limited to the agreed upon price of services in the Job contract that was just created.
                  </p>
                  <br/>
                  <br/>
                  <Button type="primary" onClick={this.approveTokens}>Approve AGI Transfer</Button>
                </div>
              }
              { this.state.jobStep == 2 &&
                <div>
                  <p>
                    Now that the token transfer has been approved, the third step is to fund the actual Job contract. This will cause the Job contract to transfer the AGI tokens that
                    were just approved from your balance to the Job contracts address to be held in escrow until the Job is completed by the Agent performing the work.
                  </p>
                  <br/>
                  <br/>
                  <Button type="primary" onClick={this.fundJob}>Fund Job Contract</Button>
                </div>
              }
              { this.state.jobStep == 3 &&
                <div>
                  <p>
                    Now that the Job contract has been funded you are able to call the API on the Agent. Select a file to be analyzed by dragging and dropping the file onto the upload
                    area or by clicking the upload area to initiate the file-chooser dialog. Once you have chosen a file to analyze, click the "Call Agent API" button to initate the API call. This
                    will prompt one further interaction with MetaMask to sign your API request before submitting the request to the Agent. This interaction does not initiate a transaction
                    or transfer any additional funds.
                  </p>
                  {
                    !this.state.fileUploaded &&
                      <React.Fragment>
                        <br/>
                        <br/>
                        <Upload.Dragger name="file" beforeUpload={(file)=>{ this.processFile(file); return false; }} >
                        <p className="ant-upload-drag-icon">
                          <Icon type="inbox" />
                        </p>
                        <p className="ant-upload-text">Click for file-chooser dialog or drag a file to this area to be analyzed.</p>
                        </Upload.Dragger>
                      </React.Fragment>
                  }

                  <br/>
                  <br/>
                  <Button type="primary" onClick={this.callApi} disabled={!this.state.fileUploaded} >Call Agent API</Button>
                </div>
              }
            </div>

            {
              this.state.jobStep == 4 &&
              <div>
                <Divider orientation="left">Job Results</Divider>
                <Table pagination={false} columns={this.state.jobKeys} dataSource={this.state.jobResult.map((result, i) => Object.assign({}, result, { key: 'result'+i }))} />
              </div>
            }

          </Card>
        </React.Fragment>
      );
    } else {
      return (<p></p>)
    }
  }
}

export default Job;
