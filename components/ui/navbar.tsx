"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { UserCircle, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useWorldAuth } from "@/hooks/use-world-auth";

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useWorldAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getInitials = (user: any) => {
    const fallback = "U";
    const source = user?.name || user?.email || "";
    if (!source) return fallback;

    const words = source.split(/\s+/);
    if (words.length >= 2) {
      return words[0][0].toUpperCase() + words[1][0].toUpperCase();
    }
    return source[0].toUpperCase();
  };

  const initials = getInitials(user);

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/assets/datagraph.png"
                alt="DataGraph"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="text-xl font-bold text-gray-900">DataGraph</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
              Dashboard
            </Link>
            <Link href="/textvibe" className="text-gray-600 hover:text-gray-900 transition-colors">
              Chat
            </Link>
            <Link href="/points" className="text-gray-600 hover:text-gray-900 transition-colors">
              Vibe Points
            </Link>
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-2 transition-colors"
                >
                  {user?.image ? (
                    <Image
                      src={user.image}
                      alt={user.name || "User"}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                      {initials}
                    </div>
                  )}
                  <span className="text-sm text-gray-700">{user?.name || user?.email}</span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200">
                    <div className="py-1">
                      <button
                        onClick={async () => {
                          setDropdownOpen(false);
                          logout();
                          router.push("/");
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => router.push('/onboarding')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 hover:text-gray-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              href="/dashboard"
              className="block px-3 py-2 text-gray-600 hover:text-gray-900"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/textvibe"
              className="block px-3 py-2 text-gray-600 hover:text-gray-900"
              onClick={() => setMobileMenuOpen(false)}
            >
              Chat
            </Link>
            <Link
              href="/points"
              className="block px-3 py-2 text-gray-600 hover:text-gray-900"
              onClick={() => setMobileMenuOpen(false)}
            >
              Vibe Points
            </Link>
            
            {user ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                  router.push("/");
                }}
                className="block w-full text-left px-3 py-2 text-red-600 hover:bg-red-50"
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  router.push('/onboarding');
                }}
                className="block w-full text-left px-3 py-2 text-blue-600 hover:bg-blue-50"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
