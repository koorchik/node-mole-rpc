IDEAS FOR FUTURE RELEASES
-------------------------

```javascript
// PROXY: Run in batch mode (everything in one JSON RPC Request)
const batch = client.newProxyBatch();

const promises = [
   batch.hello('John Doe');
   batch.hello('John Doe');
]; 

batch.runBatch(); // promises will never be resolved if you will not run batch 

const results = await Promise.all(promises);

// NOT PROXY: Run in batch mode (everything in one JSON RPC Request)
const batch = client.newBatch();

const promises = [
   batch.callMethod('hello', ['John Doe']);
   batch.notify('hello', ['John Doe']);
]; 

batch.runBatch(); // promises will never be resolved if you will not run batch 

const results = await Promise.all(promises);
```