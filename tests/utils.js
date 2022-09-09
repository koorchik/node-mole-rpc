function sleep(delay) {
    return new Promise(resolve => setTimeout(resolve, delay));
}

function assertIsTrue(value, errorMessage = 'value should equal true') {
    if (value !== true) {
        throw new Error(`Assert failed: ${errorMessage}`);
    }
}

module.exports = {
    sleep,
    assertIsTrue
};