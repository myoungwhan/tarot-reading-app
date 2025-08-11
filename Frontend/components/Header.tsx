
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    navigate('/');
  };
  
  const onClickChangePassword = () => {
    navigate('/admin/change-password');
  }

  const onClickHeading = () => {
    navigate('/admin');
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between flex-col justify-center md:flex-row">
          <div className="flex items-center space-x-4">
         
            <h1 onClick={onClickHeading} className="text-2xl font-bold text-gray-900 cursor-pointer text-center md:text-normal">Tarot Card Management</h1>
          </div>
          <div className="flex items-center space-x-4 pt-3">
            
            <button
              className="!rounded-button whitespace-nowrap px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300 transition-colors"
              onClick={onClickChangePassword}
            >
              Change Password
            </button>
            <button
              className="!rounded-button whitespace-nowrap px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300 transition-colors"
              onClick={handleLogout}
            >
              Logout
            </button>
           
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
