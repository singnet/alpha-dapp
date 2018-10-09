import { request } from "https";

const defaultHeaders = {
  "Content-Type": "application/grpc-web+proto",
  "Access-Control-Allow-Origin": "*",
  "x-grpc-web": "1"
};


export class GrpcClient {
  constructor({ endpoint, headers, root }) {
    this.endpoint = endpoint;
    this.root     = root;
    this.headers  = Object.assign({}, defaultHeaders, headers);

    this.request  = this.request.bind(this);
  }

  /**
 * @param {*} method 
 * @param {*} requestData 
 * @param {*} callback 
 */
  request(method, requestData, callback) {
    //const RequestType = this.root.lookupType(method.requestType);
    //const ResponseType = this.root.lookupType(method.responseType);

    // perform the request using an HTTP request or a WebSocket for example
    fetch(this.endpoint + "/" + method.parent.name + "/" + method.name, {
      method: "POST",
      headers: this.headers,

      body: requestData
     // body: JSON.stringify(RequestType.decode(requestData)),
    }).then((res) => {
      const { status, bodyUsed } = res;

      if (httpStatusToCode(status) === Code.OK && bodyUsed)
        callback(null, res);
      else
        throw res;

    }).catch(err => callback(err, null))
  }
}


function frameRequest(bytes) {
  const frame = new ArrayBuffer(bytes.byteLength + 5)
  new DataView(frame, 1, 4).setUint32(0, bytes.length, false)
  new Uint8Array(frame, 5).set(bytes)
  return new Uint8Array(frame)
}

/**
 * Grpc utils
 */
export const Code = {
  OK: 0,
  Canceled: 1,
  Unknown: 2,
  InvalidArgument: 3,
  DeadlineExceeded: 4,
  NotFound: 5,
  AlreadyExists: 6,
  PermissionDenied: 7,
  ResourceExhausted: 8,
  FailedPrecondition: 9,
  Aborted: 10,
  OutOfRange: 11,
  Unimplemented: 12,
  Internal: 13,
  Unavailable: 14,
  DataLoss: 15,
  Unauthenticated: 16
};

export function httpStatusToCode(httpStatus) {
  switch (httpStatus) {
    case 0: // Connectivity issues
      return Code.Internal;
    case 200:
      return Code.OK;
    case 400:
      return Code.InvalidArgument;
    case 401:
      return Code.Unauthenticated;
    case 403:
      return Code.PermissionDenied;
    case 404:
      return Code.NotFound;
    case 409:
      return Code.Aborted;
    case 412:
      return Code.FailedPrecondition;
    case 429:
      return Code.ResourceExhausted;
    case 499:
      return Code.Canceled;
    case 500:
      return Code.Unknown;
    case 501:
      return Code.Unimplemented;
    case 503:
      return Code.Unavailable;
    case 504:
      return Code.DeadlineExceeded;
    default:
      return Code.Unknown;
  }
}
