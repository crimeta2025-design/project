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

  // API fetching logic from the second file
  useEffect(() => {
    const fetchMyReports = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        // Make sure your backend URL is correct
        const API_URL = 'http://localhost:8080/user/my-reports'; 

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
      case 'resolved': return 'bg-green-100 text-green-800 border-green-300';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'new': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };
  
  const getSeverityColor = (severity) => {
    // Handling case-insensitivity from API (e.g., 'High', 'high')
    switch (severity?.toLowerCase()) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-orange-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
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
    <div className="min-h-screen bg-white text-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial="initial"
          animate="animate"
          variants={fadeInUp}
        >
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="w-8 h-8 text-blue-800" />
            <h1 className="text-3xl font-bold text-blue-800">My Reports</h1>
          </div>
          <p className="text-gray-600">
            Track and manage all your submitted incident reports.
          </p>
        </motion.div>

        {/* Stats Overview - dynamically calculated from API data */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {[
            { label: 'Total Reports', value: reports.length, color: 'from-blue-500 to-indigo-600' },
            { label: 'Resolved', value: reports.filter(r => r.status === 'resolved').length, color: 'from-green-500 to-teal-600' },
            { label: 'In Progress', value: reports.filter(r => r.status === 'in_progress').length, color: 'from-orange-500 to-red-600' },
            { label: 'New Reports', value: reports.filter(r => r.status === 'new').length, color: 'from-purple-500 to-pink-600' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="bg-gray-50 rounded-lg border border-gray-200 p-6 shadow-sm"
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center mb-3 text-white`}>
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</h3>
              <p className="text-gray-500 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Filters and Controls - UI from file 2, styled for light theme */}
        <motion.div 
          className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-8"
          variants={fadeInUp}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <Filter className="w-5 h-5 text-gray-500" />
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-gray-600 text-sm">Sort by:</span>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
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
            <motion.div variants={fadeInUp} className="text-center py-16 bg-gray-50 rounded-lg">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Reports Found</h3>
              <p className="text-gray-500">No reports match the current filter.</p>
            </motion.div>
          ) : (
            sortedReports.map((report) => (
              <motion.div
                key={report._id}
                variants={fadeInUp}
                className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm transition-all duration-300 hover:shadow-md"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`w-4 h-4 rounded-full flex-shrink-0 ${getSeverityColor(report.severity)}`}></div>
                      <h3 className="text-xl font-semibold text-gray-800 ">{report.incidentType}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${getStatusColor(report.status)}`}>
                        {report.status.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-4">{report.description}</p>

                    <div className="grid md:grid-cols-3 gap-4 mb-4 text-sm">
                      <div className="flex items-center space-x-2 text-gray-500">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span>{report.locationAddress}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-500">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>{new Date(report.incidentDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-500">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span>{new Date(report.incidentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    {/* Case Updates: Safely render if updates array exists */}
                    {report.updates && report.updates.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4 mt-4 border border-gray-200">
                        <h4 className="text-gray-700 font-medium mb-3 flex items-center space-x-2">
                          {getStatusIcon(report.status)}
                          <span>Case Updates</span>
                        </h4>
                        <div className="space-y-3">
                          {report.updates.map((update, idx) => (
                            <div key={idx} className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                              <div>
                                <p className="text-gray-800 text-sm">{update.message}</p>
                                <p className="text-gray-400 text-xs">{new Date(update.date).toLocaleDateString()}</p>
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