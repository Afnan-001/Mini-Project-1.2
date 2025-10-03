'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Menu, X, MapPin, User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function LandingHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, firebaseUser, logout, loading } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-green-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <div className="bg-green-500 rounded-lg p-2 mr-3">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-green-600">TurfBook</h1>
              <p className="text-xs text-gray-500">Sangli & Miraj</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-green-600 transition-colors">
              Home
            </Link>
            <Link href="/browse" className="text-gray-700 hover:text-green-600 transition-colors">
              Browse Turfs
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-green-600 transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-green-600 transition-colors">
              Contact
            </Link>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            {firebaseUser && user ? (
              // User is logged in
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user.name}
                  </p>
                  <div className="flex items-center justify-end space-x-2">
                    <Badge 
                      variant="secondary" 
                      className={user.role === 'owner' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}
                    >
                      {user.role === 'owner' ? 'Owner' : 'Customer'}
                    </Badge>
                  </div>
                </div>
                
                {user.role === 'owner' && (
                  <Link href="/dashboard/turf-owner">
                    <Button variant="outline" size="sm">
                      <User className="h-4 w-4 mr-1" />
                      Dashboard
                    </Button>
                  </Link>
                )}
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleLogout}
                  disabled={loading}
                  className="text-gray-600 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </div>
            ) : (
              // User is not logged in
              <>
                <Link href="/auth/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm" className="bg-green-500 hover:bg-green-600">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              <Link href="/" className="text-gray-700 hover:text-green-600 transition-colors">
                Home
              </Link>
              <Link href="/browse" className="text-gray-700 hover:text-green-600 transition-colors">
                Browse Turfs
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-green-600 transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-green-600 transition-colors">
                Contact
              </Link>
              
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                {firebaseUser && user ? (
                  // Mobile: User is logged in
                  <>
                    <div className="text-center py-2">
                      <p className="text-sm font-medium text-gray-900">
                        {user.name}
                      </p>
                      <Badge 
                        variant="secondary" 
                        className={user.role === 'owner' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}
                      >
                        {user.role === 'owner' ? 'Owner' : 'Customer'}
                      </Badge>
                    </div>
                    
                    {user.role === 'owner' && (
                      <Link href="/dashboard/turf-owner">
                        <Button variant="outline" size="sm" className="w-full">
                          <User className="h-4 w-4 mr-1" />
                          Dashboard
                        </Button>
                      </Link>
                    )}
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-red-600"
                      onClick={handleLogout}
                      disabled={loading}
                    >
                      <LogOut className="h-4 w-4 mr-1" />
                      Logout
                    </Button>
                  </>
                ) : (
                  // Mobile: User is not logged in
                  <>
                    <Link href="/auth/login">
                      <Button variant="outline" size="sm" className="w-full">
                        Login
                      </Button>
                    </Link>
                    <Link href="/auth/register">
                      <Button size="sm" className="w-full bg-green-500 hover:bg-green-600">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}