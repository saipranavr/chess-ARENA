import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Puzzle from './components/Puzzle';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <Puzzle />
      </div>
    </QueryClientProvider>
  );
}

export default App;
