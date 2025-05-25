import React from 'react';
import './Leaderboard.css';

interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  puzzlesCompleted: number;
}

const fakeLeaderboardData: LeaderboardEntry[] = [
  { rank: 1, username: "ChessMaster", score: 2500, puzzlesCompleted: 150 },
  { rank: 2, username: "GrandMaster", score: 2450, puzzlesCompleted: 145 },
  { rank: 3, username: "TacticsKing", score: 2400, puzzlesCompleted: 140 },
  { rank: 4, username: "CheckmateQueen", score: 2350, puzzlesCompleted: 135 },
  { rank: 5, username: "PawnStorm", score: 2300, puzzlesCompleted: 130 },
  { rank: 6, username: "KnightRider", score: 2250, puzzlesCompleted: 125 },
  { rank: 7, username: "BishopPower", score: 2200, puzzlesCompleted: 120 },
  { rank: 8, username: "RookMaster", score: 2150, puzzlesCompleted: 115 },
  { rank: 9, username: "CastleKing", score: 2100, puzzlesCompleted: 110 },
  { rank: 10, username: "EndgameWizard", score: 2050, puzzlesCompleted: 105 },
];

const Leaderboard: React.FC = () => {
  return (
    <div className="leaderboard-container">
      <h1 className="leaderboard-title">Chess Arena Leaderboard</h1>
      <div className="leaderboard-table">
        <div className="leaderboard-header">
          <div className="header-cell rank">Rank</div>
          <div className="header-cell username">Username</div>
          <div className="header-cell score">Score</div>
          <div className="header-cell puzzles">Puzzles Completed</div>
        </div>
        {fakeLeaderboardData.map((entry) => (
          <div key={entry.rank} className="leaderboard-row">
            <div className="cell rank">{entry.rank}</div>
            <div className="cell username">{entry.username}</div>
            <div className="cell score">{entry.score}</div>
            <div className="cell puzzles">{entry.puzzlesCompleted}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard; 