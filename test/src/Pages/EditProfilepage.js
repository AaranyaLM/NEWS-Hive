import React, { useState } from 'react';
import Navbar from '../Components/Navbar';
import EditProfile from '../Components/EditProfile'
import Footer from '../Components/Footer';


const EditProfilepage = () => {
  return (
    <>
      <Navbar></Navbar>
      <EditProfile></EditProfile>
      <Footer></Footer>
    </>
  );
};

export default EditProfilepage;