import { Link } from 'react-router-dom';
import { 
  FaCheckCircle, 
  FaLeaf, 
  FaRobot,
  FaChartLine,
  FaUsers,
  FaAward,
  FaArrowRight,
  FaSeedling
} from 'react-icons/fa';
import { MdWaterDrop, MdPets, MdLocalFlorist } from 'react-icons/md';
import { HiSparkles } from 'react-icons/hi';
import farm1 from '../assets/images/farm1.png';

const AboutUsSection = () => {
  const features = [
    {
      icon: <FaCheckCircle className="w-5 h-5" />,
      title: "Accurate Record Keeping",
      description: "Comprehensive farm records for animals and plants with real-time updates"
    },
    {
      icon: <FaRobot className="w-5 h-5" />,
      title: "AI-Powered Insights",
      description: "Smart analysis of farm and plant health, food, and watering schedules"
    },
    {
      icon: <FaLeaf className="w-5 h-5" />,
      title: "Expert Care Tips",
      description: "Professional advice and recommended products for optimal farm management"
    }
  ];

  const stats = [
    { icon: <FaUsers />, number: "10K+", label: "Active Users" },
    { icon: <MdPets />, number: "50K+", label: "Animals Tracked" },
    { icon: <MdLocalFlorist />, number: "100K+", label: "Plants Monitored" },
    { icon: <FaAward />, number: "99%", label: "Success Rate" },
  ];

  return (
    <section className="relative py-20 bg-gradient-to-b from-white via-green-50/30 to-white overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Image Column */}
          <div className="relative">
            <div className="relative">
              {/* Decorative Elements */}
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-green-200 rounded-full opacity-50 blur-2xl" />
              <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-emerald-200 rounded-full opacity-50 blur-2xl" />
              
              {/* Main Image */}
              <div className="relative bg-gradient-to-br from-green-400 to-emerald-500 rounded-[3rem] p-2 shadow-2xl">
                <div className="bg-white rounded-[2.5rem] p-2 overflow-hidden">
                  <img 
                    src={farm1}
                    alt="Smart Farm Management"
                    className="w-full h-full object-cover rounded-[2rem]"
                  />
                </div>
              </div>

              {/* Floating Stats Card */}
              <div className="absolute -bottom-8 -right-8 bg-white rounded-2xl shadow-2xl p-6 max-w-xs animate-float">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <FaChartLine className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">98%</div>
                    <div className="text-sm text-gray-500">Farm Growth</div>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full w-[98%] bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" />
                </div>
              </div>

              {/* Badge */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-xl transform rotate-12">
                <div className="text-center">
                  <FaSeedling className="w-8 h-8 text-white mx-auto mb-1" />
                  <div className="text-xs font-bold text-white">Smart</div>
                  <div className="text-xs font-bold text-white">Farming</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content Column */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-green-700 text-sm font-medium">
              <HiSparkles className="w-4 h-4" />
              <span>About MyFarm</span>
            </div>

            {/* Heading */}
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                Empowering Farmers,{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 text-green-600">Growing Together</span>
                  <svg
                    className="absolute -bottom-2 left-0 w-full h-3 text-green-200"
                    viewBox="0 0 200 12"
                    fill="currentColor"
                  >
                    <path d="M0 8 Q50 0, 100 8 T200 8 L200 12 L0 12 Z" />
                  </svg>
                </span>
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                At MyFarm, we empower you to manage crops and animals with AI-powered tools 
                for disease detection, food and watering management, and complete farm tracking.
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group flex gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-green-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 group-hover:bg-green-500 group-hover:text-white transition-colors duration-300">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 pt-6">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-100"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {stat.number}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-green-500/30 transition-all duration-300 hover:-translate-y-0.5"
              >
                Get Started Free
                <FaArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-green-500 transition-all duration-300"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Animation CSS */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default AboutUsSection;