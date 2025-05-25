import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

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
app.post('/api/puzzle/submit', (req, res) => {
  try {
    const { puzzleId, success } = req.body;
    
    // For now, just log the submission
    console.log(`Puzzle ${puzzleId} completed with ${success ? 'success' : 'failure'}`);
    
    res.json({ 
      success: true, 
      message: 'Puzzle submission recorded' 
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