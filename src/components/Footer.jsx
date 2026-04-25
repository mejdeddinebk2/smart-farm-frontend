import { Link } from 'react-router-dom';
import { 
  FaFacebookF, 
  FaTwitter, 
  FaInstagram, 
  FaYoutube,
  FaLinkedinIn,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaLeaf,
  FaArrowRight
} from 'react-icons/fa';
import FarmLogo from "../assets/images/farm-logo.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Features', path: '/features' },
      { name: 'Pricing', path: '/pricing' },
      { name: 'AI Detection', path: '/ai-farms' },
      { name: 'Smart Watering', path: '/watering' },
    ],
    company: [
      { name: 'About Us', path: '/about' },
      { name: 'Blog', path: '/blog' },
      { name: 'Careers', path: '/careers' },
      { name: 'Contact', path: '/contact' },
    ],
    support: [
      { name: 'Help Center', path: '/help' },
      { name: 'Documentation', path: '/docs' },
      { name: 'API Reference', path: '/api' },
      { name: 'Community', path: '/community' },
    ],
    legal: [
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Terms of Service', path: '/terms' },
      { name: 'Cookie Policy', path: '/cookies' },
      { name: 'Licenses', path: '/licenses' },
    ],
  };

  const socialLinks = [
    { icon: <FaFacebookF />, url: '#', name: 'Facebook', color: 'hover:bg-blue-600' },
    { icon: <FaTwitter />, url: '#', name: 'Twitter', color: 'hover:bg-sky-500' },
    { icon: <FaInstagram />, url: '#', name: 'Instagram', color: 'hover:bg-pink-600' },
    { icon: <FaYoutube />, url: '#', name: 'YouTube', color: 'hover:bg-red-600' },
    { icon: <FaLinkedinIn />, url: '#', name: 'LinkedIn', color: 'hover:bg-blue-700' },
  ];

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter Section */}
        <div className="py-12 border-b border-gray-700">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <h3 className="text-2xl md:text-3xl font-bold mb-2">
                Stay Updated with Farm Tips
              </h3>
              <p className="text-gray-400">
                Get the latest insights, tips, and updates delivered to your inbox
              </p>
            </div>
            <div className="w-full lg:w-auto lg:min-w-[400px]">
              <form className="flex gap-3">
                <div className="relative flex-1">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 font-semibold rounded-xl transition-all duration-300 whitespace-nowrap flex items-center gap-2"
                >
                  Subscribe
                  <FaArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12">
            {/* Brand Column */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <img
                  src={FarmLogo}
                  alt="MyFarm Logo"
                  className="w-14 h-14 rounded-xl"
                />
                <div>
                  <h3 className="text-2xl font-bold">MyFarm</h3>
                  <p className="text-sm text-green-400">Smart Farming Solutions</p>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6">
                AI-powered platform for smart farm management. Detect diseases, manage feeding and watering, 
                and track your entire farm's progress—all in one place.
              </p>

              {/* Contact Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                  <FaPhone className="w-4 h-4 text-green-500" />
                  <span className="text-sm">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                  <FaEnvelope className="w-4 h-4 text-green-500" />
                  <span className="text-sm">support@myfarm.com</span>
                </div>
                <div className="flex items-start gap-3 text-gray-400 hover:text-white transition-colors">
                  <FaMapMarkerAlt className="w-4 h-4 text-green-500 mt-1" />
                  <span className="text-sm">123 Farm Street, Agricultural District, CA 12345</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex gap-3">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 bg-gray-800 hover:bg-green-600 rounded-lg flex items-center justify-center transition-all duration-300 hover:-translate-y-1 ${social.color}`}
                    aria-label={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="text-lg font-bold mb-6">Product</h4>
              <ul className="space-y-3">
                {footerLinks.product.map((link, index) => (
                  <li key={index}>
                    <Link
                      to={link.path}
                      className="text-gray-400 hover:text-green-400 transition-colors flex items-center gap-2 group"
                    >
                      <FaLeaf className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="text-lg font-bold mb-6">Company</h4>
              <ul className="space-y-3">
                {footerLinks.company.map((link, index) => (
                  <li key={index}>
                    <Link
                      to={link.path}
                      className="text-gray-400 hover:text-green-400 transition-colors flex items-center gap-2 group"
                    >
                      <FaLeaf className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h4 className="text-lg font-bold mb-6">Support</h4>
              <ul className="space-y-3">
                {footerLinks.support.map((link, index) => (
                  <li key={index}>
                    <Link
                      to={link.path}
                      className="text-gray-400 hover:text-green-400 transition-colors flex items-center gap-2 group"
                    >
                      <FaLeaf className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="text-lg font-bold mb-6">Legal</h4>
              <ul className="space-y-3">
                {footerLinks.legal.map((link, index) => (
                  <li key={index}>
                    <Link
                      to={link.path}
                      className="text-gray-400 hover:text-green-400 transition-colors flex items-center gap-2 group"
                    >
                      <FaLeaf className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              © {currentYear} MyFarm. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link to="/sitemap" className="text-gray-400 hover:text-green-400 transition-colors">
                Sitemap
              </Link>
              <Link to="/accessibility" className="text-gray-400 hover:text-green-400 transition-colors">
                Accessibility
              </Link>
              <Link to="/status" className="text-gray-400 hover:text-green-400 transition-colors">
                Status
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;