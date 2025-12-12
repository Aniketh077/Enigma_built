import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, RefreshCw, CircleCheck as CheckCircle } from 'lucide-react';

import {
  verifyEmail,
  resendVerificationEmail,
  clearError,
  clearSuccessMessage,
} from '../../store/slices/authSlice';

const EmailVerificationPage = () => {
  const { token } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showSuccess, showError } = useToast();

  const { isLoading, error, successMessage } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [showResendForm, setShowResendForm] = useState(false);

  useEffect(() => {
    dispatch(clearError());
    dispatch(clearSuccessMessage());

    const searchParams = new URLSearchParams(location.search);
    const emailFromUrl = searchParams.get('email');
    const tokenFromUrl = searchParams.get('token');

    if (emailFromUrl) setEmail(emailFromUrl);

    const verificationToken = token || tokenFromUrl;

    if (verificationToken && !isVerifying && !verificationComplete) {
      setIsVerifying(true); 
      handleVerification(verificationToken);
    }
  }, [token, location.search]);

  const handleVerification = async (verificationToken) => {
    setIsVerifying(true);
    dispatch(clearError());
    dispatch(clearSuccessMessage());

    try {
      const result = await dispatch(verifyEmail(verificationToken));
      if (verifyEmail.fulfilled.match(result)) {
        setVerificationComplete(true);
        // Don't show toast here - let the useEffect handle it
        setTimeout(() => {
          navigate('/login', {
            state: null,
          });
        }, 3000);
      }
      // Don't handle errors here - let the useEffect handle them
    } catch (error) {
      console.error('Verification error:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendVerification = async (e) => {
    e.preventDefault();
    if (!email) return;

    dispatch(clearError());
    dispatch(clearSuccessMessage());

    try {
      await dispatch(resendVerificationEmail(email));
      // Don't handle success/error here - let useEffect handle it
    } catch (error) {
      console.error('Resend error:', error);
    }
  };

  const handleManualVerification = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const verificationToken = formData.get('verificationToken');
    if (verificationToken) {
      handleVerification(verificationToken);
    }
  };

  // Single useEffect to handle both success and error messages
  useEffect(() => {
    if (error && !verificationComplete) {
      showError(error);
      dispatch(clearError());
    }
  }, [error, showError, dispatch, verificationComplete]);

  useEffect(() => {
    if (successMessage) {
      showSuccess(successMessage);
      dispatch(clearSuccessMessage());
    }
  }, [successMessage, showSuccess, dispatch]);

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
              <h1 className="text-2xl font-bold mb-2">Verify Your Email</h1>
              <p className="text-gray-600">
                {token || new URLSearchParams(location.search).get('token')
                  ? 'Verifying your email address...'
                  : 'Please verify your email address to continue'}
              </p>
            </div>

            {isVerifying && (
              <div className="text-center mb-6">
                <div className="inline-flex items-center px-4 py-2 bg-green-50 rounded-md">
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin text-green-600" />
                  <span className="text-green-600">Verifying...</span>
                </div>
              </div>
            )}

            {verificationComplete && (
              <div className="text-center mb-6">
                <div className="inline-flex items-center px-4 py-2 bg-green-50 rounded-md">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  <span className="text-green-600">Email verified successfully!</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Redirecting you to login page...
                </p>
              </div>
            )}

            {!token &&
              !new URLSearchParams(location.search).get('token') &&
              !verificationComplete && (
                <div className="space-y-6">
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">
                      We've sent a verification link to your email address.
                      Click the link in your email to verify your account.
                    </p>

                    <Button
                      variant="outline"
                      onClick={() => setShowResendForm(!showResendForm)}
                      className="mb-4"
                    >
                      Didn't receive the email?
                    </Button>
                  </div>

                  {showResendForm && (
                    <form onSubmit={handleResendVerification} className="space-y-4">
                      <Input
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        leftIcon={<Mail className="h-5 w-5" />}
                        placeholder="Enter your email address"
                        fullWidth
                        required
                      />
                      <Button
                        type="submit"
                        variant="primary"
                        fullWidth
                        isLoading={isLoading}
                        leftIcon={<RefreshCw className="h-5 w-5" />}
                      >
                        Resend Verification Email
                      </Button>
                    </form>
                  )}

                  <div className="border-t pt-6">
                    
                  </div>
                </div>
              )}

            <div className="mt-8 text-center text-sm">
              <Link to="/login" className="text-green-700 hover:text-emerald-600">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;