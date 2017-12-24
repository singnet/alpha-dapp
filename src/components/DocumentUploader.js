import PropTypes from "prop-types"
import Dropzone from "react-dropzone"
import React, { Component } from "react"
// assets
import icon from "../assets/icons/upload.svg"
import icon1 from "../assets/icons/file-uploaded.svg"
// style

const FILE_TYPES = ["image/jpg", "image/png", "image/jpeg"]

export default class DocumentUploader extends Component {

  constructor(props) {
    super(props)

    this.state = {
      error: false
    }

    this.onDrop = this.onDrop.bind(this)
  }

  onDrop(files) {
    if (files.length === 1) {
      const [file] = files,
        { handleUpload } = this.props

      if (FILE_TYPES.indexOf(file.type) !== -1) {
        this.setState({ error: false, preview: file.preview })
        handleUpload(file)
      } else { this.setState({ error: true }) }
    } else { this.setState({ error: true }) }
  }

  render() {
    const { preview } = this.state
    const { editable } = this.props

    if (preview && !editable) {
      return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", border: "dashed 1px #bbb", padding: 50 }}>
          <img style={{ width: 100, height: 100 }} src={icon1} alt="upload icon" />
        </div>
      )
    }

    return (
      <div style={styles.container}>
        <Dropzone
          onDrop={this.onDrop}
          style={{ marginTop: 0 }}
          className="dropzone upload-id-form justify-content-center dz-clickable"
        >
          <div className="dz-message needsclick">
            <img src={icon} className="upload-img" alt="uploaded" />
            <p>
              Drag and drop your image
          or <span className="blue">browse</span> from your file system
          </p>
          </div>
        </Dropzone>
        {this.state.error && <span style={styles.error}>Invalid file</span>}
      </div>
    )
  }
}

DocumentUploader.propTypes = {
  editable: PropTypes.bool,
  handleUpload: PropTypes.func.isRequired,
  file: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]).isRequired,
}

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    flexDirection: "column"
  },
  box: {
    display: "flex",
    border: "dashed 2px",
    padding: 10, margin: 10,
    flex: 1, flexDirection: "column"
  },
  uploadedFile: {
    display: "flex",
    border: "dashed 1px #bbb",
    padding: 60, margin: 30,
    alignItems: "center", flexDirection: "column"
  },
  error: {
    marginTop: 20,
    color: "#d9534f",
  }
}