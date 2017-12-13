import {
  agentUrl,
  marketJobAbi,
  marketJobBytecode,
  simpleMarketJobAbi,
  simpleMarketJobBytecode
} from "./config"
import axios from "axios"
import toBuffer from "blob-to-buffer"
import { encode } from "base64-arraybuffer"
import { resolve } from "path";


export function createSimpleMarketJob(web3, params, callback) {
  // create contract
  const { agent, token, jobDesc } = params
  console.log(agent, token, jobDesc)
  web3.eth.contract(simpleMarketJobAbi).new(
    agent, // agents
    token, //token address
    web3.fromAscii(jobDesc), // job descriptor
    {
      from: agent,
      data: simpleMarketJobBytecode,
      gas: 500000
    },
    callback
  )
}

export function createMarketJob(web3, params, callback) {
  const { agent, token, jobDesc } = params
  web3.eth.contract(marketJobAbi).new(
    [agent], // agents
    [new web3.BigNumber(300000)], //amounts
    [101], // services id
    token, //token address
    agent, // payer address
    jobDesc, // first bytes packet
    {
      from: agent,
      data: marketJobBytecode,
      gas: 1200000
    },
    callback
  )
}

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