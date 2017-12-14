import React from 'react'
import JSONTree from 'react-json-tree'
import DocumentUploader from './DocumentUploader'


const DropZone = ({ file, onPay, onDrop, onNewJob, amount, result, dropZoneVisible, buttonVisible }) => {
  return (
    <div>
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
          fetching={false}
          editable={true}
          handleUpload={onDrop}
          error={''}
        />
      }
      {
        result && <JSONTree data={result[0]} />
      }
      {
        result && <button
          type="sumbit"
          onClick={onNewJob}
          className="btn btn-primary"
          disabled={false}
        >
          New Job
    </button>
      }
    </div>
  )
}

export default DropZone

