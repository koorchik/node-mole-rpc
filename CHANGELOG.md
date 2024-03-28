# Change Log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [1.3.0] - 2024-03-28

### Added
- method `shutdown` to `MoleClient` to shutdown internal transport
- method `shutdown` to `MoleServer` to shutdown all registered transports


## [1.2.0] - 2024-03-22

### Added
- options parameter for `MoleClient.callMethod` to pass `timeout` to it
- options parameter for `MoleClient.runBatch` to pass `timeout` to it
- `maxPacketSize` parameter for `MoleServer` to produce `InternalError` on max response size exceeding
- `index.js` file to export components
