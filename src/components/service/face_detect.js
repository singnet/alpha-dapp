import React from 'react';
import {Layout, Divider, Card, Icon, Spin, Alert, Row, Col, Button, Tag, message, Table, Collapse, Steps, Modal, Upload} from 'antd';

class FaceDetectService extends React.Component {

  constructor(props) {
    super(props);

    this.submitAction = this.submitAction.bind(this);
    this.state = {
        fileUploaded: false,
        file: undefined,
        fileReader: undefined,
        methodName: "find_face",
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

  submitAction() {
    this.props.showModalCallback(this.props.callModal);
    this.props.callApiCallback(this.state.methodName, 
      {
        image: this.state.fileReader.result.split(',')[1],
      }
    );
  }

  componentWillReceiveProps(nextProps) {
    console.log("Receiving props: ", nextProps)
    this.parseResult(nextProps);
  }

  renderBoundingBox(result)
  {
    // {"faces": [{"x": 511, "y": 170, "w": 283, "h": 312}, {"x": 61, "y": 252, "w": 236, "h": 259}]}
    let img = this.refs.sourceImg;
    let cnvs = this.refs.bboxCanvas;
    let outsideWrap = this.refs.outsideWrap;
    if (img === undefined || cnvs === undefined || outsideWrap == undefined)
      return;
    
    outsideWrap.style.width = img.naturalWidth + "px";
    outsideWrap.style.height = img.naturalHeight + "px";
    cnvs.style.position = "absolute";
    cnvs.style.left = img.offsetLeft + "px";
    cnvs.style.top = img.offsetTop + "px";
    cnvs.width = img.naturalWidth;
    cnvs.height = img.naturalHeight;
  
    let ctx = cnvs.getContext("2d");
    result["faces"].forEach((item) => {
      ctx.beginPath();
      ctx.rect(item["x"],item["y"],item["w"],item["h"]);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#00ff00';
      ctx.stroke();
    });
    
  }

  componentDidUpdate(prevProps) {
    if (this.props.jobResult !== prevProps.jobResult) {
      this.renderBoundingBox(this.props.jobResult);
    }
  }

  parseResult(nextProps)
  {
    if (nextProps.jobResult === undefined)
        return;
    
    /*let rpcResponse = nextProps.jobResult;

    // {"faces": [{"x": 511, "y": 170, "w": 283, "h": 312}, {"x": 61, "y": 252, "w": 236, "h": 259}]}
    this.setState((prevState) => ({
        faces: rpcResponse["faces"],
    }));*/
  }

  renderForm() {
    return(
        <React.Fragment>
        <div>
        {
            !this.state.fileUploaded &&
            <React.Fragment>
                <br/>
                <br/>
                <Upload.Dragger name="file" accept=".jpg,.jpeg,.png" beforeUpload={(file)=>{ this.processFile(file); return false; }} >
                    <p className="ant-upload-drag-icon">
                        <Icon type="inbox" />
                    </p>
                    <p className="ant-upload-text">Click for file-chooser dialog or drag a file to this area to be analyzed.</p>
                </Upload.Dragger>
            </React.Fragment>
        }
        <table><tbody>
            <tr>
                <td><b>File:</b></td>
                <td>{this.state.file ? `${this.state.file.name}` : '(not uploaded)'}</td>
            </tr>
        </tbody>
        </table>

        <br/>
        <br/>
        {
            this.state.fileUploaded &&
            <img src={ this.state.fileReader.result } />
        }
        <Button type="primary" onClick={() => {this.submitAction(); }} disabled={!this.state.fileUploaded} >Call Agent API</Button>
        </div>
        </React.Fragment>
        )
  }
  
  renderComplete() {
    return(
        <div>
          <Divider orientation="left">Job Results</Divider>
          <div ref="outsideWrap" class="outsideWrapper">
          <div class="insideWrapper">
            <img ref="sourceImg" class="coveredImage" src={this.state.fileReader.result}/>
            <canvas ref="bboxCanvas" class="coveringCanvas"/>
          </div>
          </div>
        </div>
    );
  }
  render() {
    if (this.isComplete())
        return this.renderComplete();
    else
        return this.renderForm();
  }
}

export default FaceDetectService;
