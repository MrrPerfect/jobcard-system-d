import React from 'react';
import NavBar from './NavBar.jsx';
import '../styles.css';

export default function Layout({ children }){
  return (
    <div className="app">
      <NavBar />
      <div>{children}</div>
      <div className="footer">PSG — Job Card demo</div>
    </div>
  );
}