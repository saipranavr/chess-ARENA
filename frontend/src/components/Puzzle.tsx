import React, { useEffect, useState, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Chess } from 'chess.js';
import { Puzzle as PuzzleType } from '../types/puzzle';
import PageLayout from './PageLayout';
import './Puzzle.css';

const MAX_BOARD_WIDTH = 540;

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
  const [boardSize, setBoardSize] = useState(MAX_BOARD_WIDTH);
  const [game, setGame] = useState<Chess | null>(null);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [message, setMessage] = useState('');
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');
  const [showHint, setShowHint] = useState<0 | 1 | 2>(0); // 0: no hint, 1: source square, 2: both squares
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);

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
      setShowHint(0);
      setLastMove(null);
      // Set orientation based on who's turn it is
      setOrientation(puzzle.initialFEN.includes(' b ') ? 'black' : 'white');
    }
  }, [puzzle]);

  useEffect(() => {
    const updateBoardSize = () => {
      // Get the width of the .page-card container
      const card = document.querySelector('.page-card') as HTMLElement;
      let containerWidth = window.innerWidth;
      if (card) {
        containerWidth = card.offsetWidth;
      }
      const padding = containerWidth < 400 ? 8 : 16;
      const newSize = Math.min(containerWidth - (padding * 2), MAX_BOARD_WIDTH);
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
          setLastMove(move);
          // Hide hint after successful move
          setShowHint(0);

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
              setLastMove(opponentMove);

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

  const toggleHint = () => {
    setShowHint((current) => {
      if (current === 2) return 0;
      return (current + 1) as 1 | 2;
    });
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="puzzle-loading">
          <div className="x-text">Loading...</div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="puzzle-error">
          <div className="x-text">Error loading puzzle</div>
        </div>
      </PageLayout>
    );
  }

  if (!puzzle || !game) {
    return null;
  }

  const customSquareStyles: { [square: string]: React.CSSProperties } = {};
  if (lastMove) {
    customSquareStyles[lastMove.from] = {
      backgroundColor: 'rgba(255, 255, 0, 0.4)',
    };
    customSquareStyles[lastMove.to] = {
      backgroundColor: 'rgba(255, 255, 0, 0.4)',
    };
  }
  // Add highlighting for hint squares based on hint stage
  if (showHint > 0 && puzzle && currentMoveIndex < puzzle.solutionPath.length) {
    const nextMove = puzzle.solutionPath[currentMoveIndex];
    const from = nextMove.substring(0, 2);
    const to = nextMove.substring(2, 4);
    
    // Stage 1: Show only source square
    if (showHint >= 1) {
      customSquareStyles[from] = {
        backgroundColor: 'rgba(0, 255, 0, 0.4)',
      };
    }
    // Stage 2: Show destination square
    if (showHint === 2) {
      customSquareStyles[to] = {
        backgroundColor: 'rgba(0, 255, 0, 0.4)',
      };
    }
  }

  return (
    <PageLayout>
      <div className="puzzle-container">
        <div className="puzzle-info">
          <div className="puzzle-message">
            <div className="x-text">{message}</div>
          </div>
          <button className="hint-button" onClick={toggleHint}>
            {showHint === 0 ? 'Show Hint' : showHint === 1 ? 'Show Next Step' : 'Hide Hint'}
          </button>
        </div>
        <div className="puzzle-board">
          <Chessboard
            position={game.fen()}
            boardWidth={boardSize}
            onPieceDrop={onDrop}
            boardOrientation={orientation}
            customSquareStyles={customSquareStyles}
          />
        </div>
      </div>
    </PageLayout>
  );
};

export default Puzzle; 