import type { WalletChain } from '@soroban-react/types';
import type { SorobanTransaction } from './soroban';

export interface ContractTransactionParams {
  network: WalletChain;
  contractAddress: string;
  method: string;
  args: any[];
  source: string;
}

export interface SorobanServiceInterface {
  connectFreighter(): Promise<string>;
  contractTransaction(params: ContractTransactionParams): Promise<boolean>;
  getBalance(address: string): Promise<string>;
  getTransactionHistory(address: string): Promise<SorobanTransaction[]>;
  makeDonation(fromAddress: string, toAddress: string, amount: string): Promise<SorobanTransaction>;
  signMessage(message: string, privateKey: string): Promise<string>;
  verifySignature(message: string, signature: string, publicKey: string): Promise<boolean>;
}