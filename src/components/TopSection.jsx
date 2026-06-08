import { Link } from "react-router-dom";
import { 
  FaLeaf, 
  FaRobot, 
  FaChartLine, 
  FaTractor,
  FaArrowRight,
  FaCheckCircle,
  FaSeedling
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { MdWaterDrop, MdPets, MdLocalFlorist } from "react-icons/md";
import FrontImage from "../assets/images/plante.jpg";

const TopSection = () => {
  const features = [
    { icon: <FaRobot className="w-4 h-4" />, text: "AI Disease Detection" },
    { icon: <MdWaterDrop className="w-4 h-4" />, text: "Smart Watering" },
    { icon: <FaChartLine className="w-4 h-4" />, text: "Growth Tracking" },
  ];

  const stats = [
    { number: "10K+", label: "Active Farms" },
    { number: "99%", label: "Accuracy" },
    { number: "24/7", label: "Monitoring" },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left Content */}
          <div className="flex-1 space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 border border-green-200 rounded-full text-green-700 text-sm font-medium">
              <HiSparkles className="w-4 h-4" />
              <span>AI-Powered Farm Management</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight">
              Manage Your Farm{' '}
              <span className="relative inline-block">
                <span className="relative z-10 text-green-600">Smart</span>
                <svg
                  className="absolute -bottom-2 left-0 w-full h-3 text-green-200"
                  viewBox="0 0 200 12"
                  fill="currentColor"
                >
                  <path d="M0 8 Q50 0, 100 8 T200 8 L200 12 L0 12 Z" />
                </svg>
              </span>
              ,{' '}
              <span className="block mt-2 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Grow Success
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg lg:text-xl text-gray-600 leading-relaxed max-w-2xl">
              Use AI to detect animal and plant diseases, manage food and watering schedules, 
              and grow your farm smarter than ever before!
            </p>

            {/* Features List */}
            <div className="flex flex-wrap gap-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-100"
                >
                  <div className="text-green-600">{feature.icon}</div>
                  <span className="text-sm font-medium text-gray-700">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-green-500/30 transition-all duration-300 hover:-translate-y-0.5"
              >
                Get Started Free
                <FaArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-green-500 transition-all duration-300"
              >
                <FaLeaf className="w-4 h-4 text-green-600" />
                Learn More
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200">
              {stats.map((stat, index) => (
                <div key={index}>
                  <div className="text-2xl lg:text-3xl font-bold text-green-600">
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Image */}
          <div className="flex-1 relative">
            <div className="relative">
              {/* Decorative Elements */}
              <div className="absolute -top-8 -left-8 w-32 h-32 bg-green-200 rounded-full opacity-50 blur-2xl" />
              <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-emerald-200 rounded-full opacity-50 blur-2xl" />
              
              {/* Main Image Container */}
              <div className="relative bg-gradient-to-br from-green-400 to-emerald-500 rounded-[3rem] p-2 shadow-2xl shadow-green-500/30">
                <div className="relative bg-white rounded-[2.5rem] p-4 overflow-hidden">
                  <img
                    src={FrontImage}
                    alt="Smart Farming"
                    className="w-full h-full object-cover rounded-[2rem]"
                  />
                  
                  {/* Floating Card 1 */}
                  <div className="absolute top-8 -left-4 bg-white rounded-xl shadow-xl p-4 flex items-center gap-3 animate-float">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <FaRobot className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">AI Detection</div>
                      <div className="text-lg font-bold text-gray-900">Active</div>
                    </div>
                  </div>

                  {/* Floating Card 2 */}
                  <div className="absolute bottom-8 -right-4 bg-white rounded-xl shadow-xl p-4 flex items-center gap-3 animate-float animation-delay-2000">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <MdWaterDrop className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Watering</div>
                      <div className="text-lg font-bold text-gray-900">On Time</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Badge Icons */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg transform rotate-12">
                <FaSeedling className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animation CSS */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
};

export default TopSection;