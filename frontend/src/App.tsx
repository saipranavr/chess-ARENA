import React from 'react';
import { Web3Provider } from './components/Web3Provider';
import { WalletConnect } from './components/WalletConnect';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Chess Arena Rewards</h1>
        <Web3Provider>
          <WalletConnect />
        </Web3Provider>
      </div>
    </div>
  );
}

export default App;
