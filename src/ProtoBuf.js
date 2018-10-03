import protobuf from "protobufjs";
import { Code } from "./util";

const defaultHeaders = {};

/**
 * @class Protobuf
 * @param jsonDescriptor
 */
export default class ProtoBuf {
  constructor({jsonDescriptor, endpoint, config}) {
    this.json     = jsonDescriptor;
    this.root     = protobuf.Root.fromJSON(jsonDescriptor);

    this.endpoint = endpoint;

    this.config   = Object.assign({}, defaultHeaders, config);
    this.services = {};

    this.rpcImpl              = this.rpcImpl.bind(this);
    this.generateStubs        = this.generateStubs.bind(this)
    this.isValidMessage       = this.isValidMessage.bind(this);
    this.findServiceByMethod  = this.findServiceByMethod.bind(this);
  }

  findServiceByMethod(methodName) {
    let found = undefined;
    Object.entries(this.services).forEach(([serviceName, service]) => {
        const methods = Object.keys(service.methods);
        if (methods.indexOf(methodName) !== -1) {
          found = serviceName;
        } 
    })
    return found;
  }

  isValidMessage(message, payload) {
    if (message.verify(payload))
      return false;
    else 
      return true;
  }

  generateStubs() {
    traverseServices(this.root, service => {
      const CurrentClass = this.root.lookup(service.name);
      const currentClass = CurrentClass.create(this.rpcImpl, false, false);

      Object.entries(service.methods)
        .forEach(([methodName, { requestType, responseType }]) => {
          const RequestType   = this.root.lookupType(requestType);
          const ResponseType   = this.root.lookupType(responseType);
          const call = (params) => currentClass[methodName](params);
          Object.assign(this.services, { [service.name]: { methods: { [methodName]: { call, RequestType, ResponseType } } } });
        });
    });
  }

  /**
 * NOTICE: Fake server response
 * TODO: Remove it before merge
 * @param {*} method 
 * @param {*} requestData 
 * @param {*} callback 
 */
  rpcImpl(method, requestData, callback) {
    const RequestType   = this.root.lookupType(method.requestType);
    const ResponseType  = this.root.lookupType(method.responseType);
    //Check request message
    if (!this.isValidMessage(RequestType,requestData))
      throw Error("Request not verified")
    // perform the request using an HTTP request or a WebSocket for example
    fetch(this.endpoint, {
      method: "POST",
      headers: this.config,
      body: requestData,
    }).then((res) => {
      const { status, bodyUsed } = res;
      if (bodyUsed && ResponseType.verify(res.body))
        throw Error("RequestType not verified")

      if (status === Code.OK) {
        //Check request message
        if (!this.isValidMessage(ResponseType, res))
          throw Error("Response not verified")
        callback(null, res);
      }
      else 
        throw res

    }).catch(err => callback(err, null))
  }
}


function traverseServices(current, fn) {
  if (current instanceof protobuf.Service) // and/or protobuf.Enum, protobuf.Service etc.
    fn(current);
  if (current.nestedArray)
    current.nestedArray.forEach(function (nested) {
      traverseServices(nested, fn);
    });
}

function traverseTypes(current, fn) {
  if (current instanceof protobuf.Type) // and/or protobuf.Enum, protobuf.Service etc.
    fn(current);
  if (current.nestedArray)
    current.nestedArray.forEach(function (nested) {
      traverseTypes(nested, fn);
    });
}
 