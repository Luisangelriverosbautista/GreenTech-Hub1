const SorobanRpc = require('soroban-client');
const { Keypair } = require('stellar-sdk');
require('dotenv').config();

async function getConfig() {
    const rpcUrl = process.env.SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';
    const server = new SorobanRpc.Server(rpcUrl);

    // Create keypair from secret key (if provided)
    let sourceKeypair = null;
    if (process.env.STELLAR_SECRET_KEY) {
        sourceKeypair = Keypair.fromSecret(process.env.STELLAR_SECRET_KEY);
    }

    return {
        server,
        sourceKeypair,
        networkPassphrase: SorobanRpc.Networks.TESTNET
    };
}

module.exports = {
    getConfig
};