import { SorobanReactProvider } from '@soroban-react/core';
import { freighter } from '@soroban-react/freighter';
import { testnetChain } from '../config/soroban';
import type { ReactNode } from 'react';

interface SorobanProviderProps {
  children: ReactNode;
}

const providerConfig = {
  appName: "GreenTech Hub",
  chains: [testnetChain],
  connectors: [freighter()],
  autoconnect: true
};

export function SorobanProvider({ children }: SorobanProviderProps) {
  return (
    <SorobanReactProvider {...providerConfig}>
      {children}
    </SorobanReactProvider>
  );
}