import React from 'react';
import './mozi_service.css';
import {Tabs, Tab} from '@blueprintjs/core'
import CrossvalOpts from './crossval_opts'
import MosesOpts from './moses_opts'

class MoziService extends React.Component {
    constructor(props) {
        super(props);
        this.tabRef = React.createRef();
        this.state = {
            tabId: "mos",
            mosesOpts: {
                maximumEvals: 1000,
                featureSelectionTargetSize: 4,
                reductKnobBuildingEffort: 0,
                inputCategory: '',
                resultCount: 100,
                numberOfThreads: 8,
                featureSelection: '',
                enableFeatureSelection: true,
                hcWidenSearch: true,
                balance: true

            },

            crossValOptions: {
                folds: 1,
                randomSeed: 5,
                testSize: 0.3
            },
            dataset: undefined,
            methodName: "handle"
        };

        this.handleTabChange = this.handleTabChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleFileUpload = this.handleFileUpload.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);


    }

    handleTabChange(newTabId, prevTabId, event){
        this.setState({
            tabId: newTabId
        });

        event.preventDefault();
    };

    handleFileUpload(reader){
        this.setState({
            dataset:reader.result.split(",")[1]
        });
    };

    handleInputChange(event){
        const target = event.target;
        const value = target.type === 'Switch' ? target.checked : target.value;
        const name = target.name;

        this.setState ({
            [name] : value
        });

        event.preventDefault();
    };

    handleSubmit(event){
        this.props.showModalCallback(this.props.callModal);
        this.props.callApiCallback(this.state.methodName, {
            file: this.state.dataset,
            options : {
                mosesOptions: this.state.mosesOpts,
                crossValidationOptions: this.state.crossValOptions
            }
        });

        event.preventDefault();
    };

    isJobDone(){
        console.log(this.props.jobResult);
        return this.props.jobResult !== undefined;
    };

    render() {

        if(!this.isJobDone()){
           return (
            <Tabs renderActiveTabPanelOnly={false} ref={this.tabRef} vertical={false} id="mozi_service" selectedTabId={this.state.tabId}>
                <Tab id="mos" title="Moses Options"
                     panel={<Moses_opts nextTab="cro" handleFileUpload={this.handleFileUpload} handleTabChange={this.handleTabChange} handleInputChange={this.handleInputChange} />}/>
                <Tab id="cro" title="Cross Options"
                     panel={<Crossval_opts opts={this.state.crossValOptions} prevTab="mos" handleTabChange={this.handleTabChange} handleInputChange={this.handleInputChange} handleSubmit={this.handleSubmit}/>}/>
            </Tabs>
            );
        }
        else{
            return (
                <div>
                You can poll the result from this <a href={this.props.jobResult}>link</a>.
            </div>
            );
        }

    }
}

export default MoziService;