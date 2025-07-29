import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  FileText, 
  BarChart3, 
  Settings,
  Search,
  Filter,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  MapPin,
  Calendar,
  Users,
  Badge,
  Radio
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const PolicePanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('cases');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data for police
  const cases = [
    {
      id: 1,
      caseNumber: 'PD-2025-001',
      type: 'Theft',
      reporter: 'John Doe',
      location: 'Downtown Mall',
      date: '2025-01-15',
      status: 'investigating',
      severity: 'medium',
      assignedOfficer: user?.name,
      priority: 'normal'
    },
    {
      id: 2,
      caseNumber: 'PD-2025-002',
      type: 'Assault',
      reporter: 'Anonymous',
      location: 'Main Street',
      date: '2025-01-14',
      status: 'pending',
      severity: 'high',
      assignedOfficer: null,
      priority: 'urgent'
    },
    {
      id: 3,
      caseNumber: 'PD-2025-003',
      type: 'Vandalism',
      reporter: 'Jane Smith',
      location: 'Central Park',
      date: '2025-01-13',
      status: 'resolved',
      severity: 'low',
      assignedOfficer: 'Officer Davis',
      priority: 'low'
    }
  ];

  const stats = [
    { title: 'Active Cases', value: '23', change: '+5%', trend: 'up', icon: FileText, color: 'from-blue-500 to-blue-600' },
    { title: 'Resolved Today', value: '8', change: '+12%', trend: 'up', icon: CheckCircle, color: 'from-green-500 to-green-600' },
    { title: 'High Priority', value: '4', change: '-2%', trend: 'down', icon: AlertTriangle, color: 'from-red-500 to-red-600' },
    { title: 'Response Time', value: '1.2h', change: '-15%', trend: 'down', icon: Clock, color: 'from-yellow-500 to-yellow-600' }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'investigating': return <AlertTriangle className="w-4 h-4 text-blue-400" />;
      case 'pending': return <Clock className="w-4 h-4 text-orange-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'investigating': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'pending': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'normal': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'low': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredCases = cases.filter(caseItem => {
    const matchesSearch = caseItem.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         caseItem.reporter.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         caseItem.location.toLowerCase().includes(searchTerm.toLowerCase());
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

  return (
    <div className="min-h-screen pt-8 pb-8 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial="initial"
          animate="animate"
          variants={fadeInUp}
        >
          <div className="bg-white/10 backdrop-blur-md rounded-lg border-2 border-yellow-400 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-yellow-400 p-3 rounded-full">
                  <Shield className="w-8 h-8 text-blue-900" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Police Command Center</h1>
                  <p className="text-yellow-300">Officer {user?.name} • Badge: {user?.badge}</p>
                  <p className="text-gray-300 text-sm">{user?.department}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium mb-2">
                  ON DUTY
                </div>
                <p className="text-gray-300 text-sm">Shift: 08:00 - 20:00</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white/10 backdrop-blur-md rounded-lg border border-yellow-400/30 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <Icon className="w-8 h-8 text-yellow-400" />
                  <div className={`flex items-center space-x-1 text-sm ${
                    stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    <TrendingUp className={`w-4 h-4 ${stat.trend === 'down' ? 'rotate-180' : ''}`} />
                    <span>{stat.change}</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                <p className="text-gray-300 text-sm">{stat.title}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Tab Navigation */}
        <motion.div 
          className="bg-white/10 backdrop-blur-md rounded-lg border border-yellow-400/30 mb-8"
          initial="initial"
          animate="animate"
          variants={fadeInUp}
        >
          <div className="flex flex-wrap border-b border-yellow-400/30">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-yellow-400 border-b-2 border-yellow-400 bg-yellow-400/10'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
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
              <div className="bg-white/10 backdrop-blur-md rounded-lg border border-yellow-400/30 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search cases..."
                        className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="investigating">Investigating</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Cases Table */}
              <div className="bg-white/10 backdrop-blur-md rounded-lg border border-yellow-400/30 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-yellow-400/20">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                          Case Details
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                          Reporter
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                          Priority
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCases.map((caseItem, index) => (
                        <tr key={caseItem.id} className={index % 2 === 0 ? 'bg-white/5' : ''}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full ${getSeverityColor(caseItem.severity)}`}></div>
                              <div>
                                <div className="text-white font-medium">{caseItem.type}</div>
                                <div className="text-gray-400 text-sm">{caseItem.caseNumber}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                            {caseItem.reporter}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-1 text-gray-300">
                              <MapPin className="w-4 h-4" />
                              <span>{caseItem.location}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${getPriorityColor(caseItem.priority)}`}>
                              {caseItem.priority}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(caseItem.status)}`}>
                              {getStatusIcon(caseItem.status)}
                              <span>{caseItem.status}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <button className="text-yellow-400 hover:text-yellow-300 transition-colors">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="text-blue-400 hover:text-blue-300 transition-colors">
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'patrol' && (
            <div className="bg-white/10 backdrop-blur-md rounded-lg border border-yellow-400/30 p-8">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Patrol Route Management</h3>
                <p className="text-gray-300">Interactive patrol route planning and tracking system</p>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="bg-white/10 backdrop-blur-md rounded-lg border border-yellow-400/30 p-8">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Daily Reports & Analytics</h3>
                <p className="text-gray-300">Crime statistics and patrol effectiveness reports</p>
              </div>
            </div>
          )}

          {activeTab === 'dispatch' && (
            <div className="bg-white/10 backdrop-blur-md rounded-lg border border-yellow-400/30 p-8">
              <div className="text-center">
                <Radio className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Dispatch Communications</h3>
                <p className="text-gray-300">Real-time communication with dispatch center</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PolicePanel;