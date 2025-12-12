import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Search, Filter, Factory, MapPin, Star, Mail, Eye } from 'lucide-react';
import { invitationAPI } from '../api/invitationAPI';
import { rfqAPI } from '../api/rfqAPI';
import { searchAPI } from '../api/searchAPI';

const ManufacturersPoolPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [manufacturers, setManufacturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    keyword: '',
    partType: '',
    technologies: [],
    country: '',
    region: '',
    certifications: [],
    companySize: '',
    material: '',
    machinery: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedManufacturer, setSelectedManufacturer] = useState(null);
  const [availableRFQs, setAvailableRFQs] = useState([]);

  const technologyOptions = ['CNC', 'TURNING', 'MILLING', '3D_PRINTING', 'SHEET_METAL', 'DIE_CASTING', 'INJECTION_MOLDING', 'STAMPING', 'WELDING', 'ASSEMBLY', 'OTHER'];
  const certificationOptions = ['ISO_9001', 'ISO_13485', 'AS9100', 'IATF_16949', 'ROHS', 'OTHER'];
  const partTypeOptions = ['Gear', 'Pipe', 'Bracket', 'Housing', 'Shaft', 'Bearing', 'Valve', 'Connector', 'Mount', 'Cover', 'Other'];
  const companySizeOptions = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

  useEffect(() => {
    fetchManufacturers();
    if (showInviteModal) {
      fetchAvailableRFQs();
    }
  }, [filters, showInviteModal]);

  const fetchManufacturers = async () => {
    setLoading(true);
    try {
      const response = await searchAPI.searchManufacturers({
        keyword: filters.keyword,
        partType: filters.partType,
        technologies: filters.technologies,
        country: filters.country,
        region: filters.region,
        certifications: filters.certifications,
        companySize: filters.companySize,
        material: filters.material,
        machinery: filters.machinery,
        page: 1,
        limit: 50
      });
      setManufacturers(response.data || []);
    } catch (error) {
      showError('Failed to load manufacturers: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableRFQs = async () => {
    try {
      const response = await rfqAPI.getMyRFQs({ status: 'OPEN_FOR_REQUESTS' });
      setAvailableRFQs(response.data || []);
    } catch (error) {
      console.error('Failed to load RFQs:', error);
    }
  };

  const handleInvite = async (rfqId) => {
    if (!selectedManufacturer) return;

    try {
      await invitationAPI.create({
        rfqId,
        manufacturerId: selectedManufacturer._id,
        message: `We would like to invite you to quote on this RFQ.`
      });
      showSuccess('Invitation sent successfully!');
      setShowInviteModal(false);
      setSelectedManufacturer(null);
    } catch (error) {
      showError('Failed to send invitation: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
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

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Manufacturer's Pool</h1>
        <p className="text-gray-600">Find and connect with manufacturers matching your needs</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search manufacturers..."
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Size</label>
                <select
                  value={filters.companySize}
                  onChange={(e) => handleFilterChange('companySize', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                >
                  <option value="">All Sizes</option>
                  {companySizeOptions.map(size => (
                    <option key={size} value={size}>{size} employees</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Machinery</label>
                <input
                  type="text"
                  value={filters.machinery}
                  onChange={(e) => handleFilterChange('machinery', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                  placeholder="e.g., Metrology machines"
                />
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
            </div>
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
      ) : manufacturers.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <Factory size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No manufacturers found</h3>
          <p className="text-gray-600">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {manufacturers.map((manufacturer) => (
            <div
              key={manufacturer._id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:border-[#4881F8] hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {manufacturer.companyName}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <MapPin size={14} className="mr-1" />
                    {manufacturer.country} {manufacturer.region && `• ${manufacturer.region}`}
                  </div>
                  {manufacturer.rating && (
                    <div className="flex items-center mb-2">
                      <Star size={14} className="text-yellow-500 mr-1" />
                      <span className="text-sm font-medium">{manufacturer.rating}</span>
                      <span className="text-xs text-gray-500 ml-1">({manufacturer.reviewCount || 0} reviews)</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <div className="flex flex-wrap gap-2 mb-2">
                  {manufacturer.manufacturingTypes?.slice(0, 3).map((tech, i) => (
                    <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                      {tech.replace('_', ' ')}
                    </span>
                  ))}
                  {manufacturer.manufacturingTypes?.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      +{manufacturer.manufacturingTypes.length - 3}
                    </span>
                  )}
                </div>
                {manufacturer.companySize && (
                  <div className="text-xs text-gray-600 mb-2">
                    Company Size: {manufacturer.companySize} employees
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {manufacturer.certifications?.slice(0, 2).map((cert, i) => (
                    <span key={i} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded">
                      {cert.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                <Link
                  to={`/manufacturer/${manufacturer._id}`}
                  className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  <Eye size={16} className="mr-2" />
                  View Profile
                </Link>
                <button
                  onClick={() => {
                    setSelectedManufacturer(manufacturer);
                    setShowInviteModal(true);
                  }}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-[#4881F8] text-white rounded-lg hover:bg-[#3b6fe0] transition-colors text-sm"
                >
                  <Mail size={16} className="mr-2" />
                  Invite
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Invite to RFQ</h3>
            <p className="text-sm text-gray-600 mb-4">
              Select an RFQ to invite <strong>{selectedManufacturer?.companyName}</strong> to:
            </p>
            <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
              {availableRFQs.length === 0 ? (
                <p className="text-sm text-gray-500">No open RFQs available</p>
              ) : (
                availableRFQs.map((rfq) => (
                  <button
                    key={rfq._id}
                    onClick={() => handleInvite(rfq._id)}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-[#4881F8] hover:bg-blue-50 transition-colors"
                  >
                    <div className="font-medium">{rfq.title}</div>
                    <div className="text-xs text-gray-600">RFQ #{rfq._id.toString().slice(-6)}</div>
                  </button>
                ))
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setSelectedManufacturer(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <Link
                to="/start-rfq"
                className="flex-1 px-4 py-2 bg-[#4881F8] text-white rounded-lg hover:bg-[#3b6fe0] transition-colors text-center"
              >
                Create New RFQ
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManufacturersPoolPage;
