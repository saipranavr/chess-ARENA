# Chess Arena - Daily Chess Puzzles

A modern, responsive chess puzzle platform built with React and Node.js, featuring a sleek X-style dark theme interface.

## Features

- Daily rotating chess puzzles
- Responsive chessboard that adapts to any screen size
- Clean, modern X-style dark theme UI
- Real-time puzzle loading and display

## Tech Stack

- **Frontend:**
  - React with TypeScript
  - react-chessboard for chess visualization
  - React Query for data fetching
  - Modern CSS with responsive design

- **Backend:**
  - Node.js with Express
  - TypeScript
  - JSON-based puzzle storage

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd chess-arena
```

2. Install backend dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
cd ..
```

## Launch Process

1. Start the backend server:
```bash
# From the root directory
npm run dev:backend
```
The backend server will start on http://localhost:3005

2. In a new terminal, start the frontend development server:
```bash
# From the root directory
npm run dev:frontend
```
The frontend application will start on http://localhost:3000

3. Open your browser and navigate to http://localhost:3000

## Development

- Backend API endpoint: `GET /api/puzzle/current`
- Frontend entry point: `frontend/src/App.tsx`
- Chess puzzle component: `frontend/src/components/Puzzle.tsx`

## Project Structure

```
chess-arena/
├── src/
│   └── backend/
│       ├── data/
│       │   └── puzzles.json
│       └── server.ts
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Puzzle.tsx
│   │   │   └── Puzzle.css
│   │   ├── types/
│   │   │   └── puzzle.ts
│   │   ├── App.tsx
│   │   └── App.css
│   └── package.json
├── package.json
└── tsconfig.json
```

## Available Scripts

- `npm run dev:backend` - Start backend development server
- `npm run dev:frontend` - Start frontend development server
- `npm run build` - Build the TypeScript backend
- `npm start` - Start the production backend server
- `npm run install:all` - Install all dependencies (both frontend and backend)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License. 