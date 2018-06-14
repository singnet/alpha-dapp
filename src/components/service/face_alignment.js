import React from 'react';
import {Layout, Divider, Card, Icon, Spin, Alert, Row, Col, Button, Tag, message, Table, Collapse, Steps, Modal, Upload} from 'antd';
import { debounce } from 'underscore';

class FaceAlignmentService extends React.Component {

  constructor(props) {
    super(props);

    this.submitAction = this.submitAction.bind(this);
    this.updateValid = this.updateValid.bind(this);
    this.updateValid = debounce(this.updateValid, 500);

    this.state = {
        fileUploaded: false,
        file: undefined,
        fileReader: undefined,
        methodName: "align_face",
        facesString: '[{"x":10,"y":10,"w":100,"h":100}]',
        inputValid: true,
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

  updateValid() {
    let inputValid = true;
    
    try {
        let faces = JSON.parse(this.state.facesString);
        faces.forEach((item) => {
          let expectedKeys = ['x', 'y', 'w', 'h'];
          expectedKeys.forEach((k) => {
            if (!(k in item)) inputValid = false;
          });
        });
    } catch(e) {
        inputValid = false;
    }
    
    if (this.state.methodName.length == 0)
        inputValid = false;

    if (!this.state.fileUploaded)
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
    this.updateValid();
  }

  submitAction() {
    this.props.showModalCallback(this.props.callModal);
    this.props.callApiCallback(this.state.methodName, {
        image: this.state.fileReader.result.split(',')[1],
        source_bboxes: JSON.parse(this.state.facesString),
    });
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
        <div>
        <label>
          Faces JSON (you can get this from face detect):
          <textarea onChange={ this.handleChange.bind(this, 'facesString')} value={this.state.facesString} />
        </label>
        </div>
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
        <Button type="primary" onClick={() => {this.submitAction(); }} disabled={!this.state.inputValid} >Call Agent API</Button>
        </div>
        </React.Fragment>
        )
  }
  
  renderComplete() {
    var alignedFaceImgList = this.props.jobResult['aligned_faces'].map((item) => {
      return <img src={'data:image/png;base64,' + item}/>;
    });
    return(
      <div>
        {alignedFaceImgList}
      </div>
    );
  }

  renderDescription() {
    return(
      <div>
          <p>
          A service that takes an image and a bounding box for where a face exists and returns a aligned face image.
          This aligned image has the face rotated and scaled to a canonical upright orientation
          and scaled to a 150x150 pixels.
          
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

export default FaceAlignmentService;
