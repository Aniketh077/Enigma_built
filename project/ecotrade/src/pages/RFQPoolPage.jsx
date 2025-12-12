import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { searchAPI } from '../api/searchAPI';
import { useToast } from '../contexts/ToastContext';
import { Search, Filter, FileText, MapPin, Calendar, Eye } from 'lucide-react';

const RFQPoolPage = () => {
  const navigate = useNavigate();
  const { showError } = useToast();
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    keyword: '',
    partType: '',
    technologies: [],
    country: '',
    region: '',
    certifications: [],
    length: '',
    diameter: '',
    height: '',
    width: '',
    material: '',
    quantity: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [showFilters, setShowFilters] = useState(false);

  const technologyOptions = ['CNC', 'TURNING', 'MILLING', '3D_PRINTING', 'SHEET_METAL', 'DIE_CASTING', 'INJECTION_MOLDING', 'STAMPING', 'WELDING', 'ASSEMBLY', 'OTHER'];
  const certificationOptions = ['ISO_9001', 'ISO_13485', 'AS9100', 'IATF_16949', 'ROHS', 'OTHER'];
  const partTypeOptions = ['Gear', 'Pipe', 'Bracket', 'Housing', 'Shaft', 'Bearing', 'Valve', 'Connector', 'Mount', 'Cover', 'Other'];

  useEffect(() => {
    fetchRFQs();
  }, [filters, pagination.page]);

  const fetchRFQs = async () => {
    setLoading(true);
    try {
      const response = await searchAPI.searchRFQs({
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      });
      setRfqs(response.data || []);
      setPagination(response.pagination || pagination);
    } catch (error) {
      showError('Failed to load RFQs: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleTechnologyToggle = (tech) => {
    const current = filters.technologies || [];
    const updated = current.includes(tech)
      ? current.filter(t => t !== tech)
      : [...current, tech];
    handleFilterChange('technologies', updated);
  };

  const handleCertificationToggle = (cert) => {
    const current = filters.certifications || [];
    const updated = current.includes(cert)
      ? current.filter(c => c !== cert)
      : [...current, cert];
    handleFilterChange('certifications', updated);
  };

  const clearFilters = () => {
    setFilters({
      keyword: '',
      partType: '',
      technologies: [],
      country: '',
      region: '',
      certifications: [],
      length: '',
      diameter: '',
      height: '',
      width: '',
      material: '',
      quantity: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">RFQ Pool</h1>
        <p className="text-gray-600">Browse RFQs matching your manufacturing capabilities</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search RFQs by title or description..."
              value={filters.keyword}
              onChange={(e) => handleFilterChange('keyword', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter size={20} className="mr-2" />
            Filters
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="border-t border-gray-200 pt-4 mt-4 space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Part Type</label>
                <select
                  value={filters.partType}
                  onChange={(e) => handleFilterChange('partType', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                >
                  <option value="">All Part Types</option>
                  {partTypeOptions.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Technologies</label>
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {technologyOptions.map(tech => (
                    <label key={tech} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.technologies?.includes(tech)}
                        onChange={() => handleTechnologyToggle(tech)}
                        className="w-4 h-4 text-[#4881F8] border-gray-300 rounded focus:ring-[#4881F8]"
                      />
                      <span className="text-sm text-gray-700">{tech.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Material</label>
                <input
                  type="text"
                  value={filters.material}
                  onChange={(e) => handleFilterChange('material', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                  placeholder="e.g., Steel, ABS, Wood"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Length (mm)</label>
                <input
                  type="number"
                  value={filters.length}
                  onChange={(e) => handleFilterChange('length', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                  placeholder="e.g., 150"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Width (mm)</label>
                <input
                  type="number"
                  value={filters.width}
                  onChange={(e) => handleFilterChange('width', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                  placeholder="e.g., 150"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Height (mm)</label>
                <input
                  type="number"
                  value={filters.height}
                  onChange={(e) => handleFilterChange('height', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                  placeholder="e.g., 150"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Diameter (mm)</label>
                <input
                  type="number"
                  value={filters.diameter}
                  onChange={(e) => handleFilterChange('diameter', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                  placeholder="e.g., 150"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <input
                  type="text"
                  value={filters.country}
                  onChange={(e) => handleFilterChange('country', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                  placeholder="e.g., Germany, Austria"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                <input
                  type="text"
                  value={filters.region}
                  onChange={(e) => handleFilterChange('region', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                  placeholder="e.g., DACH, European Union"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <input
                  type="number"
                  value={filters.quantity}
                  onChange={(e) => handleFilterChange('quantity', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                  placeholder="Min quantity"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Certifications</label>
              <div className="grid grid-cols-3 gap-2">
                {certificationOptions.map(cert => (
                  <label key={cert} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.certifications?.includes(cert)}
                      onChange={() => handleCertificationToggle(cert)}
                      className="w-4 h-4 text-[#4881F8] border-gray-300 rounded focus:ring-[#4881F8]"
                    />
                    <span className="text-sm text-gray-700">{cert.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={clearFilters}
              className="text-sm text-[#4881F8] hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : rfqs.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <FileText size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No RFQs found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your filters to see more results</p>
          <button
            onClick={clearFilters}
            className="text-[#4881F8] hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {rfqs.map((rfq) => (
              <Link
                key={rfq._id}
                to={`/rfqs-pool/${rfq._id}`}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:border-[#4881F8] hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex-1">{rfq.title}</h3>
                </div>

                <div className="space-y-2 mb-4">
                  {rfq.workpieces?.[0] && (
                    <>
                      {rfq.workpieces[0].partType && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Part Type:</span> {rfq.workpieces[0].partType}
                        </div>
                      )}
                      <div className="flex items-center text-sm text-gray-600">
                        <FileText size={16} className="mr-2" />
                        {rfq.workpieces[0].technology?.replace('_', ' ')} • {rfq.workpieces[0].material}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin size={16} className="mr-2" />
                        {rfq.country} {rfq.region && `• ${rfq.region}`}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar size={16} className="mr-2" />
                        Deadline: {new Date(rfq.rfqDeadline).toLocaleDateString()}
                      </div>
                      {rfq.workpieces[0].dimensions && (
                        <div className="text-sm text-gray-600">
                          Dimensions: {rfq.workpieces[0].dimensions.length} × {rfq.workpieces[0].dimensions.width} × {rfq.workpieces[0].dimensions.height} mm
                          {rfq.workpieces[0].dimensions.diameter > 0 && ` (D: ${rfq.workpieces[0].dimensions.diameter}mm)`}
                        </div>
                      )}
                      <div className="text-sm text-gray-600">
                        Quantity: {rfq.workpieces[0].quantity}
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-xs text-gray-500">
                    RFQ #{rfq._id.toString().slice(-6)}
                  </span>
                  <div className="flex items-center text-[#4881F8] text-sm">
                    View Details
                    <Eye size={16} className="ml-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.pages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RFQPoolPage;
