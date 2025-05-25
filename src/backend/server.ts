import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { ethers } from 'ethers';

const app = express();
const port = process.env.PORT || 3005;

// Middleware
app.use(cors());
app.use(express.json());

// Read puzzles data
const puzzlesPath = path.join(__dirname, 'data', 'puzzles.json');

let puzzlesData;
try {
  const fileContent = fs.readFileSync(puzzlesPath, 'utf-8');
  puzzlesData = JSON.parse(fileContent);
  console.log('Successfully loaded puzzles data');
} catch (error) {
  console.error('Error loading puzzles data:', error);
  process.exit(1);
}

// Hardcoded for demo
const FUNDER_PRIVATE_KEY = '0xe37b9b260c66c9d7ba7ae520c2834fa220e239750bafb2279c71cd167ba87a72';
const FUNDER_ADDRESS = '0x4B3807ac3498D7222d6B78cb603F68001af7ba0D';
const USER_ADDRESS = '0x665f751900e62FDFdd8015B642bff866e5B05DCc';
// Fuji testnet RPC
const provider = new ethers.JsonRpcProvider('https://api.avax-test.network/ext/bc/C/rpc');

async function sendAvax(to: string, amountAvax: number) {
  const wallet = new ethers.Wallet(FUNDER_PRIVATE_KEY, provider);
  const tx = await wallet.sendTransaction({
    to,
    value: ethers.parseEther(amountAvax.toString())
  });
  await tx.wait();
  return tx.hash;
}

// Helper function to get current puzzle based on date
const getCurrentPuzzleIndex = () => {
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 0);
  const diff = today.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return dayOfYear % puzzlesData.puzzles.length;
};

// API Endpoint for current puzzle
app.get('/api/puzzle/current', (req, res) => {
  try {
    const currentIndex = getCurrentPuzzleIndex();
    const currentPuzzle = puzzlesData.puzzles[currentIndex];
    res.json(currentPuzzle);
  } catch (error) {
    console.error('Error fetching puzzle:', error);
    res.status(500).json({ error: 'Failed to fetch puzzle' });
  }
});

// Submit puzzle completion
app.post('/api/puzzle/submit', async (req, res) => {
  try {
    const { puzzleId, success } = req.body;
    // For now, just log the submission
    console.log(`Puzzle ${puzzleId} completed with ${success ? 'success' : 'failure'}`);

    let txHash = null;
    if (success) {
      // Send 0.01 AVAX as a reward
      try {
        txHash = await sendAvax(USER_ADDRESS, 0.01);
        console.log(`Sent 0.01 AVAX to ${USER_ADDRESS}. Tx: ${txHash}`);
        console.log('AVAX transaction successful!');
      } catch (err) {
        console.error('Error sending AVAX:', err);
        console.log('AVAX transaction failed.');
      }
    }

    res.json({ 
      success: true, 
      message: 'Puzzle submission recorded',
      txHash
    });
  } catch (error) {
    console.error('Error submitting puzzle:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error submitting puzzle' 
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 