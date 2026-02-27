import { useState, useEffect } from 'react';
import Login from './components/Login';
import Onboarding from './components/Onboarding';
import Branding from './components/Branding';
import Profile from './components/Profile';

function App() {
  const [step, setStep] = useState('login'); // login, onboarding, branding, profile
  const [userData, setUserData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [userEmail, setUserEmail] = useState('');

  // 로컬 스토리지에서 이전 상태 복원
  useEffect(() => {
    const savedProfileId = localStorage.getItem('profileId');
    const savedEmail = localStorage.getItem('userEmail');
    if (savedProfileId && savedEmail) {
      setProfileData({ id: savedProfileId });
      setUserEmail(savedEmail);
      setStep('profile');
    }
  }, []);

  const handleLogin = (user) => {
    // 기존 사용자 - 프로필로 바로 이동
    setProfileData(user);
    setUserEmail(user.email);
    localStorage.setItem('profileId', user.id);
    localStorage.setItem('userEmail', user.email);
    setStep('profile');
  };

  const handleNewUser = (email) => {
    // 새 사용자 - 온보딩으로 이동
    setUserEmail(email);
    setStep('onboarding');
  };

  const handleOnboardingComplete = (data) => {
    const dataWithEmail = { ...data, email: userEmail };
    setUserData(dataWithEmail);
    setStep('branding');
  };

  const handleBrandingComplete = (data) => {
    setProfileData(data);
    localStorage.setItem('profileId', data.id);
    localStorage.setItem('userEmail', data.email);
    setStep('profile');
  };

  const handleLogout = () => {
    localStorage.clear();
    setProfileData(null);
    setUserData(null);
    setUserEmail('');
    setStep('login');
  };

  const renderContent = () => {
    switch (step) {
      case 'login':
        return <Login onLogin={handleLogin} onNewUser={handleNewUser} />;
      case 'onboarding':
        return <Onboarding email={userEmail} onComplete={handleOnboardingComplete} />;
      case 'branding':
        return <Branding userData={userData} onComplete={handleBrandingComplete} />;
      case 'profile':
        return profileData ? <Profile userId={profileData.id} onLogout={handleLogout} /> : null;
      default:
        return <Login onLogin={handleLogin} onNewUser={handleNewUser} />;
    }
  };

  return (
    <div className="App">
      {renderContent()}
    </div>
  );
}

export default App;

