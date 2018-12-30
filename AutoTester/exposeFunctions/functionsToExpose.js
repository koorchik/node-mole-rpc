function syncFunctionPrimitiveData(arg1, arg2) {
    return `args data "${arg1} ${arg2}" from syncFunctionPrimitiveData`
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

module.exports = {
    syncFunctionPrimitiveData,
    syncFunctionComplexData,
    asyncFunctionPrimitiveData,
    asyncFunctionComplexData,
    asyncFunctionLongRunning
};