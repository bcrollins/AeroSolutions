import React from 'react';
import { CommandPaletteProvider } from '@/hooks/use-command-palette';
import CommandPaletteWrapper from '@/components/UI/CommandPaletteWrapper';

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * AppProviders - Wrapper component that provides context providers to the application
 * 
 * Currently adds:
 * - CommandPaletteProvider - For global command palette functionality
 * 
 * @example
 * <AppProviders>
 *   <YourApp />
 * </AppProviders>
 */
const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <CommandPaletteProvider>
      {children}
      <CommandPaletteWrapper />
    </CommandPaletteProvider>
  );
};

export default AppProviders;