import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CHESS_TOKEN_ADDRESS, CHESS_TOKEN_ABI, getChessTokenContract } from '../contracts/ChessRewardToken';

interface ChessRewardTokenProps {
  provider: ethers.Provider;
  signer: ethers.Signer;
}

type ChessTokenContract = ethers.Contract & {
  distributeReward: (winner: string, amount: bigint) => Promise<ethers.ContractTransactionResponse>;
  pause: () => Promise<ethers.ContractTransactionResponse>;
  unpause: () => Promise<ethers.ContractTransactionResponse>;
  paused: () => Promise<boolean>;
};

export const ChessRewardToken: React.FC<ChessRewardTokenProps> = ({ provider, signer }) => {
  const [balance, setBalance] = useState<string>('0');
  const [winnerAddress, setWinnerAddress] = useState<string>('');
  const [rewardAmount, setRewardAmount] = useState<string>('');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const contract = getChessTokenContract(provider) as ChessTokenContract;
  const contractWithSigner = contract.connect(signer) as ChessTokenContract;

  useEffect(() => {
    const loadContractData = async () => {
      try {
        const address = await signer.getAddress();
        const balance = await contract.balanceOf(address);
        const paused = await contract.paused();
        setBalance(ethers.formatEther(balance));
        setIsPaused(paused);
      } catch (err) {
        console.error('Error loading contract data:', err);
        setError('Failed to load contract data');
      }
    };

    loadContractData();
  }, [contract, signer]);

  const handleDistributeReward = async () => {
    if (!winnerAddress || !rewardAmount) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const amount = ethers.parseEther(rewardAmount);
      const tx = await contractWithSigner.distributeReward(winnerAddress, amount);
      await tx.wait();
      setWinnerAddress('');
      setRewardAmount('');
      // Refresh balance
      const address = await signer.getAddress();
      const newBalance = await contract.balanceOf(address);
      setBalance(ethers.formatEther(newBalance));
    } catch (err) {
      console.error('Error distributing reward:', err);
      setError('Failed to distribute reward');
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async () => {
    try {
      setLoading(true);
      setError('');
      const tx = await contractWithSigner.pause();
      await tx.wait();
      setIsPaused(true);
    } catch (err) {
      console.error('Error pausing contract:', err);
      setError('Failed to pause contract');
    } finally {
      setLoading(false);
    }
  };

  const handleUnpause = async () => {
    try {
      setLoading(true);
      setError('');
      const tx = await contractWithSigner.unpause();
      await tx.wait();
      setIsPaused(false);
    } catch (err) {
      console.error('Error unpausing contract:', err);
      setError('Failed to unpause contract');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Chess Reward Token</h2>
      
      <div className="mb-4">
        <p className="text-lg">Your Balance: {balance} CHESS</p>
        <p className="text-lg">Contract Status: {isPaused ? 'Paused' : 'Active'}</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block mb-2">Winner Address:</label>
          <input
            type="text"
            value={winnerAddress}
            onChange={(e) => setWinnerAddress(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="0x..."
          />
        </div>

        <div>
          <label className="block mb-2">Reward Amount (CHESS):</label>
          <input
            type="number"
            value={rewardAmount}
            onChange={(e) => setRewardAmount(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="0.0"
          />
        </div>

        <div className="space-x-4">
          <button
            onClick={handleDistributeReward}
            disabled={loading || isPaused}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
          >
            {loading ? 'Processing...' : 'Distribute Reward'}
          </button>

          <button
            onClick={isPaused ? handleUnpause : handlePause}
            disabled={loading}
            className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-400"
          >
            {loading ? 'Processing...' : isPaused ? 'Unpause Contract' : 'Pause Contract'}
          </button>
        </div>

        {error && (
          <div className="text-red-500 mt-2">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}; 