import React from 'react';
import {FormGroup, InputGroup, HTMLSelect, Switch, Button} from '@blueprintjs/core'
import {Flex, Box} from 'reflexbox'

function hasErrors(fieldsError) {
    return Object.keys(fieldsError).some(field => fieldsError[field]);
}

class MosesOpts extends React.Component {

    constructor(props) {
        super(props);


        this.state = {
            fileUploaded:false,
            fileReader:null,
            fileName:"Choose File.."
        };

        this.handleFileUpload = this.handleFileUpload.bind(this);
        this.handleBtnClick = this.handleBtnClick.bind(this);

    }

    handleFileUpload(event){

        let files = event.target.files;

        if(files.length > 0) {
          let fileReader = new FileReader();

        fileReader.readAsDataURL(files[0]);

        this.setState({
                fileUploaded: true,
                fileReader: fileReader,
                fileName: files[0].name
            });
        }

        event.preventDefault();
    };

    handleBtnClick(evt){
        this.props.handleFileUpload(this.state.fileReader);
        this.props.handleTabChange(this.props.nextTab, "", evt)
    };


    render() {
        return (
            <React.Fragment>
                <Flex auto>
                    <Box m={2}>
                         <FormGroup
                        helperText="No. of Maximum Moses Evalutions"
                        label="Maximum Evals"
                        labelFor="max-evals"
                        labelInfo="*">
                        <InputGroup type="number" min={100}  id="max-evals" placeholder="1000" name="maximumEvals"
                                onChange={(evt) => this.props.handleInputChange(evt)}/>
                    </FormGroup>
                    <br/>
                    <FormGroup
                        helperText="Feature Selection Target Size"
                        label="Fs Selection Size"
                        labelFor="fs-size"
                        labelInfo="*"
                    >
                        <InputGroup name="featureSelectionTargetSize" type="number" id="fs-size" placeholder="4" onChange={(evt) => this.props.handleInputChange(evt)}/>
                    </FormGroup>

                    <FormGroup
                        labelFor="reduct-knob"
                        label="Reduct Knob Building Effort"
                    >
                        <HTMLSelect name="reductKnobBuildingEffort" id="reduct-knob" fill={true} onChange={(evt) =>  this.props.handleInputChange(evt)}>
                            <option>0</option>
                            <option>1</option>
                            <option>2</option>
                            <option>3</option>
                        </HTMLSelect>
                    </FormGroup>

                    <FormGroup
                        labelFor="input-cat"
                        label="Input Category"
                    >
                        <InputGroup name="inputCategory" placeholder="Older Than" id="input-cat" fill={true} onChange={(evt) =>  this.props.handleInputChange(evt)}/>
                    </FormGroup>

                    </Box>

                    <Box m={2}>

                    <FormGroup
                        helperText="Result Count"
                        label="Result Count"
                        labelFor="res-count"
                        labelInfo="*">
                        <InputGroup type="number" name="resultCount" min={100} step={10} max={300} id="res-count" placeholder="100" onChange={(evt) =>  this.props.handleInputChange(evt)}/>
                    </FormGroup>
                    <FormGroup
                        label="Number of Threads"
                        labelFor="num-threads"
                        labelInfo="*">
                        <InputGroup type="number" name="numberOfThreads"  min={2} max={15} id="num-threads" placeholder="8" onChange={(evt) =>  this.props.handleInputChange(evt)}/>
                    </FormGroup>
                    <FormGroup
                        labelFor="fs-sel"
                        label="Feature Selection"
                    >
                        <HTMLSelect name="featureSelectionAlgorithm" id="fs-sel" fill={true}
                                onChange={(evt) =>  this.props.handleInputChange(evt)}>
                            <option  value="simple">simple</option>
                            <option value="inc">inc</option>
                            <option value="smd">smd</option>
                            <option value="hc">hc</option>
                        </HTMLSelect>
                    </FormGroup>
                        <Switch name="enableFeatureSelection" label="Enable Feature Selection" defaultChecked={true} onChange={(evt) =>  this.props.handleInputChange(evt)} />
                        <Switch name="hcWidenSearch"
                                label="Hc Widen Search" defaultChecked={true}
                                onChange={(evt) =>  this.props.handleInputChange(evt)}
                        />
                        <Switch name="hcWidenSearch" label="Balance" defaultChecked={true}
                            onChange={(evt) =>  this.props.handleInputChange(evt)}
                        />
                    </Box>
                </Flex>
                <Flex column>
                    <Box m={2}>
                        <label className="bp3-file-input .modifier">
                          <input type="file" accept="text/csv" onChange={(evt) => this.handleFileUpload(evt)} />
                          <span className="bp3-file-upload-input">{this.state.fileName}</span>
                        </label>
                    </Box>
                    <Box>

                        <Button disabled={!this.state.fileUploaded} icon="arrow-right" text="Next" onClick={(evt) => this.handleBtnClick(evt)}/>

                    </Box>
                </Flex>
            </React.Fragment>


        );
    }
}


export default MosesOpts;
