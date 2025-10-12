import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../stores/authStore'
import { useThemeStore } from '../stores/themeStore'
import { useLanguageStore } from '../stores/languageStore'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { 
  User, 
  Settings, 
  Shield, 
  Trash2, 
  Save,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react'

interface ProfileFormData {
  username: string
  email: string
}

interface PasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const ProfilePage = () => {
  const { t } = useTranslation()
  const { user, updateProfile, changePassword, isLoading } = useAuthStore()
  const { theme, setTheme } = useThemeStore()
  const { language, setLanguage } = useLanguageStore()
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'preferences'>('profile')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors }
  } = useForm<ProfileFormData>({
    defaultValues: {
      username: user?.username || '',
      email: user?.email || ''
    }
  })

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    watch,
    formState: { errors: passwordErrors }
  } = useForm<PasswordFormData>()

  const newPassword = watch('newPassword')

  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      setErrors({})
      await updateProfile(data)
      toast.success('个人资料更新成功')
    } catch (error: any) {
      setErrors({ profile: error.message })
    }
  }

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      setErrors({})
      
      if (data.newPassword !== data.confirmPassword) {
        setErrors({ confirmPassword: t('errors.passwordsDoNotMatch') })
        return
      }

      await changePassword(data.currentPassword, data.newPassword)
      toast.success('密码修改成功')
    } catch (error: any) {
      setErrors({ password: error.message })
    }
  }

  const handleDeleteAccount = () => {
    if (window.confirm(t('profile.confirmDelete'))) {
      // Implement account deletion
      toast.error('账户删除功能暂未实现')
    }
  }

  const tabs = [
    { id: 'profile', label: t('profile.personalInfo'), icon: User },
    { id: 'preferences', label: t('profile.preferences'), icon: Settings },
    { id: 'password', label: t('profile.changePassword'), icon: Shield }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user?.username}</h1>
              <p className="text-gray-500">{user?.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user?.membership.type === 'free' ? 'bg-gray-100 text-gray-800' :
                  user?.membership.type === 'premium' ? 'bg-blue-100 text-blue-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {user?.membership.type === 'free' && t('membership.free')}
                  {user?.membership.type === 'premium' && t('membership.premium')}
                  {user?.membership.type === 'vip' && t('membership.vip')}
                </span>
                {user?.isEmailVerified ? (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    已验证
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    未验证
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    {t('profile.personalInfo')}
                  </h2>

                  {errors.profile && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <span className="text-red-700">{errors.profile}</span>
                    </div>
                  )}

                  <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('auth.username')}
                      </label>
                      <input
                        {...registerProfile('username', {
                          required: t('validation.required'),
                          minLength: {
                            value: 2,
                            message: t('validation.minLength', { min: 2 })
                          },
                          maxLength: {
                            value: 50,
                            message: t('validation.maxLength', { max: 50 })
                          }
                        })}
                        type="text"
                        className={`input w-full ${profileErrors.username ? 'border-red-500' : ''}`}
                      />
                      {profileErrors.username && (
                        <p className="mt-1 text-sm text-red-600">{profileErrors.username.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('auth.email')}
                      </label>
                      <input
                        {...registerProfile('email', {
                          required: t('validation.required'),
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: t('validation.email')
                          }
                        })}
                        type="email"
                        disabled
                        className="input w-full bg-gray-100 cursor-not-allowed"
                      />
                      <p className="mt-1 text-sm text-gray-500">邮箱地址不可修改</p>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="btn btn-primary"
                      >
                        {isLoading ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>{t('common.loading')}</span>
                          </div>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            {t('profile.updateProfile')}
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    {t('profile.preferences')}
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        {t('profile.language')}
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: 'zh', label: '中文' },
                          { value: 'ko', label: '한국어' },
                          { value: 'en', label: 'English' }
                        ].map((lang) => (
                          <button
                            key={lang.value}
                            onClick={() => setLanguage(lang.value as any)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                              language === lang.value
                                ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                            }`}
                          >
                            {lang.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        {t('profile.theme')}
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: 'classic', label: t('profile.classic') },
                          { value: 'modern', label: t('profile.modern') },
                          { value: 'dark', label: t('profile.dark') }
                        ].map((themeOption) => (
                          <button
                            key={themeOption.value}
                            onClick={() => setTheme(themeOption.value as any)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                              theme === themeOption.value
                                ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                            }`}
                          >
                            {themeOption.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Password Tab */}
              {activeTab === 'password' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    {t('profile.changePassword')}
                  </h2>

                  {errors.password && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <span className="text-red-700">{errors.password}</span>
                    </div>
                  )}

                  <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('profile.currentPassword')}
                      </label>
                      <div className="relative">
                        <input
                          {...registerPassword('currentPassword', {
                            required: t('validation.required')
                          })}
                          type={showCurrentPassword ? 'text' : 'password'}
                          className={`input w-full pr-10 ${passwordErrors.currentPassword ? 'border-red-500' : ''}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.currentPassword && (
                        <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('profile.newPassword')}
                      </label>
                      <div className="relative">
                        <input
                          {...registerPassword('newPassword', {
                            required: t('validation.required'),
                            minLength: {
                              value: 6,
                              message: t('validation.minLength', { min: 6 })
                            }
                          })}
                          type={showNewPassword ? 'text' : 'password'}
                          className={`input w-full pr-10 ${passwordErrors.newPassword ? 'border-red-500' : ''}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          {showNewPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.newPassword && (
                        <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('profile.confirmNewPassword')}
                      </label>
                      <div className="relative">
                        <input
                          {...registerPassword('confirmPassword', {
                            required: t('validation.required')
                          })}
                          type={showConfirmPassword ? 'text' : 'password'}
                          className={`input w-full pr-10 ${passwordErrors.confirmPassword || errors.confirmPassword ? 'border-red-500' : ''}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {(passwordErrors.confirmPassword || errors.confirmPassword) && (
                        <p className="mt-1 text-sm text-red-600">
                          {passwordErrors.confirmPassword?.message || errors.confirmPassword}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="btn btn-primary"
                      >
                        {isLoading ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>{t('common.loading')}</span>
                          </div>
                        ) : (
                          <>
                            <Shield className="w-4 h-4 mr-2" />
                            {t('profile.updatePassword')}
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Danger Zone */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-red-200 p-6">
              <h3 className="text-lg font-semibold text-red-800 mb-4">危险操作</h3>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{t('profile.deleteAccount')}</h4>
                  <p className="text-sm text-gray-500">永久删除您的账户和所有数据</p>
                </div>
                <button
                  onClick={handleDeleteAccount}
                  className="btn btn-danger"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  删除账户
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage