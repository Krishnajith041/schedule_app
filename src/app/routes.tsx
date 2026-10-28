import { createBrowserRouter } from 'react-router-dom';
import { RootLayout }        from './components/RootLayout';
import { SchedulePage }      from './pages/SchedulePage';
import { FoodItemsPage }     from './pages/FoodItemsPage';
import { UpcomingEventsPage} from './pages/UpcomingEventsPage';
import { AnalysisPage }      from './pages/AnalysisPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true,        element: <SchedulePage /> },
      { path: 'food',       element: <FoodItemsPage /> },
      { path: 'upcoming',   element: <UpcomingEventsPage /> },
      { path: 'analysis',   element: <AnalysisPage /> },
    ],
  },
]);
