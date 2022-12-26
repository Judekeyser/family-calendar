import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(
  <App />
);

window.addEventListener('load', () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(() => {
      console.log('Service worker registered!');
    }).catch((error) => {
      console.warn('Error registering service worker:');
      console.warn(error);
    });
  } else {
    console.warn('Navigator not supporting service worker')
  }
});