import { requestAccess, getAddress, signTransaction as freighterSignTransaction, isAllowed, getNetwork } from '@stellar/freighter-api';

/**
 * Check if Freighter wallet is connected
 */
export async function isConnected(): Promise<boolean> {
  try {
    const result = await getAddress();
    return !result.error && !!result.address;
  } catch {
    return false;
  }
}

/**
 * Ensure Freighter is on Testnet
 */
export async function ensureTestnetNetwork(): Promise<void> {
  try {
    // Check if access is allowed on testnet
    const testnetAllowed = await isAllowed();
    console.log('[ensureTestnetNetwork] Is Freighter allowed:', testnetAllowed);
    
    if (!testnetAllowed) {
      // Request access to Freighter
      const accessResult = await requestAccess();
      if (accessResult.error) {
        console.warn('[ensureTestnetNetwork] Could not get access:', accessResult.error);
      }
    }
  } catch (error) {
    console.warn('[ensureTestnetNetwork] Error ensuring testnet:', error);
  }
}

/**
 * Get the connected Freighter wallet address
 */
export async function getWalletAddress(): Promise<string> {
  try {
    const result = await getAddress();
    if (result.error) {
      throw new Error(`Error getting address: ${result.error.message}`);
    }
    return result.address!;
  } catch (error) {
    console.error('Error getting wallet address:', error);
    throw error;
  }
}

/**
 * Sign a transaction with Freighter wallet
 */
export async function signTransaction(transaction: any): Promise<any> {
  try {
    // Convert transaction to XDR
    let txXdr: string;
    if (typeof transaction === 'string') {
      txXdr = transaction;
    } else if (transaction.toXDR) {
      txXdr = transaction.toXDR();
    } else {
      throw new Error('Invalid transaction format');
    }

    console.log('[signTransaction] Getting Freighter network info...');
    const networkInfo = await getNetwork();
    console.log('[signTransaction] Freighter network passphrase:', networkInfo.networkPassphrase);
    
    // Use EXACTLY what Freighter reports, even if truncated
    const result = await freighterSignTransaction(txXdr, {
      networkPassphrase: networkInfo.networkPassphrase
    });

    if (result.error) {
      console.error('[signTransaction] Freighter error:', result.error);
      throw new Error(`Freighter error: ${result.error.message}`);
    }

    console.log('[signTransaction] ✅ Transaction signed');
    return result.signedTxXdr;
  } catch (error) {
    console.error('[signTransaction] Error:', error);
    throw error;
  }
}

/**
 * Request access to Freighter wallet
 */
export async function requestFreighterAccess(): Promise<string> {
  try {
    console.log('[requestFreighterAccess] 🌟 Solicitando acceso a Freighter...');
    
    const result = await requestAccess();
    
    if (result.error) {
      throw new Error(`Access error: ${result.error.message}`);
    }

    console.log('[requestFreighterAccess] ✓ Acceso concedido');
    
    // Get address after requesting access
    return await getWalletAddress();
  } catch (error) {
    console.error('[requestFreighterAccess] Error:', error);
    throw error;
  }
}
