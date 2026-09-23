'use client';

import { useState, useContext } from 'react';
import Link from 'next/link';
import { AuthContext } from '../../context/AuthContext';

export default function Login() {
  const { login, register } = useContext(AuthContext);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [role, setRole] = useState('customer'); // 'customer' or 'pharmacy_owner'
  
  // Base User State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Pharmacy Details State
  const [pharmacyName, setPharmacyName] = useState('');
  const [pharmacyPhone, setPharmacyPhone] = useState('');
  const [address, setAddress] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [openingTime, setOpeningTime] = useState('09:00');
  const [closingTime, setClosingTime] = useState('21:00');
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        alert('Location acquired successfully!');
      }, (err) => {
        alert('Could not get location. Please allow location permissions.');
      });
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // --- ADMIN MOCK LOGIN INTERCEPT ---
    if (isLoginMode && role === 'admin') {
      if (email === 'admin@savix.ai' && password === 'godmode') {
        window.location.href = '/admin/login'; // Redirect to the actual admin login page so it handles the strict session
        return;
      } else {
        setError('Invalid admin credentials. (Hint: admin@savix.ai / godmode)');
        setLoading(false);
        return;
      }
    }

    let result;
    if (isLoginMode) {
      result = await login(email, password, role);
    } else {
      let finalName = name;
      let finalPhone = phone;

        if (role === 'pharmacy_owner') {
          if (!pharmacyName || !pharmacyPhone || !address || !licenseNumber) {
            alert(`Error: Missing Pharmacy Field! PharmName: '${pharmacyName}', PharmPhone: '${pharmacyPhone}', Addr: '${address}', License: '${licenseNumber}'`);
            setLoading(false);
            return;
          }
          // Fallback if top fields were skipped/hidden
          if (!finalName) finalName = pharmacyName + " Owner";
          if (!finalPhone) finalPhone = pharmacyPhone;
        }

        if (!finalName || !finalPhone || !email || !password || !confirmPassword) {
          alert(`Error: Missing Field! Name: '${finalName}', Phone: '${finalPhone}', Email: '${email}', Pass: '${password ? 'yes' : 'no'}', Confirm: '${confirmPassword ? 'yes' : 'no'}'`);
          setLoading(false);
          return;
        }
        
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        
        result = await register({
          name: finalName, phone: finalPhone, email, password, role,
          ...(role === 'pharmacy_owner' ? { pharmacyName, pharmacyPhone, address, licenseNumber, openingTime, closingTime, lat, lng } : {})
        });
    }
    
    if (!result.success) {
      setError(result.message || 'Authentication failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      
      {/* LEFT PANEL - Hidden on mobile */}
      <div className="hidden md:flex md:w-1/2 bg-[#1a2b6b] text-white flex-col justify-center px-12 lg:px-20 relative overflow-hidden">
        <div className="relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-[#1a2b6b] font-black text-3xl mb-8 shadow-xl shadow-blue-900/50">
            S
          </div>
          <h1 className="text-4xl lg:text-5xl font-black mb-6 leading-tight">
            The Future of <br/>Local Pharmacy.
          </h1>
          <p className="text-blue-100 text-lg mb-10 max-w-md">
            Join SAVIX-AI to instantly search local medicines or digitize your pharmacy's inventory.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                <span className="text-xl">📍</span>
              </div>
              <div>
                <h3 className="font-bold text-lg">Hyper-local Search</h3>
                <p className="text-blue-200 text-sm">Find medicines available within minutes.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                <span className="text-xl">🏪</span>
              </div>
              <div>
                <h3 className="font-bold text-lg">Business Copilot</h3>
                <p className="text-blue-200 text-sm">AI-driven insights for pharmacy owners.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>
      </div>

      {/* RIGHT PANEL - Login Form */}
      <div className="w-full md:w-1/2 bg-white flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12 h-screen overflow-y-auto">
        <div className="max-w-md w-full mx-auto">
          
          <div className="md:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-[#1a2b6b] flex items-center justify-center text-white font-black text-xl">S</div>
            <h1 className="text-2xl font-black text-[#1a2b6b]">SAVIX</h1>
          </div>

          <h2 className="text-3xl font-black text-[#1a2b6b] mb-2">
            {isLoginMode ? 'Welcome back' : 'Create an account'}
          </h2>
          <p className="text-slate-500 mb-8">
            {isLoginMode ? 'Enter your details to access your dashboard.' : 'Join the network today.'}
          </p>

          <div className="flex p-1 bg-slate-100 rounded-xl mb-8 shrink-0">
            <button 
              type="button"
              onClick={() => setRole('customer')}
              className={`flex-1 py-2 text-xs md:text-sm font-bold rounded-xl transition-all ${role === 'customer' ? 'bg-[#1a2b6b] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Customer
            </button>
            <button 
              type="button"
              onClick={() => setRole('pharmacy_owner')}
              className={`flex-1 py-2 text-xs md:text-sm font-bold rounded-xl transition-all ${role === 'pharmacy_owner' ? 'bg-[#1a2b6b] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Pharmacy
            </button>
            <button 
              type="button"
              onClick={() => setRole('admin')}
              className={`flex-1 py-2 text-xs md:text-sm font-bold rounded-xl transition-all ${role === 'admin' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Admin
            </button>
          </div>

          
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm font-medium border border-red-200">
                {error}
              </div>
            )}
            
            {/* 1. LOGIN MODE */}
            {isLoginMode && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1a2b6b] focus:border-[#1a2b6b]" placeholder="you@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1a2b6b] focus:border-[#1a2b6b]" placeholder="••••••••" />
                </div>
              </>
            )}

            {/* 2. SIGNUP MODE (CUSTOMER) */}
            {!isLoginMode && role === 'customer' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1a2b6b] focus:border-[#1a2b6b]" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1a2b6b] focus:border-[#1a2b6b]" placeholder="+91 9876543210" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1a2b6b] focus:border-[#1a2b6b]" placeholder="you@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1a2b6b] focus:border-[#1a2b6b]" placeholder="••••••••" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1a2b6b] focus:border-[#1a2b6b]" placeholder="••••••••" />
                </div>
              </>
            )}

            {/* 3. SIGNUP MODE (PHARMACY OWNER) */}
            {!isLoginMode && role === 'pharmacy_owner' && (
              <>
                <h3 className="font-bold text-[#1a2b6b] text-lg border-b border-slate-100 pb-2">1. Personal Details</h3>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Owner Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1a2b6b] focus:border-[#1a2b6b]" placeholder="Your full name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Owner Phone Number</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1a2b6b] focus:border-[#1a2b6b]" placeholder="Your mobile number" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Login Email Address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1a2b6b] focus:border-[#1a2b6b]" placeholder="you@example.com" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1a2b6b] focus:border-[#1a2b6b]" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1a2b6b] focus:border-[#1a2b6b]" placeholder="••••••••" />
                  </div>
                </div>

                <h3 className="font-bold text-[#1a2b6b] text-lg border-b border-slate-100 pb-2 mt-6">2. Pharmacy Details</h3>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Pharmacy Name</label>
                  <input type="text" value={pharmacyName} onChange={(e) => setPharmacyName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1a2b6b] focus:border-[#1a2b6b]" placeholder="City Care Pharmacy" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Pharmacy Phone</label>
                  <input type="tel" value={pharmacyPhone} onChange={(e) => setPharmacyPhone(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1a2b6b] focus:border-[#1a2b6b]" placeholder="Shop contact number" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Pharmacy Address</label>
                  <textarea value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1a2b6b] focus:border-[#1a2b6b]" placeholder="Complete address"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Pharmacy Location</label>
                  <button type="button" onClick={handleGetLocation} className="w-full bg-blue-50 hover:bg-blue-100 border-2 border-[#1a2b6b] text-[#1a2b6b] font-bold py-3 rounded-xl transition-colors text-sm">
                    Use My Current Location
                  </button>
                  {lat && <p className="text-xs text-emerald-600 mt-2 font-bold flex items-center gap-1">Location acquired: {lat.toFixed(4)}, {lng.toFixed(4)}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">License Number</label>
                  <input type="text" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1a2b6b] focus:border-[#1a2b6b]" placeholder="LIC-XXXXX" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Opening Time</label>
                    <input type="time" value={openingTime} onChange={(e) => setOpeningTime(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1a2b6b] focus:border-[#1a2b6b]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Closing Time</label>
                    <input type="time" value={closingTime} onChange={(e) => setClosingTime(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1a2b6b] focus:border-[#1a2b6b]" />
                  </div>
                </div>
              </>
            )}

            <button type="submit" onClick={handleSubmit} disabled={loading} className="w-full bg-[#1a2b6b] text-white font-bold py-3.5 rounded-xl shadow-md hover:bg-[#0D1BD6] transition-colors mt-6 disabled:opacity-70">
              {loading ? 'Processing...' : (isLoginMode ? 'Sign In' : 'Sign Up')}
            </button>
          </form>


          <div className="mt-8 text-center text-sm text-slate-500">
            {isLoginMode ? (
              <>Don't have an account? <button type="button" onClick={() => setIsLoginMode(false)} className="font-bold text-[#4A7BFF] hover:underline">Sign up for free</button></>
            ) : (
              <>Already have an account? <button type="button" onClick={() => setIsLoginMode(true)} className="font-bold text-[#4A7BFF] hover:underline">Sign in</button></>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
