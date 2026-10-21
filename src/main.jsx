import React, { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LearningProvider } from './context/LearningContext';
import { AppLayout } from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { Loading } from './components/UI';
import './index.css';

const Home = lazy(() => import('./pages/Home'));
const Courses = lazy(() => import('./pages/Courses'));
const CourseDetail = lazy(() => import('./pages/CourseDetail'));
const LearningOverview = lazy(() => import('./pages/Learning'));
const LearningLayout = lazy(() => import('./pages/Learning').then(m => ({ default: m.LearningLayout })));
const Materials = lazy(() => import('./pages/Learning').then(m => ({ default: m.Materials })));
const Progress = lazy(() => import('./pages/Learning').then(m => ({ default: m.Progress })));
const Quiz = lazy(() => import('./pages/Quiz'));
const Assignment = lazy(() => import('./pages/Assignment'));
const Certificate = lazy(() => import('./pages/Certificate'));
const Login = lazy(() => import('./pages/Login'));
const Profile = lazy(() => import('./pages/Profile'));
function Protected({ children }) { return <ProtectedRoute>{children}</ProtectedRoute>; }

createRoot(document.getElementById('root')).render(
  <React.StrictMode><ErrorBoundary><BrowserRouter basename={import.meta.env.BASE_URL} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><AuthProvider><LearningProvider>
    <Suspense fallback={<main className="page"><Loading text="Loading learning module…" /></main>}>
      <Routes><Route element={<AppLayout />}>
        <Route path="/" element={<Home />} /><Route path="/courses" element={<Courses />} />
        <Route path="/course/:id" element={<CourseDetail />} /><Route path="/login" element={<Login />} />
        <Route path="/learning" element={<Protected><LearningLayout /></Protected>}>
          <Route index element={<LearningOverview />} /><Route path="materials" element={<Materials />} />
          <Route path="progress" element={<Progress />} /><Route path="quiz" element={<Quiz />} />
          <Route path="assignments" element={<Assignment />} /><Route path="certificate" element={<Certificate />} />
        </Route>
        <Route path="/quiz" element={<Protected><Quiz /></Protected>} />
        <Route path="/assignments" element={<Protected><Assignment /></Protected>} />
        <Route path="/certificate" element={<Protected><Certificate /></Protected>} />
        <Route path="/profile" element={<Protected><Profile /></Protected>} />
        <Route path="*" element={<main className="page"><h1>Page not found</h1><a className="btn primary" href="/">Return home</a></main>} />
      </Route></Routes>
    </Suspense>
  </LearningProvider></AuthProvider></BrowserRouter></ErrorBoundary></React.StrictMode>
);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {}));
}
