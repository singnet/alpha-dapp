import React from 'react';
import Eth from 'ethjs';
import {Layout, Divider, Card, Icon, Spin, Alert, Row, Col, Button, Tag, message, Table} from 'antd';
import {NETWORKS, AGENT_STATE, AGI} from '../util';

class Services extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      agents : [],
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
          <Button type={state == AGENT_STATE.ENABLED ? 'primary' : 'danger'} disabled={!(state == AGENT_STATE.ENABLED)} onClick={() => this.props.onAgentClick(agent)} >
            {state == AGENT_STATE.ENABLED ? 'Create Job' : 'Agent Disabled'}
          </Button>
      },
    ];

    this.watchRegistryTimer = undefined;
  }

  componentWillMount() {
    this.watchRegistryTimer = setInterval(() => this.watchRegistry(), 500);
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
          this.setState({
            agents: Object.values(agents),
          })
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