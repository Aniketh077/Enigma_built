import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { rfqAPI } from '../api/rfqAPI';
import { uploadAPI } from '../api/uploadAPI';
import STLViewer from '../components/STLViewer';
import { ArrowLeft, ArrowRight, Upload, X, File, Save } from 'lucide-react';

const StartRFQPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState('workpieces');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    workpieces: [{
      mainFile: null,
      mainFileUrl: '',
      extraFiles: [],
      partType: '',
      dimensions: {
        length: 0,
        width: 0,
        height: 0,
        diameter: 0
      },
      technology: '',
      material: '',
      quantity: 1
    }],
    preferredCurrency: user?.buyerSettings?.preferredCurrency || 'USD',
    rfqDeadline: '',
    acceptanceDeadline: '',
    partTrackingId: '',
    requestJustification: '',
    targetDeliveryDate: '',
    shippingTerms: user?.buyerSettings?.defaultIncoterms || 'FOB',
    country: user?.country || '',
    region: user?.buyerSettings?.defaultRegion || '',
    communicationLanguage: user?.buyerSettings?.communicationLanguage || 'English',
    requiredCertificates: [],
    notes: '',
    ndaFile: null,
    ndaFileUrl: ''
  });

  const technologyOptions = ['CNC', 'TURNING', 'MILLING', '3D_PRINTING', 'SHEET_METAL', 'DIE_CASTING', 'INJECTION_MOLDING', 'STAMPING', 'WELDING', 'ASSEMBLY', 'OTHER'];
  const certificationOptions = ['ISO_9001', 'ISO_13485', 'AS9100', 'IATF_16949', 'ROHS', 'OTHER'];
  const currencyOptions = ['USD', 'EUR', 'GBP', 'INR', 'CNY'];
  const incotermsOptions = ['FOB', 'CIF', 'EXW', 'DDP', 'DAP', 'FCA'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleWorkpieceChange = (index, field, value) => {
    setFormData(prev => {
      const workpieces = [...prev.workpieces];
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        workpieces[index] = {
          ...workpieces[index],
          [parent]: {
            ...workpieces[index][parent],
            [child]: value
          }
        };
      } else {
        workpieces[index] = { ...workpieces[index], [field]: value };
      }
      return { ...prev, workpieces };
    });
  };

  const handleFileUpload = async (file, type, workpieceIndex = 0) => {
    if (!file) return;

    // Validate file size
    const maxSize = type === 'nda' ? 10 * 1024 * 1024 : type === 'main' ? 150 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > maxSize) {
      showError(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type === 'main' ? 'stl' : type === 'nda' ? 'document' : 'extra');

      const response = await uploadAPI.uploadFile(formData);
      const fileUrl = response.data?.url || response.url;

      if (type === 'main') {
        handleWorkpieceChange(workpieceIndex, 'mainFileUrl', fileUrl);
        handleWorkpieceChange(workpieceIndex, 'mainFile', file);
        // TODO: Load STL file and calculate dimensions using Three.js
      } else if (type === 'nda') {
        setFormData(prev => ({ ...prev, ndaFileUrl: fileUrl, ndaFile: file }));
      } else {
        const workpieces = [...formData.workpieces];
        workpieces[workpieceIndex].extraFiles.push(fileUrl);
        setFormData(prev => ({ ...prev, workpieces }));
      }

      showSuccess('File uploaded successfully');
    } catch (error) {
      showError('Failed to upload file: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = (type, workpieceIndex = 0, fileIndex = null) => {
    if (type === 'main') {
      handleWorkpieceChange(workpieceIndex, 'mainFileUrl', '');
      handleWorkpieceChange(workpieceIndex, 'mainFile', null);
    } else if (type === 'nda') {
      setFormData(prev => ({ ...prev, ndaFileUrl: '', ndaFile: null }));
    } else {
      const workpieces = [...formData.workpieces];
      workpieces[workpieceIndex].extraFiles.splice(fileIndex, 1);
      setFormData(prev => ({ ...prev, workpieces }));
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

  const validateWorkpieces = () => {
    for (const workpiece of formData.workpieces) {
      if (!workpiece.title && !formData.title) {
        showError('Please provide a title for the RFQ or workpiece');
        return false;
      }
      if (!workpiece.mainFileUrl) {
        showError('Please upload a main workpiece file');
        return false;
      }
      if (!workpiece.technology) {
        showError('Please select a technology');
        return false;
      }
      if (!workpiece.material) {
        showError('Please specify the material');
        return false;
      }
      if (!workpiece.quantity || workpiece.quantity < 1) {
        showError('Please specify quantity (minimum 1)');
        return false;
      }
    }
    return true;
  };

  const validateRequirements = () => {
    if (!formData.rfqDeadline) {
      showError('Please specify RFQ deadline');
      return false;
    }
    if (!formData.country) {
      showError('Please specify country');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (activeTab === 'workpieces' && !validateWorkpieces()) {
      return;
    }

    if (activeTab === 'requirements' && !validateRequirements()) {
      return;
    }

    if (activeTab === 'workpieces') {
      setActiveTab('requirements');
      return;
    }

    // Final submission
    setLoading(true);
    try {
      const payload = {
        title: formData.title || `RFQ - ${formData.workpieces[0].technology}`,
        workpieces: formData.workpieces.map(wp => ({
          mainFile: wp.mainFileUrl,
          extraFiles: wp.extraFiles,
          partType: wp.partType,
          dimensions: wp.dimensions,
          technology: wp.technology,
          material: wp.material,
          quantity: parseInt(wp.quantity)
        })),
        requirements: {
          preferredCurrency: formData.preferredCurrency,
          rfqDeadline: new Date(formData.rfqDeadline),
          acceptanceDeadline: formData.acceptanceDeadline ? new Date(formData.acceptanceDeadline) : undefined,
          partTrackingId: formData.partTrackingId,
          requestJustification: formData.requestJustification,
          targetDeliveryDate: formData.targetDeliveryDate ? new Date(formData.targetDeliveryDate) : undefined,
          shippingTerms: formData.shippingTerms,
          country: formData.country,
          region: formData.region,
          communicationLanguage: formData.communicationLanguage,
          requiredCertificates: formData.requiredCertificates,
          notes: formData.notes
        },
        ndaFile: formData.ndaFileUrl,
        status: 'OPEN_FOR_REQUESTS'
      };

      const response = await rfqAPI.create(payload);
      if (response.success) {
        showSuccess('RFQ created successfully!');
        navigate('/my-rfqs');
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to create RFQ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-gray-600 hover:text-[#4881F8] mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold mb-2">Start Your RFQ</h1>
        <p className="text-gray-600">Create a new request for quotation</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('workpieces')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'workpieces'
                ? 'border-[#4881F8] text-[#4881F8]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Workpieces
          </button>
          <button
            onClick={() => setActiveTab('requirements')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'requirements'
                ? 'border-[#4881F8] text-[#4881F8]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Requirements
          </button>
        </nav>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6">
        {/* Workpieces Tab */}
        {activeTab === 'workpieces' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                RFQ Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                placeholder="e.g., Precision CNC Machined Bracket"
              />
            </div>

            {formData.workpieces.map((workpiece, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Workpiece {index + 1}</h3>

                {/* Main File Upload */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Main Workpiece File (STL) * (Max 150MB)
                  </label>
                  {workpiece.mainFileUrl ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <File size={20} className="text-[#4881F8] mr-2" />
                          <span className="text-sm">{workpiece.mainFile?.name || 'File uploaded'}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile('main', index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={20} />
                        </button>
                      </div>
                      {/* STL Preview */}
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <STLViewer 
                          fileUrl={workpiece.mainFileUrl} 
                          height="400px"
                          backgroundColor="#f9fafb"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#4881F8] transition-colors">
                      <input
                        type="file"
                        accept=".stl,.STL"
                        onChange={(e) => handleFileUpload(e.target.files[0], 'main', index)}
                        className="hidden"
                        id={`main-file-${index}`}
                        disabled={uploading}
                      />
                      <label
                        htmlFor={`main-file-${index}`}
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <Upload size={32} className="text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">Click to upload or drag and drop</span>
                        <span className="text-xs text-gray-500 mt-1">STL file (Max 150MB)</span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Dimensions */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Length (mm)</label>
                    <input
                      type="number"
                      value={workpiece.dimensions.length}
                      onChange={(e) => handleWorkpieceChange(index, 'dimensions.length', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Width (mm)</label>
                    <input
                      type="number"
                      value={workpiece.dimensions.width}
                      onChange={(e) => handleWorkpieceChange(index, 'dimensions.width', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Height (mm)</label>
                    <input
                      type="number"
                      value={workpiece.dimensions.height}
                      onChange={(e) => handleWorkpieceChange(index, 'dimensions.height', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Diameter (mm)</label>
                    <input
                      type="number"
                      value={workpiece.dimensions.diameter}
                      onChange={(e) => handleWorkpieceChange(index, 'dimensions.diameter', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Part Type */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Part Type</label>
                  <input
                    type="text"
                    value={workpiece.partType}
                    onChange={(e) => handleWorkpieceChange(index, 'partType', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                    placeholder="e.g., Gear, Pipe, Bracket, Housing"
                  />
                </div>

                {/* Technology & Material */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Technology *</label>
                    <select
                      value={workpiece.technology}
                      onChange={(e) => handleWorkpieceChange(index, 'technology', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                      required
                    >
                      <option value="">Select technology</option>
                      {technologyOptions.map(tech => (
                        <option key={tech} value={tech}>{tech.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Material *</label>
                    <input
                      type="text"
                      value={workpiece.material}
                      onChange={(e) => handleWorkpieceChange(index, 'material', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                      placeholder="e.g., Aluminum 6061, Steel, Plastic"
                      required
                    />
                  </div>
                </div>

                {/* Quantity */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    value={workpiece.quantity}
                    onChange={(e) => handleWorkpieceChange(index, 'quantity', parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                    required
                  />
                </div>

                {/* Extra Files */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Extra Files (Optional, Max 50MB each)
                  </label>
                  <div className="space-y-2">
                    {workpiece.extraFiles.map((file, fileIndex) => (
                      <div key={fileIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{file}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile('extra', index, fileIndex)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    <input
                      type="file"
                      onChange={(e) => handleFileUpload(e.target.files[0], 'extra', index)}
                      className="text-sm"
                      disabled={uploading}
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* NDA File */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                NDA File (Optional, Max 10MB)
              </label>
              {formData.ndaFileUrl ? (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <File size={20} className="text-[#4881F8] mr-2" />
                    <span className="text-sm">{formData.ndaFile?.name || 'NDA uploaded'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile('nda')}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileUpload(e.target.files[0], 'nda')}
                  className="text-sm"
                  disabled={uploading}
                />
              )}
            </div>
          </div>
        )}

        {/* Requirements Tab */}
        {activeTab === 'requirements' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Quote Currency *
                </label>
                <select
                  name="preferredCurrency"
                  value={formData.preferredCurrency}
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
                  Shipping Terms (Incoterms) *
                </label>
                <select
                  name="shippingTerms"
                  value={formData.shippingTerms}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                >
                  {incotermsOptions.map(term => (
                    <option key={term} value={term}>{term}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  RFQ Deadline *
                </label>
                <input
                  type="datetime-local"
                  name="rfqDeadline"
                  value={formData.rfqDeadline}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Acceptance Deadline
                </label>
                <input
                  type="datetime-local"
                  name="acceptanceDeadline"
                  value={formData.acceptanceDeadline}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Delivery Date
                </label>
                <input
                  type="date"
                  name="targetDeliveryDate"
                  value={formData.targetDeliveryDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Part Tracking ID
                </label>
                <input
                  type="text"
                  name="partTrackingId"
                  value={formData.partTrackingId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country *
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Region
                </label>
                <input
                  type="text"
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                  placeholder="e.g., DACH, EU, APAC"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Communication Language
              </label>
              <input
                type="text"
                name="communicationLanguage"
                value={formData.communicationLanguage}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required Certificates
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {certificationOptions.map((cert) => (
                  <label key={cert} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.requiredCertificates.includes(cert)}
                      onChange={(e) => handleArrayChange('requiredCertificates', cert, e.target.checked)}
                      className="w-4 h-4 text-[#4881F8] border-gray-300 rounded focus:ring-[#4881F8]"
                    />
                    <span className="text-sm text-gray-700">{cert.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Request Justification
              </label>
              <textarea
                name="requestJustification"
                value={formData.requestJustification}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                placeholder="Explain the purpose and requirements of this RFQ..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                placeholder="Additional notes or special requirements..."
              />
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between">
          {activeTab === 'requirements' && (
            <button
              type="button"
              onClick={() => setActiveTab('workpieces')}
              className="flex items-center px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={18} className="mr-2" />
              Back
            </button>
          )}
          <div className="ml-auto">
            {activeTab === 'workpieces' ? (
              <button
                type="submit"
                className="flex items-center px-6 py-2 bg-[#4881F8] text-white rounded-lg hover:bg-[#3b6fe0] transition-colors"
              >
                Next
                <ArrowRight size={18} className="ml-2" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading || uploading}
                className="flex items-center px-6 py-2 bg-[#4881F8] text-white rounded-lg hover:bg-[#3b6fe0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={18} className="mr-2" />
                {loading ? 'Submitting...' : 'Submit RFQ'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default StartRFQPage;

