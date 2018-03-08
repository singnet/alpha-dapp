import {
  agentUrl
} from "./config"
import axios from "axios"
import toBuffer from "blob-to-buffer"
import { encode } from "base64-arraybuffer"

export const performJob = (blob, type) => 
  new Promise((resolve,reject) => {
    axios({
      url: agentUrl,
      method: "POST",
      contentType: "application/json",
      data: {
        jsonrpc: "2.0",
        method: "perform",
        params: {
          service_node_id: "deadbeef-aaaa-bbbb-cccc-111111111102",
          job_params: [{
            input_type: "attached",
            input_data: {
              images: [blob],
              image_types: [type]
            },
            output_type: "attached"
          }] 
        },
        id:1
      }
    })
      .then(resolve)
      .catch(reject)
  })

export const normalizeFile = (name, file) =>
  new Promise((resolve, reject) => {
    axios({
      url: file,
      method: "get",
      responseType: "blob"
    })
      .then(res => {
        toBuffer(res.data, (err, buffer) => {
          if (err) {
            throw new Error("File is invalid")
          }
          resolve({
            name,
            payload: encode(buffer)
          })
        })
      })
      .catch(reject)
  })