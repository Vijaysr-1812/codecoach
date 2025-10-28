'use client';
import { Outlet } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Particles from '@/components/Particles';

import { AuthProvider } from '@/context/AuthProvider';

export default function Layout() {
  return (
      <div className="min-h-screen flex flex-col">
        <Particles />
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
  );
}