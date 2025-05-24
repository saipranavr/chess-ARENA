import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Puzzle from './components/Puzzle';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <header className="App-header">
          <h1>Arena Social Chess Puzzles</h1>
        </header>
        <main>
          <Puzzle />
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;
