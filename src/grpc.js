const { ChunkParser, ChunkType } = require("grpc-web-client/dist/ChunkParser") 

export function grpcJSONRequest(host, packageName, serviceName, methodName, requestHeaders, requestObject) {
  const service = [ packageName, serviceName ].filter(Boolean).join(".")
  return window.fetch(`${host}/${service}/${methodName}`, {
    "method": "POST",
    "headers": Object.assign(
      {},
      {
        "content-type": "application/grpc-web+json",
        "x-grpc-web": "1"
      },
      requestHeaders
    ),
    "body": frameRequest(Buffer.from(JSON.stringify(requestObject)))
  })
    .then(response => response.arrayBuffer())
    .then(buffer => {
      return grpcJSONResponseToString(buffer)
    })
    .catch(console.error)
}

export function rpcImpl(host, packageName, serviceName, methodName, requestHeaders) {
  return (method, requestObject, callback) => {
    const service = [ packageName, serviceName ].filter(Boolean).join(".")
    window.fetch(`${host}/${service}/${methodName}`, {
      "method": "POST",
      "headers": Object.assign(
        {},
        {
          "content-type": "application/grpc-web+proto",
          "x-grpc-web": "1"
        },
        requestHeaders
      ),
      "body": frameRequest(requestObject)
    })
      .then(response => response.arrayBuffer())
      .then(buffer => {
        const chunk = parseChunk(buffer)
        callback(null, chunk && chunk.data ? new Uint8Array(chunk.data) : null)
      })
      .catch(err => { callback(err) })
  }
}

function grpcJSONResponseToString(arrayBuffer) {
  const responseLength = new DataView(arrayBuffer).getUint8(4)
  const unframedResponse = new Uint8Array(arrayBuffer.slice(5, responseLength+5))
  return String.fromCharCode(...unframedResponse)
}

function frameRequest(bytes) {
  const frame = new ArrayBuffer(bytes.byteLength + 5)
  new DataView(frame, 1, 4).setUint32(0, bytes.length, false)
  new Uint8Array(frame, 5).set(bytes)
  return new Uint8Array(frame)
}

function parseChunk(buffer) {
  return new ChunkParser()
    .parse(new Uint8Array(buffer))
    .find(chunk => chunk.chunkType === ChunkType.MESSAGE)
}

export function grpcRequest(serviceObject, methodName, requestObject) {
  methodName = methodName.charAt(0).toLowerCase() + methodName.substr(1)
  if (!serviceObject[methodName]) throw new Error(`Service does not have method ${methodName}. ${serviceObject}`)

  return serviceObject[methodName](requestObject)
}
