import React from 'react';
import { useWeb3 } from './Web3Provider';
import { ChessRewardToken } from './ChessRewardToken';

export const WalletConnect: React.FC = () => {
  const { provider, signer, address, connect, disconnect, isCorrectNetwork, switchNetwork, currentNetwork } = useWeb3();

  return (
    <div className="p-4">
      <div className="mb-4">
        {!address ? (
          <button
            onClick={connect}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Connect Wallet
          </button>
        ) : (
          <div className="flex items-center gap-4">
            <span className="text-gray-700">
              Connected: {address.slice(0, 6)}...{address.slice(-4)}
            </span>
            <span className="text-gray-700">
              Network: {currentNetwork}
            </span>
            {!isCorrectNetwork && (
              <button
                onClick={switchNetwork}
                className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
              >
                Switch to Avalanche Fuji
              </button>
            )}
            <button
              onClick={disconnect}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>

      {provider && signer && isCorrectNetwork && (
        <div className="mt-4">
          <ChessRewardToken provider={provider} signer={signer} />
        </div>
      )}
    </div>
  );
}; 