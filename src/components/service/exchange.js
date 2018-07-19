import React from 'react';
import { Input, Button } from 'antd';
import { isValidAddress } from '../../util';

class ExchangeService extends React.Component {

  constructor(props) {
    super(props);

    this.submitAction = this.submitAction.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.updateValid = this.updateValid.bind(this);

    this.state = {
      methodName: 'agibtc',
      response: null,
      address: ""
    };

  }

  submitAction() {
    const { address, methodName } = this.state;

    this.props.showModalCallback(this.props.callModal);
    this.props.callApiCallback(methodName, { address });
  }

  componentWillReceiveProps(nextProps) {
    console.log("Receiving props: ", nextProps);

    if (nextProps.jobResult === undefined) {
      return;
    }

    this.setState({
      response: nextProps.jobResult
    });

  }

  updateValid(address) {
    const inputValid = isValidAddress(address, 'bitcoin', 'testnet');
    this.setState({ inputValid });
  }

  handleInputChange(e) {
    const value = e.target.value;

    this.updateValid(value);
    this.setState({
      address: value
    });
  }

  renderForm() {
    const { response, address, inputValid } = this.state;

    return (
      <React.Fragment>
        <div>
          {
            !response &&
            <React.Fragment>
              <br />
              <br />
              <label>
                Insert your address where do you want to receive testnet bitcoins: <br /> <br />
                <Input size="large" placeholder="Your Bitcoin address" type="text" value={address} onChange={this.handleInputChange} />
              </label>
            </React.Fragment>
          }
          <br />
          <br />
          {
            response && <p>{response}</p>
          }
          <br />
          <br />
          <Button type="primary" onClick={this.submitAction} disabled={!inputValid} >Call Agent API</Button>
        </div>
      </React.Fragment>
    )
  }

  renderComplete() {
    const { response } = this.state;
    return (
      <div>
        <br />
        <p>{response}</p>
      </div>
    );
  }

  renderDescription() {
    return (
      <div>
        <p>
          A service that exchanges Kovan AGI for Testnet BTC <br />
        </p>
      </div>
    )
  }

  render() {
    const isComplete = this.props.jobResult !== undefined;
    return (
      <div>
        {this.renderDescription()}
        {isComplete ? this.renderComplete() : this.renderForm()}
      </div>
    )
  }
}

export default ExchangeService;