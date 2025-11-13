export interface SorobanTransaction {
  txId?: string;
  hash?: string;
  id?: string;
  amount: string;
  sourceAddress?: string;
  from?: string;
  destinationAddress?: string;
  to?: string;
  timestamp?: string;
  time?: string;
  txStatus?: string;
  status?: string;
}

export interface Transaction {
  hash: string;
  amount: number;
  from: string;
  to: string;
  timestamp: string;
  status: string;
  type?: string;
  memo?: string;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: string;
    title: string;
  };
}

export interface WalletResponse {
  address: string;
  publicKey: string;
  privateKey?: string;
}

export const mapSorobanToTransaction = (tx: any): Transaction => ({
  hash: tx.txId ?? tx.hash ?? tx.id,
  amount: tx.amount,
  from: tx.sourceAddress ?? tx.from,
  to: tx.destinationAddress ?? tx.to,
  timestamp: tx.timestamp ?? tx.time,
  status: tx.txStatus ?? tx.status,
  type: tx.type ?? 'transfer',
  memo: tx.memo,
  createdAt: tx.timestamp ?? tx.time ?? new Date().toISOString(),
  updatedAt: tx.updatedAt ?? new Date().toISOString()
});
