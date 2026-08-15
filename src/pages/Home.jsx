// Fix mediaItems image display to show full images and video  { type: 'video', src: 'https://youtube.com/shorts/dbqnn792Y7M?si=2fJyuvvP16e47tFe', alt: 'Sunday Sermon' }, as well put it side by side
// Vidoe commercia to the left and images to the left arranged perfectly



import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import { useInView, useCountUp } from '../hooks/useInView';
import React, { useState, useEffect } from 'react';
import './Home.css';
import { FaComments } from "react-icons/fa";

import APNIcon from '../icons/APN.png';
import apnImage1 from '../assets/images/apnImage1.png';
import apnImage2 from '../assets/images/apnImage2.png';
import apnImage3 from '../assets/images/apnImage3.png';
import apnImage4 from '../assets/images/apnImage4.png';
import apnImage5 from '../assets/images/apnImage5.png';
import apnImage6 from '../assets/images/apnImage6.png';
import apnImage7 from '../assets/images/apnImage7.png';
import apnImage8 from '../assets/images/apnImage8.png';
import apnImage9 from '../assets/images/apnImage9.png';
import apnImage10 from '../assets/images/apnImage10.png';
import apnImage11 from '../assets/images/apnImage11.png';
import apnImage12 from '../assets/images/apnImage12.png';
import apnImage13 from '../assets/images/apnImage13.png';
import apnImage14 from '../assets/images/apnImage14.png';
import apnImage15 from '../assets/images/apnImage15.png';
import apnImage16 from '../assets/images/apnImage16.png';

const ministries = [
{ icon: APNIcon, title: 'Worship Ministry', desc: 'Join us in worship as we lift our hearts to God through praise, prayer, and the teaching of His Word.' },
{ icon: APNIcon, title: 'Youth Ministry', desc: 'A welcoming environment where young people can grow in faith, build friendships, and discover their purpose in Christ.' },
{ icon: APNIcon, title: 'Prayer Ministry', desc: 'Come together with us in prayer as we seek God, encourage one another, and stand together in faith.' },
{ icon: APNIcon, title: 'Community Ministry', desc: 'Serving our community with compassion, kindness, and practical support while sharing the love of Christ.' },
];

const mediaItems = [
{ type: 'image', src: apnImage1, alt: 'Church Event 1' },
{ type: 'image', src: apnImage2, alt: 'Church Event 2' },
{ type: 'image', src: apnImage3, alt: 'Church Event 3' },
{ type: 'image', src: apnImage4, alt: 'Church Event 4' },
{ type: 'image', src: apnImage5, alt: 'Church Event 5' },
{ type: 'image', src: apnImage6, alt: 'Church Event 6' },
{ type: 'image', src: apnImage7, alt: 'Church Event 7' },
{ type: 'image', src: apnImage8, alt: 'Church Event 8' },
{ type: 'image', src: apnImage9, alt: 'Church Event 9' },
{ type: 'image', src: apnImage10, alt: 'Church Event 10' },
{ type: 'image', src: apnImage11, alt: 'Church Event 11' },
{ type: 'image', src: apnImage12, alt: 'Church Event 12' },
{ type: 'image', src: apnImage13, alt: 'Church Event 13' },
{ type: 'image', src: apnImage14, alt: 'Church Event 14' },
{ type: 'image', src: apnImage15, alt: 'Church Event 15' },
{ type: 'image', src: apnImage16, alt: 'Church Event 16' },

{ type: 'video', src: 'https://youtube.com/shorts/dbqnn792Y7M?si=2fJyuvvP16e47tFe', alt: 'Sunday Sermon' },
{ type: 'video', src: 'https://youtube.com/shorts/A7usTs1ds5k?si=VHS4iGRC-DTu_uDN', alt: 'Commanding your week' },
{ type: 'video', src: 'https://youtube.com/shorts/mbcNqd7bJGs?si=tzk_fKJUxql1emtF', alt: 'Community Outreach' },
{ type: 'video', src: 'https://www.youtube.com/watch?v=Z5QRcyom9bw', alt: 'Community Outreach' },
{ type: 'video', src: 'https://www.youtube.com/watch?v=JgWr4jljWXU', alt: 'Community Outreach' },
];

const statsData = [
{ number: '∞', label: 'God’s Grace' },
{ number: '1', label: 'Family In Christ' },
{ number: '1', label: 'Body Of Christ' },
{ number: '24/7', label: 'Prayer & Faith' },
];

function StatItem({ number, label }) {
const [ref, isVisible] = useInView({ threshold: 0.3 });
const count = number === '∞' || number === '24/7' ? number : useCountUp(number, 1800, isVisible);

return (
<div className="stat-item" ref={ref}>
  <span className={`stat-number ${isVisible ? 'visible' : ''}`}>{count}</span>
  <span className="stat-label">{label}</span>
</div>
);
}

