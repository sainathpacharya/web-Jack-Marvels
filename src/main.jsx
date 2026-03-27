import React from 'react';
import ReactDOM from 'react-dom/client';
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import App from './App.jsx';
import './index.css';
import store from './store';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { NotificationProvider } from './components/notifications/NotificationProvider';
import { QUERY_GC } from './lib/queryConfig';
import { createMutationLogger } from './hooks/useMutationLogger';
import { logDevErrorIntelligence } from './lib/observability';

const mutationLogger = createMutationLogger();
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error('[react-query query error]', {
          key: query?.queryKey,
          message: error?.message || 'Unknown query error',
        });
        logDevErrorIntelligence();
      }
    },
  }),
  mutationCache: new MutationCache({
    ...mutationLogger,
  }),
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,
      gcTime: QUERY_GC.default,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <NotificationProvider>
          <App />
        </NotificationProvider>
        {import.meta.env.DEV ? <ReactQueryDevtools initialIsOpen={false} /> : null}
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
);
