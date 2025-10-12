import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../stores/authStore'
import { 
  Calculator, 
  User, 
  Crown, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Home
} from 'lucide-react'

const MobileMenu = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setIsOpen(false)
  }

  const navItems = [
    { path: '/', label: t('nav.home'), icon: Home },
    { path: '/calculator', label: t('nav.calculator'), icon: Calculator },
  ]

  if (isAuthenticated) {
    navItems.push(
      { path: '/profile', label: t('nav.profile'), icon: User },
      { path: '/membership', label: t('nav.membership'), icon: Crown }
    )
  }

  if (isAuthenticated && user?.email === 'admin@speculation-calculator.com') {
    navItems.push({ path: '/admin', label: t('nav.admin'), icon: Settings })
  }

  return (
    <>
      {/* Mobile menu button - only show on mobile */}
      <div className="md:hidden fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setIsOpen(false)}>
          <div className="absolute bottom-20 right-4 w-64 bg-white rounded-lg shadow-xl">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">菜单</h3>
              <div className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        location.pathname === item.path
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
                
                {isAuthenticated && (
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>{t('nav.logout')}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default MobileMenu