import { RouterProvider } from 'react-router-dom';
import { AppProvider } from './state/AppProvider';
import { AuthProvider } from './state/AuthProvider';
import { router }     from './routes';

export function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <RouterProvider router={router} />
      </AppProvider>
    </AuthProvider>
  );
}
