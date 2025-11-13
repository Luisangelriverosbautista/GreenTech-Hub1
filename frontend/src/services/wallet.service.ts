import api from './api';

class WalletService {
  async connectWallet(): Promise<string> {
    // Solicitar acceso a la cuenta de Stellar
    // @ts-ignore - window.freighterApi es inyectado por el plugin del navegador
    if (!window.freighterApi) {
      throw new Error('Freighter no está instalado');
    }

    try {
      // @ts-ignore
      const publicKey = await window.freighterApi.getPublicKey();
      await this.linkWalletToAccount(publicKey);
      return publicKey;
    } catch (error) {
      console.error('Error al conectar la wallet:', error);
      throw new Error('No se pudo conectar la wallet');
    }
  }

  private async linkWalletToAccount(walletAddress: string): Promise<void> {
    await api.post('/users/wallet', { walletAddress });
  }

  async signTransaction(xdr: string): Promise<string> {
    try {
      // @ts-ignore
      const signedXDR = await window.freighterApi.signTransaction(xdr);
      return signedXDR;
    } catch (error) {
      console.error('Error al firmar la transacción:', error);
      throw new Error('No se pudo firmar la transacción');
    }
  }

  async isConnected(): Promise<boolean> {
    try {
      // @ts-ignore
      if (!window.freighterApi) return false;
      // @ts-ignore
      const publicKey = await window.freighterApi.getPublicKey();
      return !!publicKey;
    } catch {
      return false;
    }
  }
}

export default new WalletService();