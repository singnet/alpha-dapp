import React from 'react';
import {FormGroup, Button, InputGroup,Intent} from '@blueprintjs/core'
import {Flex, Box} from 'reflexbox'


class CrossvalOpts extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        return (
            <React.Fragment>
                <Flex auto>
                    <Box m={2}>
                        <FormGroup
                            helperText="No. of Folds"
                            label="Folds"
                            labelFor="folds"
                            labelInfo="*">
                            <InputGroup type="number" min={1} id="folds" placeholder="1"/>

                        </FormGroup>
                        <FormGroup
                            helperText="No. of Rand Seeds"
                            label="Random Seeds"
                            labelFor="seeds"
                            labelInfo="*">
                            <InputGroup type="number" min={1} id="seeds" placeholder="5"/>
                        </FormGroup>

                        <FormGroup
                            helperText="% of Test Size"
                            label="Test Size"
                            labelFor="test-size"
                            labelInfo="*">
                            <InputGroup type="number" min={0.1} max={0.9} step={0.1} id="test-size" placeholder="0.3"/>

                        </FormGroup>

                    </Box>

                </Flex>
                <Flex>
                        <Box m={2}>
                            <Button intent={Intent.PRIMARY} text="Back" icon="arrow-left" onClick={(evt) => this.props.handleTabChange(this.props.prevTab, "", evt)}/>
                        </Box>

                         <Box m={2}>
                              <Button intent={Intent.SUCCESS} text="Submit" onClick={(evt) => this.props.handleSubmit(evt)}/>
                         </Box>
                </Flex>
            </React.Fragment>
        )
    }
}

export default CrossvalOpts;