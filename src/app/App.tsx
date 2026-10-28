import { RouterProvider } from 'react-router-dom';
import { AppProvider } from './state/AppProvider';
import { router }     from './routes';

export function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  );
}
