import React from 'react';
import {Layout, Divider, Card, Icon, Spin, Alert, Row, Col, Button, Tag, message, Table, Collapse, Steps, Modal, Upload} from 'antd';
import styles from './face_detect.css.js';

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
    else {
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
    this.props.callApiCallback(this.state.methodName, {
        image: this.state.fileReader.result.split(',')[1],
    });
  }

  renderBoundingBox(result) {
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
        <br/>
        <br/>
        <Button type="primary" onClick={() => {this.submitAction(); }} disabled={!this.state.fileUploaded} >Call Agent API</Button>
        </div>
        </React.Fragment>
        )
  }
  
  renderComplete() {
    let jsonResult = JSON.stringify(this.props.jobResult);
    return(
      <div>
        <div>
          <textarea rows="4" cols="50" readOnly value={jsonResult}/>
        </div>
        <div ref="outsideWrap" style={styles.outsideWrapper}>
          <div style={styles.insideWrapper}>
            <img ref="sourceImg" style={styles.coveredImage} src={this.state.fileReader.result}/>
            <canvas ref="bboxCanvas" style={styles.coveringCanvas}/>
          </div>
        </div>
      </div>
    );
  }
  
  renderDescription() {
    return(
      <div>
          <p>
          A service that detects the location of human faces and returns a 2d bounding box.
          
          This is part of the <a href="https://github.com/singnet/face-services">face-services</a> suite of example
          SingularityNET services.
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

export default FaceDetectService;
