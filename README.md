# node-mole-rpc
Transport agnostic spec compliant JSON RPC client and server

## What can you do with Mole RPC:

### You can use different transport for JSON RPC 

So, your code does not depend on a way you communicate. You can use:
* HTTP
* WebSockets
* MQTT
* TCP
* EventEmitter (communicate within one process in an abstract way) 

### You can use several transports the same time.

For exampe, you want an RPC server that accepts connections from your local workers by TCP and from Web browser by websocket. You can pass as many transports as you wish. 

### You can use bidirectional websocket connections.

For example, you want a JSON RPC server which handles remote calls but the same time you want to send commands in opposite direction the same time using the same connection.

So, you can use connection initiated by any of the sides for the server and the client the same time.

### You can easly create own transport.

Transports have simple API as possible, so it is very easy to add a new transport. 
