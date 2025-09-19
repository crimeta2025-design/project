import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Mail, Phone, Lock, User, UserCheck, Eye, EyeOff, KeyRound, MapPin, Building } from 'lucide-react';

const Register = () => {
  const [uiStep, setUiStep] = useState('details');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'citizen', // Citizen by default
    badgeNumber: '',
    address: '',
    city: '',
    pincode: ''
  });
  
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // --- CHANGE: Role badalne ke liye naya function ---
  const handleRoleChange = (newRole) => {
    setFormData(prev => ({
      ...prev,
      role: newRole,
      // Role change hone par police-specific fields ko reset karein
      badgeNumber: '',
      address: '',
      city: '',
      pincode: ''
    }));
  };

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
      let API_URL = '';
      let payload = {};

      if (formData.role === 'police') {
        // Police ke liye pehle location get karein
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true });
        });
        
        API_URL = 'https://crimeta1.onrender.com/auth/register/department';
        payload = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            contact_number: formData.phone,
            badge_number: formData.badgeNumber,
            address: formData.address,
            city: formData.city,
            pincode: formData.pincode,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
        };
      } else { // citizen
        API_URL = 'https://crimeta1.onrender.com/auth/register/user';
        payload = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            contact_number: formData.phone,
        };
      }

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.msg || 'Something went wrong');
      }

      console.log('Registration details submitted. OTP sent.');
      setUiStep('otp');

    } catch (err) {
      setError(err.message || 'Could not get location. Please enable location services.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = { email: formData.email, receivedOtp: otp };
      const API_URL = 'https://crimeta1.onrender.com/auth/verify-otp';
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.msg || 'Verification failed');
      if (responseData.token) localStorage.setItem('authToken', responseData.token);
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
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="bg-white p-2 rounded-full"><Shield className="w-8 h-8 text-blue-800" /></div>
            <div className="flex flex-col items-start">
              <span className="text-gray-800 font-bold text-xl">SafeReport</span>
              <span className="text-yellow-600 text-sm">Government Portal</span>
            </div>
          </Link>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">{uiStep === 'details' ? 'Official Registration' : 'Verify Your Email'}</h2>
          <p className="text-gray-600">{uiStep === 'details' ? 'Create your government portal account' : `An OTP has been sent to ${formData.email}`}</p>
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="bg-white/95 backdrop-blur-md rounded-lg border-2 border-yellow-400 p-8 shadow-2xl"
        >
          {error && (<motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-red-100 border border-red-400 text-red-700 p-3 rounded-md text-sm mb-6">{error}</motion.div>)}
          {uiStep === 'details' ? (
            <form onSubmit={handleRegisterSubmit} className="space-y-6">
              {/* --- CHANGE: Naya Role Selection UI --- */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Registration Type
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-gray-200 rounded-lg">
                  <button
                    type="button"
                    onClick={() => handleRoleChange('citizen')}
                    className={`flex items-center justify-center space-x-2 w-full px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
                      formData.role === 'citizen' 
                        ? 'bg-blue-600 text-white shadow' 
                        : 'bg-transparent text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>Citizen</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleChange('police')}
                    className={`flex items-center justify-center space-x-2 w-full px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
                      formData.role === 'police' 
                        ? 'bg-blue-600 text-white shadow' 
                        : 'bg-transparent text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    <span>Police</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2"><span className="text-blue-900 font-semibold">{formData.role === 'police' ? 'Station Name' : 'Full Legal Name'}</span></label>
                <div className="relative"><User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-600" /><input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-blue-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600" placeholder={formData.role === 'police' ? 'Enter station name' : 'Enter your full name'} /></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2"><span className="text-blue-900 font-semibold">Official Email Address</span></label>
                <div className="relative"><Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-600" /><input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-blue-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600" placeholder="Enter your email" /></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2"><span className="text-blue-900 font-semibold">Phone No.</span></label>
                <div className="relative"><Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-600" /><input type="number" name="phone" value={formData.phone} onChange={handleChange} required className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-blue-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600" placeholder="Enter your Phone Number" /></div>
              </div>
              {formData.role === 'police' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-6">
                  <div className="pt-4 border-t border-gray-200"><label className="block text-sm font-medium text-gray-700 mb-2"><span className="text-blue-900 font-semibold">Address</span></label><div className="relative"><MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-600" /><input type="text" name="address" value={formData.address} onChange={handleChange} required={formData.role === 'police'} className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-blue-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600" placeholder="Station Address" /></div></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2"><span className="text-blue-900 font-semibold">City</span></label><div className="relative"><Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-600" /><input type="text" name="city" value={formData.city} onChange={handleChange} required={formData.role === 'police'} className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-blue-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600" placeholder="City" /></div></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2"><span className="text-blue-900 font-semibold">Pincode</span></label><div className="relative"><KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-600" /><input type="number" name="pincode" value={formData.pincode} onChange={handleChange} required={formData.role === 'police'} className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-blue-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600" placeholder="Pincode" /></div></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2"><span className="text-blue-900 font-semibold">Badge Number</span></label><div className="relative"><Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-600" /><input type="text" name="badgeNumber" value={formData.badgeNumber} onChange={handleChange} required={formData.role === 'police'} className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-blue-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600" placeholder="Official badge number" /></div></div>
                </motion.div>
              )}
              <div><label className="block text-sm font-medium text-gray-700 mb-2"><span className="text-blue-900 font-semibold">Secure Password</span></label><div className="relative"><Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-600" /><input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required className="w-full pl-10 pr-12 py-3 bg-white border-2 border-gray-300 rounded-lg text-blue-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600" placeholder="Create a password" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-700">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button></div></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2"><span className="text-blue-900 font-semibold">Confirm Password</span></label><div className="relative"><Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-600" /><input type={showPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-blue-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600" placeholder="Confirm your password" /></div></div>
              <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-bold flex items-center justify-center space-x-2 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed border-2 border-yellow-400">{loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><UserCheck className="w-5 h-5" /><span>Register Account</span></>}</motion.button>
            </form>
          ) : (
            <form onSubmit={handleVerifySubmit} className="space-y-6">
              <div><label className="block text-sm font-medium text-gray-700 mb-2"><span className="text-blue-900 font-semibold">6-Digit OTP</span></label><div className="relative"><KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-600" /><input type="text" name="otp" value={otp} onChange={(e) => setOtp(e.target.value)} required maxLength="6" className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-blue-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 tracking-[0.5em] text-center" placeholder="______" /></div></div>
              <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-bold flex items-center justify-center space-x-2 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed border-2 border-yellow-400">{loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><UserCheck className="w-5 h-5" /><span>Verify & Complete</span></>}</motion.button>
            </form>
          )}
          <div className="mt-6 text-center"><p className="text-blue-800">Already have an account?{' '}<Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">Sign in here</Link></p></div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register;
