import React from 'react'
import Results from './Results'
import DocumentUploader from './DocumentUploader'


const DropZone = ({
  file,
  onPay,
  onDrop,
  onNewJob,
  amount,
  result,
  dropZoneVisible,
  buttonVisible
}) => {
  return (
    <div className="container-fluid">
      {
        !dropZoneVisible && result &&
        <Results
          predictions={result[0].predictions}
          confidences={result[0].confidences}
        />
      }
      {
        buttonVisible &&
        <button
          type="sumbit"
          onClick={onPay}
          className="btn btn-primary"
          disabled={false}
        >
          Pay {amount} COGS
      </button>
      }
      {
        dropZoneVisible &&
        <DocumentUploader
          file={file}
          editable={false}
          handleUpload={onDrop}
          error={''}
        />
      }
      {
        /* result && <button
          type="sumbit"
          onClick={onNewJob}
          className="btn btn-primary"
          disabled={false}
        >
          New Job
        </button> */
      }
    </div>
  )
}

export default DropZone

