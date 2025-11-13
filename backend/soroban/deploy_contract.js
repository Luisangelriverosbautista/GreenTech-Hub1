const SorobanRpc = require('soroban-client');
const { getConfig } = require('./config');

async function deployContract(wasmPath) {
    const { server, sourceKeypair } = await getConfig();
    
    // Read WASM file
    const wasmBuffer = require('fs').readFileSync(wasmPath);
    
    // Create and submit the deployment transaction
    const transaction = new SorobanRpc.Transaction({
        sourceAccount: sourceKeypair.publicKey(),
        sequence: await server.getSequence(sourceKeypair.publicKey()),
        fee: 100,
        networkPassphrase: SorobanRpc.Networks.TESTNET,
        timeBounds: {
            minTime: 0,
            maxTime: 0
        }
    });

    // Add the deploy contract operation
    transaction.addOperation(SorobanRpc.Operation.deployContract({
        wasm: wasmBuffer.toString('base64')
    }));

    // Sign and submit
    transaction.sign(sourceKeypair);
    const response = await server.sendTransaction(transaction);
    
    return response.hash;
}

module.exports = {
    deployContract
};