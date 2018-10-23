import React from 'react';
import ReactDOM from 'react-dom';
import Eth from 'ethjs';
import AlphaRegistryNetworks from 'singularitynet-platform-contracts/networks/AlphaRegistry.json';
import AlphaRegistryAbi from 'singularitynet-platform-contracts/abi/AlphaRegistry.json'
import RegistryNetworks from 'singularitynet-platform-contracts/networks/Registry.json';
import RegistryAbi from 'singularitynet-platform-contracts/abi/Registry.json'
import tokenNetworks from 'singularitynet-token-contracts/networks/SingularityNetToken.json';
import tokenAbi from 'singularitynet-token-contracts/abi/SingularityNetToken.json';
import agentAbi from 'singularitynet-platform-contracts/abi/Agent.json';
import {Layout, Divider, Card, Icon, Spin, message, Alert, Row, Col} from 'antd';
import Account from './components/account';
import Services from './components/services';
import Job from './components/job';
import { NETWORKS, AGI, SERVICE_SPEC_PROVIDER_URL } from './util';

import DefaultService from './components/service/default';
import AlphaExampleService from './components/service/alpha_example';
import FaceDetectService from './components/service/face_detect';
import FaceLandmarksService from './components/service/face_landmarks';
import FaceAlignmentService from './components/service/face_alignment';
import FaceRecognitionService from './components/service/face_recognition';
import ExchangeService from './components/service/exchange';


