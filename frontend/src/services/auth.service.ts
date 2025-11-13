import axios from 'axios';
import api from './api';
import type { User, AuthResponse, RegisterData } from '../types/auth.types';
import { requestAccess, getAddress } from '@stellar/freighter-api';

export class AuthService {
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', { email, password });
      if (!response.data || !response.data.token) {
        throw new Error('Invalid response from server');
      }
      this.setToken(response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al iniciar sesión. Por favor, verifica tus credenciales.');
    }
  }

  async loginWithWallet(address: string, signature: string): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login-wallet', { address, signature });
      if (!response.data || !response.data.token) {
        throw new Error('Invalid response from server');
      }
      this.setToken(response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al iniciar sesión con wallet.');
    }
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', userData);
    if (response.data.token) {
      this.setToken(response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  }

  async getProfile(): Promise<User> {
    const response = await api.get<User>('/auth/profile');
    return response.data;
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await api.put<User>('/auth/profile', userData);
    return response.data;
  }

  async linkWallet(walletAddress: string): Promise<User> {
    const response = await api.post<User>('/auth/link-wallet', { walletAddress });
    return response.data;
  }

  async unlinkWallet(): Promise<User> {
    const response = await api.post<User>('/auth/unlink-wallet');
    return response.data;
  }

  /**
   * Connect to Freighter wallet using the official SDK
   * Solicita acceso y devuelve la dirección Stellar
   */
  async connectFreighterWallet(): Promise<string> {
    try {
      console.log('[connectFreighterWallet] 🌟 Iniciando conexión con Freighter (SDK oficial)...');
      
      // PASO 1: Solicitar acceso con el SDK oficial
      console.log('[connectFreighterWallet] Paso 1: Solicitando acceso a Freighter...');
      const accessResult = await requestAccess();
      
      if (accessResult.error) {
        console.error('[connectFreighterWallet] Error al solicitar acceso:', accessResult.error);
        throw new Error(`Error de acceso: ${accessResult.error.message}`);
      }
      
      console.log('[connectFreighterWallet] ✓ Acceso concedido');
      
      // PASO 2: Obtener dirección de Stellar
      console.log('[connectFreighterWallet] Paso 2: Obteniendo dirección de Stellar...');
      const addressResult = await getAddress();
      
      if (addressResult.error) {
        console.error('[connectFreighterWallet] Error al obtener dirección:', addressResult.error);
        throw new Error(`Error al obtener dirección: ${addressResult.error.message}`);
      }
      
      const stellarAddress = addressResult.address;
      
      if (!stellarAddress) {
        throw new Error('No se recibió dirección de Freighter');
      }
      
      // Validar que es una dirección de Stellar válida
      if (!stellarAddress.startsWith('G') || stellarAddress.length !== 56) {
        console.warn('[connectFreighterWallet] ⚠️ Dirección no parece ser Stellar válida:', stellarAddress);
      }
      
      console.log('[connectFreighterWallet] ✅ Éxito - Dirección Stellar:', stellarAddress.substring(0, 10) + '...');
      return stellarAddress;
      
    } catch (error) {
      console.error('[connectFreighterWallet] ❌ Error:', error);
      
      const errorMsg = error instanceof Error ? error.message : String(error);
      
      // Detectar tipo de error y proporcionar solución específica
      if (errorMsg.includes('not installed') || errorMsg.includes('no instalada')) {
        throw new Error(`❌ FREIGHTER NO ESTÁ INSTALADA

Solución:
1. Ve a https://freighter.app
2. Haz clic en "Instalar en Chrome" (o "Instalar en Brave")
3. Completa la instalación
4. Crea tu cuenta con testnet
5. Regresa a esta página y recarga (F5)
6. Intenta conectar nuevamente`);
      }
      
      if (errorMsg.includes('denied') || errorMsg.includes('rechazada') || errorMsg.includes('rejected')) {
        throw new Error(`❌ RECHAZASTE LA AUTORIZACIÓN

Necesitas autorizar a Freighter para conectar:
1. Intenta de nuevo
2. Cuando aparezca el popup de Freighter, haz clic en "Autorizar"
3. Si vuelve a aparecer este error, reinicia el navegador y vuelve a intentar`);
      }
      
      if (errorMsg.includes('Network') || errorMsg.includes('network')) {
        throw new Error(`❌ ERROR DE RED

Verifica:
1. Que tengas conexión a internet
2. Que Freighter esté habilitado
3. Recarga la página (F5) e intenta de nuevo`);
      }
      
      throw new Error(`❌ Error al conectar con Freighter: ${errorMsg}`);
    }
  }

  /**
   * Save wallet address to user profile in backend
   */
  async saveWalletToProfile(walletAddress: string): Promise<User> {
    try {
      console.log('[saveWalletToProfile] Guardando wallet en backend:', walletAddress?.substring(0, 10) + '...');
      const response = await api.post<User>('/auth/connect-wallet', { walletAddress });
      console.log('[saveWalletToProfile] Respuesta del servidor:', response.data);
      
      // Update cached user in localStorage
      localStorage.setItem('user', JSON.stringify(response.data));
      console.log('[saveWalletToProfile] ✓ Usuario actualizado en localStorage');
      
      return response.data;
    } catch (error) {
      console.error('[saveWalletToProfile] Error:', error);
      throw error;
    }
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
    this.setAuthHeader(token);
  }

  getToken(): string | null {
    const token = localStorage.getItem('token');
    if (token) {
      this.setAuthHeader(token);
    }
    return token;
  }

  private setAuthHeader(token: string | null): void {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }

  async signLoginMessage(): Promise<{ signature: string; publicKey: string }> {
    if (typeof window === 'undefined' || !window.freighter) {
      throw new Error('Freighter no está instalado');
    }

    const publicKey = await window.freighter.getPublicKey();
    if (!publicKey) {
      throw new Error('No se pudo obtener la dirección de la wallet');
    }

    const message = `Login to GreenTech-Hub with address: ${publicKey}`;
    const signature = await window.freighter.signMessage(message);
    
    return { signature, publicKey };
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        this.logout();
        return null;
      }
    }
    return null;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
}

export const authService = new AuthService();
export default authService;
