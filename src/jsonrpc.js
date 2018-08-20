const defaultConfig = {
  debug: false,
};

const defaultHeaders = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
};

export class JsonRpcClient {
  constructor({ endpoint = '/rpc', headers = {}, config }) {
    this.lastId = 0;
    this.endpoint = endpoint;
    this.config = Object.assign({}, defaultConfig, config);
    this.headers = Object.assign({}, defaultHeaders, headers);
  }

  request(method, params, headers) {
    const id = this.lastId++;

    const req = {
      method: 'POST',
      headers: Object.assign({}, this.headers, headers),
      body: JSON.stringify({
        jsonrpc: '2.0',
        id,
        method,
        params: params,
      }),
    };

    if (this.config.debug === true) {
      // eslint-disable-next-line no-console
      console.log('Executing request', this.lastId, 'to', this.endpoint, ':', req);
    }

    return fetch(this.endpoint, req)
      .then(res => checkStatus(res))
      .then(res => parseJSON(res))
      .then(res => checkError(res, req, this.config.debug))
      .then(res => logResponse(res, this.config.debug));
  }
}

function parseJSON(response) {
  return response.json();
}

function checkStatus(response) {
  // we assume 400 as valid code here because it's the default return code when sth has gone wrong,
  // but then we have an error within the response, no?
  if (response.status >= 200 && response.status <= 400) {
    return response;
  }

  const error = new Error(response.statusText);
  error.response = response;
  throw error;
}

function checkError(data, req, debug = false) {
  if (data.error) {
    /* eslint-disable no-console */
    if (debug === true && console && console.error) {
      console.error(`Request ID ${data.id} failed: ${data.error}`);
    } else if (debug === true && console && console.log) {
      console.log(`Request ID ${data.id} failed: ${data.error}`);
    }
    /* eslint-enable no-console */

    const error = new RpcError(data.error, req, data);
    error.response = data;

    throw error;
  }

  return data;
}

function logResponse(response, debug = false) {
  if (debug === true) {
    /* eslint-disable no-console */
    console.log('Got response for id', response.id, 'with response', response.result);
    console.log('Response message for request', response.id, ':', response.result.message);
    /* eslint-enable no-console */
  }

  return response.result;
}

/**
 * RpcError is a simple error wrapper holding the request and the response.
 */
export class RpcError extends Error {
  constructor(message, request, response) {
    super(message);

    this.name = 'RpcError';
    this.message = (message || '');
    this.request = request;
    this.response = response;
  }

  toString() {
    return this.message;
  }

  getRequest() {
    return this.request;
  }

  getResponse() {
    return this.response;
  }
}