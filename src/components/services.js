import React from 'react';
import Eth from 'ethjs';
import {Layout, Divider, Card, Icon, Spin, Alert, Row, Col, Button, Tag, message, Table} from 'antd';
import {NETWORKS, AGENT_STATE, AGI} from '../util';

class Services extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      agents : [],
      account: undefined
    };

    this.servicesTableKeys = [
      {
        title:      'Agent',
        dataIndex:  'name',
      },
      {
        title:      'Contract Address',
        dataIndex:  'address',
        render:     (address, agent, index) =>
          <Tag>
            <a target="_blank" href={`${NETWORKS[this.props.network].etherscan}/address/${address}`}>
              {address}
            </a>
          </Tag>
      },
      {
        title:      'Current Price',
        dataIndex:  'currentPrice',
        render:     (currentPrice, agent, index) => `${AGI.toDecimal(currentPrice)} AGI`,
      },
      {
        title:      'Agent Endpoint',
        dataIndex:  'endpoint',
      },
      {
        title:      '',
        dataIndex:  'state',
        render:     (state, agent, index) =>
          typeof this.props.selectedAgent === 'undefined' &&
            <Button type={state == AGENT_STATE.ENABLED ? 'primary' : 'danger'} disabled={!(state == AGENT_STATE.ENABLED) || typeof this.props.account === 'undefined' } onClick={() => this.props.onAgentClick(agent)} >
              {
                this.props.account ?
                  state == AGENT_STATE.ENABLED ? 'Create Job' : 'Agent Disabled' :
                  'Unlock account'
              }
            </Button>
        }
    ];

    this.watchRegistryTimer = undefined;
  }

  componentWillMount() {
    this.watchRegistryTimer = setInterval(() => this.watchRegistry(), 500);
  }

  componentWillReceiveProps(nextProps, prevState) {
    if (prevState.account != nextProps.account) {
      this.setState({
        account: nextProps.account
      });
    }
  }

  componentWillUnmount() {
    clearInterval(this.watchRegistryTimer);
  }

  watchRegistry() {
    if(this.props.registry && this.props.agentContract) {
      this.props.registry.listRecords().then(response => {

        let agents = {};
        response[0].map((input, index) => {
          agents[Eth.toAscii(input)] = {
            name: Eth.toAscii(input),
            address: response[1][index],
            key: response[1][index],
          }
        });

        let promises = [];
        for(let agent in agents) {
          let agentInstance = this.props.agentContract.at(agents[agent].address);
          agents[agent]['contractInstance'] = agentInstance;

          let statePromise    = agentInstance.state();
          let pricePromise    = agentInstance.currentPrice();
          let endpointPromise = agentInstance.endpoint();
          promises.push(statePromise, pricePromise, endpointPromise);

          Promise.all([statePromise, pricePromise, endpointPromise]).then(values => {
            agents[agent]['state']        = values[0][0];
            agents[agent]['currentPrice'] = values[1][0];
            agents[agent]['endpoint']     = values[2][0];
          });
        }

        Promise.all(promises).then(() => {
          const newAgents = Object.values(agents);
          if (
            !this.state.agents.length ||
            newAgents.some((agent, i) => agent.address != this.state.agents[i].address) 
          ) {
            this.setState({ agents: newAgents });
          }
        });
      });
    }
  }

  render() {

    return(
      <Card title={
        <React.Fragment>
          <Icon type="table" />
          <Divider type="vertical"/>
          Agents
        </React.Fragment> }>
          <Table columns={this.servicesTableKeys} pagination={false} dataSource={this.state.agents} />
      </Card>
    )
  }
}

export default Services;
