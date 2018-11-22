import React from 'react';
import {Layout, Divider, Card, Icon, Spin, Alert, Row, Col, Button, Tag, message, Table, Collapse, Steps, Modal, Upload} from 'antd';
import { debounce } from 'underscore';


class DefaultService extends React.Component {

  constructor(props) {
    super(props);

    this.submitAction = this.submitAction.bind(this);
    this.updateValid = this.updateValid.bind(this);
    this.updateValid = debounce(this.updateValid, 500);
    
    this.state = {
        serviceName: "test",
        methodName: "test",
        paramString: "{}",
        inputValid: true
    };
  }

  isComplete() {
    if (this.props.jobResult === undefined)
        return false;
    else {
        return true;
    }
  }

  updateValid() {
    let inputValid = true;
    
    try {
        JSON.parse(this.state.paramString);
    } catch(e) {
        inputValid = false;
    }

    if (this.state.serviceName.length == 0)
        inputValid = false;
    
    if (this.state.methodName.length == 0)
        inputValid = false;
        
    this.setState({
        inputValid: inputValid
    });
  }
  
  handleChange(type, e) {
    this.setState({
        [type]: e.target.value,
    });
    this.updateValid();
  }

  submitAction() {
    this.props.showModalCallback(this.props.callModal);
    this.props.callApiCallback(
      this.state.serviceName,
      this.state.methodName, 
      JSON.parse(this.state.paramString)
    );
  }

  renderForm() {
    return(
        <React.Fragment>
        <div>
        <label>
          Service name:
          <input type="text" value={this.state.serviceName} onChange={ this.handleChange.bind(this, 'serviceName') } />
        </label>
        <label>
          Method name:
          <input type="text" value={this.state.methodName} onChange={ this.handleChange.bind(this, 'methodName') } />
        </label>
        <br/>
        <label style={{width:"100%"}}>
          Params (as JSON):
          <textarea style={{width:"100%"}} onChange={ this.handleChange.bind(this, 'paramString')} value={this.state.paramString} />
        </label>
            
        <br/>
        <Button type="primary" onClick={() => {this.submitAction(); }} disabled={!this.state.inputValid} >Call Agent API</Button>
        </div>
        </React.Fragment>
        )
  }
  
  renderComplete() {
    let jsonResult
    try {
      jsonResult = typeof this.props.jobResult === "string" ? JSON.parse(this.props.jobResult) : this.props.jobResult
      jsonResult = JSON.stringify(jsonResult, null, 4)
    } catch(e) {
      console.error(e)
      throw new Error(e.message)
    }
    return(
      <div>
        <textarea style={{width:"100%"}} rows="4" readOnly value={jsonResult}/>
      </div>
    );
  }


  renderDescription() {
    return(
      <div>
          <p>
          This service is missing a customised UI.

          Eventually service authors will be able to publish a API model that will
          allow an automatically generated interface, and optionally provide a
          manually designed one.
          
          For now, you need to find documentation for the service, and ensure you
          call the correct method with the correct parameters.
          </p>
      </div>
    )
  }

  render() {
    if (this.isComplete())
        return (
            <div>
            { this.renderDescription() }
            { this.renderComplete() }
            </div>
        );
    else
        return (
            <div>
            { this.renderDescription() }
            { this.renderForm() }
            </div>
        )  
  }
}

export default DefaultService;
