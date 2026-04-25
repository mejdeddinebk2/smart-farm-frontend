import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaDog, 
  FaLeaf, 
  FaHeartbeat, 
  FaClipboardList, 
  FaUserShield, 
  FaSeedling, 
  FaTint, 
  FaAppleAlt,
  FaRobot,
  FaChartLine,
  FaLock,
  FaArrowRight,
  FaCheckCircle,
  FaTractor
} from "react-icons/fa";
import { 
  MdPets, 
  MdLocalFlorist, 
  MdWaterDrop, 
  MdOutlineAnalytics,
  MdSecurity
} from "react-icons/md";
import { HiSparkles, HiLightningBolt } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";

const services = [
  {
    icon: <FaRobot size={40} />,
    title: "AI Animal Disease Detection",
    desc: "Detect animal diseases instantly with AI.",
    details: "Upload animal images or symptoms and our advanced AI will analyze for early signs of disease, helping you protect your livestock efficiently and prevent outbreaks before they spread.",
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600",
    features: ["Real-time detection", "95% accuracy", "Early warning system"]
  },
  {
    icon: <MdLocalFlorist size={40} />,
    title: "AI Plant Disease Detection",
    desc: "Identify plant diseases with a photo.",
    details: "Our AI scans plant images to spot diseases early, analyzing leaf patterns, discoloration, and other symptoms so you can treat crops before problems spread across your entire farm.",
    color: "from-green-500 to-emerald-600",
    bgColor: "bg-green-50",
    iconColor: "text-green-600",
    features: ["Image recognition", "Instant diagnosis", "Treatment recommendations"]
  },
  {
    icon: <FaClipboardList size={40} />,
    title: "Farm Records & Reports",
    desc: "Track all your animals, crops, and farm activities.",
    details: "Keep detailed records of animal health, crop growth, treatments, and farm operations in one centralized system. Generate comprehensive reports for better decision-making.",
    color: "from-purple-500 to-pink-600",
    bgColor: "bg-purple-50",
    iconColor: "text-purple-600",
    features: ["Digital records", "Analytics dashboard", "Export reports"]
  },
  {
    icon: <FaAppleAlt size={40} />,
    title: "Animal & Plant Food Management",
    desc: "Manage feeding schedules and supplies.",
    details: "Plan and track food for animals and plants, ensuring optimal nutrition and growth. Monitor inventory levels and get alerts when supplies run low.",
    color: "from-orange-500 to-red-600",
    bgColor: "bg-orange-50",
    iconColor: "text-orange-600",
    features: ["Smart scheduling", "Inventory tracking", "Nutrition plans"]
  },
  {
    icon: <MdWaterDrop size={40} />,
    title: "Watering & Irrigation",
    desc: "Organize and monitor watering routines.",
    details: "Set up and track irrigation for crops and water schedules for animals to maximize farm productivity. Optimize water usage with smart scheduling.",
    color: "from-cyan-500 to-blue-600",
    bgColor: "bg-cyan-50",
    iconColor: "text-cyan-600",
    features: ["Automated schedules", "Water optimization", "Usage analytics"]
  },
  {
    icon: <MdSecurity size={40} />,
    title: "Secure & Reliable",
    desc: "Your farm data is safe with us.",
    details: "We prioritize your privacy with end-to-end encryption and secure cloud storage. Your farm data is protected with bank-level security and backed up automatically.",
    color: "from-gray-700 to-gray-900",
    bgColor: "bg-gray-50",
    iconColor: "text-gray-700",
    features: ["End-to-end encryption", "Cloud backup", "24/7 monitoring"]
  }
];

const steps = [
  { 
    title: "Sign Up", 
    details: "Create your free account in under 2 minutes and join thousands of farmers managing their farms smarter.", 
    route: "/register",
    icon: <FaUserShield size={40} />,
    color: "from-blue-500 to-indigo-600",
    step: 1
  },
  { 
    title: "Add Animals & Plants", 
    details: "Register your animals and crops to begin tracking their health, growth, and productivity in real-time.", 
    route: "/dashboard",
    icon: <MdPets size={40} />,
    color: "from-green-500 to-emerald-600",
    step: 2
  },
  { 
    title: "Upload Images or Data", 
    details: "Upload photos or enter details for AI-powered disease detection and comprehensive farm analysis.", 
    route: "/ai-farms",
    icon: <FaRobot size={40} />,
    color: "from-purple-500 to-pink-600",
    step: 3
  },
  { 
    title: "Manage Food & Watering", 
    details: "Plan and monitor feeding and watering schedules for all farm resources with smart automation.", 
    route: "/feeding",
    icon: <FaAppleAlt size={40} />,
    color: "from-orange-500 to-red-600",
    step: 4
  },
  { 
    title: "Get Instant Insights", 
    details: "Receive AI-generated reports, health alerts, and actionable tips for improving your farm's productivity.", 
    route: "/dashboard",
    icon: <MdOutlineAnalytics size={40} />,
    color: "from-cyan-500 to-blue-600",
    step: 5
  },
  { 
    title: "Track Farm History", 
    details: "Monitor your farm's progress over time with detailed records, analytics, and performance metrics.", 
    route: "/dashboard",
    icon: <FaChartLine size={40} />,
    color: "from-yellow-500 to-orange-600",
    step: 6
  }
];

