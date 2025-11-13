const SorobanRpc = require('soroban-client');
const { Keypair, Server } = require('stellar-sdk');
const config = require('./config');
const getConfig = config.getConfig;
const { deployContract } = require('./deploy_contract');
const { invokeContract } = require('./invoke_contract');
const BigNumber = require('bignumber.js');

// Lazy initialization para Horizon Server
let horizonServer = null;

const getHorizonServer = () => {
    if (!horizonServer) {
        horizonServer = new Server('https://horizon-testnet.stellar.org');
    }
    return horizonServer;
};

class SorobanService {
    constructor() {
        this.initialize();
    }

    async generateWallet() {
        try {
            // Genera una nueva clave (local). Para crear la cuenta en testnet, el frontend o script debe "fundear" la clave (friendbot) o usar una cuenta fuente.
            const kp = Keypair.random();
            return {
                publicKey: kp.publicKey(),
                secret: kp.secret()
            };
        } catch (error) {
            console.error('Error generating wallet:', error);
            throw new Error('Failed to generate wallet');
        }
    }

    async initialize() {
        const { server, sourceKeypair } = await getConfig();
        this.server = server;
        this.sourceKeypair = sourceKeypair;
    }

    async getBalance(address) {
        try {
            // Usar Horizon para obtener el balance (más confiable que Soroban RPC)
            const server = getHorizonServer();
            console.log(`[Soroban] Fetching balance for address: ${address}`);
            
            const account = await server.loadAccount(address);
            console.log(`[Soroban] Account loaded. Balances:`, JSON.stringify(account.balances));
            
            const nativeBalance = account.balances.find(b => b.asset_type === 'native');
            const balance = nativeBalance ? nativeBalance.balance : '0';
            
            console.log(`[Soroban] Native balance for ${address}: ${balance} XLM`);
            return balance;
        } catch (error) {
            // Si la cuenta no existe, retorna 0 (pero no es realmente '0', la cuenta no está fundada)
            if (error.response?.status === 404 || error.message?.includes('404')) {
                console.warn(`[Soroban] Account ${address} not found on Stellar (404).`);
                return '0';
            }
            console.error(`[Soroban] Error getting balance for ${address}:`, error.message);
            console.error(`[Soroban] Error details:`, error);
            throw error;
        }
    }

    async makeDonation(fromAddress, toAddress, amount, fromKeypair = null) {
        try {
            const transaction = await this.createTransaction(fromAddress);
            
            // Añadir la operación de pago (usando stellar-sdk)
            const Operation = require('stellar-sdk').Operation;
            transaction.addOperation(Operation.payment({
                destination: toAddress,
                asset: require('stellar-sdk').Asset.native(),
                amount: amount.toString()
            }));

            // Firmar y enviar la transacción (usando Horizon Server)
            // IMPORTANTE: Para firmar la transacción, necesitamos la clave privada del donante
            // Pero en el modelo actual, el frontend no nos envía la clave privada
            // Esto es un problema de seguridad que necesita ser resuelto
            
            if (!fromKeypair && !this.sourceKeypair) {
                throw new Error('No keypair available to sign transaction. This is a limitation of the current architecture.');
            }
            
            const keyToUse = fromKeypair || this.sourceKeypair;
            transaction.sign(keyToUse);
            
            const server = getHorizonServer();
            const response = await server.submitTransaction(transaction);
            
            return {
                hash: response.hash,
                status: response.status,
                fromAddress,
                toAddress,
                amount: amount.toString()
            };
        } catch (error) {
            console.error('Error making donation:', error);
            throw new Error(`Failed to make donation: ${error.message}`);
        }
    }

    async getTransactionHistory(address) {
        try {
            // Obtener transacciones desde Horizon
            const server = getHorizonServer();
            const transactions = await server.transactions()
                .forAccount(address)
                .order('desc')
                .limit(10)
                .call();

            return transactions.records.map(tx => ({
                hash: tx.hash,
                created_at: tx.created_at,
                type: tx.type,
                source_account: tx.source_account,
                memo: tx.memo,
                fee_charged: tx.fee_charged,
                status: tx.successful ? 'success' : 'failed'
            }));
        } catch (error) {
            console.error('Error getting transaction history:', error);
            throw new Error('Failed to get transaction history');
        }
    }

    async createTransaction(sourceAddress) {
        const { Transaction, Networks } = require('stellar-sdk');
        const server = getHorizonServer();
        const account = await server.loadAccount(sourceAddress);
        return new Transaction({
            source: account,
            fee: 100,
            networkPassphrase: Networks.TESTNET_NETWORK_PASSPHRASE,
            timeBounds: {
                minTime: 0,
                maxTime: 0
            }
        });
    }

    async deploySmartContract(wasmPath) {
        try {
            const contractId = await deployContract(wasmPath);
            console.log('Smart contract deployed with ID:', contractId);
            return contractId;
        } catch (error) {
            console.error('Error deploying smart contract:', error);
            throw new Error('Failed to deploy smart contract');
        }
    }

    async invokeSmartContract(contractId, method, params) {
        try {
            const result = await invokeContract(contractId, method, params);
            console.log('Smart contract method invoked:', result);
            return result;
        } catch (error) {
            console.error('Error invoking smart contract:', error);
            throw new Error('Failed to invoke smart contract');
        }
    }
}

// Crear singleton instance
let singletonInstance = null;

const getInstance = async () => {
    if (!singletonInstance) {
        singletonInstance = new SorobanService();
        // Esperar a que se inicialice
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    return singletonInstance;
};

module.exports = getInstance;
module.exports.SorobanService = SorobanService;