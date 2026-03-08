import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, ProtectedRoute } from './components';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import NewTrip from './pages/NewTrip';
import TripDetail from './pages/TripDetail/index';
import SharedPage from './pages/SharedPage.tsx';
import ArchivedPage from './pages/ArchivedPage.tsx';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route element={<Layout />}>
          <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="shared" element={<ProtectedRoute><SharedPage /></ProtectedRoute>} />
          <Route path="archived" element={<ProtectedRoute><ArchivedPage /></ProtectedRoute>} />
          <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="trips/new" element={<ProtectedRoute><NewTrip /></ProtectedRoute>} />
          <Route path="trips/:id" element={<ProtectedRoute><TripDetail /></ProtectedRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
