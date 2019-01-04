function syncFunctionPrimitiveData(arg1, arg2) {
    return `args data "${arg1} ${arg2}" from syncFunctionPrimitiveData`
}

function syncFunctionPrimitiveDataNoArgs() {
    return 'return from syncFunctionPrimitiveDataNoArgs';
}

function syncFunctionComplexData(...args) {
    return {
        from: 'syncFunctionComplexData',
        args
    }
}

async function asyncFunctionPrimitiveData(arg1, arg2) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(`args data "${arg1} ${arg2}" from asyncFunctionPrimitiveData`);
        }, 500);
    });
}

async function asyncFunctionComplexData(...args) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({
                from: 'asyncFunctionComplexData',
                args
            });
        }, 500);
    });
}

async function asyncFunctionLongRunning(arg1, arg2) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(`args data "${arg1} ${arg2}" from asyncFunctionLongRunning`);
        }, 3000);
    });
}

function _privateFunction() {
    return 'Function which starts with "_" will not be exposed';
}


module.exports = {
    syncFunctionPrimitiveDataNoArgs,
    syncFunctionPrimitiveData,
    syncFunctionComplexData,
    asyncFunctionPrimitiveData,
    asyncFunctionComplexData,
    asyncFunctionLongRunning,
    _privateFunction
};