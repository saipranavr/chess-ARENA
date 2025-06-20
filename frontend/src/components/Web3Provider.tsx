import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { LOCAL_NETWORK, AVALANCHE_FUJI } from '../config/networks';

interface Web3ContextType {
  provider: ethers.Provider | null;
  signer: ethers.Signer | null;
  address: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  isCorrectNetwork: boolean;
  switchNetwork: () => Promise<void>;
  currentNetwork: string;
}

const Web3Context = createContext<Web3ContextType>({
  provider: null,
  signer: null,
  address: null,
  connect: async () => {},
  disconnect: () => {},
  isCorrectNetwork: false,
  switchNetwork: async () => {},
  currentNetwork: '',
});

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [provider, setProvider] = useState<ethers.Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState<boolean>(false);
  const [currentNetwork, setCurrentNetwork] = useState<string>('');

  const checkNetwork = async (provider: ethers.Provider) => {
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);
    const isLocal = chainId === LOCAL_NETWORK.id;
    const isFuji = chainId === AVALANCHE_FUJI.id;
    setIsCorrectNetwork(isLocal || isFuji);
    setCurrentNetwork(isLocal ? 'Local' : isFuji ? 'Fuji' : 'Unknown');
  };

  const switchNetwork = async () => {
    if (!window.ethereum) return;

    try {
      // Try to switch to Fuji first
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${AVALANCHE_FUJI.id.toString(16)}` }],
      });
    } catch (switchError: any) {
      // If Fuji is not added, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${AVALANCHE_FUJI.id.toString(16)}`,
              chainName: AVALANCHE_FUJI.name,
              nativeCurrency: AVALANCHE_FUJI.nativeCurrency,
              rpcUrls: AVALANCHE_FUJI.rpcUrls.default.http,
              blockExplorerUrls: AVALANCHE_FUJI.blockExplorers?.default?.url ? [AVALANCHE_FUJI.blockExplorers.default.url] : [],
            }],
          });
        } catch (addError) {
          console.error('Error adding Avalanche Fuji network:', addError);
        }
      }
    }

    if (provider) {
      await checkNetwork(provider);
    }
  };

  const connect = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('Please install MetaMask');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      await checkNetwork(provider);
      
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      setProvider(provider);
      setSigner(signer);
      setAddress(address);

      // Listen for account changes
      window.ethereum.on('accountsChanged', async (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          const newSigner = await provider.getSigner();
          setSigner(newSigner);
          setAddress(accounts[0]);
        }
      });

      // Listen for chain changes
      window.ethereum.on('chainChanged', async () => {
        await checkNetwork(provider);
        window.location.reload();
      });
    } catch (error) {
      console.error('Error connecting to wallet:', error);
      throw error;
    }
  };

  const disconnect = () => {
    setProvider(null);
    setSigner(null);
    setAddress(null);
    setIsCorrectNetwork(false);
    setCurrentNetwork('');
  };

  useEffect(() => {
    // Check if already connected
    if (window.ethereum?.selectedAddress) {
      connect();
    }
  }, [connect]);

  return (
    <Web3Context.Provider value={{ 
      provider, 
      signer, 
      address, 
      connect, 
      disconnect, 
      isCorrectNetwork, 
      switchNetwork,
      currentNetwork 
    }}>
      {children}
    </Web3Context.Provider>
  );
}; 