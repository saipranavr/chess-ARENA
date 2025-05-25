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
  const [lastMove, setLastMove] = useState<{ from: string; to: string; isWrong?: boolean } | null>(null);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [canUndo, setCanUndo] = useState(false);

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
      setLastMove(null);
      setSelectedSquare(null);
      setCanUndo(false);
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
          setLastMove({ ...move, isWrong: false });
          setCanUndo(false);

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
              setLastMove({ ...opponentMove, isWrong: false });

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
          setMessage('Incorrect move. Click undo to try again!');
          setLastMove({ ...move, isWrong: true });
          setCanUndo(true);
          return true;
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

  const onSquareClick = (square: string) => {
    setSelectedSquare(square);
  };

  const handleUndo = () => {
    if (game && canUndo) {
      game.undo();
      setGame(new Chess(game.fen()));
      setLastMove(null);
      setMessage(puzzle?.description || '');
      setCanUndo(false);
    }
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
    const highlightColor = lastMove.isWrong ? 'rgba(255, 0, 0, 0.4)' : 'rgba(255, 255, 0, 0.4)';
    customSquareStyles[lastMove.from] = {
      backgroundColor: highlightColor,
    };
    customSquareStyles[lastMove.to] = {
      backgroundColor: highlightColor,
    };
  }
  
  if (selectedSquare) {
    customSquareStyles[selectedSquare] = {
      backgroundColor: 'rgba(255, 255, 0, 0.4)',
    };
  }

  return (
    <PageLayout>
      <div className="puzzle-container">
        <div className="puzzle-info">
          <div className="puzzle-message">
            <div className="x-text">{message}</div>
          </div>
          <button 
            className={`undo-button ${!canUndo ? 'disabled' : ''}`} 
            onClick={handleUndo}
            disabled={!canUndo}
          >
            Undo Move
          </button>
        </div>
        <div className="puzzle-board">
          <Chessboard
            position={game.fen()}
            boardWidth={boardSize}
            onPieceDrop={onDrop}
            onSquareClick={onSquareClick}
            boardOrientation={orientation}
            customSquareStyles={customSquareStyles}
          />
        </div>
      </div>
    </PageLayout>
  );
};

export default Puzzle; 