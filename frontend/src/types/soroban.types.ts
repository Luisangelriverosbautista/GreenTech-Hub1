export interface SorobanService {
  connectFreighter: () => Promise<string>;
  getAddressFromFreighter: () => Promise<string>;
  buildDonationXDR: (from: string, to: string, amount: string) => Promise<string>;
  signXDRWithFreighter: (xdr: string) => Promise<string>;
  submitSignedXDR: (signedXDR: string) => Promise<string>;
}

export interface WalletInfo {
  address: string;
  balance: string;
  network: 'testnet' | 'public';
}