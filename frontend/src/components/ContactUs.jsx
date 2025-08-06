import React, { useState } from 'react';
import { Phone, MapPin, Clock, Mail, Heart, Star } from 'lucide-react';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900">
        <div className="absolute inset-0 opacity-20">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `url('data:image/svg+xml,${encodeURIComponent(`
                <svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
                  <g fill="none" fill-rule="evenodd">
                    <g fill="rgba(255,255,255,0.05)" fill-opacity="0.1">
                      <circle cx="40" cy="40" r="3"/>
                      <path d="M40 10v10M40 60v10M10 40h10M60 40h10"/>
                      <circle cx="20" cy="20" r="2"/>
                      <circle cx="60" cy="20" r="2"/>
                      <circle cx="20" cy="60" r="2"/>
                      <circle cx="60" cy="60" r="2"/>
                    </g>
                  </g>
                </svg>
              `)}')`
            }}
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="space-y-8">
            <h1 className="text-6xl md:text-8xl font-light text-white mb-6 tracking-widest">
              Connect
            </h1>
            <div className="flex items-center justify-center space-x-4">
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-emerald-300 to-transparent"></div>
              <div className="w-2 h-2 bg-emerald-300 rounded-full"></div>
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-emerald-300 to-transparent"></div>
            </div>
            <p className="text-xl md:text-2xl text-emerald-100 font-light max-w-3xl mx-auto leading-relaxed">
              Let us help you find the perfect prayer mat for your spiritual journey
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        
        {/* Company Introduction */}
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-light text-slate-800 mb-8 tracking-widest bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
            CEKIR
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed font-light">
            Dedicated artisans creating premium prayer mats that honor Islamic traditions. 
            Each mat is carefully crafted to provide comfort, beauty, and spiritual connection during your prayers.
          </p>
        </div>

        {/* Contact Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          <h3 className="text-3xl font-light text-slate-800 mb-8 lg:col-span-4 text-center">Get In Touch</h3>
            
            {/* Phone */}
            <div className="group bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 border-l-4 border-emerald-600">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full group-hover:bg-emerald-600 transition-colors duration-300">
                  <Phone className="w-8 h-8 text-emerald-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <div>
                  <h4 className="text-xl font-medium text-slate-800 mb-3">Phone</h4>
                  <div className="space-y-2">
                    <p className="text-slate-600 hover:text-emerald-600 transition-colors cursor-pointer">+1 (555) 123-4567</p>
                    <p className="text-slate-600 hover:text-emerald-600 transition-colors cursor-pointer">+1 (555) 987-6543</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="group bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 border-l-4 border-emerald-600">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full group-hover:bg-emerald-600 transition-colors duration-300">
                  <Mail className="w-8 h-8 text-emerald-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <div>
                  <h4 className="text-xl font-medium text-slate-800 mb-3">Email</h4>
                  <div className="space-y-2">
                    <p className="text-slate-600 hover:text-emerald-600 transition-colors cursor-pointer">info@cekir.com</p>
                    <p className="text-slate-600 hover:text-emerald-600 transition-colors cursor-pointer">orders@cekir.com</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="group bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 border-l-4 border-emerald-600">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full group-hover:bg-emerald-600 transition-colors duration-300">
                  <MapPin className="w-8 h-8 text-emerald-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <div>
                  <h4 className="text-xl font-medium text-slate-800 mb-3">Showroom</h4>
                  <div className="space-y-1">
                    <p className="text-slate-600">123 Heritage Street</p>
                    <p className="text-slate-600">Islamic Quarter</p>
                    <p className="text-slate-600">Istanbul, Turkey 34122</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hours */}
            <div className="group bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 border-l-4 border-emerald-600">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full group-hover:bg-emerald-600 transition-colors duration-300">
                  <Clock className="w-8 h-8 text-emerald-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <div>
                  <h4 className="text-xl font-medium text-slate-800 mb-3">Showroom Hours</h4>
                  <div className="space-y-1">
                    <p className="text-slate-600">Monday - Friday: 9:00 AM - 7:00 PM</p>
                    <p className="text-slate-600">Saturday: 10:00 AM - 6:00 PM</p>
                    <p className="text-slate-600">Sunday: 12:00 PM - 5:00 PM</p>
                  
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

     

        {/* Customer Testimonials */}
        <div className="bg-slate-50 p-12 rounded-3xl mb-20">
          <h3 className="text-4xl font-light text-slate-800 text-center mb-12">What Our Customers Say</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Ahmed Hassan",
                location: "Dubai, UAE",
                text: "The quality of my Cekir prayer mat is exceptional. It's been over two years and it still looks brand new. The comfort during prayers is unmatched.",
                rating: 5
              },
              {
                name: "Fatima Al-Zahra",
                location: "London, UK",
                text: "I ordered a custom design prayer mat for my daughter's wedding gift. The attention to detail and craftsmanship exceeded all expectations.",
                rating: 5
              },
              {
                name: "Ibrahim Yusuf",
                location: "Istanbul, Turkey",
                text: "As a frequent traveler, the travel companion series has been a blessing. Lightweight yet durable, perfect for prayers anywhere in the world.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-emerald-500 fill-current" />
                  ))}
                </div>
                <p className="text-slate-600 mb-4 italic">"{testimonial.text}"</p>
                <div>
                  <p className="font-medium text-slate-800">{testimonial.name}</p>
                  <p className="text-sm text-slate-500">{testimonial.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h3 className="text-4xl md:text-5xl font-light text-slate-800 mb-6 tracking-wide">
            Ready to Find Your Perfect Prayer Mat?
          </h3>
          <p className="text-lg text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed font-light">
            Experience the difference of praying on a mat crafted with devotion, respect, and 
            the finest materials. Let us help you find the perfect companion for your spiritual journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-emerald-600 text-white px-8 py-4 rounded-lg hover:bg-emerald-700 transition-colors duration-300 font-medium tracking-wide">
              VISIT SHOWROOM
            </button>
            <button className="border-2 border-emerald-600 text-emerald-600 px-8 py-4 rounded-lg hover:bg-emerald-600 hover:text-white transition-all duration-300 font-medium tracking-wide">
              BROWSE COLLECTIONS
            </button>
          </div>
        </div>

        {/* Footer tagline */}
        <div className="text-center mt-20 pt-12 border-t border-slate-200">
          <div className="text-4xl md:text-5xl font-light mb-4 bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent tracking-widest">
            CEKIR
          </div>
          <p className="text-slate-500 mt-2 font-light tracking-widest text-sm">
            WHERE PRAYER MEETS PERFECTION
          </p>
          <div className="flex items-center justify-center space-x-2 mt-4">
            <Heart className="w-4 h-4 text-emerald-600" />
            <p className="text-slate-400 text-xs">Crafted with love and devotion</p>
            <Heart className="w-4 h-4 text-emerald-600" />
          </div>
        </div>
    
    </div>
  );
};

export default ContactUs;