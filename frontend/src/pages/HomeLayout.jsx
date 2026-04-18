import React, { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const HomeLayout = () => {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <>
      {!isLanding && <Navbar />}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Outlet />
      </div>
      {!isLanding && <Footer />}
    </>
  )
}

export default HomeLayout