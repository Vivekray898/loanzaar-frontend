'use client'

import React, { useState } from 'react';
import { 
  BarChart3, 
  FileText, 
  Shield, 
  MessageSquare, 
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Database
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useRouter } from 'next/navigation';

function AdminSidebar({ activeSection, onSectionChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState(null);
  const { logout } = useAdminAuth();
  const router = useRouter();

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: BarChart3, submenu: null },
    { id: 'loans', label: 'Loan Applications', icon: FileText, submenu: null },
    { id: 'insurance', label: 'Insurance Applications', icon: Shield, submenu: null },
    { id: 'collections', label: 'Collections Manager', icon: Database, submenu: null },
    { id: 'support', label: 'Support Center', icon: MessageSquare, submenu: null },
    { id: 'settings', label: 'Settings', icon: Settings, submenu: null },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  const toggleMenu = (id) => {
    setExpandedMenu(expandedMenu === id ? null : id);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-20 right-4 z-40 p-2 bg-rose-600 text-white rounded-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:sticky top-20 left-0 h-[calc(100vh-80px)] w-64 bg-slate-900 text-white transition-transform duration-300 z-30 md:z-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Sidebar Content */}
        <div className="flex flex-col h-full">
          {/* Logo/Title */}
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-600 rounded-lg flex items-center justify-center">
                <BarChart3 size={20} />
              </div>
              <div>
                <p className="font-bold text-lg">Admin Panel</p>
                <p className="text-xs text-slate-400">LoanZaar</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <div key={item.id}>
                  <button
                    onClick={() => {
                      onSectionChange(item.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-rose-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="flex-1 text-left font-medium">{item.label}</span>
                    {item.submenu && (
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${
                          expandedMenu === item.id ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </button>

                  {/* Submenu */}
                  {item.submenu && expandedMenu === item.id && (
                    <div className="pl-8 space-y-1 mt-1">
                      {item.submenu.map((subitem) => (
                        <button
                          key={subitem.id}
                          onClick={() => {
                            onSectionChange(subitem.id);
                            setIsOpen(false);
                          }}
                          className={`w-full flex items-center gap-2 px-4 py-2 rounded text-sm transition-colors ${
                            activeSection === subitem.id
                              ? 'bg-rose-600/30 text-rose-300'
                              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                          }`}
                        >
                          {subitem.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Footer - Logout Button */}
          <div className="p-4 border-t border-slate-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-red-600/10 hover:text-red-400 transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminSidebar;