export default function Home() {
const [currentIndex, setCurrentIndex] = useState(0);
useEffect(() => {
const images = mediaItems.filter(item => item.type === 'image');
const interval = setInterval(() => {
setCurrentIndex(prevIndex =>
  prevIndex === images.length - 1 ? 0 : prevIndex + 1
);
}, 5000);
return () => clearInterval(interval);
}, []);

const [ministriesRef, ministriesVisible] = useInView({ threshold: 0.1 });
const [welcomeRef, welcomeVisible] = useInView({ threshold: 0.2 });
const [whyTextRef, whyTextVisible] = useInView({ threshold: 0.2 });
const [whyImgRef, whyImgVisible] = useInView({ threshold: 0.2 });

return (
<main className="home">
  {/* HERO */}
  <section className="hero">
    <div className="hero-overlay" />
    <div className="hero-content">
      <p className="section-eyebrow hero-anim-eyebrow">Welcome To Answered Prayer Network</p>
      <h1 className="hero-title hero-anim-title">
        A Place To Worship,
        <br />
        Grow &amp; Belong
      </h1>
      <p className="hero-desc hero-anim-desc">
        We are a community of believers committed to following
        Jesus Christ, growing in faith, serving others, and
        sharing the love of God with our community.
      </p>
      <div className="hero-actions">
        <Link to="/about" className="btn-outline-white hero-anim-btn">Discover Answered Prayer Network</Link>
        <Link to="/contact" className="btn-gold hero-anim-btn">Plan Your Visit</Link>
      </div>
    </div>
  </section>
  {/* ✅ ADVERTS MARQUEE */}
  <section className="adverts">
    <marquee behavior="scroll" direction="left" scrollamount="6">
      ✨ Special Event This Sunday • Youth Fellowship • Community Outreach • Join Us! ✨
    </marquee>
  </section>
{/* ✅ MEDIA SECTION SIDE BY SIDE */}
<section className="media-section">
  <div className="media-columns">
    {/* Left column: videos */}
    <div className="media-column videos">
      {mediaItems.filter(item => item.type === 'video').map((item, index) => (
        <div className="media-item" key={index}>
          <iframe
            width="100%"
            height="315"
            src={item.src
              .replace('watch?v=', 'embed/')
              .replace('shorts/', 'embed/')}
            title={item.alt}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      ))}
    </div>

    {/* Right column: image slider */}
    <div className="media-column images">
      <div className="image-slider">
        <img
          src={mediaItems.filter(item => item.type === 'image')[currentIndex].src}
          alt={mediaItems.filter(item => item.type === 'image')[currentIndex].alt}
        />
      </div>
    </div>
  </div>
</section>

  {/* WELCOME */}
  <section className="welcome">
    <div className={`welcome-inner anim-fade-up ${welcomeVisible ? 'visible' : ''}`} ref={welcomeRef}>
      <p className="section-eyebrow" style={{ textAlign: 'center' }}>Welcome Home</p>
      <h2 className="section-title" style={{ textAlign: 'center' }}>You Belong Here</h2>
      <span className="gold-rule centered" />
      <p className="welcome-desc">
        Whether you are discovering faith for the first time,
        returning to Answered Prayer Network, or looking for a church family,
        you are welcome here. We gather to worship God, study
        His Word, pray together, build meaningful relationships,
        and serve our community with love.
      </p>
    </div>

    {/* Ministries */}
    <div className="services-grid" ref={ministriesRef}>
      {ministries.map((ministry, index) => (
        <div
          className={`service-card anim-fade-up delay-${index + 1} ${ministriesVisible ? 'visible' : ''}`}
          key={ministry.title}
        >
          <img src={ministry.icon} alt={`${ministry.title} icon`} className="service-icon" />
          <h3 className="service-title">{ministry.title}</h3>
          <p className="service-desc">{ministry.desc}</p>
        </div>
      ))}
    </div>

    <div className="welcome-cta">
      <Link to="/services" className="btn-gold">Explore Our Ministries</Link>
    </div>
  </section>

  {/* WHY / OUR MISSION */}
  <section className="why-us">
    <div className="why-inner">
      <div className={`why-text anim-slide-left ${whyTextVisible ? 'visible' : ''}`} ref={whyTextRef}>
        <p className="section-eyebrow">Our Mission</p>
        <h2 className="section-title" style={{ color: 'var(--white)' }}>
          Growing Together
          <br />
          In Faith &amp; Love
        </h2>
        <span className="gold-rule" />
        <p className="why-desc">
          Our desire is to create a Christ-centered community
          where people can encounter God, grow spiritually,
          discover their gifts, build lasting relationships,
          and make a positive difference in the lives of
          others.
        </p>
        <Link to="/about" className="btn-outline-gold" style={{ marginTop: 32, display: 'inline-block' }}>
          Learn More About Answered Prayer Network
        </Link>
      </div>

      <div className={`why-image anim-slide-right ${whyImgVisible ? 'visible' : ''}`} ref={whyImgRef}>
        <img
          src="https://images.unsplash.com/photo-1507692049790-de58290a4334?w=1000&q=85"
          alt="People worshipping together in church"
        />
        <div className="why-badge">
          <span className="badge-cross">✝</span>
          <span className="badge-label">Faith<br />Hope<br />Love</span>
        </div>
      </div>
    </div>
  </section>

  {/* STATS */}
  <section className="stats">
    {statsData.map((stat) => (
      <StatItem key={stat.label} number={stat.number} label={stat.label} />
    ))}
  </section>

  {/* CTA */}
  <section className="home-cta">
    <div className="home-cta-inner">
      <p className="section-eyebrow">You Are Welcome</p>
      <h2 className="home-cta-title">Come Worship With Answered Prayer Network</h2>
      <p className="home-cta-desc">
        We would love to welcome you and your family.
        Come as you are and experience a community
        built around Christ at Answered Prayer Network.
      </p>
      <div className="home-cta-buttons">
        <Link to="/contact" className="btn-gold">Plan Your Visit</Link>
        <Link to="/services" className="btn-outline-gold">Explore Ministries</Link>
      </div>
    </div>
  </section>

  <Footer />

{/* <Link to="/chatbot" className="chatbot-icon" aria-label="Answered Prayer Network Chatbot"
>💬 Chat With Us 
</Link> */}

<Link
  to="/chatbot"
  className="chatbot-icon"
  aria-label="Answered Prayer Network Chatbot"
>
  <FaComments className="chatbot-icon-symbol" />
  <span>Chat With Us</span>
</Link>
</main>
);
}