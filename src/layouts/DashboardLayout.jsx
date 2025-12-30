import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import BottomNav from '../components/layout/BottomNav';

const DashboardLayout = () => {
    return (
        <div className="app-layout">
            {/* Sidebar - visible on desktop only via CSS */}
            <Sidebar />

            {/* Main Content */}
            <main className="main-content">
                <Header />
                <div className="page-content">
                    <Outlet />
                </div>
            </main>

            {/* Bottom Nav - visible on mobile only via CSS */}
            <BottomNav />
        </div>
    );
};

export default DashboardLayout;
