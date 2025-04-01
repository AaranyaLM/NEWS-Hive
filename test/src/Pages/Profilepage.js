import React, { useState } from 'react';
import Navbar from '../Components/Navbar';
import Profile from '../Components/Profile';
import Footer from '../Components/Footer';

const Profilepage = () => {
  return (
    <>
      <Navbar></Navbar>
      <Profile></Profile>
      <Footer></Footer>
    </>
  );
};

export default Profilepage;