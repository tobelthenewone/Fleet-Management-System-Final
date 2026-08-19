import React, { useState } from 'react';
import './NavigationBar.css';

const NavigationBar = ({ user, onLogout }) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });

  // const handlePasswordChange = e => setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  // const handlePasswordSubmit = e => {
  //   e.preventDefault();
  //   // Add password change logic here
  //   setShowChangePassword(false);
  //   setPasswordForm({ current: '', new: '', confirm: '' });
  // };

  return (
    <nav className="navigation-bar">
      <div className="nav-left">
        <img src="/zemen-logo.png" alt="Zemen Bank" className="nav-logo" />
        <span className="bank-name">Zemen Bank</span>
      </div>
      <div className="nav-right">
        <div
          className="user-profile"
          onMouseEnter={() => setShowUserDropdown(true)}
          onMouseLeave={() => setShowUserDropdown(false)}
        >
          <span className="user-icon">👤</span>
          <span className="user-info">{user.name}<br /><span className="user-type">{user.usertype}</span></span>
          {showUserDropdown && (
            <div className="user-dropdown">
              {!showChangePassword ? (
                <>
                  <div className="user-detail"><b>Name:</b> {user.name}</div>
                  <div className="user-detail"><b>Email:</b> {user.email}</div>
                  <div className="user-detail"><b>User Type:</b> {user.usertype}</div>
                  <button className="change-password-btn" onClick={() => setShowChangePassword(true)}>
                    Change Password
                  </button>
                </>
              ) : (
                <form className="change-password-form" onSubmit={handlePasswordSubmit}>
                  <div className="form-group">
                    <label>Current Password</label>
                    <input
                      type="password"
                      name="current"
                      value={passwordForm.current}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      name="new"
                      value={passwordForm.new}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm Password</label>
                    <input
                      type="password"
                      name="confirm"
                      value={passwordForm.confirm}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <div className="form-actions">
                    <button type="button" onClick={() => setShowChangePassword(false)}>Cancel</button>
                    <button type="submit">Save</button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
        <button className="logout-btn" onClick={onLogout} title="Logout">
          🚪
        </button>
      </div>
    </nav>
  );
};

export default NavigationBar; 