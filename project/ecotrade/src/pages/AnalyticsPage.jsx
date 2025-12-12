import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { rfqAPI } from '../api/rfqAPI';
import { FileText, TrendingUp, CheckCircle, Clock, DollarSign, Star } from 'lucide-react';

const AnalyticsPage = () => {
  const { user } = useAuth();
  const [kpis, setKpis] = useState({
    requestsReceived: 0,
    rfqsAccepted: 0,
    winRate: 0,
    revenueWon: 0,
    avgLeadTime: 0,
    avgRating: 0
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Get all RFQs for analytics
      const [myRFQs, accepted] = await Promise.all([
        rfqAPI.getMyRFQs(),
        rfqAPI.getAcceptedRFQs()
      ]);

      const allRFQs = myRFQs.data || [];
      const acceptedRFQs = accepted.data || [];

      // Calculate KPIs
      const requestsReceived = allRFQs.filter(r => 
        r.status === 'REQUESTS_PENDING' || r.status === 'OPEN_FOR_REQUESTS'
      ).length;

      const rfqsAccepted = acceptedRFQs.length;
      const winRate = allRFQs.length > 0 
        ? (rfqsAccepted / allRFQs.length) * 100 
        : 0;

      // Calculate average lead time (placeholder - would need actual data)
      const avgLeadTime = 0;

      // Calculate average rating (placeholder - would need rating data)
      const avgRating = 0;

      setKpis({
        requestsReceived,
        rfqsAccepted,
        winRate: Math.round(winRate),
        revenueWon: 0, // Would need actual revenue data
        avgLeadTime,
        avgRating
      });
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Track your performance and insights</p>
        </div>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
        >
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="quarter">Last Quarter</option>
          <option value="year">Last Year</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <FileText className="text-[#4881F8]" size={32} />
              <TrendingUp className="text-green-500" size={20} />
            </div>
            <div className="text-3xl font-bold mb-1">{kpis.requestsReceived}</div>
            <div className="text-sm text-gray-600">RFQ Requests Received</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="text-[#4881F8]" size={32} />
              <TrendingUp className="text-green-500" size={20} />
            </div>
            <div className="text-3xl font-bold mb-1">{kpis.rfqsAccepted}</div>
            <div className="text-sm text-gray-600">RFQs Accepted (Won)</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="text-[#4881F8]" size={32} />
            </div>
            <div className="text-3xl font-bold mb-1">{kpis.winRate}%</div>
            <div className="text-sm text-gray-600">Win Rate</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="text-[#4881F8]" size={32} />
            </div>
            <div className="text-3xl font-bold mb-1">
              ${kpis.revenueWon.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Revenue Won</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Clock className="text-[#4881F8]" size={32} />
            </div>
            <div className="text-3xl font-bold mb-1">
              {kpis.avgLeadTime || 'N/A'}
            </div>
            <div className="text-sm text-gray-600">Avg Lead Time (days)</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Star className="text-[#4881F8]" size={32} />
            </div>
            <div className="text-3xl font-bold mb-1">
              {kpis.avgRating || 'N/A'}
            </div>
            <div className="text-sm text-gray-600">Average Buyer Rating</div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">RFQs by Technology</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            <p>Chart visualization coming soon</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">RFQs by Buyer Region</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            <p>Chart visualization coming soon</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Performance Over Time</h3>
        <div className="h-64 flex items-center justify-center text-gray-400">
          <p>Chart visualization coming soon</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;