const ServicesSection = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [selectedStep, setSelectedStep] = useState(null);
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-b from-white via-gray-50 to-white">
      {/* Services Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-green-700 text-sm font-medium mb-4">
              <HiSparkles className="w-4 h-4" />
              <span>Our Services</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose{' '}
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                MyFarm
              </span>
              ?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive farm management tools powered by AI to help you grow smarter and more efficiently
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div 
                key={index} 
                className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                onClick={() => setSelectedService(service)}
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                {/* Content */}
                <div className="relative p-8">
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <div className="text-white">
                      {service.icon}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {service.desc}
                  </p>

                  {/* Features List */}
                  <div className="space-y-2 mb-4">
                    {service.features?.slice(0, 2).map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-500">
                        <FaCheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Learn More Link */}
                  <div className="flex items-center gap-2 text-green-600 font-medium text-sm group-hover:gap-3 transition-all">
                    <span>Learn more</span>
                    <FaArrowRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Corner Accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-400/10 to-transparent rounded-bl-full" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Detail Modal */}
      <AnimatePresence>
        {selectedService && (
          <motion.div 
            className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedService(null)}
          >
            <motion.div 
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with Gradient */}
              <div className={`relative bg-gradient-to-r ${selectedService.color} p-8 text-white`}>
                <button 
                  className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                  onClick={() => setSelectedService(null)}
                >
                  <span className="text-2xl leading-none">&times;</span>
                </button>

                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    {selectedService.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{selectedService.title}</h3>
                    <p className="text-white/80">Advanced Farm Management</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                  {selectedService.details}
                </p>

                {/* Features */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <HiLightningBolt className="w-5 h-5 text-yellow-500" />
                    Key Features
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {selectedService.features?.map((feature, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                      >
                        <FaCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      navigate('/register');
                      setSelectedService(null);
                    }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    Get Started
                    <FaArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedService(null)}
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-green-700 text-sm font-medium mb-4">
              <FaTractor className="w-4 h-4" />
              <span>Getting Started</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get started with MyFarm in 6 simple steps and transform your farming operations
            </p>
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                onClick={() => setSelectedStep(step)}
              >
                {/* Step Number Badge */}
                <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  {step.step}
                </div>

                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                {/* Content */}
                <div className="relative p-6">
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <div className="text-white text-2xl">
                      {step.icon}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                    {step.details}
                  </p>

                  {/* Action Link */}
                  <div className="flex items-center gap-2 text-green-600 font-medium text-sm group-hover:gap-3 transition-all">
                    <span>View details</span>
                    <FaArrowRight className="w-3 h-3" />
                  </div>
                </div>

                {/* Progress Line (connects to next step) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-green-300 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <div className="inline-flex flex-col items-center gap-4 p-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl shadow-xl">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <HiSparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">Ready to Get Started?</h3>
              <p className="text-green-100 max-w-md">
                Join thousands of farmers already using MyFarm to manage their operations smarter
              </p>
              <div className="flex flex-wrap gap-3 mt-2">
                <button
                  onClick={() => navigate('/register')}
                  className="px-8 py-4 bg-white text-green-600 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-lg flex items-center gap-2"
                >
                  Start Free Trial
                  <FaArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate('/about')}
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300"
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Step Detail Modal */}
      <AnimatePresence>
        {selectedStep && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedStep(null)}
          >
            <motion.div
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className={`relative bg-gradient-to-r ${selectedStep.color} p-8 text-white`}>
                <button
                  className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                  onClick={() => setSelectedStep(null)}
                >
                  <span className="text-2xl leading-none">&times;</span>
                </button>

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    {selectedStep.icon}
                  </div>
                  <div>
                    <div className="text-sm text-white/80 mb-1">Step {selectedStep.step}</div>
                    <h3 className="text-2xl font-bold">{selectedStep.title}</h3>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                  {selectedStep.details}
                </p>

                {/* Benefits */}
                <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2 text-green-700 font-semibold mb-2">
                    <FaCheckCircle className="w-5 h-5" />
                    <span>What you'll accomplish</span>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>Quick and easy setup process</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>Immediate access to all features</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>Step-by-step guidance available</span>
                    </li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-green-500/30"
                    onClick={() => {
                      navigate(selectedStep.route);
                      setSelectedStep(null);
                    }}
                  >
                    Go to {selectedStep.title}
                    <FaArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedStep(null)}
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ServicesSection;