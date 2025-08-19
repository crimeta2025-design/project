import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  MapPin, 
  FileText, 
  Clock, 
  Send,
  X,
  Upload
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ReportCrime = () => {
  // State from the second file (logic) with additions from the first (UI)
  const [formData, setFormData] = useState({
    incidentType: '',
    description: '',
    locationAddress: '',
    incidentDate: '',
    incidentTime: '',
    isAnonymous: false,
    severity: 'medium' // Added from first file's UI
  });
  const [files, setFiles] = useState([]); // Renamed from 'images' for consistency
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Crime types from the first file
  const crimeTypes = [
    'Theft/Burglary', 'Assault', 'Vandalism', 'Drug Activity', 'Fraud',
    'Domestic Violence', 'Harassment', 'Traffic Violation', 
    'Suspicious Activity', 'Other'
  ];

  // Geolocation logic from the second file
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
        },
        () => {
          setError('Location access denied. Please enable it in your browser settings to submit a report.');
        }
      );
    }
  }, []);

  // Form submission logic from the second file, updated to include all fields
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location) {
      setError('Location is required. Please wait for it to be detected or enable permissions.');
      return;
    }
    setLoading(true);
    setError('');
    
    const data = new FormData();
    data.append('incidentType', formData.incidentType);
    data.append('locationAddress', formData.locationAddress);
    data.append('incidentDate', formData.incidentDate);
    data.append('incidentTime', formData.incidentTime);
    data.append('description', formData.description);
    data.append('isAnonymous', formData.isAnonymous);
    data.append('severity', formData.severity);
    data.append('latitude', location.latitude);
    data.append('longitude', location.longitude);
    
    files.forEach(file => {
      data.append('evidenceFiles', file);
    });

    try {
      // Your backend API endpoint
      const API_URL = 'http://localhost:8080/user/create'; 
      const token = localStorage.getItem('authToken');

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data,
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.msg || 'An unknown error occurred.');
      }
      // response.status(200).json({message: "Report Registered Successfully"})
      navigate('/my-reports'); // Navigate after successful submission

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handler functions from the second file
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...uploadedFiles]);
  };

  const removeImage = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  // Merged JSX: Structure and CSS from the first file, connected to the second file's logic
  return (
    <div className="min-h-screen bg-[#ffffff] text-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header from file 1 */}
        <motion.div 
          className="mb-8"
          initial="initial"
          animate="animate"
          variants={fadeInUp}
        >
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-8 h-8 text-[#00C9A7]" />
            <h1 className="text-3xl font-bold text-blue-900">Report an Incident</h1>
          </div>
          <p className="text-gray-900">
            Help keep your community safe by reporting incidents. All reports are taken seriously and handled with care.
          </p>
        </motion.div>

        {/* Form container from file 1 */}
        <motion.div 
          className="bg-gray-100 backdrop-blur-md rounded-lg border border-blue-800 p-8"
          initial="initial"
          animate="animate"
          variants={fadeInUp}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error display logic from file 2, styled for light theme */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md text-sm" role="alert">
                {error}
              </div>
            )}
            
            {/* Incident Type: UI from file 1, logic from file 2 */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Type of Incident *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {crimeTypes.map((type) => {
                  const active = formData.incidentType === type;
                  return (
                    <label
                      key={type}
                      className={`rounded-lg border cursor-pointer transition-all duration-200 text-center flex items-center justify-center px-2 py-2 sm:py-3 min-h-[52px] sm:min-h-[60px] leading-tight ${
                        active
                          ? 'border-[#0028c9] bg-[#00C9A7]/10 shadow-sm'
                          : 'border-black bg-white hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="incidentType"
                        value={type}
                        checked={active}
                        onChange={handleChange}
                        className="sr-only"
                        required
                        aria-label={type}
                      />
                      <span className={`break-words whitespace-normal text-[11px] xs:text-xs sm:text-sm font-medium ${
                        active ? 'text-black' : 'text-gray-900 font-normal'
                      }`}>
                        {type}
                      </span>
                    </label>
                  );
                })}
              </div>
              <div className="sm:hidden mt-2 text-[11px] text-gray-500">Tap a category. Long names wrap automatically.</div>
              
              {/* Special description for 'Other' incident type */}
              {formData.incidentType === 'Other' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Please describe the Other type of incident (required)
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-800" />
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      rows={4}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-black rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00C9A7] focus:border-transparent transition-all duration-200 resize-none"
                      placeholder="Describe the specific Other type of incident..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Severity Level: Section from file 1 */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Severity Level
              </label>
              <div className="flex space-x-4">
                {[
                  { value: 'low', label: 'Low', color: 'bg-green-500' },
                  { value: 'medium', label: 'Medium', color: 'bg-orange-500' },
                  { value: 'high', label: 'High', color: 'bg-red-500' }
                ].map((severity) => (
                  <label
                    key={severity.value}
                    className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                      formData.severity === severity.value
                        ? 'border-[#00C9A7] bg-[#00C9A7]/10'
                        : 'border-black bg-white hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="severity"
                      value={severity.value}
                      checked={formData.severity === severity.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`w-3 h-3 rounded-full ${severity.color}`}></div>
                    <span className={`text-sm ${
                      formData.severity === severity.value ? 'text-black font-medium' : 'text-gray-900'
                    }`}>
                      {severity.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Location: UI from file 1, logic from file 2 */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Location Address *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-800" />
                <input
                  type="text"
                  name="locationAddress"
                  value={formData.locationAddress}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white border border-black rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00C9A7] focus:border-transparent transition-all duration-200"
                  placeholder="Enter the address or area of the incident"
                />
              </div>
            </div>

            {/* Date and Time: UI from file 1, logic from file 2 */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Date *</label>
                <div className="relative">
                  <input
                    type="date"
                    name="incidentDate"
                    value={formData.incidentDate}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white border border-black rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#00C9A7] focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Time</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-800" />
                  <input
                    type="time"
                    name="incidentTime"
                    value={formData.incidentTime}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-black rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#00C9A7] focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Description: UI from file 1, logic from file 2 */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Description *</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-800" />
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-black rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00C9A7] focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Provide a detailed description of what happened..."
                />
              </div>
            </div>

            {/* File Upload: UI from file 1, logic from file 2 */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Evidence (Photos/Videos)</label>
              <div className="border-2 border-dashed border-black rounded-lg p-6 hover:border-[#00C9A7] transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="flex flex-col items-center justify-center cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-800 mb-3" />
                  <p className="text-gray-900 text-center">Click to upload or drag and drop</p>
                  <p className="text-gray-600 text-sm mt-1">PNG, JPG, MP4 up to 10MB each</p>
                </label>
              </div>

              {files.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {files.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Evidence ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/*
            Anonymous Checkbox: UI styled for light theme
            <div className="flex items-center space-x-3">
              <input 
                type="checkbox" 
                name="isAnonymous" 
                checked={formData.isAnonymous} 
                onChange={handleChange} 
                id="isAnonymous"
                className="w-4 h-4 text-[#00C9A7] bg-gray-200 border-gray-400 rounded focus:ring-[#00C9A7] focus:ring-offset-0 focus:ring-2" 
              />
              <label htmlFor="isAnonymous" className="text-sm text-gray-900">Submit this report anonymously</label>
            </div>
            */}

            {/* Submit Button: UI from file 1, logic from file 2, text color changed for contrast */}
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-[#0086c9] to-[#005ea6] text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Submit Report</span>
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Emergency Notice from file 1 */}
        <motion.div 
          className="mt-8 bg-red-100 border border-red-300 rounded-lg p-6"
          initial="initial"
          animate="animate"
          variants={fadeInUp}
        >
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-600 mt-0.5" />
            <div>
              <h3 className="text-red-800 font-semibold mb-2">Emergency Situations</h3>
              <p className="text-red-700 text-sm">
                If you are experiencing an emergency or immediate danger, please call 112 immediately. 
                This form is for non-emergency reporting only.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ReportCrime;