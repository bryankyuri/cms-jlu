import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppProvider } from "./context/AppContext";
import { QueryClient, QueryClientProvider } from 'react-query';
import App from './App';
import './styles/global.scss';
import NProgress from 'nprogress';
import './styles/nprogress-custom.css';

// Configure NProgress
NProgress.configure({ 
  showSpinner: false,
  easing: 'ease',
  speed: 500,
  minimum: 0.1,
  trickleSpeed: 200
});

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      onLoading: () => {
        NProgress.start();
      },
      onSuccess: () => {
        NProgress.done();
      },
      onError: () => {
        NProgress.done();
      },
    },
    mutations: {
      onLoading: () => {
        NProgress.start();
      },
      onSuccess: () => {
        NProgress.done();
      },
      onError: () => {
        NProgress.done();
      },
    },
  },
});

// Get the root element
const container = document.getElementById('app');
const root = createRoot(container);

// Render the app
root.render(
  <AppProvider>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </AppProvider>
);