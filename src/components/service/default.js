import React from 'react';
import {Layout, Divider, Card, Icon, Spin, Alert, Row, Col, Button, Tag, message, Table, Collapse, Steps, Modal, Upload} from 'antd';


class DefaultService extends React.Component {

  constructor(props) {
    super(props);

    this.title = 'Call API';
    this.submitAction       = this.submitAction.bind(this);
    this.state = {
        methodName: "test",
        paramString: "{}",
        inputValid: true
    };
  }

  isComplete() {
    if (this.props.jobResult === undefined)
        return false;
    else
    {
        console.log(this.props.jobResult);
        return true;
    }
  }
  
  handleChange(type, e) {
    
    let inputValid = true;

    if (type === "paramString")
    {
        try {
            a = JSON.parse(e.target.value);
        } catch(e) {
            inputValid = false;
        }
    }
    else if (type === "methodName")
    {
        if (e.target.value.length == 0)
            inputValid = false;
    }
    this.setState({
        [type]: e.target.value,
        inputValid: inputValid
    })
  }

  submitAction() {
    this.props.showModalCallback(this.props.callModal);
    this.props.callApiCallback(this.state.methodName, 
      JSON.parse(this.state.paramString)
    );
  }

  renderForm() {
    return(
        <React.Fragment>
        <div><p>
            Now that the Job contract has been funded you are able to call the API on the Agent. Select a file to be analyzed by dragging and dropping the file onto the upload
            area or by clicking the upload area to initiate the file-chooser dialog. Once you have chosen a file to analyze, click the "Call Agent API" button to initate the API call. This
            will prompt one further interaction with MetaMask to sign your API request before submitting the request to the Agent. This interaction does not initiate a transaction
            or transfer any additional funds.
        </p>

        <label>
          Method name:
          <input type="text" value={this.state.methodName} onChange={ this.handleChange.bind(this, 'methodName') } />
        </label>
        <br/>
        <label>
          Params (as JSON):
          <textarea onChange={ this.handleChange.bind(this, 'paramString')} value={this.state.paramString} />
        </label>
            
        <br/>
        <Button type="primary" onClick={() => {this.submitAction(); }} disabled={!this.state.inputValid} >Call Agent API</Button>
        </div>
        </React.Fragment>
        )
  }
  
  renderComplete() {
    return(<div><p>Complete</p>
        <div>
          <Divider orientation="left">Job Results</Divider>
          <textarea rows="4" cols="50" readonly value={() => {JSON.stringify(this.props.jobResult)}}/>
          
        </div>
    </div>);
  }
  render() {
    if (this.isComplete())
        return this.renderComplete();
    else
        return this.renderForm();
  }
}

export default DefaultService;