import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Calendar, 
  MapPin, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Filter
} from 'lucide-react';

const MyReports = () => {
  // State from the second file (for API data and controls)
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  // Welcome popup state
  const [showWelcome, setShowWelcome] = useState(true); // Always show on first render

  // API fetching logic from the second file
  useEffect(() => {
    const fetchMyReports = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        // Make sure your backend URL is correct
        const API_URL = 'https://crimeta1.onrender.com/user/my-reports'; 

        const response = await fetch(API_URL, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch reports.');
        }

        const data = await response.json();
        setReports(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyReports();
  }, []); 

  // Helper functions adapted for API data
  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_progress': return <AlertTriangle className="w-5 h-5 text-blue-500" />;
      case 'new': return <Clock className="w-5 h-5 text-orange-500" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'in_progress': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'new': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'rejected': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };
  
  const getSeverityColor = (severity) => {
    // Handling case-insensitivity from API (e.g., 'High', 'high')
    switch (severity?.toLowerCase()) {
      case 'high': return 'bg-rose-500';
      case 'medium': return 'bg-amber-400';
      case 'low': return 'bg-emerald-500';
      default: return 'bg-slate-500';
    }
  };

  // Filtering and Sorting logic updated for API data fields
  const filteredReports = reports.filter(report => 
    filterStatus === 'all' || report.status === filterStatus
  );

  const sortedReports = [...filteredReports].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortBy === 'oldest') {
      return new Date(a.createdAt) - new Date(b.createdAt);
    } else if (sortBy === 'status') {
      return a.status.localeCompare(b.status);
    }
    return 0;
  });

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };
  const staggerContainer = {
    animate: { transition: { staggerChildren: 0.1 } }
  };

  // Loading and Error state UI
  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-white text-gray-800">Loading your reports...</div>;
  }
  if (error) {
    return <div className="flex justify-center items-center h-screen bg-white text-red-600">Error: {error}</div>;
  }

  // Merged JSX: UI from file 1, logic from file 2
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-12 pt-6">
    
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="mb-8 bg-white rounded-[2.5rem] p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden"
          initial="initial"
          animate="animate"
          variants={fadeInUp}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>
          <div className="flex items-center space-x-4 mb-2">
            <div className="p-4 rounded-[1.5rem] bg-indigo-50 text-indigo-600 border border-indigo-100">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">My Reports</h1>
              <p className="font-bold text-[11px] tracking-wider uppercase text-slate-500 mt-1">
                Track and manage all your submitted incident reports.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Overview - dynamically calculated from API data */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {[
            { label: 'Total Reports', value: reports.length, color: 'from-indigo-500 to-indigo-600' },
            { label: 'Resolved', value: reports.filter(r => r.status === 'resolved').length, color: 'from-emerald-500 to-emerald-600' },
            { label: 'In Progress', value: reports.filter(r => r.status === 'in_progress').length, color: 'from-amber-500 to-amber-600' },
            { label: 'New Reports', value: reports.filter(r => r.status === 'new').length, color: 'from-rose-500 to-rose-600' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="bg-white rounded-[2.5rem] border border-slate-200 p-6 shadow-sm relative overflow-hidden group hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className={`w-12 h-12 rounded-[1.25rem] bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 text-white shadow-sm`}>
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-1">{stat.value}</h3>
              <p className="text-slate-500 text-[11px] font-black uppercase tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Filters and Controls - UI from file 2, styled for light theme */}
        <motion.div 
          className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-5 mb-8"
          variants={fadeInUp}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-slate-100 rounded-xl">
                <Filter className="w-5 h-5 text-slate-500" />
              </div>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none min-w-[140px]">
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">Sort by:</span>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none min-w-[140px]">
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>
        </motion.div>
        
        {/* Reports List */}
        <motion.div 
          className="space-y-6"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {sortedReports.length === 0 ? (
            <motion.div variants={fadeInUp} className="text-center py-16 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-black text-slate-800 mb-2">No Reports Found</h3>
              <p className="text-slate-500 text-sm font-semibold">No reports match the current filter.</p>
            </motion.div>
          ) : (
            sortedReports.map((report) => (
              <motion.div
                key={report._id}
                variants={fadeInUp}
                className="bg-white rounded-[2.5rem] border border-slate-200 p-6 sm:p-8 shadow-sm relative overflow-hidden hover:shadow-md transition-all duration-300 group"
              >
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-indigo-400 to-purple-400"></div>
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0 pl-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${getSeverityColor(report.severity)} ring-4 ring-slate-50`}></div>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{report.incidentType}</h3>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border capitalize ${getStatusColor(report.status)}`}>
                        {report.status.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-slate-600 mb-6 text-sm sm:text-base leading-relaxed">{report.description}</p>

                    <div className="flex flex-wrap gap-4 mb-4 text-xs font-semibold text-slate-500">
                      <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                        <MapPin className="w-4 h-4 flex-shrink-0 text-indigo-500" />
                        <span>{report.locationAddress}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                        <Calendar className="w-4 h-4 flex-shrink-0 text-indigo-500" />
                        <span>{new Date(report.incidentDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                        <Clock className="w-4 h-4 flex-shrink-0 text-indigo-500" />
                        <span>{new Date(report.incidentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    {/* Case Updates: Safely render if updates array exists */}
                    {report.updates && report.updates.length > 0 && (
                      <div className="bg-slate-50 rounded-[1.5rem] p-5 mt-6 border border-slate-100">
                        <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-800 mb-4 flex items-center space-x-2">
                          {getStatusIcon(report.status)}
                          <span>Case Updates</span>
                        </h4>
                        <div className="space-y-4">
                          {report.updates.map((update, idx) => (
                            <div key={idx} className="flex items-start space-x-4">
                              <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0 ring-4 ring-white shadow-sm"></div>
                              <div className="bg-white border border-slate-100 rounded-2xl p-3 flex-1 shadow-sm">
                                <p className="text-slate-800 text-sm font-semibold">{update.message}</p>
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-1">{new Date(update.date).toLocaleDateString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
        
        <footer className="mt-12 text-sm text-gray-500 text-center">
          Crimeta Portal © {new Date().getFullYear()}  |  Official Government Service
        </footer>
      </div>
    </div>
  );
};

export default MyReports;