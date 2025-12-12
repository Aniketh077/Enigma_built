import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, X, Bell, User, LogOut, Settings, HelpCircle, ChevronLeft, ChevronRight,
  Home, FileText, CheckCircle, Mail, BarChart3,
  Factory, PlusCircle, Star, DollarSign, MessageSquare
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LoginModal from '../auth/LoginModal';

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Load from localStorage or default to true
    const saved = localStorage.getItem('sidebarOpen');
    return saved !== null ? saved === 'true' : true;
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarOpen', sidebarOpen.toString());
  }, [sidebarOpen]);

  // If not authenticated, show login modal
  if (!isAuthenticated) {
    return (
      <>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <img 
                src="/indianet png.png" 
                alt="Enigma Logo" 
                className="h-16 w-auto object-contain"
              />
            </div>
            <p className="text-gray-600 mb-6">Please login to access your dashboard</p>
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-6 py-2 rounded-lg text-white font-medium"
              style={{ backgroundColor: '#4881F8' }}
            >
              Login
            </button>
          </div>
        </div>
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSuccess={() => navigate('/dashboard')}
        />
      </>
    );
  }

  const userType = user?.userType || 'BUYER';
  const isManufacturer = userType === 'MANUFACTURER' || userType === 'HYBRID';
  const isBuyer = userType === 'BUYER' || userType === 'HYBRID';

  const commonMenuItems = [
    { icon: Home, label: 'My Feed', path: '/dashboard' },
    { icon: User, label: 'My Profile', path: '/profile' }
  ];

  const manufacturerMenuItems = [
    { icon: FileText, label: "RFQ's Pool", path: '/rfqs-pool' },
    { icon: CheckCircle, label: "Accepted RFQ's", path: '/accepted-rfqs' },
    { icon: Mail, label: 'Your Invitations', path: '/invitations' },
    { icon: BarChart3, label: 'Analytics Dashboard', path: '/analytics' }
  ];

  const buyerMenuItems = [
    { icon: Factory, label: "Manufacturer's Pool", path: '/manufacturers-pool' },
    { icon: PlusCircle, label: 'Start Your RFQ', path: '/start-rfq' },
    { icon: FileText, label: "My RFQ's", path: '/my-rfqs' },
    { icon: Star, label: 'My Manufacturers', path: '/my-manufacturers' }
  ];

  const supportMenuItems = [
    { icon: DollarSign, label: 'Pricing', path: '/pricing' },
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: HelpCircle, label: 'Help', path: '/help' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-white flex overflow-hidden" style={{ height: '100vh' }}>
      {/* Sidebar */}
      <aside
        className={`
          fixed md:fixed inset-y-0 left-0 z-40
          bg-black text-white
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'w-64' : 'w-20'}
          ${isMobile ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : ''}
        `}
        style={{ height: '100vh' }}
      >
        <div className="h-full flex flex-col overflow-hidden">
          {/* Logo Header */}
          <div className="p-4 border-b border-gray-800 flex items-center justify-between min-h-[64px] flex-shrink-0">
            <button
              onClick={toggleSidebar}
              className="flex items-center justify-center w-full hover:bg-gray-800 rounded-lg p-2 transition-colors group"
              title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {sidebarOpen ? (
                <div className="flex items-center justify-between w-full gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <img 
                      src="/indianet png.png" 
                      alt="Enigma Logo" 
                      className="h-8 w-auto object-contain flex-shrink-0"
                    />
                    <span className="text-lg font-bold whitespace-nowrap" style={{ color: '#4881F8' }}>
                      Enigma
                    </span>
                  </div>
                  <ChevronLeft 
                    size={20} 
                    className="text-gray-400 group-hover:text-[#4881F8] transition-colors flex-shrink-0" 
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center w-full">
                  <img 
                    src="/indianet png.png" 
                    alt="Enigma Logo" 
                    className="h-8 w-auto object-contain mb-2"
                  />
                  <ChevronRight 
                    size={16} 
                    className="text-gray-400 group-hover:text-[#4881F8] transition-colors" 
                  />
                </div>
              )}
            </button>
          </div>

          {/* Menu Items - Scrollable */}
          <nav className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-6 scrollbar-thin" style={{ maxHeight: 'calc(100vh - 64px)' }}>
            {/* Common Section */}
            <div>
              {sidebarOpen && (
                <p className="text-xs uppercase text-gray-500 mb-3 px-2 whitespace-nowrap">COMMON</p>
              )}
              {!sidebarOpen && (
                <div className="h-4"></div>
              )}
              <div className="space-y-1">
                {commonMenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`
                        flex items-center ${sidebarOpen ? 'px-3' : 'px-2 justify-center'} py-2 rounded-lg transition-colors group
                        ${isActive(item.path)
                          ? 'bg-[#4881F8] text-white'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        }
                      `}
                      title={!sidebarOpen ? item.label : ''}
                    >
                      <Icon size={20} className={sidebarOpen ? 'mr-3 flex-shrink-0' : 'flex-shrink-0'} />
                      {sidebarOpen && <span className="text-sm whitespace-nowrap">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* For Manufacturers Section */}
            {isManufacturer && (
              <div>
                {sidebarOpen && (
                  <p className="text-xs uppercase text-gray-500 mb-3 px-2 whitespace-nowrap">FOR MANUFACTURERS</p>
                )}
                {!sidebarOpen && (
                  <div className="h-4"></div>
                )}
                <div className="space-y-1">
                  {manufacturerMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`
                          flex items-center ${sidebarOpen ? 'px-3' : 'px-2 justify-center'} py-2 rounded-lg transition-colors group
                          ${isActive(item.path)
                            ? 'bg-[#4881F8] text-white'
                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                          }
                        `}
                        title={!sidebarOpen ? item.label : ''}
                      >
                        <Icon size={20} className={sidebarOpen ? 'mr-3 flex-shrink-0' : 'flex-shrink-0'} />
                        {sidebarOpen && <span className="text-sm whitespace-nowrap">{item.label}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* For Buyers Section */}
            {isBuyer && (
              <div>
                {sidebarOpen && (
                  <p className="text-xs uppercase text-gray-500 mb-3 px-2 whitespace-nowrap">FOR BUYERS</p>
                )}
                {!sidebarOpen && (
                  <div className="h-4"></div>
                )}
                <div className="space-y-1">
                  {buyerMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`
                          flex items-center ${sidebarOpen ? 'px-3' : 'px-2 justify-center'} py-2 rounded-lg transition-colors group
                          ${isActive(item.path)
                            ? 'bg-[#4881F8] text-white'
                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                          }
                        `}
                        title={!sidebarOpen ? item.label : ''}
                      >
                        <Icon size={20} className={sidebarOpen ? 'mr-3 flex-shrink-0' : 'flex-shrink-0'} />
                        {sidebarOpen && <span className="text-sm whitespace-nowrap">{item.label}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Support Section */}
            <div>
              {sidebarOpen && (
                <p className="text-xs uppercase text-gray-500 mb-3 px-2 whitespace-nowrap">SUPPORT</p>
              )}
              {!sidebarOpen && (
                <div className="h-4"></div>
              )}
              <div className="space-y-1">
                {supportMenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`
                        flex items-center ${sidebarOpen ? 'px-3' : 'px-2 justify-center'} py-2 rounded-lg transition-colors group
                        ${isActive(item.path)
                          ? 'bg-[#4881F8] text-white'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        }
                      `}
                      title={!sidebarOpen ? item.label : ''}
                    >
                      <Icon size={20} className={sidebarOpen ? 'mr-3 flex-shrink-0' : 'flex-shrink-0'} />
                      {sidebarOpen && <span className="text-sm whitespace-nowrap">{item.label}</span>}
                    </Link>
                  );
                })}
                <button
                  onClick={handleLogout}
                  className={`w-full flex items-center ${sidebarOpen ? 'px-3' : 'px-2 justify-center'} py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors group`}
                  title={!sidebarOpen ? 'Logout' : ''}
                >
                  <LogOut size={20} className={sidebarOpen ? 'mr-3 flex-shrink-0' : 'flex-shrink-0'} />
                  {sidebarOpen && <span className="text-sm whitespace-nowrap">Logout</span>}
                </button>
              </div>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div 
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isMobile 
            ? 'ml-0' 
            : sidebarOpen 
              ? 'md:ml-64' 
              : 'md:ml-20'
        }`}
        style={{ height: '100vh', overflow: 'hidden' }}
      >
        {/* Top Navbar */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-6 flex-shrink-0 z-30">
          <button
            onClick={toggleSidebar}
            className="text-gray-600 hover:text-[#4881F8] transition-colors"
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
          </button>

          <div className="flex-1" />

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative text-gray-600 hover:text-[#4881F8] transition-colors">
              <Bell size={24} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 text-gray-700 hover:text-[#4881F8] transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#4881F8] flex items-center justify-center text-white font-semibold">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                {!isMobile && (
                  <span className="font-medium">{user?.fullName || 'User'}</span>
                )}
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    My Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content - Scrollable */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-white p-4 md:p-6 scrollbar-thin" style={{ maxHeight: 'calc(100vh - 64px)' }}>
          {children}
        </main>
      </div>

      {/* Click outside to close profile menu */}
      {showProfileMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowProfileMenu(false)}
        />
      )}

      {/* Mobile overlay when sidebar is open */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};

export default DashboardLayout;

