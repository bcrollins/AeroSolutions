import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BreadcrumbNav from '@/components/BreadcrumbNav';
import { BreadcrumbItem } from '@/hooks/useBreadcrumbs';

interface MainLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  hideBreadcrumbs?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  breadcrumbs,
  hideBreadcrumbs = false
}) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {!hideBreadcrumbs && (
        <div className="container mx-auto px-4 py-3">
          <BreadcrumbNav items={breadcrumbs} />
        </div>
      )}
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;