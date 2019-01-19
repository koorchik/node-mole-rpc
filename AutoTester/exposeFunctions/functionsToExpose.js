const lastResultsStore = {};

function syncFunctionPrimitiveData(arg1, arg2) {
    const result = `args data "${arg1} ${arg2}" from syncFunctionPrimitiveData`;

    lastResultsStore.syncFunctionPrimitiveData = result;
    return result;
}

function functionReturnsUndefined() {
    lastResultsStore.functionReturnsUndefined = null;
    return undefined;
}

function syncFunctionPrimitiveDataNoArgs() {
    const result = 'return from syncFunctionPrimitiveDataNoArgs';

    lastResultsStore.syncFunctionPrimitiveDataNoArgs = result;
    return result;
}

function syncFunctionComplexData(...args) {
    const result = {
        from: 'syncFunctionComplexData',
        args
    };

    lastResultsStore.syncFunctionComplexData = result;
    return result;
}

async function asyncFunctionPrimitiveData(arg1, arg2) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const result = `args data "${arg1} ${arg2}" from asyncFunctionPrimitiveData`;

            lastResultsStore.asyncFunctionPrimitiveData = result;
            resolve(result);
        }, 200);
    });
}

async function asyncFunctionComplexData(...args) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const result = {
                from: 'asyncFunctionComplexData',
                args
            };

            lastResultsStore.asyncFunctionComplexData = result;
            resolve(result);
        }, 100);
    });
}

async function asyncFunctionLongRunning(arg1, arg2) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const result = `args data "${arg1} ${arg2}" from asyncFunctionLongRunning`;

            lastResultsStore.asyncFunctionLongRunning = result;
            resolve(result);
        }, 3000);
    });
}

function _privateFunction() {
    return 'Function which starts with "_" will not be exposed';
}

module.exports = {
    functionsToExpose: {
        syncFunctionPrimitiveDataNoArgs,
        syncFunctionPrimitiveData,
        syncFunctionComplexData,
        asyncFunctionPrimitiveData,
        asyncFunctionComplexData,
        asyncFunctionLongRunning,
        functionReturnsUndefined,
        _privateFunction
    },
    lastResultsStore
};
