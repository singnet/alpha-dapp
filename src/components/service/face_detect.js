import React from 'react';
import {Layout, Divider, Card, Icon, Spin, Alert, Row, Col, Button, Tag, message, Table, Collapse, Steps, Modal, Upload} from 'antd';

class FaceDetectService extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      file:                   undefined,
      fileUploaded:           false,
      fileReader:             undefined,
    };
  }

  render() {
    return(

        <React.Fragment>
            <Divider orientation="left">Test</Divider>
        </React.Fragment>
    )
  }
}

export default FaceDetectService;
