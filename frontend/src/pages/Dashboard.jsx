import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  MapPin,
  AlertTriangle,
  Shield,
  Users,
  Clock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Total Reports',
      value: '156',
      change: '+12%',
      trend: 'up',
      icon: BarChart3,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Resolved Cases',
      value: '143',
      change: '+8%',
      trend: 'up',
      icon: Shield,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Active Cases',
      value: '13',
      change: '-2%',
      trend: 'down',
      icon: AlertTriangle,
      color: 'from-orange-500 to-orange-600'
    },
    {
      title: 'Community Score',
      value: '87%',
      change: '+5%',
      trend: 'up',
      icon: Users,
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const recentReports = [
    {
      id: 1,
      type: 'Theft',
      location: 'Downtown Mall',
      time: '2 hours ago',
      status: 'investigating',
      severity: 'medium'
    },
    {
      id: 2,
      type: 'Vandalism',
      location: 'Central Park',
      time: '4 hours ago',
      status: 'resolved',
      severity: 'low'
    },
    {
      id: 3,
      type: 'Assault',
      location: 'Main Street',
      time: '6 hours ago',
      status: 'pending',
      severity: 'high'
    },
    {
      id: 4,
      type: 'Drug Activity',
      location: 'School District',
      time: '8 hours ago',
      status: 'investigating',
      severity: 'high'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'investigating': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'pending': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-orange-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

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
          <div
            className={`rounded-lg p-6 border-2 ${
              user?.role === 'citizen'
                ? 'bg-green-500/10 border-green-400'
                : user?.role === 'police'
                ? 'bg-yellow-400/10 border-yellow-400'
                : 'bg-red-500/10 border-red-400'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div
                className={`p-3 rounded-full ${
                  user?.role === 'citizen'
                    ? 'bg-green-500'
                    : user?.role === 'police'
                    ? 'bg-yellow-400'
                    : 'bg-red-500'
                }`}
              >
                <Shield
                  className={`w-8 h-8 ${
                    user?.role === 'police' ? 'text-blue-900' : 'text-white'
                  }`}
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  Welcome,{' '}
                  {user?.role === 'citizen'
                    ? 'Citizen'
                    : user?.role === 'police'
                    ? 'Officer'
                    : 'Administrator'}{' '}
                  {user?.name}
                </h1>
                <p
                  className={`font-medium ${
                    user?.role === 'citizen'
                      ? 'text-green-300'
                      : user?.role === 'police'
                      ? 'text-yellow-300'
                      : 'text-red-300'
                  }`}
                >
                  {user?.role === 'citizen'
                    ? 'Community Safety Dashboard'
                    : user?.role === 'police'
                    ? 'Law Enforcement Portal'
                    : 'System Administration Center'}
                </p>
                {user?.badge && (
                  <p className="text-gray-300 text-sm">
                    Badge: {user?.badge} • {user?.department}
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
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
                className={`backdrop-blur-md rounded-lg border-2 p-6 hover:bg-white/15 transition-all duration-300 ${
                  user?.role === 'citizen'
                    ? 'bg-white/10 border-green-400/30'
                    : user?.role === 'police'
                    ? 'bg-white/10 border-yellow-400/30'
                    : 'bg-white/10 border-red-400/30'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      user?.role === 'citizen'
                        ? 'bg-green-500'
                        : user?.role === 'police'
                        ? 'bg-yellow-400'
                        : 'bg-red-500'
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 ${
                        user?.role === 'police' ? 'text-blue-900' : 'text-white'
                      }`}
                    />
                  </div>
                  <div
                    className={`flex items-center space-x-1 text-sm ${
                      stat.trend === 'up'
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}
                  >
                    <TrendingUp
                      className={`w-4 h-4 ${
                        stat.trend === 'down' ? 'rotate-180' : ''
                      }`}
                    />
                    <span>{stat.change}</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  {stat.value}
                </h3>
                <p className="text-gray-300 text-sm">{stat.title}</p>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Reports */}
          <motion.div
            className="lg:col-span-2"
            initial="initial"
            animate="animate"
            variants={fadeInUp}
          >
            <div
              className={`bg-white/10 backdrop-blur-md rounded-lg border-2 p-6 ${
                user?.role === 'citizen'
                  ? 'border-green-400/30'
                  : user?.role === 'police'
                  ? 'border-yellow-400/30'
                  : 'border-red-400/30'
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Recent Reports</h2>
                <button
                  className={`text-sm font-medium transition-colors ${
                    user?.role === 'citizen'
                      ? 'text-green-400 hover:text-green-300'
                      : user?.role === 'police'
                      ? 'text-yellow-400 hover:text-yellow-300'
                      : 'text-red-400 hover:text-red-300'
                  }`}
                >
                  View All
                </button>
              </div>

              <div className="space-y-4">
                {recentReports.map((report) => (
                  <div
                    key={report.id}
                    className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-3 h-3 rounded-full ${getSeverityColor(
                            report.severity
                          )}`}
                        ></div>
                        <h3 className="text-white font-medium">
                          {report.type}
                        </h3>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(
                          report.status
                        )}`}
                      >
                        {report.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-300">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{report.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{report.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Quick Actions & Activity Feed */}
          <motion.div
            className="space-y-6"
            initial="initial"
            animate="animate"
            variants={fadeInUp}
          >
            {/* Quick Actions */}
            <div
              className={`bg-white/10 backdrop-blur-md rounded-lg border-2 p-6 ${
                user?.role === 'citizen'
                  ? 'border-green-400/30'
                  : user?.role === 'police'
                  ? 'border-yellow-400/30'
                  : 'border-red-400/30'
              }`}
            >
              <h2 className="text-xl font-bold text-white mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                {user?.role === 'citizen' && (
                  <>
                    <button className="w-full bg-green-500 hover:bg-green-600 text-white p-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Report Incident</span>
                    </button>
                    <button className="w-full bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                      <BarChart3 className="w-4 h-4" />
                      <span>View My Reports</span>
                    </button>
                  </>
                )}
                {(user?.role === 'admin' || user?.role === 'police') && (
                  <>
                    <button
                      className={`w-full p-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                        user?.role === 'police'
                          ? 'bg-yellow-400 hover:bg-yellow-500 text-blue-900'
                          : 'bg-red-500 hover:bg-red-600 text-white'
                      }`}
                    >
                      <Shield className="w-4 h-4" />
                      <span>
                        {user?.role === 'police'
                          ? 'Police Panel'
                          : 'Admin Panel'}
                      </span>
                    </button>
                    <button className="w-full bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>User Management</span>
                    </button>
                  </>
                )}
                <button className="w-full bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>View Safety Map</span>
                </button>
              </div>
            </div>

            {/* Activity Feed */}
            <div
              className={`bg-white/10 backdrop-blur-md rounded-lg border-2 p-6 ${
                user?.role === 'citizen'
                  ? 'border-green-400/30'
                  : user?.role === 'police'
                  ? 'border-yellow-400/30'
                  : 'border-red-400/30'
              }`}
            >
              <h2 className="text-xl font-bold text-white mb-4">
                Recent Activity
              </h2>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      user?.role === 'citizen'
                        ? 'bg-green-400'
                        : user?.role === 'police'
                        ? 'bg-yellow-400'
                        : 'bg-red-400'
                    }`}
                  ></div>
                  <div>
                    <p className="text-white text-sm">
                      New report filed in Downtown area
                    </p>
                    <p className="text-gray-400 text-xs">5 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-white text-sm">
                      Case #456 marked as resolved
                    </p>
                    <p className="text-gray-400 text-xs">15 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-white text-sm">
                      Safety alert issued for Park area
                    </p>
                    <p className="text-gray-400 text-xs">1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-white text-sm">
                      Community patrol scheduled
                    </p>
                    <p className="text-gray-400 text-xs">2 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
