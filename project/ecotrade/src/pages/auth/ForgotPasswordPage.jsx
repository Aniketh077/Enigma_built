import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CircleCheck as CheckCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '../../contexts/ToastContext';

import {
  forgotPassword,
  clearError,
  clearSuccessMessage
} from '../../store/slices/authSlice';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, error, successMessage } = useSelector((state) => state.auth);
  const { showSuccess, showError } = useToast();

  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    dispatch(clearError());
    dispatch(clearSuccessMessage());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      showError(error);
      dispatch(clearError());
    }

    if (successMessage) {
      showSuccess(successMessage);
      dispatch(clearSuccessMessage());
    }
  }, [error, successMessage, showError, showSuccess, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      showError('Please enter your email address.');
      return;
    }

    dispatch(clearError());
    dispatch(clearSuccessMessage());

    try {
      const result = await dispatch(forgotPassword(email));
      if (forgotPassword.fulfilled.match(result)) {
        setEmailSent(true);
      }
    } catch (error) {
      console.error('Forgot password error:', error);
    }
  };

  const handleResendEmail = async () => {
    dispatch(clearError());
    dispatch(clearSuccessMessage());

    try {
      await dispatch(forgotPassword(email));
    } catch (error) {
      console.error('Resend error:', error);
    }
  };

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
              <h1 className="text-2xl font-bold mb-2">
                {emailSent ? 'Check Your Email' : 'Forgot Password?'}
              </h1>
              <p className="text-gray-600">
                {emailSent
                  ? "We've sent a password reset link to your email address."
                  : "No worries! Enter your email address and we'll send you a link to reset your password."}
              </p>
            </div>

            {!emailSent ? (
              <form onSubmit={handleSubmit} className="space-y-6">
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
                  size="lg"
                  fullWidth
                  isLoading={isLoading}
                  leftIcon={<Mail className="h-5 w-5" />}
                >
                  Send Reset Link
                </Button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
                    <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="text-green-800 font-medium">Reset link sent!</p>
                    <p className="text-green-700 text-sm mt-1">
                      Check your email for the password reset link. It may take a few minutes to arrive.
                    </p>
                  </div>

                  <div className="text-sm text-gray-600">
                    <p className="mb-2">Sent to: <span className="font-medium">{email}</span></p>
                    <p>Didn't receive the email? Check your spam folder or</p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  fullWidth
                  onClick={handleResendEmail}
                  isLoading={isLoading}
                >
                  Resend Email
                </Button>

                <div className="text-center">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setEmailSent(false);
                      setEmail('');
                      dispatch(clearError());
                      dispatch(clearSuccessMessage());
                    }}
                  >
                    Try a different email
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-8 text-center">
              <button
                onClick={() => navigate('/role-selection')}
                className="inline-flex items-center text-sm font-medium hover:underline"
                style={{ color: '#4881F8' }}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
