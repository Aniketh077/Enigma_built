import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Upload } from 'lucide-react';
import { authAPI } from '../../api/authAPI';
import { useToast } from '../../contexts/ToastContext';

const EnigmaRegisterPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showSuccess, showError } = useToast();
  const role = searchParams.get('role') || 'BUYER';

  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    // Basic Info
    title: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    country: 'India',
    
    // Company Info
    companyName: '',
    website: '',
    gstNumber: '',
    
    // Address
    address: '',
    city: '',
    state: '',
    zipCode: '',
    
    // Manufacturer fields
    manufacturingTypes: [],
    companySize: '',
    yearsInBusiness: '',
    maxDimensions: { height: '', width: '', length: '' },
    primaryMaterials: [],
    certifications: [],
    
    // Buyer fields
    industryVertical: '',
    annualSpending: '',
    procurementTeamSize: '',
    preferredLeadTime: ''
  });

  const manufacturingTypesOptions = [
    'CNC', '3D_PRINTING', 'SHEET_METAL', 'DIE_CASTING', 
    'INJECTION_MOLDING', 'STAMPING', 'WELDING', 'ASSEMBLY', 'OTHER'
  ];

  const materialOptions = [
    'Aluminum', 'Steel', 'Stainless Steel', 'Brass', 'Copper', 
    'Titanium', 'Plastic/Polymers', 'Composites', 'Others'
  ];

  const certificationOptions = [
    'ISO_9001', 'ISO_13485', 'AS9100', 'IATF_16949', 'ROHS', 'OTHER'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleArrayChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleDimensionChange = (dimension, value) => {
    setFormData(prev => ({
      ...prev,
      maxDimensions: {
        ...prev.maxDimensions,
        [dimension]: value
      }
    }));
  };

  // Password validation rules
  const validatePassword = (password) => {
    const rules = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    return rules;
  };

  const getPasswordStrength = (password) => {
    if (!password) return 0;
    const rules = validatePassword(password);
    const passedRules = Object.values(rules).filter(Boolean).length;
    return (passedRules / 5) * 100;
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email';
      
      // Comprehensive password validation
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else {
        const passwordRules = validatePassword(formData.password);
        if (!passwordRules.minLength) {
          newErrors.password = 'Password must be at least 8 characters long';
        } else if (!passwordRules.hasUpperCase) {
          newErrors.password = 'Password must contain at least one uppercase letter';
        } else if (!passwordRules.hasLowerCase) {
          newErrors.password = 'Password must contain at least one lowercase letter';
        } else if (!passwordRules.hasNumber) {
          newErrors.password = 'Password must contain at least one number';
        } else if (!passwordRules.hasSpecialChar) {
          newErrors.password = 'Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)';
        }
      }
      
      // Confirm password validation
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      
      if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
      else if (!/^[6-9]\d{9}$/.test(formData.phoneNumber)) newErrors.phoneNumber = 'Invalid phone number';
    }
    
    if (step === 2) {
      if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
      if (!formData.address.trim()) newErrors.address = 'Address is required';
      if (!formData.city.trim()) newErrors.city = 'City is required';
      if (!formData.state.trim()) newErrors.state = 'State is required';
      if (!formData.zipCode.trim()) newErrors.zipCode = 'Zip code is required';
      else if (!/^[0-9]{5,6}$/.test(formData.zipCode)) newErrors.zipCode = 'Invalid zip code';
      
      // Manufacturing types required for all user types
      if (formData.manufacturingTypes.length === 0) {
        newErrors.manufacturingTypes = 'Select at least one manufacturing type';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;
    
    setIsSubmitting(true);
    
    try {
      const payload = {
        ...formData,
        userType: role,
        maxDimensions: {
          height: parseFloat(formData.maxDimensions.height) || 0,
          width: parseFloat(formData.maxDimensions.width) || 0,
          length: parseFloat(formData.maxDimensions.length) || 0
        }
      };
      
      const response = await authAPI.register(payload);
      
      if (response) {
        showSuccess(response.message || 'Registration successful! Please check your email to verify your account.');
        navigate('/verify-email', {
          state: { email: formData.email }
        });
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalSteps = role === 'HYBRID' ? 3 : 2;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/role-selection')}
            className="flex items-center text-gray-600 hover:text-[#4881F8] mb-4"
          >
            <ArrowLeft className="mr-2" size={20} />
            Back to Role Selection
          </button>
          <div className="flex justify-center mb-4">
            <img 
              src="/indianet png.png" 
              alt="Enigma Logo" 
              className="h-12 w-auto object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold mb-2 text-center" style={{ color: '#4881F8' }}>
            {role === 'BUYER' && 'Sign up as Buyer'}
            {role === 'MANUFACTURER' && 'Sign up as Manufacturer'}
            {role === 'HYBRID' && 'Sign up as Hybrid'}
          </h1>
          <p className="text-gray-600 text-center">Complete your registration to get started</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[...Array(totalSteps)].map((_, i) => (
              <div key={i} className="flex-1 flex items-center">
                <div className="flex-1 flex items-center">
                  <div
                    className={`h-2 rounded-full flex-1 ${
                      i + 1 <= currentStep ? 'bg-[#4881F8]' : 'bg-gray-200'
                    }`}
                  />
                </div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mx-2 ${
                    i + 1 <= currentStep
                      ? 'bg-[#4881F8] text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {i + 1}
                </div>
                <div className="flex-1 flex items-center">
                  {i < totalSteps - 1 && (
                    <div
                      className={`h-2 rounded-full flex-1 ${
                        i + 1 < currentStep ? 'bg-[#4881F8]' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-8">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold mb-6">Basic Information</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <select
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                  >
                    <option value="">Select</option>
                    <option value="Mr">Mr</option>
                    <option value="Mrs">Mrs</option>
                    <option value="Ms">Ms</option>
                    <option value="Dr">Dr</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent ${
                      errors.fullName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent ${
                      errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="10-digit mobile number"
                    required
                  />
                  {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent pr-10 ${
                        errors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            getPasswordStrength(formData.password) < 40 ? 'bg-red-500' :
                            getPasswordStrength(formData.password) < 70 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${getPasswordStrength(formData.password)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Password strength: {
                          getPasswordStrength(formData.password) < 40 ? 'Weak' :
                          getPasswordStrength(formData.password) < 70 ? 'Medium' :
                          'Strong'
                        }
                      </p>
                    </div>
                  )}
                  
                  {/* Password Rules */}
                  {formData.password && (
                    <div className="mt-2 text-xs space-y-1">
                      <p className="text-gray-600 font-medium mb-2">Password must contain:</p>
                      <div className="space-y-1">
                        <div className={`flex items-center ${formData.password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                          <span className="mr-2">{formData.password.length >= 8 ? '✓' : '○'}</span>
                          <span>At least 8 characters</span>
                        </div>
                        <div className={`flex items-center ${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                          <span className="mr-2">{/[A-Z]/.test(formData.password) ? '✓' : '○'}</span>
                          <span>One uppercase letter</span>
                        </div>
                        <div className={`flex items-center ${/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                          <span className="mr-2">{/[a-z]/.test(formData.password) ? '✓' : '○'}</span>
                          <span>One lowercase letter</span>
                        </div>
                        <div className={`flex items-center ${/\d/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                          <span className="mr-2">{/\d/.test(formData.password) ? '✓' : '○'}</span>
                          <span>One number</span>
                        </div>
                        <div className={`flex items-center ${/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                          <span className="mr-2">{/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? '✓' : '○'}</span>
                          <span>One special character (!@#$%^&*(),.?":{}|&lt;&gt;)</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent pr-10 ${
                        errors.confirmPassword 
                          ? 'border-red-500' 
                          : formData.confirmPassword && formData.password === formData.confirmPassword
                          ? 'border-green-500'
                          : 'border-gray-300'
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  
                  {/* Password Match Indicator */}
                  {formData.confirmPassword && (
                    <div className="mt-1">
                      {formData.password === formData.confirmPassword ? (
                        <p className="text-green-600 text-sm flex items-center">
                          <span className="mr-1">✓</span> Passwords match
                        </p>
                      ) : (
                        <p className="text-red-500 text-sm flex items-center">
                          <span className="mr-1">✗</span> Passwords do not match
                        </p>
                      )}
                    </div>
                  )}
                  
                  {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Company & Address */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold mb-6">Company & Address Information</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent ${
                      errors.companyName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
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
                    placeholder="Enter the Website if any"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company GST/VAT Number
                  </label>
                  <input
                    type="text"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent ${
                      errors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent ${
                      errors.state ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zip Code *
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent ${
                      errors.zipCode ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
                </div>
              </div>

              {/* Manufacturing Capabilities - Show for ALL user types */}
              <div className="mt-8 space-y-6 border-t pt-6">
                <h3 className="text-xl font-semibold">Manufacturing Capabilities</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Manufacturing Types * (Select at least one)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {manufacturingTypesOptions.map((type) => (
                      <label key={type} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.manufacturingTypes.includes(type)}
                          onChange={() => handleArrayChange('manufacturingTypes', type)}
                          className="w-4 h-4 text-[#4881F8] border-gray-300 rounded focus:ring-[#4881F8]"
                        />
                        <span className="text-sm text-gray-700">{type.replace('_', ' ')}</span>
                      </label>
                    ))}
                  </div>
                  {errors.manufacturingTypes && (
                    <p className="text-red-500 text-sm mt-1">{errors.manufacturingTypes}</p>
                  )}
                </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Height (mm)
                      </label>
                      <input
                        type="number"
                        value={formData.maxDimensions.height}
                        onChange={(e) => handleDimensionChange('height', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Width (mm)
                      </label>
                      <input
                        type="number"
                        value={formData.maxDimensions.width}
                        onChange={(e) => handleDimensionChange('width', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Length (mm)
                      </label>
                      <input
                        type="number"
                        value={formData.maxDimensions.length}
                        onChange={(e) => handleDimensionChange('length', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Materials
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {materialOptions.map((material) => (
                        <label key={material} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.primaryMaterials.includes(material)}
                            onChange={() => handleArrayChange('primaryMaterials', material)}
                            className="w-4 h-4 text-[#4881F8] border-gray-300 rounded focus:ring-[#4881F8]"
                          />
                          <span className="text-sm text-gray-700">{material}</span>
                        </label>
                      ))}
                    </div>
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
                            onChange={() => handleArrayChange('certifications', cert)}
                            className="w-4 h-4 text-[#4881F8] border-gray-300 rounded focus:ring-[#4881F8]"
                          />
                          <span className="text-sm text-gray-700">{cert.replace('_', ' ')}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Size (employees)
                    </label>
                    <input
                      type="text"
                      name="companySize"
                      value={formData.companySize}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Years in Business
                    </label>
                    <input
                      type="number"
                      name="yearsInBusiness"
                      value={formData.yearsInBusiness}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Buyer Information - Show for ALL user types */}
              <div className="mt-8 space-y-6 border-t pt-6">
                <h3 className="text-xl font-semibold">Buyer Information</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Industry Vertical
                      </label>
                      <input
                        type="text"
                        name="industryVertical"
                        value={formData.industryVertical}
                        onChange={handleChange}
                        placeholder="e.g., Automotive, Aerospace, Medical"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Annual Spending
                      </label>
                      <input
                        type="text"
                        name="annualSpending"
                        value={formData.annualSpending}
                        onChange={handleChange}
                        placeholder="Estimated annual spending"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Procurement Team Size
                      </label>
                      <input
                        type="text"
                        name="procurementTeamSize"
                        value={formData.procurementTeamSize}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Lead Time
                      </label>
                      <input
                        type="text"
                        name="preferredLeadTime"
                        value={formData.preferredLeadTime}
                        onChange={handleChange}
                        placeholder="e.g., 2-4 weeks"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4881F8] focus:border-transparent"
                      />
                    </div>
                  </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`px-6 py-2 rounded-lg border ${
                currentStep === 1
                  ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Back
            </button>
            
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2 rounded-lg text-white font-medium"
                style={{ backgroundColor: '#4881F8' }}
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 rounded-lg text-white font-medium disabled:opacity-50"
                style={{ backgroundColor: '#4881F8' }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnigmaRegisterPage;