class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      account:                    undefined,
      ethBalance:                 0,
      agiBalance:                 0,
      chainId:                    undefined,
      selectedAgent:              undefined,
      serviceEncoding:            undefined,
      serviceSpec:                undefined,
      agentCallComponent:         undefined,
      usingDefaultCallComponent:  false,
    };

    this.serviceNameToComponent = {
      'Alpha TensorFlow Agent': AlphaExampleService,
      'face_detect': FaceDetectService,
      'face_landmarks': FaceLandmarksService,
      'face_alignment': FaceAlignmentService,
      'face_recognition': FaceRecognitionService,
      'Exchange AGI for BTC': ExchangeService
    };
    this.serviceDefaultComponent = DefaultService;
    

    this.web3               = undefined;
    this.eth                = undefined;
    this.watchWalletTimer   = undefined;
    this.watchNetworkTimer  = undefined;
    this.agentContract      = undefined;
    this.registryInstances  = undefined;
    this.tokenInstance      = undefined;
  }

  componentWillMount() {
    window.addEventListener('load', () => this.handleWindowLoad());
  }

  componentWillUnmount() {
    if(this.watchWalletTimer) {
      clearInterval(this.watchWalletTimer);
    }
    if(this.watchNetworkTimer) {
      clearInterval(this.watchNetworkTimer);
    }
  }

  handleWindowLoad() {
    if(typeof window.web3 !== 'undefined') {
      this.web3          = window.web3;
      this.eth           = new Eth(window.web3.currentProvider);
      window.ethjs       = this.eth;
      this.agentContract = this.eth.contract(agentAbi);

      this.watchWalletTimer  = setInterval(() => this.watchWallet(), 500);
      this.watchNetworkTimer = setInterval(() => this.watchNetwork(), 500);
    }
  }

  watchWallet() {
    this.eth.accounts().then(accounts => {

      if(accounts.length === 0) {
        console.log('wallet is locked');
        this.setState({account: undefined});
        return;
      } else if(accounts[0] !== this.state.account) {
        console.log('account: ' + accounts[0] + ' unlocked');
        this.setState({ account: accounts[0] });
      }

      this.eth.getBalance(accounts[0]).then(response => {
        let balance = Number(response.toString());
        if(balance !== this.state.ethBalance) {
          console.log('account eth balance is: ' + Eth.fromWei(balance, 'ether'));
          this.setState({ethBalance: balance});
        }
      })

      if(this.tokenInstance) {
        this.tokenInstance.balanceOf(this.state.account).then(response => {
          let balance = Number(response['balance']);
          if(balance !== this.state.agiBalance) {
            console.log('account agi balance is: ' + AGI.toDecimal(balance));
            this.setState({agiBalance: balance})
          }
        })
      } else {
        this.setState({agiBalance: 0})
      }
    }).catch(err => { console.log(err) });
  }

  watchNetwork() {
    this.eth.net_version().then(chainId => {

      if (this.state.chainId !== chainId && typeof chainId !== undefined) {
        if (typeof NETWORKS[chainId] !== "undefined" && typeof NETWORKS[chainId].name !== "undefined") {
          console.log("connected to network: " + NETWORKS[chainId].name);
        }
        this.setState({chainId: chainId});

        this.registryInstances = {};
        // if (chainId in AlphaRegistryNetworks) { this.registryInstances["AlphaRegistry"] = this.eth.contract(AlphaRegistryAbi).at(AlphaRegistryNetworks[chainId].address) };
        if (chainId in RegistryNetworks) { this.registryInstances["Registry"] = this.eth.contract(RegistryAbi).at(RegistryNetworks[chainId].address) };

        this.tokenInstance = (chainId in tokenNetworks) ? this.eth.contract(tokenAbi).at(tokenNetworks[chainId].address) : undefined;
      }
    }).catch(err => {
      console.log(err);
      this.setState({ chainId: undefined });
    });
  }

  hireAgent(agent) {
    console.log("Agent " + agent.name + " selected");
    Promise.all([
      window.fetch(`${agent.endpoint}/encoding`),
      window.fetch(`${SERVICE_SPEC_PROVIDER_URL}/${agent.address}`)
    ]) 
      .then(([ encodingResponse, serviceSpecResponse ]) => Promise.all([ encodingResponse.text(), serviceSpecResponse.json() ]))
      .then(([ serviceEncoding, serviceSpec ]) => {
        this.setState({
          selectedAgent: agent,
          serviceSpec,
          serviceEncoding: serviceEncoding.trim(),
          serviceCallComponent: this.serviceNameToComponent[agent.name] || this.serviceDefaultComponent,
          usingDefaultCallComponent: !(agent.name in this.serviceNameToComponent),
        });
      })
      .catch(console.error) 
  }


  render() {

    return (
      <div>
        <Layout style={{ minHeight: '100vh' }} >
          <Layout.Header style={{ background: 'rgb(35, 13, 58)' }}>
            <img src="/img/logo.svg" alt="SingularityNET" />
          </Layout.Header>
          <Layout.Content>
            <Row type="flex" justify="center" style={{ marginTop: '40px' }}>
              <Col xs={24} sm={24} md={22} lg={15} xl={18} span={9}>
                <Account network={this.state.chainId} account={this.state.account} ethBalance={this.state.ethBalance} agiBalance={this.state.agiBalance} />
                <Divider/>
                <Services account={this.state.account} network={this.state.chainId} registries={this.registryInstances} agentContract={this.agentContract} onAgentClick={(agent) => this.hireAgent(agent)} />
                <Divider/>
                { this.state.usingDefaultCallComponent &&
                  <Alert type="warning" message="This service is using the default interface" description="You will have to marshall the data into JSON-RPC yourself and ensure it matches the API of the service based on its documentation."/>
                }
                {
                  this.state.selectedAgent && this.state.serviceEncoding && this.state.serviceSpec && this.state.chainId && this.state.account &&
                  <Job network={this.state.chainId} account={this.state.account} agent={this.state.selectedAgent} serviceEncoding={this.state.serviceEncoding} serviceSpec={this.state.serviceSpec} setFetchHeaders={this.setFetchHeaders} callComponent={this.state.serviceCallComponent} token={this.tokenInstance} />
                }
              </Col>
            </Row>
          </Layout.Content>
          <Layout.Footer style={{ textAlign: 'center' }} >SingularityNET</Layout.Footer>
        </Layout>
      </div>
    );
  }
}

ReactDOM.render(
  <App/>,
  document.getElementById('react-root')
);
