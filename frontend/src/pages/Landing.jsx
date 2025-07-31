import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  MapPin, 
  BarChart3, 
  CheckCircle, 
  Eye, 
  AlertTriangle, 
  Bot,
  ArrowRight,
  Mail,
  Github,
  Linkedin
} from 'lucide-react';

const Landing = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-white"></div>
        
        <motion.div 
          className="relative z-10 text-center max-w-4xl mx-auto"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-white p-4 rounded-full shadow-lg">
                <Shield className="w-16 h-16 text-blue-800" />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              <span className="text-blue-400">Government</span>
              <br />
              <span className="text-gray-900">Crime Portal</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-900 mb-8 leading-relaxed">
              Official government platform for secure crime reporting and community safety management.
            </p>
          </motion.div>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="bg-white text-gray-900 px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Citizen Login
            </Link>
            <Link
              to="/register"
              className="bg-white hover:bg-gray-100 text-gray-900 px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 border-2 "
            >
              Register
            </Link>
          </motion.div>
        </motion.div>

 
         
      </section>

      {/* About Us Section */}
     <section className="py-20 px-4 bg-gradient-to-r from-blue-50 to-yellow-50">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">About SafeReport</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Official government platform connecting citizens with law enforcement through secure, efficient crime reporting and community safety management.
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 gap-12 items-center"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}>
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Our Mission</h3>
              <p className="text-gray-700 mb-6 leading-relaxed">
                To provide a secure, efficient, and transparent platform that strengthens the partnership between citizens and law enforcement agencies for enhanced community safety.
              </p>
              
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Government Commitment</h3>
              <p className="text-gray-700 leading-relaxed">
                Backed by government resources and commitment to public safety, ensuring reliable service and proper follow-up on all reported incidents.
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="grid grid-cols-2 gap-6">
              {[
                { icon: Users, title: 'Citizen-Focused', desc: 'Designed for easy public access and use', color: 'text-green-600' },
                { icon: Shield, title: 'Government Secure', desc: 'Protected by government-grade security', color: 'text-blue-600' },
                { icon: BarChart3, title: 'Official Data', desc: 'Integrated with law enforcement systems', color: 'text-purple-600' },
                { icon: Bot, title: 'AI-Assisted', desc: 'Smart guidance for accurate reporting', color: 'text-orange-600' }
              ].map((item, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-md">
                  <item.icon className={`w-8 h-8 ${item.color} mb-3`} />
                  <h4 className="text-blue-900 font-semibold mb-2">{item.title}</h4>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-50 to-yellow-50">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">How It Works</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Simple, secure process for reporting and tracking incidents
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-4 gap-8"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {[
              { 
                icon: AlertTriangle, 
                title: 'Report', 
                desc: 'Submit secure reports with location and evidence',
                step: '01'
              },
              { 
                icon: CheckCircle, 
                title: 'Process', 
                desc: 'Law enforcement reviews and processes your report',
                step: '02'
              },
              { 
                icon: Eye, 
                title: 'Track', 
                desc: 'Monitor progress and receive official updates',
                step: '03'
              },
              { 
                icon: Shield, 
                title: 'Resolve', 
                desc: 'Cases are resolved with proper follow-up',
                step: '04'
              }
            ].map((step, index) => (
              <motion.div 
                key={index}
                variants={fadeInUp}
                className="text-center relative"
              >
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 relative shadow-lg">
                  <step.icon className="w-8 h-8 text-white" />
                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-blue-900 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                    {step.step}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-3">{step.title}</h3>
                <p className="text-gray-700 leading-relaxed">{step.desc}</p>
                
                {index < 3 && (
                  <ArrowRight className="hidden md:block absolute top-8 -right-4 w-6 h-6 text-blue-600" />
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* AI Safety Assistant Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="grid md:grid-cols-2 gap-12 items-center"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}>
              <Bot className="w-16 h-16 text-blue-600 mb-6" />
              <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">
                AI-Powered Assistance
              </h2>
              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                Government-approved AI assistant to help you navigate the reporting process and get accurate information about community safety.
              </p>
              
              <div className="space-y-4">
                {[
                  'Step-by-step reporting guidance',
                  'Official safety information',
                  'Report status updates',
                  '24/7 assistance available'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 shadow-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <Bot className="w-8 h-8 text-blue-600" />
                  <span className="text-blue-900 font-semibold">Government AI Assistant</span>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-blue-100 rounded-lg p-3">
                    <p className="text-blue-800 text-sm">
                      Hello! I'm your official government AI assistant. I can help you file reports and answer questions about community safety.
                    </p>
                  </div>
                  
                  <div className="bg-yellow-100 rounded-lg p-3 ml-8">
                    <p className="text-blue-900 text-sm">
                      I need to report a suspicious activity. Can you guide me through the process?
                    </p>
                  </div>
                  
                  <div className="bg-blue-100 rounded-lg p-3">
                    <p className="text-blue-800 text-sm">
                      I'll guide you through our secure reporting process. First, let me collect some basic information about the incident...
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Contact & Footer Section */}
           <section className="py-20 px-4 bg-gradient-to-r from-blue-50 to-yellow-50">

        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Get In Touch</h2>
            <p className="text-xl text-gray-900 max-w-3xl mx-auto">
              Official government contact channels for support and inquiries.
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-3 gap-8 mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {[
              { 
                icon: Mail, 
                title: 'Official Email', 
                content: 'support@safereport.gov',
                link: 'mailto:support@safereport.gov'
              },
              { 
                icon: Shield, 
                title: 'Emergency Line', 
                content: 'Call 911 for emergencies',
                link: 'tel:911'
              },
              { 
                icon: Users, 
                title: 'Public Affairs', 
                content: 'Community outreach office',
                link: 'tel:311'
              }
            ].map((contact, index) => (
              <motion.a
                key={index}
                href={contact.link}
                variants={fadeInUp}
                className="bg-white/10 backdrop-blur-md p-6 rounded-lg border border-blue-400 text-center hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
              >
                <contact.icon className="w-12 h-12 text-yellow-800 mx-auto mb-4" />
                <h3 className="text-gray-800 font-semibold mb-2">{contact.title}</h3>
                <p className="text-gray-900">{contact.content}</p>
              </motion.a>
            ))}
          </motion.div>

          {/* CTA Section */}
          <motion.div 
            className="text-center"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h3 className="text-3xl font-bold text-black mb-6">Ready to Make Your Community Safer?</h3>
            <Link
              to="/register"
              className="inline-flex items-center space-x-2   hover:bg-yellow-500   px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>

          {/* Footer */}
          <div className="border-t border-blue-400 mt-16 pt-8 text-center">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-2">
                {/* <Shield className="w-6 h-6 text-yellow-400" /> */}
                <div className="flex flex-col items-start">
                  <span className="text-black font-bold">SafeReport</span>
                  <span className="text-blue-600 text-xs">Official Government Portal</span>
                </div>
              </div>
              
              <div className="flex space-x-6 text-gray-900">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors">Support</a>
              </div>
              
              <p className="text-gray-900 text-sm">
                © 2025 Government SafeReport Portal. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;