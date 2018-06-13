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
    this.props.callApiCallback(this.state.methodName, 
      JSON.parse(this.state.paramString)
    );
  }

  renderForm() {
    return(
        <React.Fragment>
        <div>
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
    let jsonResult = JSON.stringify(this.props.jobResult);
    return(<div>
          <Divider orientation="left">Job Results</Divider>
          <textarea rows="4" cols="50" readOnly value={jsonResult}/>
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