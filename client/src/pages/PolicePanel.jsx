import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, FileText, BarChart3, Search, Filter, Eye, Edit,
  CheckCircle, XCircle, Clock, AlertTriangle, TrendingUp, MapPin, Radio
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const PolicePanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('cases');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // --- CHANGE: Mock data ko hata kar real state variables banayein ---
  const [cases, setCases] = useState([]);
  const [stats, setStats] = useState({ activeCases: 0, resolvedToday: 0, highPriority: 0, responseTime: 'N/A' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Track expanded case
  const [expandedCaseId, setExpandedCaseId] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        
        // Dono API calls ko ek saath karein
        const [casesRes, statsRes] = await Promise.all([
          fetch('http://localhost:8080/api/police/cases', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('http://localhost:8080/api/police/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        if (!casesRes.ok || !statsRes.ok) {
          throw new Error('Failed to load panel data.');
        }

        const casesData = await casesRes.json();
        const statsData = await statsRes.json();
        
        setCases(casesData);
        setStats(statsData);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'investigating': return <AlertTriangle className="w-4 h-4 text-blue-400" />;
      case 'pending': return <Clock className="w-4 h-4 text-orange-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  // Light theme color helpers
  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800 border-green-300';
      case 'investigating': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'pending': return 'bg-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'normal': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'low': return 'bg-gray-100 text-gray-700 border-gray-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'High': return 'bg-red-500';
      case 'Medium': return 'bg-yellow-400';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredCases = cases.filter(caseItem => {
    const reporterName = caseItem.reportedBy ? caseItem.reportedBy.name : 'Anonymous';
    const matchesSearch = 
        caseItem.incidentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reporterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        caseItem.locationAddress.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || caseItem.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const tabs = [
    { id: 'cases', label: 'Active Cases', icon: FileText },
    { id: 'patrol', label: 'Patrol Routes', icon: MapPin },
    { id: 'reports', label: 'Daily Reports', icon: BarChart3 },
    { id: 'dispatch', label: 'Dispatch', icon: Radio }
  ];

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  // Simple StatCard component for demonstration
  const StatCard = ({ title, value, icon }) => {
    const IconComp = icon; // ensure usage recognized
    return (
      <div className="bg-white border-2 border-blue-800 rounded-lg p-5 hover:bg-blue-50 transition-colors">
        {IconComp && <IconComp className="w-8 h-8 text-blue-700 mb-4" />}
        <h3 className="text-2xl font-extrabold text-[#204080] mb-1">{value}</h3>
        <p className="text-gray-600 text-sm">{title}</p>
      </div>
    );
  };

  if (loading) return <div className="text-center text-blue-800 py-20">Loading Police Panel...</div>;
  if (error) return <div className="text-center text-red-600 py-20">Error: {error}</div>;

  return (
    <div className="min-h-screen pt-8 pb-12 bg-gray-50 text-[#204080]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial="initial"
          animate="animate"
          variants={fadeInUp}
        >
          <div className="bg-white rounded-lg border-2 border-blue-800 p-6 shadow">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-700 p-3 rounded-full shadow-inner">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-[#204080] leading-tight">Police Command Center</h1>
                  <p className="text-blue-700 font-medium">Officer {user?.name}</p>
                </div>
              </div>
              <div className="flex items-start sm:items-center gap-4">
                <div className="text-right">
                  <div className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold tracking-wide inline-block mb-2 shadow-sm">ON DUTY</div>
                  <p className="text-gray-600 text-sm">Shift: 08:00 - 20:00</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* --- CHANGE: Stats ko real data se display karein --- */}
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" initial="initial" animate="animate" variants={staggerContainer}>
          <motion.div variants={fadeInUp}><StatCard title="Active Cases" value={stats.activeCases} icon={FileText} /></motion.div>
          <motion.div variants={fadeInUp}><StatCard title="Resolved Today" value={stats.resolvedToday} icon={CheckCircle} /></motion.div>
          <motion.div variants={fadeInUp}><StatCard title="High Priority" value={stats.highPriority} icon={AlertTriangle} /></motion.div>
          <motion.div variants={fadeInUp}><StatCard title="Response Time" value={stats.responseTime} icon={Clock} /></motion.div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          className="bg-white rounded-lg border-2 border-blue-800 mb-8 overflow-hidden"
          initial="initial"
          animate="animate"
          variants={fadeInUp}
        >
          <div className="flex flex-wrap">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${active ? 'text-blue-800 border-blue-800 bg-blue-50' : 'text-gray-600 border-transparent hover:text-blue-800 hover:bg-gray-50'}`}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
        >
          {activeTab === 'cases' && (
            <div className="space-y-6">
              {/* Search and Filters */}
              <div className="bg-white rounded-lg border-2 border-blue-800 p-6 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search cases..."
                          className="pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Filter className="w-5 h-5 text-gray-500" />
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent"
                      >
                        <option value="all">All Status</option>
                        <option value="new">New</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                  </div>
              </div>

              {/* Cases Table */}
              <div className="bg-white rounded-lg border-2 border-blue-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-blue-50">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-blue-800 uppercase tracking-wider">Case Details</th>
                            <th className="px-6 py-4 text-xs font-semibold text-blue-800 uppercase tracking-wider">Reporter</th>
                            <th className="px-6 py-4 text-xs font-semibold text-blue-800 uppercase tracking-wider">Location</th>
                            <th className="px-6 py-4 text-xs font-semibold text-blue-800 uppercase tracking-wider">Priority</th>
                            <th className="px-6 py-4 text-xs font-semibold text-blue-800 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-blue-800 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                      {/* --- CHANGE: Cases ko real data se display karein --- */}
                      {filteredCases.map((caseItem, index) => (
                        <React.Fragment key={caseItem._id}>
                          <tr
                            className={`cursor-pointer transition-colors duration-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${expandedCaseId === caseItem._id ? 'ring-2 ring-blue-300' : ''}`}
                            onClick={() => setExpandedCaseId(expandedCaseId === caseItem._id ? null : caseItem._id)}
                            aria-label={expandedCaseId === caseItem._id ? 'Hide details' : 'Show details'}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-3">
                                <div className={`w-3 h-3 rounded-full ${getSeverityColor(caseItem.severity)}`}></div>
                                <div>
                                  <div className="text-[#204080] font-semibold">{caseItem.incidentType}</div>
                                  <div className="text-gray-500 text-xs">...{caseItem._id.slice(-6)}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                              {caseItem.reportedBy ? caseItem.reportedBy.name : 'Anonymous'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-1 text-gray-700">
                                <MapPin className="w-4 h-4 text-blue-600" />
                                <span className="max-w-[180px] truncate md:max-w-none">{caseItem.locationAddress}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs border font-medium ${getPriorityColor(caseItem.priority)}`}>
                                {caseItem.priority || 'Normal'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border font-medium capitalize ${getStatusColor(caseItem.status)}`}>
                                {getStatusIcon(caseItem.status)}
                                <span>{caseItem.status}</span>
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                {/* Eye icon removed as only trigger; Edit remains */}
                                <button className="text-yellow-600 hover:text-yellow-700"><Edit className="w-4 h-4" /></button>
                              </div>
                            </td>
                          </tr>
                          {expandedCaseId === caseItem._id && (
                            <tr>
                              <td colSpan={6} className="p-0 border-t border-blue-200">
                                <div className="relative">
                                  <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.35 }}
                                    className="mx-2 sm:mx-4 my-4 rounded-xl shadow-lg border border-blue-300 bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4 sm:p-6 flex flex-col md:flex-row gap-4 md:gap-6"
                                    style={{ minWidth: 0 }}
                                  >
                                    <div className="flex-1 flex flex-col gap-3 min-w-0">
                                      <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <FileText className="w-5 h-5 text-blue-700" />
                                        <span className="font-bold text-base sm:text-lg text-blue-900">{caseItem.incidentType}</span>
                                        <span className="ml-2 text-xs text-gray-500 break-all">ID: {caseItem._id.slice(-6)}</span>
                                      </div>
                                      <div className="flex flex-wrap items-center gap-2">
                                        <BarChart3 className="w-4 h-4 text-orange-500" />
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(caseItem.priority)}`}>{caseItem.priority || 'Normal'}</span>
                                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold border capitalize ${getStatusColor(caseItem.status)}`}>{caseItem.status}</span>
                                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(caseItem.severity)}`}>{caseItem.severity}</span>
                                      </div>
                                      <div className="flex flex-wrap items-center gap-2">
                                        <MapPin className="w-4 h-4 text-blue-600" />
                                        <span className="font-medium text-gray-700 break-words max-w-full">{caseItem.locationAddress}</span>
                                      </div>
                                      <div className="flex flex-wrap items-center gap-2">
                                        <Shield className="w-4 h-4 text-blue-700" />
                                        <span className="font-medium text-gray-700">Reported By: {caseItem.reportedBy ? caseItem.reportedBy.name : 'Anonymous'}</span>
                                      </div>
                                      <div className="flex flex-wrap items-center gap-2">
                                        <Clock className="w-4 h-4 text-gray-500" />
                                        <span className="font-medium text-gray-700">Reported At: {caseItem.reportedAt ? new Date(caseItem.reportedAt).toLocaleString() : 'N/A'}</span>
                                      </div>
                                    </div>
                                    <div className="flex-1 flex flex-col gap-3 min-w-0">
                                      <div className="font-semibold text-blue-800 mb-1 flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-blue-700" />
                                        Description
                                      </div>
                                      <div className="text-gray-700 text-sm bg-white rounded-lg p-3 border border-blue-100 shadow-sm overflow-x-auto max-w-full" style={{ wordBreak: 'break-word' }}>
                                        {caseItem.description || 'No description provided.'}
                                      </div>
                                      {/* Add more fields or actions here if needed */}
                                    </div>
                                  </motion.div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          {/* ... baaki tabs ka content ... */}

          {activeTab === 'patrol' && (
            <div className="bg-white rounded-lg border-2 border-blue-800 p-8 text-center shadow-sm">
              <MapPin className="w-16 h-16 text-blue-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#204080] mb-2">Patrol Route Management</h3>
              <p className="text-gray-600 text-sm">Interactive patrol route planning and tracking system</p>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="bg-white rounded-lg border-2 border-blue-800 p-8 text-center shadow-sm">
              <BarChart3 className="w-16 h-16 text-blue-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#204080] mb-2">Daily Reports & Analytics</h3>
              <p className="text-gray-600 text-sm">Crime statistics and patrol effectiveness reports</p>
            </div>
          )}

          {activeTab === 'dispatch' && (
            <div className="bg-white rounded-lg border-2 border-blue-800 p-8 text-center shadow-sm">
              <Radio className="w-16 h-16 text-blue-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#204080] mb-2">Dispatch Communications</h3>
              <p className="text-gray-600 text-sm">Real-time communication with dispatch center</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PolicePanel;