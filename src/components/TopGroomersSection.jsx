import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaLinkedin, 
  FaTwitter, 
  FaEnvelope,
  FaAward,
  FaTractor,
  FaArrowRight
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import Farmer1 from '../assets/images/groomer-1.png';
import Farmer2 from '../assets/images/groomer-2.png';
import Farmer3 from '../assets/images/groomer-3.png';

const TopFarmersSection = () => {
  const farmers = [
    {
      id: 1,
      name: "Oliver Mitchell",
      role: "Sustainable Agriculture Expert",
      image: Farmer1,
      specialties: ["Organic Farming", "Soil Health"],
      experience: "15 years",
      farms: "50+ farms"
    },
    {
      id: 2,
      name: "Sophia Reynolds",
      role: "Precision Farming Specialist",
      image: Farmer2,
      specialties: ["Smart Tech", "AI Integration"],
      experience: "12 years",
      farms: "40+ farms"
    },
    {
      id: 3,
      name: "Ethan Anderson",
      role: "Crop Management Consultant",
      image: Farmer3,
      specialties: ["Disease Prevention", "Yield Optimization"],
      experience: "18 years",
      farms: "60+ farms"
    },
  ];

  return (
    <section className="relative py-20 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
      <div className="absolute bottom-20 left-0 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-green-700 text-sm font-medium mb-4">
            <FaAward className="w-4 h-4" />
            <span>Our Experts</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Meet Our Top Agricultural Experts
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experienced professionals dedicated to helping you achieve farming excellence
          </p>
        </div>

        {/* Farmers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {farmers.map((farmer, index) => (
            <div
              key={farmer.id}
              className="group bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              {/* Image Container */}
              <div className="relative">
                <div className="aspect-square overflow-hidden bg-gradient-to-br from-green-100 to-emerald-100">
                  <img
                    src={farmer.image}
                    alt={farmer.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Social Links (visible on hover) */}
                  <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                    <button className="w-10 h-10 bg-white/90 hover:bg-green-500 hover:text-white rounded-full flex items-center justify-center transition-colors shadow-lg">
                      <FaLinkedin className="w-4 h-4" />
                    </button>
                    <button className="w-10 h-10 bg-white/90 hover:bg-green-500 hover:text-white rounded-full flex items-center justify-center transition-colors shadow-lg">
                      <FaTwitter className="w-4 h-4" />
                    </button>
                    <button className="w-10 h-10 bg-white/90 hover:bg-green-500 hover:text-white rounded-full flex items-center justify-center transition-colors shadow-lg">
                      <FaEnvelope className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Experience Badge */}
                <div className="absolute top-4 right-4">
                  <div className="px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg">
                    {farmer.experience}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {farmer.name}
                </h3>
                <p className="text-green-600 font-medium mb-4">
                  {farmer.role}
                </p>

                {/* Specialties */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {farmer.specialties.map((specialty, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaTractor className="w-4 h-4 text-green-500" />
                    <span className="font-semibold">{farmer.farms}</span>
                  </div>
                  <div className="w-1 h-1 bg-gray-300 rounded-full" />
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaAward className="w-4 h-4 text-green-500" />
                    <span className="font-semibold">Certified</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-8 md:p-12 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
              <HiSparkles className="w-4 h-4" />
              <span>Join Our Expert Network</span>
            </div>
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Become Part of Our Team
            </h3>
            <p className="text-green-100 text-lg mb-8">
              Are you a farming expert? Join our community and help farmers worldwide achieve better results
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/join-experts"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-green-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              >
                Apply Now
                <FaArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/experts"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                View All Experts
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TopFarmersSection;