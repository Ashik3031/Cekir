import React, { useEffect, useRef, useState } from 'react';

const AboutUs = () => {
  const heroRef = useRef(null);
  const sectionsRef = useRef([]);
  const [isVisible, setIsVisible] = useState({});

  useEffect(() => {
    // Parallax effect for hero section
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const hero = heroRef.current;
      if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.3}px)`;
      }
    };

    // Intersection Observer for fade-in animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({
              ...prev,
              [entry.target.dataset.section]: true
            }));
          }
        });
      }, 
      { threshold: 0.2 }
    );  

    sectionsRef.current.forEach((section, index) => {
      if (section) {
        section.dataset.section = index;
        observer.observe(section);
      }
    });

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white min-h-screen">
      {/* Hero Section */}
      <div className="relative h-screen overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900">
        <div 
          ref={heroRef}
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url('data:image/svg+xml,${encodeURIComponent(`
              <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
                <g fill="none" fill-rule="evenodd">
                  <g fill="rgba(255,255,255,0.03)" fill-opacity="0.1">
                    <circle cx="30" cy="30" r="4"/>
                    <path d="M30 0v8M30 52v8M0 30h8M52 30h8"/>
                  </g>
                </g>
              </svg>
            `)}')`
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center text-center text-white px-4">
            <div className="max-w-5xl space-y-8">
              <div className="space-y-4">
                <h1 className="text-7xl md:text-9xl font-light tracking-widest mb-6 bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent">
                  CEKIR
                </h1>
                <div className="flex items-center justify-center space-x-4">
                  <div className="w-16 h-px bg-gradient-to-r from-transparent via-emerald-300 to-transparent"></div>
                  <div className="w-2 h-2 bg-emerald-300 rounded-full"></div>
                  <div className="w-16 h-px bg-gradient-to-r from-transparent via-emerald-300 to-transparent"></div>
                </div>
              </div>
              
              <div className="space-y-6">
                <p className="text-2xl md:text-3xl font-light tracking-wide text-emerald-100">
                  Sacred Spaces, Woven with Devotion
                </p>
                <p className="text-lg md:text-xl font-extralight text-emerald-200 max-w-3xl mx-auto leading-relaxed">
                  Crafting premium prayer mats that honor tradition while embracing modern elegance
                </p>
              </div>

              <div className="flex items-center justify-center mt-12">
                <div className="animate-bounce">
                  <div className="w-8 h-12 border-2 border-emerald-300 rounded-full flex justify-center">
                    <div className="w-1 h-3 bg-emerald-300 rounded-full mt-2"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Our Story Section */}
      <section 
        ref={el => sectionsRef.current[0] = el}
        className={`py-24 px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${
          isVisible[0] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-light text-slate-800 mb-8">
              Our Sacred Journey
            </h2>
            <div className="flex items-center justify-center space-x-4 mb-12">
              <div className="w-12 h-px bg-emerald-600"></div>
              <div className="w-3 h-3 bg-emerald-600 rounded-full"></div>
              <div className="w-12 h-px bg-emerald-600"></div>
            </div>
            <p className="text-xl text-slate-600 font-light max-w-4xl mx-auto leading-relaxed">
              Born from a deep reverence for Islamic tradition and a passion for exceptional craftsmanship, 
              Cekir has been creating prayer mats that serve as bridges between the earthly and the divine.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <div className="space-y-6 text-slate-700 font-light leading-relaxed text-lg">
                <p>
                  Every thread tells a story of devotion. Founded with the vision of creating prayer mats 
                  that honor the sanctity of worship, Cekir combines time-honored weaving techniques with 
                  contemporary design sensibilities.
                </p>
                <p>
                  Our artisans understand that a prayer mat is more than just a carpet – it's a sacred space 
                  where believers connect with Allah, find peace, and center their souls. Each mat is woven 
                  with intention, respect, and meticulous attention to detail.
                </p>
                <p>
                  From traditional Islamic geometric patterns to modern minimalist designs, we create 
                  prayer mats that complement both classical mosque interiors and contemporary homes, 
                  ensuring your spiritual practice is always beautifully supported.
                </p>
              </div>
              
              <div className="bg-emerald-50 p-8 rounded-2xl border-l-4 border-emerald-600">
                <p className="text-emerald-800 font-medium italic text-lg">
                  "And it is He who sends down rain from heaven, and We produce thereby the vegetation of every kind."
                </p>
                <p className="text-emerald-600 text-sm mt-3 font-medium">
                  — Quran 6:99
                </p>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-3xl p-8 shadow-2xl">
                <div className="w-full h-full bg-gradient-to-br from-emerald-800 to-emerald-600 rounded-2xl flex items-center justify-center">
                  <div className="text-white text-center space-y-4">
                    <div className="text-6xl">🕌</div>
                    <p className="text-xl font-light">Handcrafted with Love</p>
                    <p className="text-emerald-200 font-light">Since 2010</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 w-32 h-32 border-2 border-emerald-300 rounded-full opacity-30"></div>
              <div className="absolute -bottom-6 -left-6 w-20 h-20 border-2 border-emerald-400 rounded-full opacity-40"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Collections Section */}
      <section 
        ref={el => sectionsRef.current[1] = el}
        className={`py-24 bg-white transition-all duration-1000 delay-200 ${
          isVisible[1] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-light text-slate-800 mb-8">
              Sacred Collections
            </h2>
            <div className="flex items-center justify-center space-x-4 mb-12">
              <div className="w-12 h-px bg-emerald-600"></div>
              <div className="w-3 h-3 bg-emerald-600 rounded-full"></div>
              <div className="w-12 h-px bg-emerald-600"></div>
            </div>
            <p className="text-xl text-slate-600 font-light max-w-3xl mx-auto">
              Four distinct collections, each designed to enhance your spiritual journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Classic Heritage",
                subtitle: "Traditional Islamic Patterns",
                description: "Timeless geometric designs inspired by Islamic architecture and calligraphy. Rich colors and intricate patterns that have adorned mosques for centuries.",
                icon: "🕌",
                color: "emerald"
              },
              {
                title: "Modern Minimalist",
                subtitle: "Contemporary Elegance", 
                description: "Clean lines and subtle textures for modern Muslim homes. Simple yet sophisticated designs that complement contemporary living spaces.",
                icon: "✨",
                color: "teal"
              },
              {
                title: "Travel Companion",
                subtitle: "Portable Prayer Mats",
                description: "Lightweight, foldable prayer mats perfect for travel, office, or outdoor worship. Compact design without compromising on comfort and quality.",
                icon: "🧳",
                color: "cyan"
              },
              {
                title: "Premium Luxe",
                subtitle: "Artisan Masterpieces",
                description: "Hand-woven premium mats using the finest materials. Exclusive designs crafted by master artisans for those who appreciate exceptional quality.",
                icon: "💎",
                color: "slate"
              }
            ].map((collection, index) => (
              <div 
                key={index}
                className="group relative bg-slate-50 p-8 rounded-2xl hover:bg-white transition-all duration-500 hover:shadow-2xl border-2 border-transparent hover:border-emerald-200"
              >
                <div className="text-center space-y-6">
                  <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    {collection.icon}
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-light text-slate-800">
                      {collection.title}
                    </h3>
                    <div className="w-8 h-px bg-emerald-600 mx-auto"></div>
                    <p className="text-sm text-emerald-700 font-medium tracking-wider uppercase">
                      {collection.subtitle}
                    </p>
                    <p className="text-slate-600 font-light leading-relaxed text-sm">
                      {collection.description}
                    </p>
                  </div>
                </div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-t-2xl"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Craftsmanship Section */}
      <section 
        ref={el => sectionsRef.current[2] = el}
        className={`py-24 bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 text-white transition-all duration-1000 delay-300 ${
          isVisible[2] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl md:text-6xl font-light mb-8 text-emerald-100">
                Art of Devotion
              </h2>
              <div className="w-16 h-px bg-emerald-400 mb-8"></div>
              <div className="space-y-6 text-emerald-50 font-light leading-relaxed text-lg">
                <p>
                  Every Cekir prayer mat begins with a prayer itself – a prayer for guidance, 
                  for skill, and for the creation of something truly worthy of worship.
                </p>
                <p>
                  Our master weavers, many of whom come from generations of textile artisans, 
                  carefully select premium materials: soft Turkish cotton, durable Persian wool, 
                  and eco-friendly bamboo fibers.
                </p>
                <p>
                  Through traditional hand-weaving techniques passed down through centuries, 
                  combined with modern quality controls, we ensure each mat provides the perfect 
                  foundation for spiritual connection.
                </p>
              </div>
            </div>
            <div className="space-y-8">
              {[
                { number: "100%", text: "Natural, breathable materials" },
                { number: "15+", text: "Years of artisan experience" },
                { number: "5000+", text: "Happy customers worldwide" },
                { number: "∞", text: "Moments of peace created" }
              ].map((stat, index) => (
                <div key={index} className="text-center p-6 bg-emerald-800/30 backdrop-blur-sm rounded-xl border border-emerald-700/50 hover:border-emerald-400/50 transition-all duration-300">
                  <div className="text-4xl font-light text-emerald-300 mb-2">{stat.number}</div>
                  <div className="text-emerald-100 font-light">{stat.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section 
        ref={el => sectionsRef.current[3] = el}
        className={`py-24 bg-emerald-50 transition-all duration-1000 delay-400 ${
          isVisible[3] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-5xl md:text-6xl font-light text-slate-800 mb-8">
            Our Values
          </h2>
          <div className="flex items-center justify-center space-x-4 mb-16">
            <div className="w-12 h-px bg-emerald-600"></div>
            <div className="w-3 h-3 bg-emerald-600 rounded-full"></div>
            <div className="w-12 h-px bg-emerald-600"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                title: "Respect",
                description: "Deep reverence for Islamic traditions and the sacred act of prayer",
                icon: "🤲"
              },
              {
                title: "Quality",
                description: "Uncompromising commitment to excellence in every thread and stitch",
                icon: "⭐"
              },
              {
                title: "Community",
                description: "Supporting Muslim families worldwide in their spiritual journey",
                icon: "🤝"
              }
            ].map((value, index) => (
              <div key={index} className="space-y-6">
                <div className="text-5xl">{value.icon}</div>
                <h3 className="text-2xl font-light text-slate-800">{value.title}</h3>
                <p className="text-slate-600 font-light leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section 
        ref={el => sectionsRef.current[4] = el}
        className={`py-24 bg-slate-900 text-white transition-all duration-1000 delay-500 ${
          isVisible[4] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-5xl md:text-6xl font-light mb-8">
            Connect With Us
          </h2>
          <div className="flex items-center justify-center space-x-4 mb-16">
            <div className="w-12 h-px bg-emerald-400"></div>
            <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
            <div className="w-12 h-px bg-emerald-400"></div>
          </div>
          
          <div className="space-y-12 text-slate-200 font-light">
            <div>
              <p className="text-2xl mb-6 text-emerald-300">Discover Your Perfect Prayer Mat</p>
              <p className="text-lg mb-8">
                Visit our showroom or browse our collections online to find the prayer mat that speaks to your soul
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-slate-700">
              <div>
                <p className="text-xl mb-4 text-emerald-300">📍 Our Showroom</p>
                <p className="leading-relaxed">
                  Experience our collections in person<br/>
                  Expert guidance from our team<br/>
                  Custom orders welcome
                </p>
              </div>
              <div>
                <p className="text-xl mb-4 text-emerald-300">🌐 Online Store</p>
                <p className="leading-relaxed">
                  Browse our complete catalog<br/>
                  Worldwide shipping available<br/>
                  Secure and easy ordering
                </p>
              </div>
            </div>

            <div className="pt-12 border-t border-slate-700">
              <div className="text-3xl md:text-4xl font-light mb-4 bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
                CEKIR
              </div>
              <p className="text-emerald-400 font-medium tracking-wider uppercase text-sm">
                Where Prayer Meets Perfection
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;