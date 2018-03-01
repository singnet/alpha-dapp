import React from 'react';
import Results from './Results';
import DocumentUploader from './DocumentUploader';
import Row from 'antd/lib/row';
import Button from 'antd/lib/button';

/* QUESTION
 * shouldn't this only handle file upload and not all the buying steps?
 */
const DropZone = ({
	file,
	onPay,
	onDrop,
	onNewJob,
	amount,
	result,
	dropZoneVisible,
	buttonVisible,
}) => {
	return (
		<Row>
			{!dropZoneVisible &&
				result && (
					<Results
						predictions={result[0].predictions}
						confidences={result[0].confidences}
					/>
				)}
			{buttonVisible && (
				<Button
					type="primary"
					size="large"
					onClick={onPay}
					style={{ width: '100%', marginBottom: '20px' }}
				>
					Pay {amount} COGS to elaborate image
				</Button>
			)}
			{dropZoneVisible && (
				<DocumentUploader
					file={file}
					editable={false}
					handleUpload={onDrop}
					error={''}
				/>
			)}
			{/* result && <button
          type="sumbit"
          onClick={onNewJob}
          className="btn btn-primary"
          disabled={false}
        >
          New Job
        </button> */}
		</Row>
	);
};

export default DropZone;
