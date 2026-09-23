"use client";

import React, { useState } from 'react';

export default function SuperAdminDashboard() {
  const [pendingPharmacies, setPendingPharmacies] = useState([
    { id: 1, name: "City Medicos", location: "Civil Lines", license: "DL-12345" },
    { id: 2, name: "Gupta Pharma", location: "Kydganj", license: "DL-67890" },
    { id: 3, name: "Apollo Naini", location: "Naini", license: "DL-11223" },
  ]);
  const [toastMessage, setToastMessage] = useState("");

  const handleApprove = (id, name) => {
    setPendingPharmacies((prev) => prev.filter((p) => p.id !== id));
    showToast(`Pharmacy Approved & Live on Network!`);
  };

  const handleReject = (id, name) => {
    setPendingPharmacies((prev) => prev.filter((p) => p.id !== id));
    showToast(`${name} Rejected.`);
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  return (
    <div className="flex min-h-screen font-sans text-slate-800 bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-indigo-400">SAVIX</h2>
          <p className="text-xs text-slate-400 mt-1">Super-Admin</p>
        </div>
        <nav className="mt-6 flex-1">
          <a href="#" className="block py-3 px-6 bg-slate-800 text-indigo-300 border-l-4 border-indigo-500">Dashboard</a>
          <a href="#" className="block py-3 px-6 hover:bg-slate-800 hover:text-indigo-300 transition-colors">Pharmacies</a>
          <a href="#" className="block py-3 px-6 hover:bg-slate-800 hover:text-indigo-300 transition-colors">Patients</a>
          <a href="#" className="block py-3 px-6 hover:bg-slate-800 hover:text-indigo-300 transition-colors">Settings</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">SAVIX God Mode - Platform Command Center</h1>
            <p className="text-slate-500 mt-2">Manage platform health, approve vendors, and monitor GMV.</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="bg-indigo-100 text-indigo-800 text-sm font-semibold px-4 py-2 rounded-full shadow-sm">Admin: Root</span>
          </div>
        </header>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-slate-500 text-sm font-medium">Total Pharmacies</h3>
            <p className="text-3xl font-bold text-slate-800 mt-2">42</p>
            <p className="text-xs text-slate-400 mt-1">18 Active, 24 Pending</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-slate-500 text-sm font-medium">Total Patients</h3>
            <p className="text-3xl font-bold text-slate-800 mt-2">1,204</p>
            <p className="text-xs text-emerald-500 mt-1">↑ 12% from last week</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-slate-500 text-sm font-medium">Platform GMV (30d)</h3>
            <p className="text-3xl font-bold text-slate-800 mt-2">₹4,52,000</p>
            <p className="text-xs text-emerald-500 mt-1">↑ 8% from last month</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-slate-500 text-sm font-medium">SAVIX Commission (2%)</h3>
            <p className="text-3xl font-bold text-indigo-600 mt-2">₹9,040</p>
            <p className="text-xs text-slate-400 mt-1">Pending payout: ₹2,100</p>
          </div>
        </div>

        {/* Verification Queue */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Verification Queue</h2>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Pharmacy Name</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">License Number</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {pendingPharmacies.length > 0 ? (
                  pendingPharmacies.map((pharmacy) => (
                    <tr key={pharmacy.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">{pharmacy.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-500">{pharmacy.location}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-500">{pharmacy.license}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleApprove(pharmacy.id, pharmacy.name)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg mr-3 shadow-sm transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(pharmacy.id, pharmacy.name)}
                          className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg shadow-sm transition-colors"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 whitespace-nowrap text-center text-slate-500">
                      All pharmacies have been verified! 🎉
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Live Demand Heatmap (Mock) */}
        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-4">City Demand Insights</h2>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="mb-6">
              <p className="text-sm font-semibold text-rose-700 bg-rose-50 inline-flex items-center px-4 py-2 rounded-lg border border-rose-200">
                <span className="mr-2 text-lg">🔥</span> Top Underserved Area: Prayagraj Civil Lines - 450 failed searches
              </p>
            </div>
            
            {/* Mock Heatmap Grid */}
            <div className="grid grid-cols-5 gap-3 h-48">
              <div className="bg-rose-500 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-inner transition-transform hover:scale-105">Civil Lines</div>
              <div className="bg-orange-400 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-inner transition-transform hover:scale-105">Kydganj</div>
              <div className="bg-amber-300 rounded-lg flex items-center justify-center text-slate-800 text-xs font-bold shadow-inner transition-transform hover:scale-105">Naini</div>
              <div className="bg-emerald-300 rounded-lg flex items-center justify-center text-slate-800 text-xs font-bold shadow-inner transition-transform hover:scale-105">Jhunsi</div>
              <div className="bg-rose-400 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-inner transition-transform hover:scale-105">Katra</div>
              
              <div className="bg-amber-200 rounded-lg transition-transform hover:scale-105"></div>
              <div className="bg-rose-300 rounded-lg transition-transform hover:scale-105"></div>
              <div className="bg-emerald-200 rounded-lg transition-transform hover:scale-105"></div>
              <div className="bg-emerald-400 rounded-lg transition-transform hover:scale-105"></div>
              <div className="bg-amber-400 rounded-lg transition-transform hover:scale-105"></div>
              
              <div className="bg-emerald-100 rounded-lg transition-transform hover:scale-105"></div>
              <div className="bg-amber-100 rounded-lg transition-transform hover:scale-105"></div>
              <div className="bg-rose-200 rounded-lg transition-transform hover:scale-105"></div>
              <div className="bg-emerald-100 rounded-lg transition-transform hover:scale-105"></div>
              <div className="bg-amber-200 rounded-lg transition-transform hover:scale-105"></div>
            </div>
            
            {/* Legend */}
            <div className="mt-6 flex items-center text-sm text-slate-600 space-x-6">
              <div className="flex items-center"><span className="w-4 h-4 bg-emerald-300 inline-block rounded mr-2 shadow-sm"></span> Low Demand</div>
              <div className="flex items-center"><span className="w-4 h-4 bg-amber-300 inline-block rounded mr-2 shadow-sm"></span> Medium</div>
              <div className="flex items-center"><span className="w-4 h-4 bg-rose-500 inline-block rounded mr-2 shadow-sm"></span> High Demand (Critical)</div>
            </div>
          </div>
        </section>

      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-6 py-4 rounded-xl shadow-2xl border border-slate-700 flex items-center space-x-3 z-50">
          <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
