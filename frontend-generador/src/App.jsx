import React from 'react';
import ArticleForm from './components/ArticleForm';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  return (
    <div className="page-container">
      <Navbar />

      <div className="layout">
        <div className="side-column" />
        <main className="main-content">
          <div className="App">
            <ArticleForm />
          </div>
        </main>
        <div className="side-column" />
      </div>
    </div>
  );
}

export default App;
