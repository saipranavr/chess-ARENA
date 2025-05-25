import React, { ReactNode } from 'react';
import './PageLayout.css';

interface PageLayoutProps {
  children: ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  return (
    <div className="page-bg">
      <header className="page-header">
        <span className="page-title">Chess Arena</span>
      </header>
      <main className="page-main">
        <div className="page-card">
          {children}
        </div>
      </main>
    </div>
  );
};

export default PageLayout; 