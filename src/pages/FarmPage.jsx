import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  FaLeaf,
  FaHeartbeat,
  FaShieldAlt,
  FaSeedling,
  FaArrowRight,
  FaBookOpen,
  FaPaw,
  FaAppleAlt,
  FaSyringe,
  FaStethoscope,
  FaExclamationTriangle,
  FaCheckCircle
} from 'react-icons/fa';
import { MdPets, MdLocalFlorist, MdWaterDrop } from 'react-icons/md';
import { HiSparkles } from 'react-icons/hi';
import CategoryDropdown from '../components/CategoryDropdown';
import image1 from '../assets/images/farm1.jpg';
import image2 from '../assets/images/farm1.png';
import image3 from '../assets/images/vaccination.png';

const FarmPage = () => {
  const [careTips, setCareTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const healthImages = [
    'https://images.ctfassets.net/b85ozb2q358o/d863425c73c7c617a9774422e6436312d34f417f79d87066c70c0d76adc4f858/3731c6967b8127db7f493a334035c07c/image.png',
    'https://fr.mypet.com/wp-content/uploads/sites/10/2024/04/nettoyage-yeux-chien.png',
    'https://www.myvetshop.fr/img/cms/helena-lopes-S3TPJCOIRoo-unsplash.jpg',
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const careTipsResponse = await axios.get('http://localhost:8080/api/care-tips');
        setCareTips(careTipsResponse.data.slice(0, 3));
      } catch (err) {
        setError('Failed to load data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const features = [
    {
      icon: <FaHeartbeat className="w-6 h-6" />,
      title: 'Health Monitoring',
      description: 'Track and monitor the health status of all your animals and plants',
      color: 'from-red-500 to-pink-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600'
    },
    {
      icon: <MdWaterDrop className="w-6 h-6" />,
      title: 'Smart Watering',
      description: 'Automated watering schedules for optimal plant growth',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      icon: <FaAppleAlt className="w-6 h-6" />,
      title: 'Nutrition Plans',
      description: 'Customized feeding schedules for every animal',
      color: 'from-orange-500 to-amber-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    },
    {
      icon: <FaShieldAlt className="w-6 h-6" />,
      title: 'Disease Prevention',
      description: 'Early detection and prevention strategies',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
  ];

  const stats = [
    { number: '10K+', label: 'Active Farms', icon: <FaSeedling /> },
    { number: '50K+', label: 'Animals Cared', icon: <MdPets /> },
    { number: '100K+', label: 'Plants Growing', icon: <MdLocalFlorist /> },
    { number: '99%', label: 'Success Rate', icon: <FaCheckCircle /> },
  ];

  const sections = [
    {
      title: 'Health and Well-Being',
      subtitle: 'Expert advice to keep your farm thriving',
      articles: careTips.map((careTip, index) => ({
        id: careTip.id,
        title: careTip.title,
        image: healthImages[index % healthImages.length],
        link: `/care-tips/${careTip.id}`,
        category: 'Health Tips'
      })),
      allArticlesLink: '/care-tips',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative mx-4 mt-4 rounded-3xl overflow-hidden shadow-2xl">
        <div
          className="relative h-[600px] bg-cover bg-center"
          style={{ backgroundImage: `url(${image2})` }}
        >
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
          
          {/* Decorative Elements */}
          <div className="absolute top-10 right-10 opacity-20">
            <FaLeaf className="w-32 h-32 text-green-400 transform rotate-12" />
          </div>
          <div className="absolute bottom-20 right-20 opacity-10">
            <FaSeedling className="w-48 h-48 text-green-400" />
          </div>

          {/* Content */}
          <div className="relative h-full flex items-center">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
              <div className="max-w-2xl">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-full text-green-300 text-sm font-medium mb-6">
                  <HiSparkles className="w-4 h-4" />
                  <span>Smart Farm Management</span>
                </div>

                <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                  Care for Your
                  <span className="block bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    Farm Animals & Plants
                  </span>
                </h1>

                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                  Discover expert tips and resources to keep your farm healthy and thriving. 
                  From nutrition to disease prevention, we've got you covered.
                </p>

                <div className="flex flex-wrap gap-4">
                  <Link
                    to="/care-tips"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-green-500/30 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <FaBookOpen className="w-5 h-5" />
                    Explore Care Tips
                  </Link>
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all duration-300"
                  >
                    Go to Dashboard
                    <FaArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 to-transparent" />
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl text-green-600 mb-3 group-hover:scale-110 transition-transform duration-300">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-green-700 text-sm font-medium mb-4">
            <FaLeaf className="w-4 h-4" />
            Features
          </span>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need for Your Farm
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive tools and resources to manage every aspect of your farm
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-green-200 transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Banner Cards Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {/* Vaccination Card */}
          <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className="relative h-56 overflow-hidden">
              <img
                src={image3}
                alt="Vaccination"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
                  <FaSyringe className="w-3 h-3" />
                  Vaccination
                </span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                Vaccinating Your Farm Animals
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Learn which diseases you should protect against and when to vaccinate.
              </p>
              <Link
                to="/care-tips"
                className="inline-flex items-center gap-2 text-green-600 font-medium text-sm hover:text-green-700 transition-colors"
              >
                Learn More
                <FaArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Category Dropdown Card */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-8 flex flex-col justify-center items-center text-center text-white">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
              <FaPaw className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Browse by Category</h3>
            <p className="text-green-100 mb-6">
              Find specific care tips for your animals and plants
            </p>
            <div className="w-full">
              <CategoryDropdown />
            </div>
          </div>

          {/* Nutrition Card */}
          <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className="relative h-56 overflow-hidden">
              <img
                src={image1}
                alt="Farm Nutrition"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-500 text-white text-xs font-medium rounded-full">
                  <FaAppleAlt className="w-3 h-3" />
                  Nutrition
                </span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                Optimal Nutrition Plans
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                High-protein, balanced formulation to meet your farm animals' needs.
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 text-green-600 font-medium text-sm hover:text-green-700 transition-colors"
              >
                View Products
                <FaArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Articles Section */}
      {loading ? (
        <div className="flex flex-col justify-center items-center min-h-[40vh] gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-green-200 rounded-full animate-spin border-t-green-600" />
            <FaLeaf className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-green-600" />
          </div>
          <p className="text-gray-500 font-medium">Loading care tips...</p>
        </div>
      ) : error ? (
        <div className="max-w-md mx-auto my-12">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaExclamationTriangle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to Load</h3>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : (
        sections.map((section, index) => (
          <div key={index} className="max-w-7xl mx-auto px-4 py-16">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
              <div>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-green-700 text-sm font-medium mb-4">
                  <FaHeartbeat className="w-4 h-4" />
                  Care Tips
                </span>
                <h2 className="text-4xl font-bold text-gray-900 mb-2">
                  {section.title}
                </h2>
                <p className="text-gray-600">{section.subtitle}</p>
              </div>
              <Link
                to={section.allArticlesLink}
                className="inline-flex items-center gap-2 text-green-600 font-medium hover:text-green-700 transition-colors mt-4 md:mt-0"
              >
                View All Articles
                <FaArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {section.articles.map((article, idx) => (
                <div
                  key={article.id}
                  className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Image */}
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium rounded-full">
                        <FaStethoscope className="w-3 h-3 text-green-600" />
                        {article.category}
                      </span>
                    </div>

                    {/* Quick Action */}
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <Link
                        to={article.link}
                        className="inline-flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-lg hover:bg-green-500 hover:text-white transition-colors"
                      >
                        <FaArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-green-600 transition-colors">
                      {article.title}
                    </h3>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <FaBookOpen className="w-4 h-4" />
                        <span>5 min read</span>
                      </div>
                      <Link
                        to={article.link}
                        className="inline-flex items-center gap-1 text-green-600 font-medium text-sm hover:text-green-700 transition-colors"
                      >
                        Read More
                        <FaArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* View All Button */}
            <div className="flex justify-center mt-12">
              <Link
                to={section.allArticlesLink}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-green-500/30 transition-all duration-300 hover:-translate-y-0.5"
              >
                <FaBookOpen className="w-5 h-5" />
                Browse All {section.title} Articles
              </Link>
            </div>
          </div>
        ))
      )}

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="relative bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
          </div>

          <div className="relative px-8 py-16 md:py-20 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-6">
              <FaLeaf className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Farm?
            </h2>
            <p className="text-green-100 text-lg max-w-2xl mx-auto mb-8">
              Join thousands of farmers who are already using MyFarm to manage their 
              animals and plants more efficiently.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-green-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              >
                Get Started Free
                <FaArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-gray-50 rounded-3xl p-8 md:p-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-2xl mb-6">
              <FaLeaf className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Stay Updated with Farm Tips
            </h3>
            <p className="text-gray-600 mb-8">
              Subscribe to our newsletter and get the latest care tips, product updates, 
              and expert advice delivered to your inbox.
            </p>
            
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 bg-white border border-gray-200 rounded-xl outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
              />
              <button
                type="submit"
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-green-500/30 transition-all duration-300 whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>

            <p className="text-xs text-gray-500 mt-4">
              By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmPage;