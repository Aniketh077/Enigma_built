import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Package, ShoppingCart, Users, LogOut, Menu, X, ChevronRight, Mail, MessageSquare, ChartBar as BarChart3, Hop as Home, ChevronLeft, Calendar, User, DollarSign, Eye, Grid2x2 as Grid, Tag, Briefcase, Store } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchDashboardStats, fetchAllUsers } from '../../store/slices/adminSlice';
import AdminProducts from './AdminProducts/AdminProducts';
import AdminOrders from './AdminOrders/AdminMainOrders';
import AdminCustomers from './AdminCustomers';
import AdminNewsletter from './AdminNewsletter';
import AdminContactForm from './AdminContactForm/AdminContactForm';
import AdminCollections from './AdminCollections';
import AdminBrands from './AdminBrands';
import AdminServiceRequests from './AdminServiceRequests';
import AdminSellerRequests from './AdminSellerRequests';
import Button from '../../components/ui/Button';
import formatProductNames from  './AdminOrders/components/formatProductNames';


const AdminTab = {
  DASHBOARD: 'dashboard',
  PRODUCTS: 'products',
  COLLECTIONS: 'collections',
  BRANDS: 'brands',
  ORDERS: 'orders',
  CUSTOMERS: 'customers',
  SERVICES: 'services',
  SELLER_REQUESTS: 'seller-requests',
  NEWSLETTER: 'newsletter',
  CONTACT: 'contact',
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(AdminTab.DASHBOARD);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null); 
  const { user, logout, isAdmin, isInitialized } = useAuth();
  const { users } = useSelector(state => state.admin);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Check if screen is mobile
 useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    if (isInitialized && user && isAdmin) {
      dispatch(fetchDashboardStats());
      if (users.length === 0) {
        dispatch(fetchAllUsers());
      }
    }
  }, [user, isAdmin, isInitialized,dispatch, users.length]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMainWebsite = () => {
    navigate('/');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleViewDetails = (tabName, orderId = null) => {
    setActiveTab(tabName);
    if (tabName === AdminTab.ORDERS && orderId) {
      setSelectedOrderId(orderId);
    } else {
      setSelectedOrderId(null);
    }
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setSelectedOrderId(null); // Reset selected order when changing tab
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const menuItems = [
    { key: AdminTab.DASHBOARD, label: 'Dashboard', icon: BarChart3 },
    { key: AdminTab.PRODUCTS, label: 'Products', icon: Package },
    { key: AdminTab.COLLECTIONS, label: 'Collections', icon: Grid },
    { key: AdminTab.BRANDS, label: 'Brands', icon: Tag },
    { key: AdminTab.ORDERS, label: 'Orders', icon: ShoppingCart },
    { key: AdminTab.CUSTOMERS, label: 'Customers', icon: Users },
    { key: AdminTab.SERVICES, label: 'Service Requests', icon: Briefcase },
    { key: AdminTab.SELLER_REQUESTS, label: 'Seller Requests', icon: Store },
    { key: AdminTab.NEWSLETTER, label: 'Newsletter', icon: Mail },
    { key: AdminTab.CONTACT, label: 'Contact Forms', icon: MessageSquare },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case AdminTab.DASHBOARD:
        return <AdminDashboardContent onViewDetails={handleViewDetails} />;
      case AdminTab.PRODUCTS:
        return <AdminProducts />;
      case AdminTab.COLLECTIONS:
        return <AdminCollections />;
      case AdminTab.BRANDS:
        return <AdminBrands />;
      case AdminTab.ORDERS:
        return <AdminOrders initialOrderId={selectedOrderId} />;
      case AdminTab.CUSTOMERS:
        return <AdminCustomers />;
      case AdminTab.SERVICES:
        return <AdminServiceRequests />;
      case AdminTab.SELLER_REQUESTS:
        return <AdminSellerRequests />;
      case AdminTab.NEWSLETTER:
        return <AdminNewsletter />;
      case AdminTab.CONTACT:
        return <AdminContactForm />;
      default:
        return <AdminDashboardContent onViewDetails={handleViewDetails} />;
    }
  };

return (
    <div className="flex bg-gray-100 min-h-screen">
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={closeSidebar}
        />
      )}

      {/* Mobile sidebar toggle */}
          {!sidebarOpen && (
  <button
    onClick={toggleSidebar}
    className="fixed top-4 right-0  z-50 xl:hidden bg-green-600   text-white p-4  shadow-lg hover:bg-[#3D5980] transition-all duration-300 transform hover:scale-105"
  >
    <Menu size={22} />
  </button>
)}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-green-600 text-white transition-all duration-300 ease-in-out ${
          isMobile 
            ? `${sidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full'}`
            : `${sidebarOpen ? 'w-52' : 'w-16'} translate-x-0`
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-6 border-b border-[#3D5980]">
            <div className="flex items-center">
              
               {(!isMobile ) && (
                <span className="-ml-2 text font-bold">Admin</span>
              )}
              {( isMobile ) && (
                <>
                  <img 
                    src="/logo1.png" 
                    alt="EcoTrade Admin" 
                    className="h-8 w-32 rounded flex-shrink-0"
                  />
                  <span className="ml-2 text-lg font-bold">Admin</span>
                </>
              )}
            </div>
            {/* Close button for mobile */}
            {isMobile && sidebarOpen && (
              <button
                onClick={closeSidebar}
                className="p-1 rounded-md hover:bg-[#3D5980] transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Main Website Button */}
          <div className="px-2 py-4 border-b border-[#3D5980]">
            <button
              onClick={handleMainWebsite}
              className="flex items-center w-full px-3 py-3 rounded-md transition-colors text-gray-300 hover:bg-[#3D5980] hover:text-white"
              title="Main Website"
            >
              <Home className="h-5 w-5 flex-shrink-0" />
              {(sidebarOpen || isMobile) && (
                <span className="ml-3 text-sm font-medium">Main Website</span>
              )}
            </button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-2 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    onClick={() => handleTabChange(item.key)}
                    className={`flex items-center w-full px-3 py-3 rounded-md transition-colors group ${
                      activeTab === item.key
                        ? 'bg-[#3D5980] text-white'
                        : 'text-gray-300 hover:bg-[#3D5980] hover:text-white'
                    }`}
                    title={item.label}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {(sidebarOpen || isMobile) && (
                      <span className="ml-3 text-sm font-medium">{item.label}</span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* User section */}
          <div className="border-t border-[#3D5980] p-4">
            <div className="flex items-center justify-center mb-3">
              <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-semibold">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              {(sidebarOpen || isMobile) && (
                <div className="ml-3 min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{user?.name}</div>
                  <div className="text-xs text-gray-300 truncate">{user?.email}</div>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-full px-3 py-2 text-sm text-gray-300 rounded-md hover:bg-[#3D5980] hover:text-white transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              {(sidebarOpen || isMobile) && (
                <span className="ml-2">Sign out</span>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={`flex-1 transition-all duration-300 ${
        isMobile ? 'ml-0' : (sidebarOpen ? 'ml-52' : 'ml-16')
      }`}>
        <div className="p-3 lg:p-4 xl:p-6">
          <div className="rounded-lg bg-white shadow-sm">
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Desktop sidebar toggle */}
      {!isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 z-40 bg-green-600 text-white p-2 rounded-r-md transform -translate-y-1/2 transition-all duration-300 "
          style={{ left: sidebarOpen ? '12rem' : '3rem' }}
        >
          {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      )}
    </div>
  );
};

const AdminDashboardContent = ({ onViewDetails }) => {
  const { stats, loading: adminLoading } = useSelector(state => state.admin);
  // const { products, loading: productsLoading, bestSellers, bestSellersLoading } = useSelector(state => state.products);
  const recentOrders = stats?.recentOrders || [];


  
 const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
  };
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

 

  if (adminLoading || !stats) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (<div key={i} className="bg-gray-200 rounded-lg h-24"></div>))}
          </div>
        </div>
      </div>
    );
  }

  // Mobile Order Card Component
  const MobileOrderCard = ({ order }) => {
    const orderTotal = order.totalPrice || order.total || 0;
    const orderStatus = order.status || order.orderStatus || 'Pending';
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-3 hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-green-700 truncate">
              #{order.orderId || order._id?.slice(-8)}
            </h3>
            <p className="text-xs text-gray-500 truncate">
              {order.user?.name || order.shippingAddress?.fullName || 'N/A'}
            </p>
          </div>
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(orderStatus)}`}>
            {orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1)}
          </span>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="flex items-center space-x-2">
            <Package className="h-4 w-4 text-gray-400" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500">Items</p>
              <p className="text-sm font-medium">
                {order.items?.length || order.products?.length || 0} items
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-gray-400" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-sm font-semibold text-green-600">{formatCurrency(orderTotal)}</p>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-500">
              {new Date(order.createdAt).toLocaleDateString()}
            </span>
          </div>
          <button
            onClick={() => onViewDetails('orders', order._id)} // Pass orderId
            className="text-green-700 hover:text-emerald-600 text-xs font-medium flex items-center space-x-1"
          >
            <Eye className="h-3 w-3" />
            <span>View</span>
          </button>
        </div>
      </div>
    );
  };


 if (adminLoading ) {
    return (
      <div className="p-3 lg:p-4 xl:p-6">
        <div className="animate-pulse">
          <div className="h-6 lg:h-8 bg-gray-200 rounded w-1/4 mb-4 lg:mb-6"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 xl:gap-6 mb-6 lg:mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-20 lg:h-24"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 lg:p-4 xl:p-6">
      <div className="mb-4 lg:mb-6 xl:mb-8">
        <h1 className="text-lg lg:text-xl xl:text-2xl font-bold mb-3 lg:mb-4 xl:mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 xl:gap-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 lg:p-4 xl:p-6 shadow-sm border border-green-200">
            <p className="text-xs lg:text-sm text-green-600 font-medium">Total Products</p>
            <p className="text-xl lg:text-2xl font-bold mt-1 lg:mt-2 text-blue-800">
              {stats.totalProducts}
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3 lg:p-4 xl:p-6 shadow-sm border border-green-200">
            <p className="text-xs lg:text-sm text-green-600 font-medium">Total Orders</p>
            <p className="text-xl lg:text-2xl font-bold mt-1 lg:mt-2 text-green-800">
              {stats.totalOrders}
            </p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <p className="text-sm text-purple-600 font-medium">This Month's Revenue</p>
            <p className="text-2xl font-bold mt-2 text-purple-800">{formatCurrency(stats.monthlyRevenue)}</p>
            <p className="text-xs text-gray-500 mt-1 font-semibold">Total: {formatCurrency(stats.totalRevenue)}</p>
          </div>
          
         <div className="bg-orange-50 p-4 rounded-lg border">
            <p className="text-sm text-orange-600">Total Customers</p>
            {/* FIX: Displays the correct, backend-calculated count */}
            <p className="text-2xl font-bold mt-2">{stats.totalUsers}</p>
          </div>
        </div>
      </div>
      
      <div className="mb-4 lg:mb-6 xl:mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 lg:mb-4 gap-2">
          <h2 className="text-base lg:text-lg font-semibold">Recent Orders</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails('orders')}
            rightIcon={<ChevronRight size={16} />}
            className="w-full sm:w-auto"
          >
            View All
          </Button>
        </div>
        
        {/* Mobile View - Cards (only for phones) */}
        <div className="block sm:hidden">
          {recentOrders.length > 0 ? (
            recentOrders.map((order) => (
              <MobileOrderCard key={order._id} order={order} onViewDetails={onViewDetails} />
            ))
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No recent orders found</p>
            </div>
          )}
        </div>

        {/* Table View - For tablets, laptops and desktops */}
        <div className="hidden sm:block bg-white overflow-hidden shadow-sm rounded-lg mb-6">
          <div className="overflow-x-auto">
            <table className="w-full divide-y-2 divide-gray-200 min-w-[600px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 lg:px-4 xl:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Order Details
                  </th>
                  <th className="px-3 lg:px-4 xl:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-3 lg:px-4 xl:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-3 lg:px-4 xl:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-3 lg:px-4 xl:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 lg:px-4 xl:px-6 py-3 lg:py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => {
                    const orderStatus = order.status || order.orderStatus || 'Pending';
                    const orderTotal = order.totalPrice || order.total || 0;
                    
                    return (
                      <tr 
                        key={order._id} 
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => onViewDetails('orders', order._id)} // Pass orderId
                      >
                        <td className="px-3 lg:px-4 xl:px-6 py-3 lg:py-4">
                          <div className="flex flex-col space-y-1">
                            <span className="text-sm font-semibold text-green-700">
                              #{order.orderId || order._id.slice(-8)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(order.createdAt)}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 lg:px-4 xl:px-6 py-3 lg:py-4">
                          <div className="flex flex-col space-y-1">
                            <span className="text-sm font-medium text-gray-900 max-w-[120px] lg:max-w-[150px] xl:max-w-[200px] truncate">
                              {order.user?.name || order.shippingAddress?.fullName || 'N/A'}
                            </span>
                            <span className="text-xs text-gray-500 max-w-[120px] lg:max-w-[150px] xl:max-w-[200px] truncate">
                              {order.user?.email || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 lg:px-4 xl:px-6 py-3 lg:py-4">
                          <span className="text-sm text-gray-900 max-w-[100px] lg:max-w-[120px] xl:max-w-[180px] truncate block font-semibold">
                            {formatProductNames(order)}
                          </span>
                        </td>
                        <td className="px-3 lg:px-4 xl:px-6 py-3 lg:py-4">
                          <span className="text-sm font-semibold text-green-600">
                            {formatCurrency(orderTotal)}
                          </span>
                        </td>
                        <td className="px-3 lg:px-4 xl:px-6 py-3 lg:py-4">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(orderStatus)}`}>
                            {orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1)}
                          </span>
                        </td>
                        <td className="px-3 lg:px-4 xl:px-6 py-3 lg:py-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewDetails('orders', order._id); // Pass orderId
                            }}
                            className="text-green-700 hover:text-emerald-600 inline-flex items-center text-sm font-medium transition-colors"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">
                        No recent orders found
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* <div className="mb-4 lg:mb-6 xl:mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 lg:mb-4 gap-2">
          <h2 className="text-base lg:text-lg font-semibold">Popular Products</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails('products')}
            rightIcon={<ChevronRight size={16} />}
            className="w-full sm:w-auto"
          >
            View All
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 xl:gap-6">
          {popularProducts.length > 0 ? (
            popularProducts.map((product) => (
              <div 
                key={product._id} 
                className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  if (frontendUrl && product._id) {
                    window.open(`${frontendUrl}/product/${product._id}`, '_blank');
                  }
                }}
              >
                <div className="h-24 lg:h-32 xl:h-40 bg-gray-100 p-2 lg:p-4">
                  <img
                    src={product.image || 'https://images.pexels.com/photos/5824883/pexels-photo-5824883.jpeg'}
                    alt={product.name}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="p-3 lg:p-4">
                  <h3 className="font-medium mb-1 truncate text-sm lg:text-base">{product.name}</h3>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                    <span className="text-xs lg:text-sm text-gray-500">
                      {product.countInStock} in stock
                    </span>
                    <span className="font-semibold text-sm lg:text-base">
                      {formatCurrency(product.price)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-6 lg:py-8 text-gray-500 text-sm lg:text-base">
              No products found
            </div>
          )}
        </div>
      </div> */}

      <div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 lg:mb-4 gap-2">
          <h2 className="text-base lg:text-lg font-semibold">Customer Overview</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails('customers')}
            rightIcon={<ChevronRight size={16} />}
            className="w-full sm:w-auto"
          >
            View All
          </Button>
        </div>
        
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 xl:gap-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 lg:p-4 xl:p-6 shadow-sm border border-green-200">
            <p className="text-xs lg:text-sm text-green-600 font-medium">Total Customers</p>
            <p className="text-xl lg:text-2xl font-bold mt-1 lg:mt-2 text-blue-800">
              {dashboardStats.totalCustomers}
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3 lg:p-4 xl:p-6 shadow-sm border border-green-200">
            <p className="text-xs lg:text-sm text-green-600 font-medium">Total Orders</p>
            <p className="text-xl lg:text-2xl font-bold mt-1 lg:mt-2 text-green-800">
              {dashboardStats.totalOrders}
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-3 lg:p-4 xl:p-6 shadow-sm border border-purple-200">
            <p className="text-xs lg:text-sm text-purple-600 font-medium">Total Revenue</p>
            <p className="text-xl lg:text-2xl font-bold mt-1 lg:mt-2 text-purple-800">
              {formatCurrency(dashboardStats.totalRevenue)}
            </p>
          </div>
        </div> */}
      </div>
    </div>
  );
}
export default AdminDashboard;