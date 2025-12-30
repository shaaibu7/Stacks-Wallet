
import { createBrowserRouter } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import { AdminPage } from './pages/AdminPage'
import { PlatformAdminDashboard } from './components/platform-admin/PlatformAdminDashboard'

export const router = createBrowserRouter([
    {
        path: '/',
        element: <MainLayout />,
        children: [
            {
                path: '/',
                element: <Home />,
            },
            {
                path: '/dashboard',
                element: <Dashboard />,
            },
            {
                path: '/admin',
                element: <AdminPage />,
            },
            {
                path: '/platform-admin',
                element: <PlatformAdminDashboard />,
            },
        ],
    },
])
