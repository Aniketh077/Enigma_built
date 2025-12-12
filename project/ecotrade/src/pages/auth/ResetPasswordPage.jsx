import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { Lock, Eye, EyeOff, CircleAlert as AlertCircle, CircleCheck as CheckCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useDispatch, useSelector } from 'react-redux';
import { resetPassword, clearError, clearSuccessMessage } from '../../store/slices/authSlice';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { showSuccess, showError } = useToast();
  const { isLoading, error, successMessage } = useSelector((state) => state.auth);
  const token = new URLSearchParams(location.search).get('token');
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    dispatch(clearError());
    dispatch(clearSuccessMessage());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.newPassword) {
      errors.newPassword = 'Password is required';
    } else if (formData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters long';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };



  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) return;
  if (!token) return;

  dispatch(clearError());
  dispatch(clearSuccessMessage());

  try {
    const result = await dispatch(resetPassword({
      token,
      newPassword: formData.newPassword,
      confirmPassword: formData.confirmPassword
    }));

    if (resetPassword.fulfilled.match(result)) {
      dispatch({
        type: 'auth/setSuccessMessage',
        payload: null,
      });
      setResetComplete(true);
      setTimeout(() => {
        navigate('/role-selection');
      }, 3000);
    } else {
      dispatch({
        type: 'auth/setError',
        payload: result.error?.message || 'Password reset failed. Please try again.',
      });
    }
  } catch (error) {
    console.error('Reset password error:', error);
    dispatch({
      type: 'auth/setError',
      payload: 'An error occurred while resetting password. Please try again.',
    });
  }
};

useEffect(() => {
  if (successMessage) {
    showSuccess(successMessage);
    dispatch(clearSuccessMessage());
  }
}, [successMessage, showSuccess, dispatch]);

useEffect(() => {
  if (error) {
    showError(error);
    dispatch(clearError());
  }
}, [error, showError, dispatch]);

  if (!token) {
    return (
      <div className="min-h-screen pt-20 pb-16 flex flex-col justify-center">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <img 
                    src="/indianet png.png" 
                    alt="Enigma Logo" 
                    className="h-12 w-auto object-contain"
                  />
                </div>
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Invalid Reset Link</h1>
                <p className="text-gray-600 mb-6">
                  This password reset link is invalid or has expired. Please request a new one.
                </p>
                <Link to="/forgot-password">
                  <Button variant="primary">
                    Request New Link
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16 flex flex-col justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <img 
                  src="/indianet png.png" 
                  alt="Enigma Logo" 
                  className="h-12 w-auto object-contain"
                />
              </div>
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold mb-2">
                {resetComplete ? 'Password Reset Complete!' : 'Reset Your Password'}
              </h1>
              <p className="text-gray-600">
                {resetComplete 
                  ? 'Your password has been successfully reset.'
                  : 'Enter your new password below.'
                }
              </p>
            </div>

            {resetComplete ? (
              <div className="text-center">
                <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
                  <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-green-800 font-medium">Success!</p>
                  <p className="text-green-700 text-sm mt-1">
                    Redirecting you to login page...
                  </p>
                </div>
                <Link to="/role-selection">
                  <Button variant="primary">
                    Go to Login
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Input
                    label="New Password"
                    type={showPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    leftIcon={<Lock className="h-5 w-5" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    }
                    placeholder="Enter your new password"
                    fullWidth
                    required
                    error={validationErrors.newPassword}
                  />
                </div>

                <div>
                  <Input
                    label="Confirm New Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    leftIcon={<Lock className="h-5 w-5" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    }
                    placeholder="Confirm your new password"
                    fullWidth
                    required
                    error={validationErrors.confirmPassword}
                  />
                </div>

                <div className="text-sm text-gray-600">
                  <p className="mb-2">Password requirements:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>At least 6 characters long</li>
                    <li>Should contain letters and numbers</li>
                    <li>Avoid using common words</li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  isLoading={isLoading}
                  leftIcon={<Lock className="h-5 w-5" />}
                >
                  Reset Password
                </Button>
              </form>
            )}

            <div className="mt-8 text-center">
              <Link
                to="/role-selection"
                className="text-sm font-medium hover:underline"
                style={{ color: '#4881F8' }}
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;