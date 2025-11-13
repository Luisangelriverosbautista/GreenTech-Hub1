export interface StellarBalance {
  asset_type: string;
  balance: string;
  asset_code?: string;
  asset_issuer?: string;
}

export interface StellarAccount {
  id: string;
  balances: StellarBalance[];
  sequence: string;
}