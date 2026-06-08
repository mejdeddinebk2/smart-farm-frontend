import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import WateringPage from './pages/WateringPage';
import FeedingPage from './pages/FeedingPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import AboutUsSection from './components/AboutUsSection';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import ServicesSection from './components/ServicesSection';
import TopSection from './components/TopSection';
import Login from './pages/Login';
import SignOut from './components/SignOut';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import FarmPage from './pages/FarmPage';
import Products from './pages/Products';
import CareTipArticlePage from './pages/CareTipArticlePage';
import CareTips from './pages/CareTips';
import MyAnimals from './pages/AnimalPage';
import MyPlantes from './pages/PlantPage';
import Dashboard from './pages/Dashboard';
import Sidebar from './components/Sidebar';
import Notifications from './pages/Notifications';
import AIPlantDetection from './pages/AIPlantDetection';
import AIAnimalDetection from './pages/AIAnimalDetection';
import AIDetectionHub from './pages/AIDetectionHub';
import PlotlyTest from './pages/PlotlyTest';
import axios from 'axios';
import CreateFarm from './pages/CreateFarm';
import GlobalChatbot from './components/GlobalChatbot';

// ✅ NEW IMPORTS - Settings, Profile, Help
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Help from './pages/Help';
import DetectionHistoryPage from './pages/DetectionHistory';


