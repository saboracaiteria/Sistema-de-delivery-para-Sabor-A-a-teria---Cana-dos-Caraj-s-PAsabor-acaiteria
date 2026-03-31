import React from 'react';
import { MapPin } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export const Footer: React.FC = () => {
  const { settings } = useApp();

  return (
    <footer className="relative overflow-hidden mt-12">
      {/* Gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #1a0533 0%, #2d0d5a 50%, #1a0533 100%)'
        }}
      />
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-5" style={{ background: 'var(--color-header-bg)', transform: 'translate(30%, -30%)' }} />
      <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-5" style={{ background: 'var(--color-button-primary)', transform: 'translate(-30%, 30%)' }} />

      <div className="relative z-10 text-white py-8 px-4">
        <div className="max-w-md mx-auto">
          {/* Store icon + name */}
          <div className="text-center mb-5 flex flex-col items-center">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-3">
              <span className="text-2xl">🏪</span>
            </div>
            <p className="font-heading font-bold text-lg text-purple-200">
              {settings.storeName || 'Nossa Loja'}
            </p>
          </div>

          {/* Instagram Link */}
          {settings.instagramUrl && (
            <div className="flex justify-center mb-5">
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white px-7 py-3 rounded-full font-semibold text-sm hover:opacity-90 active:scale-95 transition-all shadow-lg btn-press"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                Siga no Instagram
              </a>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-white/10 my-4" />

          {/* Location & Copyright */}
          <div className="text-center space-y-1">
            {settings.businessAddress && (
              <p className="text-purple-300 text-sm flex items-center justify-center gap-1.5 mb-2">
                <MapPin size={13} />
                {settings.businessAddress}
              </p>
            )}
            <p className="text-purple-400/70 text-xs">
              {settings.copyrightText || `© ${new Date().getFullYear()} ${settings.storeName || 'Nossa Loja'}`}
            </p>
          </div>

          {/* Developer Credit */}
          <div className="text-center mt-4">
            <p className="text-xs text-white/30">
              Desenvolvido com 💜 por{' '}
              <a
                href="https://www.instagram.com/_nildoxz/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-300 font-semibold hover:text-white transition-colors"
              >
                @_nildoxz
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
