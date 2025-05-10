import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
//import React from 'react/jsx-runtime';

//import { AppRegistry } from 'react-native';

//import { name as appName } from './app.json';

//AppRegistry.registerComponent(appName, () => App);


const root = ReactDOM.createRoot(document.getElementById('root')as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
