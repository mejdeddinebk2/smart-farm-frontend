import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaArrowRight, 
  FaCalendarAlt, 
  FaLeaf,
  FaTractor,
  FaSeedling,
  FaNewspaper
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import News1 from '../assets/images/news-1.png';
import News2 from '../assets/images/news-2.png';
import News3 from '../assets/images/news-3.png';

const TopNewsSection = () => {
  const newsArticles = [
    {
      id: 1,
      title: "Smart Irrigation Revolution",
      excerpt: "Discover how AI-powered irrigation systems are helping farmers save up to 40% water while increasing crop yields. The future of sustainable farming is here.",
      image: News1,
      category: "Technology",
      date: "May 15, 2024",
      icon: <FaTractor />,
      color: "blue"
    },
    {
      id: 2,
      title: "Organic Farming Success",
      excerpt: "Local farmers embrace eco-friendly practices with organic fertilizers and natural pest control, leading to healthier crops and better soil quality.",
      image: News2,
      category: "Sustainability",
      date: "May 10, 2024",
      icon: <FaLeaf />,
      color: "green"
    },
    {
      id: 3,
      title: "Crop Disease Detection AI",
      excerpt: "New artificial intelligence technology can detect plant diseases 48 hours before visible symptoms appear, revolutionizing crop management.",
      image: News3,
      category: "Innovation",
      date: "May 5, 2024",
      icon: <FaSeedling />,
      color: "purple"
    },
  ];

  const categoryColors = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    purple: "bg-purple-100 text-purple-700"
  };

  return (
    <section className="relative py-20 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-green-700 text-sm font-medium mb-4">
            <FaNewspaper className="w-4 h-4" />
            <span>Latest Updates</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Farm News & Insights
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Stay updated with the latest trends, technologies, and success stories from the farming community
          </p>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {newsArticles.map((article, index) => (
            <div
              key={article.id}
              className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${categoryColors[article.color]} backdrop-blur-sm text-xs font-semibold rounded-full`}>
                    {article.icon}
                    {article.category}
                  </span>
                </div>

                {/* Read More Button (appears on hover) */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <Link
                    to={`/news/${article.id}`}
                    className="inline-flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-lg hover:bg-green-500 hover:text-white transition-colors"
                  >
                    <FaArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Date */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <FaCalendarAlt className="w-3 h-3" />
                  <span>{article.date}</span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-green-600 transition-colors">
                  {article.title}
                </h3>

                {/* Excerpt */}
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
                  {article.excerpt}
                </p>

                {/* Read More Link */}
                <Link
                  to={`/news/${article.id}`}
                  className="inline-flex items-center gap-2 text-green-600 font-semibold text-sm hover:text-green-700 transition-colors"
                >
                  Read Full Article
                  <FaArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="flex justify-center">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-green-500/30 transition-all duration-300 hover:-translate-y-0.5"
          >
            <FaNewspaper className="w-5 h-5" />
            View All Articles
            <FaArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TopNewsSection;