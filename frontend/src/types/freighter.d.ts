declare global {
  interface Window {
    freighter: {
      signTransaction: (xdr: string) => Promise<string>;
      signAuthEntry: (xdr: string) => Promise<string>;
      getPublicKey: () => Promise<string>;
      isConnected: () => Promise<boolean>;
      signMessage: (message: string) => Promise<string>;
      isAllowed: () => Promise<boolean>;
    }
  }
}

export {};