# mole-rpc
Tiny transport agnostic JSON-RPC 2.0 client and server which can work both in NodeJs, Browser, Electron etc

## Table of contents

- [Features](#features)
- [Usage](#installation)
- [Use cases](#use-cases)
- [Usage](#usage)
  - [Client](#client)
     - [Interface description](#client-interface-description)
     - [Browser usage](#clientbrowser)
     - [Notifications](#notifications)
     - [Batches](#batches)
     - [Callback syntactic sugar](#client-callback-syntactic-sugar)
     - [Events](#client-events)
  - [Server](#server)
     - [Interface description](#server-interface-description)
     - [Many interfaces at the same time](#many-interfaces-at-the-same-time)
     - [Using the server as a relay](#using-the-server-as-a-relay)
- [FAQ](#faq)
- [Contributing](#contributing)


## Use cases

### Case 1: Easy way to communicate with web-workers in your browser

### Case 2: Bypass firewall

### Case 3: Microservices via message broker

### Case 4: Lightweight Inter process communication

### You can use different transport for JSON RPC 

So, your code does not depend on a way you communicate. You can use:
* HTTP
* WebSockets
* MQTT
* TCP
* EventEmitter (communicate within one process in an abstract way)
* Named pipe (FIFOs) 

### You can use several transports the same time.

For exampe, you want an RPC server that accepts connections from your local workers by TCP and from Web browser by websocket. You can pass as many transports as you wish. 

### You can use bidirectional websocket connections.

For example, you want a JSON RPC server which handles remote calls but the same time you want to send commands in opposite direction the same time using the same connection.

So, you can use connection initiated by any of the sides for the server and the client the same time.

### You can easly create own transport.

Transports have simple API as possible, so it is very easy to add a new transport. 
