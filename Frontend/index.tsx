
import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from './router';
import { Provider } from 'react-redux';
import { store } from './store';


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <AppRouter/>
    </Provider>
  </React.StrictMode>
);