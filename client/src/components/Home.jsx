import React from 'react';
import Header from './header';
import NavIcons from './NavIcons';
import bgGif from '../assets/source.gif'; // ✅ Replace with your actual gif filename

const Home = () => (
  <div style={{
    height: '100vh',
    width: '100vw',
    position: 'relative',
    overflow: 'hidden'
  }}>
    {/* Background GIF with dark overlay */}
    <div style={{
      backgroundImage: `url(${bgGif})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      filter: 'brightness(0.4)', // ✅ Fade effect
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 0
    }} />

    {/* Foreground Content */}
    <div style={{
      position: 'relative',
      zIndex: 1,
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      color: 'white'
    }}>
      <Header />
      <NavIcons />
    </div>
  </div>
);

export default Home;
