import React, { useEffect, useState, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Chess } from 'chess.js';
import { Puzzle as PuzzleType } from '../types/puzzle';
import './Puzzle.css';

const fetchPuzzle = async (): Promise<PuzzleType> => {
  const response = await axios.get('http://localhost:3005/api/puzzle/current');
  return response.data;
};

const submitPuzzle = async (puzzleId: string) => {
  await axios.post('http://localhost:3005/api/puzzle/submit', {
    puzzleId,
    success: true
  });
};

const Puzzle: React.FC = () => {
  const navigate = useNavigate();
  const [boardSize, setBoardSize] = useState(600);
  const [game, setGame] = useState<Chess | null>(null);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [message, setMessage] = useState('');
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');

  const { data: puzzle, isLoading, error } = useQuery<PuzzleType>({
    queryKey: ['currentPuzzle'],
    queryFn: fetchPuzzle,
  });

  // Initialize chess game when puzzle loads
  useEffect(() => {
    if (puzzle) {
      const newGame = new Chess(puzzle.initialFEN);
      setGame(newGame);
      setCurrentMoveIndex(0);
      setMessage(puzzle.description);
      // Set orientation based on who's turn it is
      setOrientation(puzzle.initialFEN.includes(' b ') ? 'black' : 'white');
    }
  }, [puzzle]);

  useEffect(() => {
    const updateBoardSize = () => {
      const containerWidth = window.innerWidth;
      const padding = containerWidth < 400 ? 8 : 16;
      const newSize = Math.min(containerWidth - (padding * 2), 600);
      setBoardSize(newSize);
    };

    updateBoardSize();
    window.addEventListener('resize', updateBoardSize);
    return () => window.removeEventListener('resize', updateBoardSize);
  }, []);

  const makeMove = useCallback((move: { from: string; to: string }) => {
    if (!game || !puzzle) return false;

    try {
      const result = game.move(move);
      if (result) {
        const expectedMove = puzzle.solutionPath[currentMoveIndex];
        const moveString = `${move.from}${move.to}`;
        
        if (moveString === expectedMove) {
          // Update game state immediately after player's move
          const newGame = new Chess(game.fen());
          setGame(newGame);
          setCurrentMoveIndex(currentMoveIndex + 1);
          setMessage('Correct move! Keep going.');

          // Make the opponent's move if available
          const nextMove = puzzle.solutionPath[currentMoveIndex + 1];
          if (nextMove) {
            setTimeout(() => {
              const opponentMove = {
                from: nextMove.substring(0, 2),
                to: nextMove.substring(2, 4)
              };
              newGame.move(opponentMove);
              setGame(new Chess(newGame.fen()));
              setCurrentMoveIndex(currentMoveIndex + 2);

              // Check if puzzle is completed after opponent's move
              if (currentMoveIndex + 2 >= puzzle.solutionPath.length) {
                setMessage('Congratulations! Puzzle completed!');
                // Submit puzzle completion and navigate to leaderboard
                submitPuzzle(puzzle.puzzleId)
                  .then(() => {
                    setTimeout(() => navigate('/leaderboard'), 1500);
                  })
                  .catch(error => {
                    console.error('Error submitting puzzle:', error);
                  });
              }
            }, 500);
          } else {
            // If there's no next move, this was the last move
            setMessage('Congratulations! Puzzle completed!');
            // Submit puzzle completion and navigate to leaderboard
            submitPuzzle(puzzle.puzzleId)
              .then(() => {
                setTimeout(() => navigate('/leaderboard'), 1500);
              })
              .catch(error => {
                console.error('Error submitting puzzle:', error);
              });
          }
          return true;
        } else {
          setMessage('Incorrect move. Try again!');
          game.undo();
          setGame(new Chess(game.fen()));
          return false;
        }
      }
      return false;
    } catch (e) {
      console.error('Move error:', e);
      return false;
    }
  }, [game, puzzle, currentMoveIndex, navigate]);

  const onDrop = (sourceSquare: string, targetSquare: string): boolean => {
    if (!game) return false;
    return makeMove({
      from: sourceSquare,
      to: targetSquare
    });
  };

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

  if (!puzzle || !game) {
    return null;
  }

  return (
    <div className="puzzle-container">
      <div className="puzzle-message">
        <div className="x-text">{message}</div>
      </div>
      <div className="puzzle-board">
        <Chessboard
          position={game.fen()}
          boardWidth={boardSize}
          onPieceDrop={onDrop}
          boardOrientation={orientation}
        />
      </div>
    </div>
  );
};

export default Puzzle; 