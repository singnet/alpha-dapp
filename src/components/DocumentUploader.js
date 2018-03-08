import PropTypes from 'prop-types';
import Dropzone from 'react-dropzone';
import React, { Component } from 'react';
import Card from 'antd/lib/card';
import Icon from 'antd/lib/icon';
import Row from 'antd/lib/row';
import Alert from 'antd/lib/alert';
import Divider from 'antd/lib/divider';

const FILE_TYPES = ['image/jpg', 'image/png', 'image/jpeg'];

export default class DocumentUploader extends Component {
	constructor(props) {
		super(props);
		this.state = {
			error: false,
		};
		this.onDrop = this.onDrop.bind(this);
	}

	onDrop(files) {
		if (files.length === 1) {
			const [file] = files,
				{ handleUpload } = this.props;

			if (FILE_TYPES.indexOf(file.type) !== -1) {
				this.setState({ error: false, preview: file.preview });
				handleUpload(file);
			} else {
				this.setState({ error: true });
			}
		} else {
			this.setState({ error: true });
		}
	}

	render() {
		const { preview } = this.state;
		const { editable } = this.props;
		return (
			<Row>
				{/*Phase 2*/}
				{preview &&
					!editable && (
						<Alert
							message="Successful image upload"
							type="success"
							showIcon
							style={{ marginBottom: '20px' }}
						/>
					)}
				{/*Phase 1*/}
				{/* REFACTOR remove dropzone and use antd uploader */}
				<Dropzone onDrop={this.onDrop} style={{ marginTop: '0px' }}>
					<Card
						style={{
							padding: '0px 20px',
							width: '100%',
							border: '1px dashed #d9d9d9',
							borderRadius: '4px',
							background: '#fafafa',
							textAlign: 'center',
						}}
					>
						<Icon type="inbox" />
						<Divider />Drag and drop your image or browse from your file system.
					</Card>
				</Dropzone>
				{/*Show image upload error*/}
				{this.state.error && (
					<Alert
						message="Invalid file"
						type="error"
						style={{ marginTop: '20px' }}
					/>
				)}
			</Row>
		);
	}
}

DocumentUploader.propTypes = {
	editable: PropTypes.bool,
	handleUpload: PropTypes.func.isRequired,
	file: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]).isRequired,
};
