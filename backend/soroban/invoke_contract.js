const SorobanRpc = require('soroban-client');
const { getConfig } = require('./config');

async function invokeContract(contractId, method, params) {
    const { server, sourceKeypair } = await getConfig();
    
    // Create the invocation transaction
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

    // Add the invoke contract operation
    transaction.addOperation(SorobanRpc.Operation.invokeHostFunction({
        contractId: contractId,
        functionName: method,
        args: params
    }));

    // Sign and submit
    transaction.sign(sourceKeypair);
    const response = await server.sendTransaction(transaction);
    
    return response;
}

module.exports = {
    invokeContract
};