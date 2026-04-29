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
    otherDescription: '', // New field for "other" description
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
      const API_URL = 'https://crimeta1.onrender.com/user/create'; 
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
  const handleIncidentTypeChange = (e) => {
    const val = e.target.value;
    setFormData(prev => ({
      ...prev,
      incidentType: val,
      // clear otherDescription when switching away from "other"
      ...(val !== 'Other' ? { otherDescription: '' } : {})
    }));
  };

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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans py-8 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header from file 1 */}
        <motion.div 
          className="mb-8 bg-white rounded-[2.5rem] p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden"
          initial="initial"
          animate="animate"
          variants={fadeInUp}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500"></div>
          <div className="flex items-center space-x-4 mb-2">
            <div className="p-4 rounded-[1.5rem] bg-rose-50 text-rose-600 border border-rose-100">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Report an Incident</h1>
              <p className="font-bold text-[11px] tracking-wider uppercase text-slate-500 mt-1">
                Help keep your community safe by reporting incidents. All reports are taken seriously and handled with care.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Form container from file 1 */}
        <motion.div 
          className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-6 sm:p-8 relative overflow-hidden"
          initial="initial"
          animate="animate"
          variants={fadeInUp}
        >
          <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-indigo-400 to-purple-400"></div>
          <form onSubmit={handleSubmit} className="space-y-8 pl-4">
            {/* Error display logic from file 2, styled for light theme */}
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-semibold" role="alert">
                {error}
              </div>
            )}
            
            {/* Incident Type: UI from file 1, logic from file 2 */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-4">
                Type of Incident *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {crimeTypes.map((type) => {
                  const active = formData.incidentType === type;
                  return (
                    <label
                      key={type}
                      className={`rounded-[1.25rem] border cursor-pointer transition-all duration-200 text-center flex items-center justify-center px-2 py-2 sm:py-3 min-h-[52px] sm:min-h-[60px] leading-tight ${
                        active
                          ? 'border-indigo-500 bg-indigo-50 shadow-sm ring-2 ring-indigo-100'
                          : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-indigo-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="incidentType"
                        value={type}
                        checked={active}
                        onChange={handleIncidentTypeChange}
                        className="sr-only"
                        required
                        aria-label={type}
                      />
                      <span className={`break-words whitespace-normal text-[11px] font-bold uppercase tracking-wider ${
                        active ? 'text-indigo-700' : 'text-slate-500'
                      }`}>
                        {type}
                      </span>
                    </label>
                  );
                })}
              </div>
              <div className="sm:hidden mt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Tap a category. Long names wrap automatically.</div>
              
              {/* Special description for 'Other' incident type */}
              {formData.incidentType === 'Other' && (
                <div className="mt-4">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-2">
                    Please describe the Other type of incident (required)
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                    <textarea
                      name="otherDescription"
                      value={formData.otherDescription}
                      onChange={handleChange}
                      required
                      rows={4}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200 resize-none"
                      placeholder="Describe the specific Other type of incident..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Severity Level: Section from file 1 */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-4">
                Severity Level
              </label>
              <div className="flex flex-wrap gap-4">
                {[
                  { value: 'low', label: 'Low', color: 'bg-emerald-500', bgBorder: 'border-emerald-500 bg-emerald-50' },
                  { value: 'medium', label: 'Medium', color: 'bg-amber-400', bgBorder: 'border-amber-400 bg-amber-50' },
                  { value: 'high', label: 'High', color: 'bg-rose-500', bgBorder: 'border-rose-500 bg-rose-50' }
                ].map((severity) => (
                  <label
                    key={severity.value}
                    className={`flex items-center space-x-2 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                      formData.severity === severity.value
                        ? severity.bgBorder + ' shadow-sm'
                        : 'border-slate-200 bg-slate-50 hover:bg-white'
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
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${
                      formData.severity === severity.value ? 'text-slate-900' : 'text-slate-500'
                    }`}>
                      {severity.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Location: UI from file 1, logic from file 2 */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-2">
                Location Address *
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  name="locationAddress"
                  value={formData.locationAddress}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200"
                  placeholder="Enter the address or area of the incident"
                />
              </div>
            </div>

            {/* Date and Time: UI from file 1, logic from file 2 */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-2">Date *</label>
                <div className="relative">
                  <input
                    type="date"
                    name="incidentDate"
                    value={formData.incidentDate}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-2">Time</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="time"
                    name="incidentTime"
                    value={formData.incidentTime}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Description: UI from file 1, logic from file 2 */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-2">Description *</label>
              <div className="relative">
                <FileText className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200 resize-none"
                  placeholder="Provide a detailed description of what happened..."
                />
              </div>
            </div>

            {/* File Upload: UI from file 1, logic from file 2 */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-2">Evidence (Photos/Videos)</label>
              <div className="border-2 border-dashed border-slate-300 rounded-[1.25rem] p-8 hover:border-indigo-500 hover:bg-indigo-50/50 transition-colors bg-slate-50">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="flex flex-col items-center justify-center cursor-pointer">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200 mb-4">
                    <Upload className="w-8 h-8 text-indigo-500" />
                  </div>
                  <p className="text-slate-800 font-bold">Click to upload or drag and drop</p>
                  <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mt-2">PNG, JPG, MP4 up to 10MB each</p>
                </label>
              </div>

              {files.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {files.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Evidence ${index + 1}`}
                        className="w-full h-24 object-cover rounded-xl shadow-sm border border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Anonymous Checkbox: UI styled for light theme */}
            {/*
            <div className="flex items-center space-x-3">
              <input 
                type="checkbox" 
                name="isAnonymous" 
                checked={formData.isAnonymous} 
                onChange={handleChange} 
                id="isAnonymous"
                className="w-4 h-4 text-indigo-600 bg-slate-100 border-slate-300 rounded focus:ring-indigo-500 focus:ring-offset-0 focus:ring-2" 
              />
              <label htmlFor="isAnonymous" className="text-sm text-slate-800 font-medium">Submit this report anonymously</label>
            </div>
            */}

            {/* Submit Button: UI from file 1, logic from file 2, text color changed for contrast */}
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold flex items-center justify-center space-x-2 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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
          className="mt-8 bg-rose-50 border border-rose-200 rounded-[2rem] p-6 sm:p-8 relative overflow-hidden"
          initial="initial"
          animate="animate"
          variants={fadeInUp}
        >
          <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500"></div>
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-rose-100 shrink-0">
              <AlertTriangle className="w-6 h-6 text-rose-500" />
            </div>
            <div>
              <h3 className="text-rose-900 font-black tracking-tight text-lg mb-1">Emergency Situations</h3>
              <p className="text-rose-700 text-sm font-medium leading-relaxed">
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