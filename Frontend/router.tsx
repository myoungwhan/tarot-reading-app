import React from 'react';
import { createBrowserRouter, RouterProvider, RouteObject, Navigate, Outlet } from 'react-router-dom';
import AdminPanelLayout from './pages/AdminPanelLayout';
import App from './App'; // main layout or dashboard
import AdminHome from './pages/AdminHome';
import Cards from './pages/Cards';
import ChangePassword from './pages/ChangePassword';
import AdminLogin from './pages/AdminLogin';
// import DeckDetails from './pages/DeckDetails'; // page to manage individual decks


// ProtectedRoute component
const ProtectedRoute: React.FC = () => {
  const isAuthenticated = Boolean(localStorage.getItem('adminUser'));
  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

const routes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
  },
  {
    path:"/admin/login",
    element: <AdminLogin />, // Admin login page
  },
  {
    path: '/admin',
    element: <ProtectedRoute />, // Protect all /admin routes
    children: [
      {
        element: <AdminPanelLayout />,
        children: [
          {
            index: true,
            element: <AdminHome />,
          },
          {
            path: ":deck_id",
            element: <Cards />,
          },
          {
            path: "change-password",
            element: <ChangePassword />,
          },
        ],
      },
    ],
  },
];

// Create router instance
const router = createBrowserRouter(routes);

// Export as a wrapper component
const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;