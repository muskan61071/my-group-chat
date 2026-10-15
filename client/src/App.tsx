import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Home } from './pages/Home';
import { Chat } from './pages/Chat';
import { GroupInfo } from './pages/GroupInfo';
import { GroupMedia } from './pages/GroupMedia';
import { Announcements } from './pages/Announcements';
import { Calls } from './pages/Calls';
import { Search } from './pages/Search';
import { Notifications } from './pages/Notifications';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { CreateGroupForm } from './components/groups/CreateGroupForm';
import { JoinGroupForm } from './components/groups/JoinGroupForm';
import { AppBrandingModal } from './components/common/AppBrandingModal';

const secure = (node: React.ReactNode) => <ProtectedRoute>{node}</ProtectedRoute>;

export default function App() {
  const [showBrandingModal, setShowBrandingModal] = useState(false);
  const [isFirstInstall, setIsFirstInstall] = useState(false);

  useEffect(() => {
    // Check if user has performed initial branding setup
    const isDone = localStorage.getItem('chat_branding_setup_done') || localStorage.getItem('hivetalk_branding_setup_done');
    if (!isDone) {
      setIsFirstInstall(true);
      setShowBrandingModal(true);
    }

    // Global event listener to easily open branding modal from anywhere
    const handleOpenModal = () => {
      setIsFirstInstall(false);
      setShowBrandingModal(true);
    };

    window.addEventListener('open_app_branding_modal', handleOpenModal);
    return () => {
      window.removeEventListener('open_app_branding_modal', handleOpenModal);
    };
  }, []);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/" element={secure(<Home />)} />
        <Route path="/groups/new" element={secure(<CreateGroupForm />)} />
        <Route path="/groups/join" element={secure(<JoinGroupForm />)} />
        <Route path="/join" element={secure(<JoinGroupForm />)} />
        <Route path="/join/:inviteCode" element={secure(<JoinGroupForm />)} />
        <Route path="/chat/:groupId" element={secure(<Chat />)} />
        <Route path="/groups/:groupId" element={secure(<GroupInfo />)} />
        <Route path="/groups/:groupId/announcements" element={secure(<Announcements />)} />
        <Route path="/groups/:groupId/media" element={secure(<GroupMedia />)} />
        <Route path="/calls" element={secure(<Calls />)} />
        <Route path="/search" element={secure(<Search />)} />
        <Route path="/notifications" element={secure(<Notifications />)} />
        <Route path="/profile" element={secure(<Profile />)} />
        <Route path="/settings" element={secure(<Settings />)} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <AppBrandingModal
        isOpen={showBrandingModal}
        onClose={() => setShowBrandingModal(false)}
        isFirstInstall={isFirstInstall}
      />
    </BrowserRouter>
  );
}
