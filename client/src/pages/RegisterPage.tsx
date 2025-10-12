import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../stores/authStore'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { Calculator, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'

interface RegisterFormData {
  email: string
  password: string
  confirmPassword: string
  username: string
}

const RegisterPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { register: registerUser, isLoading } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors: formErrors }
  } = useForm<RegisterFormData>()

  const password = watch('password')

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setErrors({})
      
      if (data.password !== data.confirmPassword) {
        setErrors({ confirmPassword: t('errors.passwordsDoNotMatch') })
        return
      }

      await registerUser(data.email, data.password, data.username)
      toast.success(t('auth.registerSuccess'))
      navigate('/calculator')
    } catch (error: any) {
      setErrors({ general: error.message })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
              <Calculator className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white">
            {t('auth.register')}
          </h2>
          <p className="mt-2 text-sm text-blue-100">
            创建您的 {t('app.name')} 账户
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700">{errors.general}</span>
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.username')}
              </label>
              <input
                {...register('username', {
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
                className={`input w-full ${formErrors.username ? 'border-red-500' : ''}`}
                placeholder="用户名"
              />
              {formErrors.username && (
                <p className="mt-1 text-sm text-red-600">{formErrors.username.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.email')}
              </label>
              <input
                {...register('email', {
                  required: t('validation.required'),
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: t('validation.email')
                  }
                })}
                type="email"
                className={`input w-full ${formErrors.email ? 'border-red-500' : ''}`}
                placeholder="your@email.com"
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600">{formErrors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.password')}
              </label>
              <div className="relative">
                <input
                  {...register('password', {
                    required: t('validation.required'),
                    minLength: {
                      value: 6,
                      message: t('validation.minLength', { min: 6 })
                    }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className={`input w-full pr-10 ${formErrors.password ? 'border-red-500' : ''}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-600">{formErrors.password.message}</p>
              )}
              
              {/* Password strength indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded ${
                          password.length >= level * 2
                            ? password.length >= 8
                              ? 'bg-green-500'
                              : 'bg-yellow-500'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {password.length < 6
                      ? '密码太短'
                      : password.length < 8
                      ? '密码强度中等'
                      : '密码强度良好'}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.confirmPassword')}
              </label>
              <div className="relative">
                <input
                  {...register('confirmPassword', {
                    required: t('validation.required')
                  })}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`input w-full pr-10 ${formErrors.confirmPassword || errors.confirmPassword ? 'border-red-500' : ''}`}
                  placeholder="••••••••"
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
              {(formErrors.confirmPassword || errors.confirmPassword) && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.confirmPassword?.message || errors.confirmPassword}
                </p>
              )}
              
              {/* Password match indicator */}
              {password && watch('confirmPassword') && (
                <div className="mt-2 flex items-center space-x-1">
                  {password === watch('confirmPassword') ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-600">密码匹配</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-red-600">密码不匹配</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                我同意{' '}
                <Link to="/terms" className="text-blue-600 hover:text-blue-500">
                  服务条款
                </Link>{' '}
                和{' '}
                <Link to="/privacy" className="text-blue-600 hover:text-blue-500">
                  隐私政策
                </Link>
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>{t('common.loading')}</span>
                  </div>
                ) : (
                  t('auth.register')
                )}
              </button>
            </div>

            <div className="text-center">
              <span className="text-sm text-gray-600">
                已有账户？{' '}
                <Link
                  to="/login"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  {t('auth.login')}
                </Link>
              </span>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-blue-100">
            {t('app.tagline')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage