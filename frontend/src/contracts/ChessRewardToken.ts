import { ethers } from 'ethers';

// Local Network configuration
export const LOCAL_NETWORK = {
  chainId: '0x7A69', // 31337 in hex
  chainName: 'Localhost 8545',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['http://127.0.0.1:8545'],
  blockExplorerUrls: [''],
};

// Avalanche Fuji Testnet configuration
export const AVALANCHE_FUJI = {
  chainId: '0xa869', // 43113 in hex
  chainName: 'Avalanche Fuji Testnet',
  nativeCurrency: {
    name: 'Avalanche',
    symbol: 'AVAX',
    decimals: 18,
  },
  rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
  blockExplorerUrls: ['https://testnet.snowtrace.io/'],
};

// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  localhost: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // This will be updated after deployment
  fuji: '0x633C56da2d8946bF3ddb3392D250cbBe5b14572c',
};

export const CHESS_TOKEN_ADDRESS = CONTRACT_ADDRESSES.localhost;

export const CHESS_TOKEN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function distributeReward(address winner, uint256 amount)",
  "function batchDistributeRewards(address[] winners, uint256[] amounts)",
  "function hasClaimed(address account) view returns (bool)",
  "function resetClaimStatus(address account)",
  "function pause()",
  "function unpause()",
  "function paused() view returns (bool)",
  "event RewardDistributed(address indexed winner, uint256 amount)",
  "event Paused(address account)",
  "event Unpaused(address account)"
];

export const getChessTokenContract = (provider: ethers.Provider) => {
  return new ethers.Contract(CHESS_TOKEN_ADDRESS, CHESS_TOKEN_ABI, provider);
};

export const switchToAvalancheFuji = async () => {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('Please install MetaMask');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: AVALANCHE_FUJI.chainId }],
    });
  } catch (switchError: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [AVALANCHE_FUJI],
        });
      } catch (addError) {
        throw new Error('Failed to add Avalanche Fuji network to MetaMask');
      }
    } else {
      throw switchError;
    }
  }
}; 