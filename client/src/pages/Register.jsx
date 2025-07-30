import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Mail, Phone, Lock, User, UserCheck, Eye, EyeOff, KeyRound } from 'lucide-react';

const Register = () => {
  // This state will control which view to show: 'details' or 'otp'
  const [uiStep, setUiStep] = useState('details');

  // State for the main registration form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'citizen'
  });
  
  // New state specifically for the OTP input
  const [otp, setOtp] = useState('');

  // Common states for UI feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  // Handles changes for the main registration form
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // --- Step 1: Handle Initial Registration and Send OTP ---
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        contact_number: formData.phone,
        role: formData.role
      };

      const API_URL = 'http://localhost:8080/auth/register/user';
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.msg || 'Something went wrong');
      }

      // On success, switch the UI to the OTP verification step
      console.log('Registration details submitted. OTP sent.');
      setUiStep('otp');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Step 2: Handle OTP Verification ---
  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        email: formData.email, // Use the email from the first form
        receivedOtp: otp,
      };

      const API_URL = 'http://localhost:8080/auth/verify-otp';
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.msg || 'Verification failed');
      }

      console.log('OTP Verified:', responseData);
      
      // On successful verification, navigate to the dashboard
      if (responseData.token) {
        localStorage.setItem('authToken', responseData.token);
      }
      alert('Verification successful! You can now log in.');
      navigate('/login');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-r from-blue-50 to-yellow-50">
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="bg-white p-2 rounded-full">
              <Shield className="w-8 h-8 text-blue-800" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-gray-800 font-bold text-xl">SafeReport</span>
              <span className="text-yellow-600 text-sm">Government Portal</span>
            </div>
          </Link>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {uiStep === 'details' ? 'Official Registration' : 'Verify Your Email'}
          </h2>
          <p className="text-gray-600">
            {uiStep === 'details' 
              ? 'Create your government portal account' 
              : `An OTP has been sent to ${formData.email}`
            }
          </p>
        </div>

        {/* Form Container */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="bg-white/95 backdrop-blur-md rounded-lg border-2 border-yellow-400 p-8 shadow-2xl"
        >
          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-100 border border-red-400 text-red-700 p-3 rounded-md text-sm mb-6"
            >
              {error}
            </motion.div>
          )}

          {/* Conditional Rendering based on uiStep */}
          {uiStep === 'details' ? (
            // --- REGISTRATION FORM ---
            <form onSubmit={handleRegisterSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="text-blue-900 font-semibold">Full Legal Name</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-600" />
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-blue-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600" placeholder="Enter your full name" />
                </div>
              </div>
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="text-blue-900 font-semibold">Official Email Address</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-600" />
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-blue-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600" placeholder="Enter your email" />
                </div>
              </div>
              {/* Phone Number Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="text-blue-900 font-semibold">Phone No.</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-600" />
                  <input type="number" name="phone" value={formData.phone} onChange={handleChange} required className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-blue-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600" placeholder="Enter your Phone Number" />
                </div>
              </div>
              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="text-blue-900 font-semibold">Secure Password</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-600" />
                  <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required className="w-full pl-10 pr-12 py-3 bg-white border-2 border-gray-300 rounded-lg text-blue-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600" placeholder="Create a password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-700">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="text-blue-900 font-semibold">Confirm Password</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-600" />
                  <input type={showPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-blue-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600" placeholder="Confirm your password" />
                </div>
              </div>
              {/* Submit Button */}
              <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-bold flex items-center justify-center space-x-2 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed border-2 border-yellow-400">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><UserCheck className="w-5 h-5" /><span>Register Account</span></>}
              </motion.button>
            </form>
          ) : (
            // --- OTP VERIFICATION FORM ---
            <form onSubmit={handleVerifySubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="text-blue-900 font-semibold">6-Digit OTP</span>
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-600" />
                  <input
                    type="text"
                    name="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    maxLength="6"
                    className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-blue-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 tracking-[0.5em] text-center"
                    placeholder="______"
                  />
                </div>
              </div>
              <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-bold flex items-center justify-center space-x-2 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed border-2 border-yellow-400">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><UserCheck className="w-5 h-5" /><span>Verify & Complete</span></>}
              </motion.button>
            </form>
          )}

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-blue-800">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                Sign in here
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register;
