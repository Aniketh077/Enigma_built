import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FileText, Factory, CheckCircle, BarChart3, PlusCircle, 
  Clock, Package, Users, TrendingUp, AlertCircle, ArrowRight
} from 'lucide-react';
import { rfqAPI } from '../api/rfqAPI';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userType = user?.userType || 'BUYER';
  const isManufacturer = userType === 'MANUFACTURER' || userType === 'HYBRID';
  const isBuyer = userType === 'BUYER' || userType === 'HYBRID';

  const [kpis, setKpis] = useState({
    activeRFQs: 0,
    awaitingSupplier: 0,
    inProduction: 0,
    awaitingConfirmation: 0,
    matchingRFQs: 0,
    requestedRFQs: 0,
    acceptedRFQs: 0,
    inProductionJobs: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentRequests, setRecentRequests] = useState([]);
  const [newMatchingRFQs, setNewMatchingRFQs] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [userType]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      if (isBuyer) {
        // Fetch buyer KPIs
        const myRFQs = await rfqAPI.getMyRFQs();
        const rfqs = myRFQs.data || [];
        
        setKpis({
          activeRFQs: rfqs.filter(r => !['CLOSED', 'CANCELLED', 'EXPIRED'].includes(r.status)).length,
          awaitingSupplier: rfqs.filter(r => r.status === 'REQUESTS_PENDING').length,
          inProduction: rfqs.filter(r => r.status === 'IN_PRODUCTION').length,
          awaitingConfirmation: rfqs.filter(r => r.status === 'SHIPPED').length,
          matchingRFQs: 0,
          requestedRFQs: 0,
          acceptedRFQs: 0,
          inProductionJobs: 0
        });

        // Get RFQs with new requests
        const rfqsWithRequests = rfqs.filter(r => r.status === 'REQUESTS_PENDING');
        setRecentRequests(rfqsWithRequests.slice(0, 5));
      }

      if (isManufacturer) {
        // Fetch manufacturer KPIs
        const [pool, accepted, myRFQs] = await Promise.all([
          rfqAPI.getRFQPool({ page: 1, limit: 1 }),
          rfqAPI.getAcceptedRFQs(),
          rfqAPI.getMyRFQs()
        ]);

        const requestedCount = myRFQs.data?.filter(r => 
          r.status === 'REQUESTS_PENDING' || r.status === 'OPEN_FOR_REQUESTS'
        ).length || 0;

        setKpis({
          activeRFQs: 0,
          awaitingSupplier: 0,
          inProduction: 0,
          awaitingConfirmation: 0,
          matchingRFQs: pool.pagination?.total || 0,
          requestedRFQs: requestedCount,
          acceptedRFQs: accepted.data?.length || 0,
          inProductionJobs: accepted.data?.filter(r => r.status === 'IN_PRODUCTION').length || 0
        });

        // Get new matching RFQs
        const matching = await rfqAPI.getRFQPool({ page: 1, limit: 5 });
        setNewMatchingRFQs(matching.data || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRolePill = () => {
    const roleMap = {
      'BUYER': { label: 'Buyer', color: 'bg-blue-100 text-blue-800' },
      'MANUFACTURER': { label: 'Manufacturer', color: 'bg-green-100 text-green-800' },
      'HYBRID': { label: 'Hybrid', color: 'bg-purple-100 text-purple-800' }
    };
    const role = roleMap[userType] || roleMap['BUYER'];
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${role.color}`}>
        {role.label}
      </span>
    );
  };

  const handleKPIClick = (filter) => {
    if (isBuyer) {
      navigate('/my-rfqs', { state: { filter } });
    } else {
      if (filter === 'matching') {
        navigate('/rfqs-pool');
      } else if (filter === 'accepted') {
        navigate('/accepted-rfqs');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">Welcome back, {user?.fullName || 'User'}!</h1>
          {getRolePill()}
        </div>
        <p className="text-gray-600">
          {userType === 'BUYER' && 'Manage your RFQs and find the best manufacturers'}
          {userType === 'MANUFACTURER' && 'Browse RFQs and grow your business'}
          {userType === 'HYBRID' && 'Manage both buying and manufacturing activities'}
        </p>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-6 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isBuyer && (
            <>
              <div 
                onClick={() => handleKPIClick('active')}
                className="bg-white border border-gray-200 rounded-lg p-6 cursor-pointer hover:border-[#4881F8] hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <FileText className="text-[#4881F8]" size={32} />
                  <span className="text-2xl font-bold">{kpis.activeRFQs}</span>
                </div>
                <h3 className="text-sm font-medium text-gray-600">Active RFQs</h3>
                <p className="text-xs text-gray-500 mt-1">Non-closed RFQs</p>
              </div>
              <div 
                onClick={() => handleKPIClick('REQUESTS_PENDING')}
                className="bg-white border border-gray-200 rounded-lg p-6 cursor-pointer hover:border-[#4881F8] hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <Clock className="text-[#4881F8]" size={32} />
                  <span className="text-2xl font-bold">{kpis.awaitingSupplier}</span>
                </div>
                <h3 className="text-sm font-medium text-gray-600">Awaiting Supplier Selection</h3>
                <p className="text-xs text-gray-500 mt-1">RFQs with pending requests</p>
              </div>
              <div 
                onClick={() => handleKPIClick('IN_PRODUCTION')}
                className="bg-white border border-gray-200 rounded-lg p-6 cursor-pointer hover:border-[#4881F8] hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <Factory className="text-[#4881F8]" size={32} />
                  <span className="text-2xl font-bold">{kpis.inProduction}</span>
                </div>
                <h3 className="text-sm font-medium text-gray-600">In Production</h3>
                <p className="text-xs text-gray-500 mt-1">RFQs being manufactured</p>
              </div>
              <div 
                onClick={() => handleKPIClick('SHIPPED')}
                className="bg-white border border-gray-200 rounded-lg p-6 cursor-pointer hover:border-[#4881F8] hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <Package className="text-[#4881F8]" size={32} />
                  <span className="text-2xl font-bold">{kpis.awaitingConfirmation}</span>
                </div>
                <h3 className="text-sm font-medium text-gray-600">Awaiting Confirmation</h3>
                <p className="text-xs text-gray-500 mt-1">Deliveries to confirm</p>
              </div>
            </>
          )}
          {isManufacturer && (
            <>
              <div 
                onClick={() => handleKPIClick('matching')}
                className="bg-white border border-gray-200 rounded-lg p-6 cursor-pointer hover:border-[#4881F8] hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <FileText className="text-[#4881F8]" size={32} />
                  <span className="text-2xl font-bold">{kpis.matchingRFQs}</span>
                </div>
                <h3 className="text-sm font-medium text-gray-600">Matching RFQs</h3>
                <p className="text-xs text-gray-500 mt-1">RFQs matching your profile</p>
              </div>
              <div 
                onClick={() => handleKPIClick('requested')}
                className="bg-white border border-gray-200 rounded-lg p-6 cursor-pointer hover:border-[#4881F8] hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <Clock className="text-[#4881F8]" size={32} />
                  <span className="text-2xl font-bold">{kpis.requestedRFQs}</span>
                </div>
                <h3 className="text-sm font-medium text-gray-600">RFQs Requested</h3>
                <p className="text-xs text-gray-500 mt-1">Pending buyer decision</p>
              </div>
              <div 
                onClick={() => handleKPIClick('accepted')}
                className="bg-white border border-gray-200 rounded-lg p-6 cursor-pointer hover:border-[#4881F8] hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <CheckCircle className="text-[#4881F8]" size={32} />
                  <span className="text-2xl font-bold">{kpis.acceptedRFQs}</span>
                </div>
                <h3 className="text-sm font-medium text-gray-600">Accepted RFQs</h3>
                <p className="text-xs text-gray-500 mt-1">Active jobs</p>
              </div>
              <div 
                onClick={() => handleKPIClick('IN_PRODUCTION')}
                className="bg-white border border-gray-200 rounded-lg p-6 cursor-pointer hover:border-[#4881F8] hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <Factory className="text-[#4881F8]" size={32} />
                  <span className="text-2xl font-bold">{kpis.inProductionJobs}</span>
                </div>
                <h3 className="text-sm font-medium text-gray-600">In Production</h3>
                <p className="text-xs text-gray-500 mt-1">Jobs being manufactured</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Recent Activity Lists */}
      {isBuyer && recentRequests.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">New RFQ Requests</h2>
            <Link 
              to="/my-rfqs" 
              className="text-sm text-[#4881F8] hover:underline flex items-center"
            >
              View all <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentRequests.map((rfq) => (
              <Link
                key={rfq._id}
                to={`/my-rfqs/${rfq._id}?tab=requests`}
                className="block p-4 border border-gray-200 rounded-lg hover:border-[#4881F8] hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{rfq.title}</h3>
                    <p className="text-sm text-gray-600">RFQ #{rfq._id.toString().slice(-6)}</p>
                  </div>
                  <div className="flex items-center text-sm text-[#4881F8]">
                    <AlertCircle size={16} className="mr-1" />
                    New requests
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {isManufacturer && newMatchingRFQs.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">New RFQs Matching Your Profile</h2>
            <Link 
              to="/rfqs-pool" 
              className="text-sm text-[#4881F8] hover:underline flex items-center"
            >
              View all <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
          <div className="space-y-3">
            {newMatchingRFQs.map((rfq) => (
              <Link
                key={rfq._id}
                to={`/rfqs-pool/${rfq._id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:border-[#4881F8] hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{rfq.title}</h3>
                    <p className="text-sm text-gray-600">
                      {rfq.workpieces[0]?.technology} • {rfq.workpieces[0]?.material} • {rfq.country}
                    </p>
                  </div>
                  <div className="flex items-center">
                    {rfq.matchScore && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full mr-2">
                        {rfq.matchScore}% match
                      </span>
                    )}
                    <ArrowRight size={16} className="text-[#4881F8]" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isBuyer && (
            <Link
              to="/start-rfq"
              className="p-4 border border-gray-200 rounded-lg hover:border-[#4881F8] hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-center mb-2">
                <PlusCircle className="text-[#4881F8] mr-2" size={20} />
                <h3 className="font-medium">Create New RFQ</h3>
              </div>
              <p className="text-sm text-gray-600">Start a new request for quotation</p>
            </Link>
          )}
          {isManufacturer && (
            <Link
              to="/rfqs-pool"
              className="p-4 border border-gray-200 rounded-lg hover:border-[#4881F8] hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-center mb-2">
                <FileText className="text-[#4881F8] mr-2" size={20} />
                <h3 className="font-medium">Browse RFQ Pool</h3>
              </div>
              <p className="text-sm text-gray-600">Find RFQs matching your capabilities</p>
            </Link>
          )}
          {isManufacturer && (
            <Link
              to="/analytics"
              className="p-4 border border-gray-200 rounded-lg hover:border-[#4881F8] hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-center mb-2">
                <BarChart3 className="text-[#4881F8] mr-2" size={20} />
                <h3 className="font-medium">View Analytics</h3>
              </div>
              <p className="text-sm text-gray-600">Track your performance metrics</p>
            </Link>
          )}
          <Link
            to="/profile"
            className="p-4 border border-gray-200 rounded-lg hover:border-[#4881F8] hover:bg-blue-50 transition-colors"
          >
            <div className="flex items-center mb-2">
              <Users className="text-[#4881F8] mr-2" size={20} />
              <h3 className="font-medium">Update Profile</h3>
            </div>
            <p className="text-sm text-gray-600">Complete your profile information</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

