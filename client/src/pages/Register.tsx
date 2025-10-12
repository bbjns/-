import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface RegisterForm {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

const Register: React.FC = () => {
  const { t } = useTranslation();
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();

  const password = watch('password');

  const onSubmit = async (data: RegisterForm) => {
    try {
      setIsLoading(true);
      const result = await registerUser(data.email, data.password, data.username);
      
      if (result.success) {
        toast.success('注册成功！请查收邮箱验证邮件。');
        navigate('/');
      } else {
        toast.error(result.error || '注册失败');
      }
    } catch (error) {
      toast.error('注册过程中发生错误');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('auth.register')}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t('app.subtitle')}
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-white dark:bg-dark-800 py-8 px-4 shadow-xl rounded-xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('auth.email')}
              </label>
              <div className="mt-1">
                <input
                  {...register('email', {
                    required: t('validation.required'),
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: t('validation.email'),
                    },
                  })}
                  type="email"
                  autoComplete="email"
                  className="form-input"
                  placeholder="your@email.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('auth.username')}
              </label>
              <div className="mt-1">
                <input
                  {...register('username', {
                    required: t('validation.required'),
                    minLength: {
                      value: 2,
                      message: t('validation.minLength', { min: 2 }),
                    },
                    maxLength: {
                      value: 20,
                      message: t('validation.maxLength', { max: 20 }),
                    },
                  })}
                  type="text"
                  autoComplete="username"
                  className="form-input"
                  placeholder="用户名"
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('auth.password')}
              </label>
              <div className="mt-1">
                <input
                  {...register('password', {
                    required: t('validation.required'),
                    minLength: {
                      value: 6,
                      message: t('validation.minLength', { min: 6 }),
                    },
                  })}
                  type="password"
                  autoComplete="new-password"
                  className="form-input"
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('auth.confirmPassword')}
              </label>
              <div className="mt-1">
                <input
                  {...register('confirmPassword', {
                    required: t('validation.required'),
                    validate: (value) => value === password || '密码不匹配',
                  })}
                  type="password"
                  autoComplete="new-password"
                  className="form-input"
                  placeholder="••••••••"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full flex justify-center items-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {t('common.loading')}
                  </>
                ) : (
                  t('auth.registerBtn')
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-dark-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-dark-800 text-gray-500 dark:text-gray-400">
                  {t('auth.hasAccount')}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/login"
                className="w-full flex justify-center py-3 px-4 border border-gray-300 dark:border-dark-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-700 hover:bg-gray-50 dark:hover:bg-dark-600 transition-colors"
              >
                {t('auth.goToLogin')}
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;