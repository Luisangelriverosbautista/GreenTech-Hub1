import type { WalletChain } from '@soroban-react/types';

export interface Chain extends WalletChain {
  id: string;
  name: string;
  network: string;
  networkPassphrase: string;
  sorobanRpcUrl: string;
  networkUrl: string;
}

// Constantes para Testnet
const TESTNET_NETWORK_PASSPHRASE = 'Test SDF Network ; September 15, 2015';
const TESTNET_NETWORK_URL = 'https://horizon-testnet.stellar.org';
const TESTNET_SOROBAN_RPC_URL = 'https://soroban-testnet.stellar.org';

export const testnetChain: Chain = {
  id: 'testnet',
  name: 'Testnet',
  network: 'testnet',
  networkPassphrase: TESTNET_NETWORK_PASSPHRASE,
  sorobanRpcUrl: import.meta.env.VITE_SOROBAN_RPC_URL || TESTNET_SOROBAN_RPC_URL,
  networkUrl: import.meta.env.VITE_NETWORK_URL || TESTNET_NETWORK_URL
};