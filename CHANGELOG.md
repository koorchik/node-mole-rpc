# Change Log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [1.2.0] - 2024-03-22

### Added
- options parameter for `MoleClient.callMethod` to pass `timeout` to it
- options parameter for `MoleClient.runBatch` to pass `timeout` to it
- `maxPacketSize` parameter for `MoleServer` to produce `InternalError` on max response size exceeding
- `index.js` file to export components
