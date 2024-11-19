import React from 'react';
import ReactDOM from 'react-dom/client'; // Use 'react-dom/client' for React 18
import './index.css';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css'; // Importing Bootstrap styles

// Create a root element using createRoot
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the App inside the root element
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
