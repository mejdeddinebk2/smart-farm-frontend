import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HiMenu, 
  HiX, 
  HiChevronDown,
  HiHome,
  HiInformationCircle,
  HiCog,
  HiLogin,
  HiUserAdd
} from "react-icons/hi";
import { FaLeaf } from "react-icons/fa";
import FarmLogo from "../assets/images/farm-logo.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Close mobile menu on route change
    setIsOpen(false);
  }, [location]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const navLinks = [
    { 
      to: "/", 
      label: "Home", 
      icon: <HiHome className="w-5 h-5" /> 
    },
    { 
      to: "/about", 
      label: "About Us", 
      icon: <HiInformationCircle className="w-5 h-5" /> 
    },
    { 
      to: "/services", 
      label: "Services", 
      icon: <HiCog className="w-5 h-5" />,
      dropdown: [
        { to: "/services/animals", label: "Animal Care" },
        { to: "/services/plants", label: "Plant Care" },
        { to: "/services/consulting", label: "Consulting" },
      ]
    },
  ];

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  const toggleDropdown = (label) => {
    setActiveDropdown(activeDropdown === label ? null : label);
  };

  return (
    <>
      <nav 
        className={`w-full fixed top-0 z-50 transition-all duration-500 ${
          scrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-green-100' 
            : 'bg-white/80 backdrop-blur-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            
            {/* Logo Section */}
            <motion.div 
              className="flex-shrink-0 flex items-center cursor-pointer select-none group"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative">
                <img 
                  className="h-10 lg:h-12 w-auto rounded-xl shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:shadow-green-200" 
                  src={FarmLogo} 
                  alt="Farm Logo" 
                />
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 shadow-sm">
                  <FaLeaf className="w-2 h-2 text-white" />
                </div>
              </div>
              <div className="ml-3 flex flex-col">
                <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
                  MyFarm
                </span>
                <span className="text-[10px] text-gray-400 font-medium tracking-wider hidden sm:block">
                  Smart Farming Solutions
                </span>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center justify-center flex-1 px-8">
              <div className="flex items-center space-x-1">
                {navLinks.map((link) => (
                  <div key={link.label} className="relative">
                    {link.dropdown ? (
                      <div className="relative">
                        <button
                          onClick={() => toggleDropdown(link.label)}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300
                            ${isActiveLink(link.to)
                              ? 'bg-green-100 text-green-700'
                              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                        >
                          {link.icon}
                          {link.label}
                          <HiChevronDown 
                            className={`w-4 h-4 transition-transform duration-300 ${
                              activeDropdown === link.label ? 'rotate-180' : ''
                            }`} 
                          />
                        </button>
                        
                        <AnimatePresence>
                          {activeDropdown === link.label && (
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              transition={{ duration: 0.2 }}
                              className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
                            >
                              {link.dropdown.map((item) => (
                                <Link
                                  key={item.to}
                                  to={item.to}
                                  className="block px-4 py-3 text-sm text-gray-600 hover:bg-green-50 hover:text-green-700 transition-colors duration-200"
                                  onClick={() => setActiveDropdown(null)}
                                >
                                  {item.label}
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link
                        to={link.to}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 relative group
                          ${isActiveLink(link.to)
                            ? 'bg-green-100 text-green-700'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                      >
                        {link.icon}
                        {link.label}
                        {isActiveLink(link.to) && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full"
                          />
                        )}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Auth Buttons - Desktop */}
            <div className="hidden lg:flex items-center space-x-3">
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-300"
                >
                  <HiLogin className="w-4 h-4" />
                  Login
                </motion.button>
              </Link>
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 10px 30px -10px rgba(34, 197, 94, 0.5)" }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-xl shadow-lg shadow-green-200 transition-all duration-300"
                >
                  <HiUserAdd className="w-4 h-4" />
                  Sign Up
                </motion.button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors duration-200"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <HiX className="w-6 h-6" />
              ) : (
                <HiMenu className="w-6 h-6" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden bg-white border-t border-gray-100 overflow-hidden"
            >
              <div className="px-4 py-4 space-y-2">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {link.dropdown ? (
                      <div>
                        <button
                          onClick={() => toggleDropdown(link.label)}
                          className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-base font-medium transition-all duration-200
                            ${isActiveLink(link.to)
                              ? 'bg-green-100 text-green-700'
                              : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                          <span className="flex items-center gap-3">
                            {link.icon}
                            {link.label}
                          </span>
                          <HiChevronDown 
                            className={`w-5 h-5 transition-transform duration-300 ${
                              activeDropdown === link.label ? 'rotate-180' : ''
                            }`} 
                          />
                        </button>
                        <AnimatePresence>
                          {activeDropdown === link.label && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="ml-4 mt-1 space-y-1 overflow-hidden"
                            >
                              {link.dropdown.map((item) => (
                                <Link
                                  key={item.to}
                                  to={item.to}
                                  className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-green-50 hover:text-green-700 rounded-lg transition-colors duration-200"
                                >
                                  {item.label}
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link
                        to={link.to}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200
                          ${isActiveLink(link.to)
                            ? 'bg-green-100 text-green-700'
                            : 'text-gray-700 hover:bg-gray-100'
                          }`}
                      >
                        {link.icon}
                        {link.label}
                      </Link>
                    )}
                  </motion.div>
                ))}

                {/* Mobile Auth Buttons */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navLinks.length * 0.1 }}
                  className="pt-4 border-t border-gray-100 space-y-2"
                >
                  <Link to="/login" className="block">
                    <button className="w-full flex items-center justify-center gap-2 px-4 py-3 text-base font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200">
                      <HiLogin className="w-5 h-5" />
                      Login
                    </button>
                  </Link>
                  <Link to="/register" className="block">
                    <button className="w-full flex items-center justify-center gap-2 px-4 py-3 text-base font-medium text-white bg-gradient-to-r from-green-500 to-green-600 rounded-xl transition-all duration-200">
                      <HiUserAdd className="w-5 h-5" />
                      Sign Up
                    </button>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      
      {/* Spacer for fixed navbar */}
      <div className="h-16 lg:h-20" />
    </>
  );
};

export default Navbar;