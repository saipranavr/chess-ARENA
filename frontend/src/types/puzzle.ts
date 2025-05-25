export interface Puzzle {
  puzzleId: string;
  initialFEN: string;
  solutionPath: string[];
  difficulty: string;
  description: string;
}

export interface PuzzleState extends Puzzle {
  currentMoveIndex: number;
  isComplete: boolean;
  lastMove?: {
    from: string;
    to: string;
  };
} 