import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoadingFetchLoader from './components/LoadingFetchLoader';
import Index from './pages/services/Index';

const AuthRoute = lazy(() => import('@/layouts/AuthRoute'));
const DefaultLayout = lazy(() => import('@/layouts/DefaultLayout')); 
const AuthLogin = lazy(() => import('@/pages/authentication/Index'));

const App: React.FC = () => {
    const isAuthenticated = true;

    return (
        <Router basename="/apps">
            <Suspense fallback={<LoadingFetchLoader />}>
            
                <Routes>
                    {/* Base URL exact match redirects to login */}
                <Route path="/" element={<Navigate to="/login" replace />} />


                    {/* Public routes */}
                    <Route path="/login" element={<AuthLogin />} />
                    <Route path="/services" element={<Index />} />

                    {/* Auth protected routes */}
                    <Route
                        path="/*"
                        element={
                            <AuthRoute isAuthenticated={isAuthenticated}>
                                <DefaultLayout />
                            </AuthRoute>
                        }
                    />
                </Routes>
            </Suspense>
        </Router>
    );
};

export default App;
