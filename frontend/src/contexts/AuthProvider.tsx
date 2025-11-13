import { useState, useEffect } from 'react';
import { AuthContext, type AuthContextProps, type AuthContextType } from './AuthContext';
import { authService } from '../services/auth.service';
import type { User, RegisterData } from '../types/auth.types';

export function AuthProvider({ children }: AuthContextProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | undefined>(undefined);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = authService.getToken();
        if (token) {
          await loadUser();
        } else {
          authService.logout();
          setUser(null);
        }
      } catch (err) {
        authService.logout();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUser = async () => {
    try {
      const profile = await authService.getProfile();
      setUser(profile);
      setError(null);
    } catch (err) {
      authService.logout();
      setUser(null);
      setError('Error al cargar el usuario');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const { user: loggedUser, token } = await authService.login(email, password);
      authService.setToken(token);
      setUser(loggedUser);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      setError(null);
      const { user: newUser, token } = await authService.register(data);
      authService.setToken(token);
      setUser(newUser);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al registrar el usuario';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setWalletAddress(undefined);
    setError(null);
  };

  const linkWallet = async (address: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedUser = await authService.linkWallet(address);
      setUser(updatedUser);
      setWalletAddress(address);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al vincular wallet';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const unlinkWallet = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedUser = await authService.unlinkWallet();
      setUser(updatedUser);
      setWalletAddress(undefined);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al desvincular wallet';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithWallet = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Implement wallet login with Freighter
      // For now, this is not being used - we use email/password login followed by wallet connection
      throw new Error('Wallet login no está implementado. Por favor usa email y contraseña.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión con wallet';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Connect Freighter wallet and save it to user profile
   * This is called from dashboard/profile after user logs in
   */
  const connectFreighter = async () => {
    try {
      console.log('[AuthProvider.connectFreighter] Iniciando conexión con Freighter...');
      setIsLoading(true);
      setError(null);

      // Step 1: Connect to Freighter and get public key
      console.log('[AuthProvider.connectFreighter] Step 1: Conectando a Freighter...');
      const publicKey = await authService.connectFreighterWallet();
      console.log('[AuthProvider.connectFreighter] Step 1 ✓: Clave pública obtenida:', publicKey?.substring(0, 10) + '...');

      // Step 2: Save wallet to user profile in backend
      console.log('[AuthProvider.connectFreighter] Step 2: Guardando en backend...');
      const updatedUser = await authService.saveWalletToProfile(publicKey);
      console.log('[AuthProvider.connectFreighter] Step 2 ✓: Usuario actualizado');
      
      setUser(updatedUser);
      setWalletAddress(publicKey);
      setError(null);
      console.log('[AuthProvider.connectFreighter] ✓ Conexión completada exitosamente');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al conectar Freighter';
      console.error('[AuthProvider.connectFreighter] ✗ Error:', message);
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // helper functions are intentionally kept minimal; exposures are via linkWallet/unlinkWallet/loginWithWallet

  const contextValue: AuthContextType = {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    loginWithWallet,
    linkWallet,
    unlinkWallet,
    connectFreighter,
    isAuthenticated: !!user,
    walletAddress
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}
