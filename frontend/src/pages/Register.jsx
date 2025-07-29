import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, User, UserCheck, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'citizen'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        role: formData.role
      });
      navigate('/dashboard');
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const roles = [
    { value: 'citizen', label: 'Citizen', icon: User, desc: 'Report incidents and track community safety', color: 'text-green-600' },
    { value: 'police', label: 'Police Officer', icon: Shield, desc: 'Law enforcement access and case management', color: 'text-blue-600' },
    { value: 'admin', label: 'System Administrator', icon: UserCheck, desc: 'Full system administration and oversight', color: 'text-red-600' }
  ];

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
              <span className="text-white font-bold text-xl">SafeReport</span>
              <span className="text-yellow-300 text-sm">Government Portal</span>
            </div>
          </Link>
          <h2 className="text-3xl font-bold text-white mb-2">Official Registration</h2>
          <p className="text-gray-300">Create your government portal account</p>
        </div>

        {/* Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="bg-white/95 backdrop-blur-md rounded-lg border-2 border-yellow-400 p-8 shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-md text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <span className="text-blue-900 font-semibold">Full Legal Name</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-600" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-blue-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all duration-200"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <span className="text-blue-900 font-semibold">Official Email Address</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-600" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-blue-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all duration-200"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                <span className="text-blue-900 font-semibold">Account Type</span>
              </label>
              <div className="space-y-3">
                {roles.map((role) => {
                  const Icon = role.icon;
                  return (
                    <label
                      key={role.value}
                      className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        formData.role === role.value
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={role.value}
                        checked={formData.role === role.value}
                        onChange={handleChange}
                        className="mt-1 sr-only"
                      />
                      <Icon className={`w-6 h-6 mt-0.5 ${
                        formData.role === role.value ? role.color : 'text-gray-400'
                      }`} />
                      <div>
                        <div className={`font-semibold ${
                          formData.role === role.value ? 'text-blue-900' : 'text-gray-700'
                        }`}>
                          {role.label}
                        </div>
                        <div className={`text-sm mt-1 ${
                          formData.role === role.value ? 'text-blue-700' : 'text-gray-500'
                        }`}>
                          {role.desc}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <span className="text-blue-900 font-semibold">Secure Password</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-600" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-12 py-3 bg-white border-2 border-gray-300 rounded-lg text-blue-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all duration-200"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
               <span className="text-blue-900 font-semibold">Confirm Password</span>
              </label>
              <div className="relative">
               <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-600" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                 className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-blue-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all duration-200"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
             className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-bold flex items-center justify-center space-x-2 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-yellow-400"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <UserCheck className="w-5 h-5" />
                 <span>Register Account</span>
                </>
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
           <p className="text-blue-800">
              Already have an account?{' '}
             <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
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