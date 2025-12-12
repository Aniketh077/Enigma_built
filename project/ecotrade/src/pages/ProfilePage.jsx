import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { profileAPI } from '../api/profileAPI';
import { useToast } from '../contexts/ToastContext';
import { Building2, ShoppingCart, Factory, Save } from 'lucide-react';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState('company');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    website: '',
    industryVertical: '',
    buyerSettings: {
      defaultCountry: '',
      defaultRegion: '',
      preferredCurrency: 'USD',
      defaultIncoterms: 'FOB',
      communicationLanguage: 'English',
      savedShippingAddresses: [],
      billingInfo: {}
    },
    manufacturerSettings: {
      technologies: [],
      materials: [],
      partTypes: [],
      machinery: [],
      regionsServed: [],
      languages: []
    },
    primaryMaterials: [],
    certifications: [],
    maxDimensions: {
      height: 0,
      width: 0,
      length: 0
    }
  });

  const userType = user?.userType || 'BUYER';
  const isBuyer = userType === 'BUYER' || userType === 'HYBRID';
  const isManufacturer = userType === 'MANUFACTURER' || userType === 'HYBRID';

  useEffect(() => {
    if (user) {
      setFormData({
        companyName: user.companyName || '',
        website: user.website || '',
        industryVertical: user.industryVertical || '',
        buyerSettings: user.buyerSettings || {
          defaultCountry: '',
          defaultRegion: '',
          preferredCurrency: 'USD',
          defaultIncoterms: 'FOB',
          communicationLanguage: 'English',
          savedShippingAddresses: [],
          billingInfo: {}
        },
        manufacturerSettings: {
          technologies: user.manufacturerSettings?.technologies || [],
          materials: user.manufacturerSettings?.materials || [],
          partTypes: user.manufacturerSettings?.partTypes || [],
          machinery: user.manufacturerSettings?.machinery || [],
          regionsServed: user.manufacturerSettings?.regionsServed || [],
          languages: user.manufacturerSettings?.languages || ['English']
        },
        primaryMaterials: user.primaryMaterials || [],
        certifications: user.certifications || [],
        maxDimensions: user.maxDimensions || { height: 0, width: 0, length: 0 }
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleArrayChange = (field, value, isChecked) => {
    setFormData(prev => {
      const current = prev[field] || [];
      if (isChecked) {
        return { ...prev, [field]: [...current, value] };
      } else {
        return { ...prev, [field]: current.filter(item => item !== value) };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await profileAPI.update(formData);
      if (response.success) {
        updateUser(response.data.data);
        showSuccess('Profile updated successfully!');
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'company', label: 'Company', icon: Building2, show: true },
    { id: 'buyer', label: 'Buyer Settings', icon: ShoppingCart, show: isBuyer },
    { id: 'manufacturer', label: 'Manufacturer Settings', icon: Factory, show: isManufacturer }
  ].filter(tab => tab.show);

  const technologyOptions = ['CNC', 'TURNING', 'MILLING', '3D_PRINTING', 'SHEET_METAL', 'DIE_CASTING', 'INJECTION_MOLDING', 'STAMPING', 'WELDING', 'ASSEMBLY', 'OTHER'];
  const certificationOptions = ['ISO_9001', 'ISO_13485', 'AS9100', 'IATF_16949', 'ROHS', 'OTHER'];
  const currencyOptions = ['USD', 'EUR', 'GBP', 'INR', 'CNY'];
  const incotermsOptions = ['FOB', 'CIF', 'EXW', 'DDP', 'DAP', 'FCA'];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-gray-600">Manage your profile settings and preferences</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-[#4881F8] text-[#4881F8]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={18} className="mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6">
        {/* Company Tab */}
        {activeTab === 'company' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry Vertical
              </label>
              <input
                type="text"
                name="industryVertical"
                value={formData.industryVertical}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                placeholder="e.g., Automotive, Aerospace, Medical"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                placeholder="https://example.com"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={user?.country || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Size (employees)
                </label>
                <input
                  type="text"
                  name="companySize"
                  value={user?.companySize || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                  readOnly
                />
              </div>
            </div>
          </div>
        )}

        {/* Buyer Settings Tab */}
        {activeTab === 'buyer' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Country
                </label>
                <input
                  type="text"
                  name="buyerSettings.defaultCountry"
                  value={formData.buyerSettings.defaultCountry}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Region
                </label>
                <input
                  type="text"
                  name="buyerSettings.defaultRegion"
                  value={formData.buyerSettings.defaultRegion}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                  placeholder="e.g., DACH, EU, APAC"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Currency
                </label>
                <select
                  name="buyerSettings.preferredCurrency"
                  value={formData.buyerSettings.preferredCurrency}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                >
                  {currencyOptions.map(currency => (
                    <option key={currency} value={currency}>{currency}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Incoterms
                </label>
                <select
                  name="buyerSettings.defaultIncoterms"
                  value={formData.buyerSettings.defaultIncoterms}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                >
                  {incotermsOptions.map(term => (
                    <option key={term} value={term}>{term}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Communication Language
              </label>
              <input
                type="text"
                name="buyerSettings.communicationLanguage"
                value={formData.buyerSettings.communicationLanguage}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                placeholder="e.g., English, German, French"
              />
            </div>
          </div>
        )}

        {/* Manufacturer Settings Tab */}
        {activeTab === 'manufacturer' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Technologies
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {technologyOptions.map((tech) => (
                  <label key={tech} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.manufacturerSettings.technologies.includes(tech)}
                      onChange={(e) => handleArrayChange('manufacturerSettings.technologies', tech, e.target.checked)}
                      className="w-4 h-4 text-[#4881F8] border-gray-300 rounded focus:ring-[#4881F8]"
                    />
                    <span className="text-sm text-gray-700">{tech.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Materials
              </label>
              <input
                type="text"
                placeholder="Enter materials separated by commas"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                onBlur={(e) => {
                  const materials = e.target.value.split(',').map(m => m.trim()).filter(m => m);
                  setFormData(prev => ({
                    ...prev,
                    manufacturerSettings: {
                      ...prev.manufacturerSettings,
                      materials: materials
                    }
                  }));
                }}
                defaultValue={formData.manufacturerSettings.materials?.join(', ') || ''}
              />
              <p className="text-xs text-gray-500 mt-1">e.g., Aluminum, Steel, Plastic, Titanium</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Part Types
              </label>
              <input
                type="text"
                placeholder="Enter part types separated by commas"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                onBlur={(e) => {
                  const partTypes = e.target.value.split(',').map(p => p.trim()).filter(p => p);
                  setFormData(prev => ({
                    ...prev,
                    manufacturerSettings: {
                      ...prev.manufacturerSettings,
                      partTypes: partTypes
                    }
                  }));
                }}
                defaultValue={formData.manufacturerSettings.partTypes?.join(', ') || ''}
              />
              <p className="text-xs text-gray-500 mt-1">e.g., Gear, Pipe, Bracket, Housing</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Machinery
              </label>
              <input
                type="text"
                placeholder="Enter machinery separated by commas"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                onBlur={(e) => {
                  const machinery = e.target.value.split(',').map(m => m.trim()).filter(m => m);
                  setFormData(prev => ({
                    ...prev,
                    manufacturerSettings: {
                      ...prev.manufacturerSettings,
                      machinery: machinery
                    }
                  }));
                }}
                defaultValue={formData.manufacturerSettings.machinery?.join(', ') || ''}
              />
              <p className="text-xs text-gray-500 mt-1">e.g., Metrology machines, 5-axis CNC, Laser Cutter</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certifications
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {certificationOptions.map((cert) => (
                  <label key={cert} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.certifications.includes(cert)}
                      onChange={(e) => handleArrayChange('certifications', cert, e.target.checked)}
                      className="w-4 h-4 text-[#4881F8] border-gray-300 rounded focus:ring-[#4881F8]"
                    />
                    <span className="text-sm text-gray-700">{cert.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Part Dimensions (mm)
              </label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Length</label>
                  <input
                    type="number"
                    value={formData.maxDimensions.length}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      maxDimensions: { ...prev.maxDimensions, length: parseFloat(e.target.value) || 0 }
                    }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Width</label>
                  <input
                    type="number"
                    value={formData.maxDimensions.width}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      maxDimensions: { ...prev.maxDimensions, width: parseFloat(e.target.value) || 0 }
                    }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Height</label>
                  <input
                    type="number"
                    value={formData.maxDimensions.height}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      maxDimensions: { ...prev.maxDimensions, height: parseFloat(e.target.value) || 0 }
                    }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-6 py-2 bg-[#4881F8] text-white rounded-lg hover:bg-[#3b6fe0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} className="mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;

