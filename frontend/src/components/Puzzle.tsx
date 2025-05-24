import React, { useEffect, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Puzzle as PuzzleType } from '../types/puzzle';
import './Puzzle.css';

const fetchPuzzle = async (): Promise<PuzzleType> => {
  const response = await axios.get('http://localhost:3005/api/puzzle/current');
  return response.data;
};

const Puzzle: React.FC = () => {
  const [boardSize, setBoardSize] = useState(600);

  useEffect(() => {
    const updateBoardSize = () => {
      const containerWidth = window.innerWidth;
      const padding = containerWidth < 400 ? 8 : 16; // Smaller padding for mobile
      const newSize = Math.min(containerWidth - (padding * 2), 600);
      setBoardSize(newSize);
    };

    updateBoardSize();
    window.addEventListener('resize', updateBoardSize);
    return () => window.removeEventListener('resize', updateBoardSize);
  }, []);

  const { data: puzzle, isLoading, error } = useQuery<PuzzleType>({
    queryKey: ['currentPuzzle'],
    queryFn: fetchPuzzle,
  });

  if (isLoading) {
    return (
      <div className="puzzle-loading">
        <div className="x-text">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="puzzle-error">
        <div className="x-text">Error loading puzzle</div>
      </div>
    );
  }

  if (!puzzle) {
    return null;
  }

  return (
    <div className="puzzle-container">
      <div className="puzzle-board">
        <Chessboard
          position={puzzle.initialFEN}
          boardWidth={boardSize}
        />
      </div>
    </div>
  );
};

export default Puzzle; 