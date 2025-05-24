import React from 'react';
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
  const { data: puzzle, isLoading, error } = useQuery<PuzzleType>({
    queryKey: ['currentPuzzle'],
    queryFn: fetchPuzzle,
  });

  if (isLoading) {
    return <div className="puzzle-loading">Loading puzzle...</div>;
  }

  if (error) {
    return <div className="puzzle-error">Error loading puzzle</div>;
  }

  if (!puzzle) {
    return null;
  }

  return (
    <div className="puzzle-container">
      <div className="puzzle-board">
        <Chessboard
          position={puzzle.initialFEN}
          boardWidth={400}
        />
      </div>
      <div className="puzzle-info">
        <h2>Daily Puzzle</h2>
        <p className="difficulty">Difficulty: {puzzle.difficulty}</p>
        <p className="description">{puzzle.description}</p>
      </div>
    </div>
  );
};

export default Puzzle; 