function AppLayout({ isLoggedIn, userDetails, isAdmin, setIsLoggedIn, fetchUserDetails }) {
  const location = useLocation();
  const hideSidebarPaths = ['/create-farm', '/register', '/login', '/reset-password'];
  const hideSidebar = hideSidebarPaths.includes(location.pathname);
  
  return (
    <div className='app-container w-full min-h-svh bg-white flex'>
      {isLoggedIn && !hideSidebar && (
        <Sidebar
          setIsLoggedIn={setIsLoggedIn}
          username={userDetails.username}
          email={userDetails.email}
          isAdmin={isAdmin}
        />
      )}
      <div className='content-container flex-1'>
        {!isLoggedIn && <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />}
        <Routes>
          {/* ══════════════════════════════════════════════════════════════
              MAIN DASHBOARD & FARM ROUTES
              ══════════════════════════════════════════════════════════════ */}
          <Route
            path="/dashboard"
            element={isLoggedIn ? <Dashboard /> : <Login setIsLoggedIn={setIsLoggedIn} fetchUserDetails={fetchUserDetails} />}
          />
          
          {/* ══════════════════════════════════════════════════════════════
              ✅ NEW ROUTES - SETTINGS, PROFILE, HELP
              ══════════════════════════════════════════════════════════════ */}
          <Route
            path="/settings"
            element={isLoggedIn ? <Settings /> : <Login setIsLoggedIn={setIsLoggedIn} fetchUserDetails={fetchUserDetails} />}
          />
          <Route
            path="/profile"
            element={isLoggedIn ? <Profile /> : <Login setIsLoggedIn={setIsLoggedIn} fetchUserDetails={fetchUserDetails} />}
          />
          <Route
            path="/help"
            element={isLoggedIn ? <Help /> : <Login setIsLoggedIn={setIsLoggedIn} fetchUserDetails={fetchUserDetails} />}
          />
          
          {/* ══════════════════════════════════════════════════════════════
              ANIMALS & PLANTS ROUTES
              ══════════════════════════════════════════════════════════════ */}
          <Route
            path="/my-animals"
            element={isLoggedIn ? <MyAnimals /> : <Login setIsLoggedIn={setIsLoggedIn} fetchUserDetails={fetchUserDetails} />}
          />
          <Route
            path="/my-plantes"
            element={isLoggedIn ? <MyPlantes /> : <Login setIsLoggedIn={setIsLoggedIn} fetchUserDetails={fetchUserDetails} />}
          />
          <Route
            path="/my-plants"
            element={isLoggedIn ? <MyPlantes /> : <Login setIsLoggedIn={setIsLoggedIn} fetchUserDetails={fetchUserDetails} />}
          />
          
          {/* ══════════════════════════════════════════════════════════════
              HOME & PUBLIC ROUTES
              ══════════════════════════════════════════════════════════════ */}
          <Route
            path="/"
            element={
              <>
                <TopSection />
                <AboutUsSection />
                <ServicesSection />
              </>
            }
          />
          <Route path="/services" element={<ServicesSection />} />
          <Route path="/about" element={<AboutUsSection />} />
          
          {/* ══════════════════════════════════════════════════════════════
              AUTH ROUTES
              ══════════════════════════════════════════════════════════════ */}
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} fetchUserDetails={fetchUserDetails} />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/signout" element={<SignOut setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/register" element={<Register setIsLoggedIn={setIsLoggedIn} fetchUserDetails={fetchUserDetails} />} />

          
          {/* ══════════════════════════════════════════════════════════════
              FARM MANAGEMENT ROUTES
              ══════════════════════════════════════════════════════════════ */}
          <Route path="/watering" element={<WateringPage />} />
          <Route path="/feeding" element={<FeedingPage />} />
          
          <Route
            path="/create-farm"
            element={isLoggedIn ? <CreateFarm setIsLoggedIn={setIsLoggedIn} /> : <Login setIsLoggedIn={setIsLoggedIn} fetchUserDetails={fetchUserDetails} />}
          />
          <Route
            path="/farm"
            element={isLoggedIn ? <FarmPage setIsLoggedIn={setIsLoggedIn} /> : <Login setIsLoggedIn={setIsLoggedIn} fetchUserDetails={fetchUserDetails} />}
          />
          
          {/* ══════════════════════════════════════════════════════════════
              PRODUCTS & CARE TIPS ROUTES
              ══════════════════════════════════════════════════════════════ */}
          <Route
            path="/products"
            element={isLoggedIn ? <Products /> : <Login setIsLoggedIn={setIsLoggedIn} fetchUserDetails={fetchUserDetails} />}
          />
          <Route
            path="/care-tips"
            element={isLoggedIn ? <CareTips /> : <Login setIsLoggedIn={setIsLoggedIn} fetchUserDetails={fetchUserDetails} />}
          />
          <Route
            path="/care-tips/:id"
            element={isLoggedIn ? <CareTipArticlePage /> : <Login setIsLoggedIn={setIsLoggedIn} fetchUserDetails={fetchUserDetails} />}
          />
          
          {/* ══════════════════════════════════════════════════════════════
              NOTIFICATIONS ROUTE
              ══════════════════════════════════════════════════════════════ */}
          <Route
            path="/notifications"
            element={isLoggedIn ? <Notifications /> : <Login setIsLoggedIn={setIsLoggedIn} fetchUserDetails={fetchUserDetails} />}
          />
          
          {/* ══════════════════════════════════════════════════════════════
              AI DETECTION ROUTES
              ══════════════════════════════════════════════════════════════ */}
          <Route
            path="/ai-plant-detection"
            element={isLoggedIn ? <AIPlantDetection /> : <Login setIsLoggedIn={setIsLoggedIn} fetchUserDetails={fetchUserDetails} />}
          />
          <Route
            path="/ai-animal-detection"
            element={isLoggedIn ? <AIAnimalDetection /> : <Login setIsLoggedIn={setIsLoggedIn} fetchUserDetails={fetchUserDetails} />}
          />
          <Route
            path="/ai-detection"
            element={isLoggedIn ? <AIDetectionHub /> : <Login setIsLoggedIn={setIsLoggedIn} fetchUserDetails={fetchUserDetails} />}
          />
          <Route
            path="/detection-history"
            element={isLoggedIn ? <DetectionHistoryPage /> : <Login setIsLoggedIn={setIsLoggedIn} fetchUserDetails={fetchUserDetails} />}
          />
          <Route
            path="/ai-farms"
            element={<Navigate to="/ai-detection" replace />}
          />
          
          {/* ══════════════════════════════════════════════════════════════
              TEST & UTILITY ROUTES
              ══════════════════════════════════════════════════════════════ */}
          <Route
            path="/plotly-test"
            element={<PlotlyTest />}
          />
          
          {/* ══════════════════════════════════════════════════════════════
              CATCH-ALL ROUTE - Redirect unknown paths
              ══════════════════════════════════════════════════════════════ */}
          <Route
            path="*"
            element={<Navigate to={isLoggedIn ? "/dashboard" : "/"} replace />}
          />
        </Routes>
        {!isLoggedIn && <Footer />}
      </div>
      
      {/* Global AI Chatbot - appears on all pages when logged in */}
      {isLoggedIn && <GlobalChatbot />}
    </div>
    
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userDetails, setUserDetails] = useState({ username: '', email: '', roles: [] });

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log("App.jsx: Token from localStorage on load:", token);
    if (token) {
      setIsLoggedIn(true);
      fetchUserDetails(token);
    }
  }, []);

  const fetchUserDetails = async (token) => {
    try {
      const response = await axios.get('http://localhost:8080/auth/user', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUserDetails({
        username: response.data.username || 'User',
        email: response.data.email || '',
        roles: response.data.roles || [],
      });
    } catch (err) {
      console.error('Failed to fetch user details:', err);
      try {
        console.error('Backend status:', err?.response?.status);
        console.error('Backend response body:', err?.response?.data);
        console.error('Request sent (headers/config):', err?.config);
      } catch (e) { /* ignore */ }
      // Clear auth state on failure
      localStorage.removeItem('token');
      setIsLoggedIn(false);
      setUserDetails({ username: '', email: '', roles: [] });
    }
  };

  const isAdmin = userDetails.roles.includes('ADMIN');

  return (
    <Router>
      <AppLayout
        isLoggedIn={isLoggedIn}
        userDetails={userDetails}
        isAdmin={isAdmin}
        setIsLoggedIn={setIsLoggedIn}
        fetchUserDetails={fetchUserDetails}
      />
      <ToastContainer />
    </Router>
  );
  useEffect(() => {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') document.documentElement.classList.add('dark');
}, []);
}

export default App;