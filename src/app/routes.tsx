import { createHashRouter } from 'react-router-dom';
import { RootLayout }        from './components/RootLayout';
import { SchedulePage }      from './pages/SchedulePage';
import { FoodItemsPage }     from './pages/FoodItemsPage';
import { UpcomingEventsPage} from './pages/UpcomingEventsPage';
import { AnalysisPage }      from './pages/AnalysisPage';

export const router = createHashRouter([
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
