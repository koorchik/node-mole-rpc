# mole-rpc

Tiny transport agnostic JSON-RPC 2.0 client and server which can work both in NodeJs, Browser, Electron etc

[![npm version](https://badge.fury.io/js/mole-rpc.svg)](https://badge.fury.io/js/mole-rpc)
[![Build Status](https://travis-ci.org/koorchik/node-mole-rpc.svg?branch=master)](https://travis-ci.org/koorchik/node-mole-rpc)
[![Known Vulnerabilities](https://snyk.io/test/github/koorchik/node-mole-rpc/badge.svg?targetFile=package.json)](https://snyk.io/test/github/koorchik/node-mole-rpc?targetFile=package.json)

![Mole RPC](docs/images/mole-logo.jpg)

## Table of contents

-   [Features](#features)
-   [Basic usage](#basic-usage)
    -   [Client (with Proxy support)](#client-with-proxy-support)
    -   [Client (without Proxy support)](#client-without-proxy-support)
    -   [Server (expose instance)](#server-expose-instance)
    -   [Server (expose functions)](#server-expose-functions)
-   [Advanced usage](#advanced-usage)
-   [Use cases](#use-cases)

## Features

-   **Transport agnostic** (works with HTTP, MQTT, Websocket, Browser post message etc). Here is the list of supported transports - https://www.npmjs.com/search?q=keywords:mole-transport
-   **Zero dependencies**. Mole-RPC itself has zero dependencies.
-   **Works both in NodeJs and in a browser** (both client anf server). For example, you can use it to send request to webworker in your browser.
-   **Bidirectional websocket connections support** via WS tranport. For example, you want a JSON RPC server which handles remote calls but the same time you want to send commands in opposite direction using the same connection.So, you can use connection initiated by any of the sides for the server and the client the same time.
-   **Server can use several transports the same time**. For example, you want an RPC server that accepts connections from your local workers by TCP and from Web browser by websocket. You can pass as many transports as you wish.
-   **Lightweight**
-   **Modern API**. Totally based on Promises and supports Proxified interface
-   **Supports all features of JSON-RPC 2.0** (batches, notifications etc)
-   **Easy to create own transport**. Transports have simple API as possible, so it is very easy to add a new transport.

## Motivation

Yet another JSON-RPC library? Why do we need it? The reality, that there is no transport agnostic JSON-RPC library for nodejs. One of our projects required JSON RPC over MQTT and unfortunetely we were not able to find a good solution. 

**Key issues with existing libraries:**

1. No multiple transports support.
2. Not possible to add a new transport.
3. For some possible, but you need to duplicate almost all protocol logic in every transport.
4. Bidirectional websocket connections are not supported.
5. Leaking transport abtractions (like topic name in MQTT needs to be the same as method name).
6. Huge codebase with tons of classes (JSON RPC should not look like this)
7. No promise based API.
8. Everything is bundled to one large package with high level of coupling.
9. Bugs, not tests.
10. etc 

Mole-RPC solves all of the issues described above.

## Basic usage

This module is transport agnostics. So, [you can choose any transport you need](https://www.npmjs.com/search?q=mole-rpc-transport)

### Simple example with websocket transport (WebSocketServer for server)

**Server**
```js
const MoleServer = require('mole-rpc/MoleServer');
const TransportServerWSS = require('mole-rpc-transport-ws/TransportServerWSS');
const WebSocket = require('ws');
const WSS_PORT = 12345;

function sum(a, b) { return a + b }
function multiply(a, b) { return a * b } 

async function main() {
  const server = new MoleServer({ 
    transports: prepareTransports() 
  });

  server.expose({ sum, multiply });
  await server.run();
}

function prepareTransports() {
  return [
    new TransportServerWSS({
      wss: new WebSocket.Server({ 
        port: WSS_PORT 
      })
    })
  ];
}

main().catch(console.error);
```

**Client (with Proxy support)**

```js
const MoleClient = require('mole-rpc/MoleClientProxified');
const X = require('mole-rpc/X');
const TransportClientWS = require('mole-rpc-transport-ws/TransportClientWS');


const WebSocket = require('ws');
const WSS_PORT = 12345;

async function main() {
  const client = new MoleClient({
    requestTimeout: 1000,
    transport: prepareTransport()
  });

  try {
      console.log( await client.sum(2, 3) );
  } catch (error) {
    if (error instanceof X.ExecutionError) {
      console.log('ERROR', error.data);
    } else {
      throw error;
    }
  }
}

function prepareTransport() {
  return new TransportClientWS({
    wsBuilder: () => new WebSocket(`ws://localhost:${WSS_PORT}`)
  });
}

main().then(console.log, console.error);
```

## API examples

### Proxified client

If you use modern JavaScript you can use proxified client.
It allows you to do remote calls very similar to local calls

```javascript
import MoleClientProxified from 'mole-rpc/MoleClientProxified';

// choose any transports here
// https://www.npmjs.com/search?q=keywords:mole-transport
const transport = new TransportClient();
const calculator = new MoleClientProxified({ transport });

const result1 = await calculator.sum(1, 3);
const result2 = await calculator.asyncSum(2, 3);

// Send JSON RPC notification (fire and forget)
// server will send no response
await calculator.notify.sum(3, 2);
```

### Client (without Proxy support)

```javascript
import MoleClient from 'mole-rpc/MoleClient';

// choose any transports here
// https://www.npmjs.com/search?q=keywords:mole-transport
const transport = new TransportClient();
const client = new MoleClient({ transport });

const result1 = await client.callMethod('sum', [1, 3]);
const result2 = await client.callMethod('sum', [2, 3]);

// Send JSON RPC notification (fire and forget)
// server will send no response
await client.notify('sum', [2, 3]);
```

### Server (expose instance)

You can expose instance directly.
Methods which start with underscore will not be exposed.
Built-in methods of Object base class will not be exposed.

```javascript
import MoleServer from 'mole-rpc/MoleServer';

class Calculator {
    sum(a, b) {
        return a + b;
    }

    asyncSum(a, b) {
        return new Promise((resolve, reject) => {
            resolve(this.sum(a, b));
        });
    }

    _privateMethod() {
        // will not be exposed
    }
}

const calculator = new Calculator();

// choose any transports here
// https://www.npmjs.com/search?q=keywords:mole-transport
const transports = [new TransportServer()];

const server = new MoleServer({ transports: [] });
server.expose(calculator);

await server.run();
```

### Server (expose functions)

You can expose functions directly

```javascript
import MoleServer from "mole-rpc/MoleServer";

function sum(a, b) {
   return a+b;
}

function asyncSum(a, b) {
   return new Promise((resolve, reject) {
      resolve( sum(a, b) );
   });
}

// choose any transports here
// https://www.npmjs.com/search?q=keywords:mole-transport
const transports = [ new TransportServer() ];

const server = new MoleServer({ transports });
server.expose({
   sum,
   asyncSum
});

await server.run();
```

## Advanced usage

```javascript


// Proxified client: explicit call
await calculator.callMethod.sum(1, 2); // the same as "calculator.sum(1, 2)"
// Can be usefull if your server method is a reserverd name.
// For example to make a call to remote "notify" method.
await proxifiedClient.callMethod.notify("Hello");

// Proxified client: run request in parallel
const promises = [
   calculator.sum(1, 2);
   calculator.notify.sum(1, 2);
];

const results = await Promise.all(promises);

// Simple client: run in parallel
const promises = [
   client.callMethod('sum', [1, 2]);
   client.notify('sum', [1, 2]);
];

const results = await Promise.all(promises);

// Simple client: run batch
const results = await client.runBatch([
   // [methodName, params, mode]
   ['sum', [1, 3]],
   ['sum', [2, 5], 'notify'],
   ['sum', [7, 9], 'callMethod'], // "callMethod" is optional
]);


// Result structure
[
   {success: true, result: 123},
   null, // no response for notification
   {success: false, error: errorObject}
];

```

## Use cases (TODO)

### Case 1: Easy way to communicate with web-workers in your browser

### Case 2: Bypass firewall

### Case 3: Microservices via message broker

### Case 4: Lightweight Inter process communication

### Case 5: Multi transport mode (HTTP, HTTPS, WS the same time, for example)

## How to create own transport?
