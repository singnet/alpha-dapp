import React from 'react';
import Eth from 'ethjs';
import {Input, Divider, Card, Icon, Button, Tag, Table} from 'antd';
import {NETWORKS, AGENT_STATE, AGI, FORMAT_UTILS, STRINGS} from '../util';


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
        width:      200,
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => this.renderFilterDropdown({ setSelectedKeys, selectedKeys, confirm, clearFilters }),
        filterIcon: filtered => <Icon type="search" theme="outlined" style={{ color: filtered ? '#108ee9' : '#aaa' }} />,
        onFilter: (value, record) => record.name.toLowerCase().includes(value.toLowerCase()),
        onFilterDropdownVisibleChange: (visible) => {
          if (visible) {
            setTimeout(() => {
              this.searchInput.focus();
            });
          }
        },
        render: (text) => {
          const { searchText } = this.state;
          return searchText ? (
            <span>
              {text.split(new RegExp(`(?<=${searchText})|(?=${searchText})`, 'i')).map((fragment, i) => (
                fragment.toLowerCase() === searchText.toLowerCase()
                  ? <span key={i} style={{color:'#20AAF8'}} className="highlight">{fragment}</span> : fragment // eslint-disable-line
              ))}
            </span>
          ) : text;
        },
      },
      {
        title:      'Contract Address',
        dataIndex:  'address',
        width:      '20ch',
        render:     (address, agent, index) =>
          this.props.network &&
          <Tag>
            <a target="_blank" href={this.props.network && typeof NETWORKS[this.props.network] !== "undefined" ? `${NETWORKS[this.props.network].etherscan}/address/${address}` : undefined}>
              {FORMAT_UTILS.toHumanFriendlyAddressPreview(address)}
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
        width: '23ch'
      },
      {
        title:      '',
        dataIndex:  'state',
        render:     (state, agent, index) =>
          <Button type={state == AGENT_STATE.ENABLED ? 'primary' : 'danger'}
                  onClick={() => { return this.props.onAgentClick(agent); }}
                  disabled={ !(state == AGENT_STATE.ENABLED)
                              || typeof this.props.account === 'undefined'
                              || this.props.jobInProgress
                              || this.isSelectedAgent(agent)}>
            {this.getAgentButtonText(state, agent) }
          </Button>
        }
    ].map(column => Object.assign({}, { width: 150 }, column));

    this.watchRegistriesTimer = undefined;
  }

  isSelectedAgent(agent){
    if (this.props.selectedAgent !== undefined) {
      return this.props.selectedAgent.key === agent.key;
    }
    return false;
  }

  getAgentButtonText(state, agent) {
    if (this.props.account) {
      if (typeof this.props.selectedAgent === 'undefined' || this.props.selectedAgent.key !== agent.key) {
        return state == AGENT_STATE.ENABLED ? 'Create Job' : 'Agent Disabled';
      } else {
        return 'Selected';
      }
    } else {
      return 'Unlock account';
    }
  }

  componentWillMount() {
    this.watchRegistriesTimer = setInterval(() => this.watchRegistries(), 500);
  }

  componentWillUnmount() {
    clearInterval(this.watchRegistriesTimer);
  }

  hexToAscii(hexString) { 
    let asciiString = Eth.toAscii(hexString);
    return asciiString.substr(0,asciiString.indexOf("\0")); // name is right-padded with null bytes
  }

  getServiceRegistrations(registry) {
    return registry.listOrganizations()
      .then(({ orgNames }) =>
        Promise.all(orgNames.map(orgName => Promise.all([ Promise.resolve(orgName), registry.listServicesForOrganization(orgName) ])))
      )
      .then(servicesByOrg => {
        const nonEmptyServiceLists = servicesByOrg.filter(([ , { serviceNames } ]) => serviceNames.length);
        return Promise.all(
          nonEmptyServiceLists.reduce((acc, [ orgName, { serviceNames } ]) =>
            acc.concat(serviceNames.map(serviceName => Promise.all([
              Promise.resolve(orgName),
              registry.getServiceRegistrationByName(orgName, serviceName)
            ])))
          , [])
        );
      })
      .then(servicesList =>
        Promise.resolve(servicesList.map(([ orgName, { name, agentAddress, servicePath } ]) => ({ orgName, name, agentAddress, servicePath })))
      )
      .catch(console.error);
  };

  watchRegistries() {
    if(typeof this.props.registries !== "undefined" && this.props.agentContract) {
      Promise.all([
        typeof this.props.registries["AlphaRegistry"] !== "undefined" ? this.props.registries["AlphaRegistry"].listRecords() : undefined,
        typeof this.props.registries["Registry"] !== "undefined" ? this.getServiceRegistrations(this.props.registries["Registry"]) : undefined
      ])
      .then(([ alphaRegistryListing, registryListing ]) => {
        let agents = [];

        if (typeof alphaRegistryListing !== "undefined") {  
          alphaRegistryListing[0].map((input, index) => {
            const asciiName = this.hexToAscii(input);

            const thisAgent = {
              "name": asciiName,
              "address": alphaRegistryListing[1][index],
              "key": [ alphaRegistryListing[1][index], asciiName ].filter(Boolean).join("/"),
            };

            if (thisAgent.name !== "" && thisAgent.address !== STRINGS.NULL_ADDRESS) {
              agents.push(thisAgent);
            }
          });
        }

        if (typeof registryListing !== "undefined") {
          registryListing.forEach(({ orgName, name, agentAddress, servicePath }) => {
            const serviceAsciiName = this.hexToAscii(name);
            const serviceAsciiPath = this.hexToAscii(servicePath);
            const orgAsciiName = this.hexToAscii(orgName);

            const serviceIdentifier = [ orgAsciiName, serviceAsciiPath, serviceAsciiName ].filter(Boolean).join("/");
            
            const thisAgent = {
              "name": serviceIdentifier,
              "address": agentAddress,
              "key": [ agentAddress, serviceIdentifier ].filter(Boolean).join("/")
            };

            if (thisAgent.name !== "" && thisAgent.address !== STRINGS.NULL_ADDRESS) {
              agents.push(thisAgent);
            }
          });
        }

        let promises = [];
        
        promises.push(fetch('/featured.json').then(response => response.json()))

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

        Promise.all(promises).then(([featured]) => {
          if (this.props.network) {
            let otherAgents = []
            this.setState({
              agents: Object.assign(
                {},
                {
                  featured: Object.values(agents).filter(agent => {
                    const test = featured.includes(agent.address)
                    if (test) {
                      return test
                    } else {
                      otherAgents.push(agent)
                    }
                  }),
                  other: otherAgents
                }
              )
            })
          } else {
            this.setState({
              agents: []
            })
          }
        });
      });
    }
  }

  handleSearch(selectedKeys, confirm) {
    this.setState({ searchText: selectedKeys[0] })
    return confirm()
  }

  handleReset(clearFilters){
    this.setState({ searchText: '' });
    return clearFilters()
  }

  renderFilterDropdown({ setSelectedKeys, selectedKeys, confirm, clearFilters }){
    return (
      <div className="custom-filter-dropdown" style ={{padding: '8px',  borderRadius: '6px',  background: '#fff',  boxShadow: '0 1px 6px rgba(0, 0, 0, .2)'}}>
        <Input
          style={{width: '130px', marginRight: '8px'}}
          ref={ele => this.searchInput = ele}
          placeholder="Search name"
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => this.handleSearch(selectedKeys, confirm)}
        />
        <Button type="primary" onClick={() => this.handleSearch(selectedKeys, confirm)}>Search</Button>
        <Button onClick={() => this.handleReset(clearFilters)}>Reset</Button>
      </div>
    )
  }

  render() {

    let servicesTable = (columns, dataSource, featured) =>
      <React.Fragment>
        {/* featured ? <h5><Icon type="star" /> Featured</h5> : <h5>Other</h5> */}
        <Table className="services-table" scroll={{ x: true }} columns={columns} pagination={dataSource.length > 20} dataSource={dataSource} />
        <br/>
      </React.Fragment>
    
    /* All services go in one table for now
    let featuredServices = () => servicesTable(this.servicesTableKeys, this.state.agents.featured, true)
    let otherServices = () => servicesTable(this.servicesTableKeys, this.state.agents.other)
    */
    // TODO: destroy the allServices table once we go live with the Featured agents distinction
    let allServicesList = () => {
      const serviceInOrg = name => name.split("/").length > 1;
      return Object.values(this.state.agents)
        .reduce((acc, cur) => cur.length !== 0 ? acc.concat(cur) : acc, [])
        .sort((a, b) => {
          const aInOrg = serviceInOrg(a.name);
          const bInOrg = serviceInOrg(b.name);
          if (aInOrg !== bInOrg) {
            return bInOrg - aInOrg;
          } else {
            return a.name.localeCompare(b.name);
          }
        });
    };

    let allServicesTable = () => servicesTable(this.servicesTableKeys, allServicesList())

    return(
      <Card title={
        <React.Fragment>
          <Icon type="table" />
          <Divider type="vertical"/>
            Agents
        </React.Fragment> }>
        {/* TODO: Destroy the allServices table rendering once we go live with the Featured agents distinction, restore the two tables */} 
        {
          this.state.agents
          && (
            (this.state.agents.featured && this.state.agents.featured.length !== 0)
            || (this.state.agents.other && this.state.agents.other.length !== 0)
          )
          && allServicesTable()
        }
        {
          /*
          {this.state.agents.featured && this.state.agents.featured.length !== 0 && featuredServices()}
          {this.state.agents.other && this.state.agents.other.length !== 0 && otherServices()}
          */
        }
      </Card>
    )
  }
}

export default Services;
