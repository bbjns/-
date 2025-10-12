import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import CalculatorForm from '../components/Calculator/CalculatorForm';
import CalculatorResults from '../components/Calculator/CalculatorResults';
import { CalculationResult } from '../types';

const Calculator: React.FC = () => {
  const { t } = useTranslation();
  const [result, setResult] = useState<CalculationResult | null>(null);

  const handleCalculate = (calculationResult: CalculationResult) => {
    setResult(calculationResult);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-8 lg:py-8 pt-20 lg:pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t('app.title')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
            {t('app.subtitle')}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            {t('app.description')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* 计算器表单 */}
          <div className="xl:sticky xl:top-8 xl:self-start order-1">
            <CalculatorForm onCalculate={handleCalculate} />
          </div>

          {/* 计算结果 */}
          <div className="order-2 xl:order-2">
            {result ? (
              <CalculatorResults result={result} />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-12 text-center"
              >
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/20 dark:to-primary-800/20 rounded-full flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-primary-600 dark:text-primary-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  等待计算
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  请在左侧填写参数并点击计算按钮，查看详细的计算结果
                </p>
              </motion.div>
            )}
          </div>
        </div>

        {/* 功能说明 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-16 bg-white dark:bg-dark-800 rounded-xl shadow-lg p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            计算器功能特点
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">高精度计算</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">精确到小数点后6位，确保计算结果的准确性</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/20 dark:to-green-800/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">浮盈加仓</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">智能浮盈加仓策略，最大化盈利潜力</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/20 dark:to-purple-800/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">复利计算</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">多轮复利计算，展示长期投资收益</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gold-100 to-gold-200 dark:from-gold-900/20 dark:to-gold-800/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gold-600 dark:text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">风险管理</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">科学的风险控制，保护您的资金安全</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Calculator;