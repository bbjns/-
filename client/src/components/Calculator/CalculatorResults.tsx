import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CalculationResult } from '../../types';
import Decimal from 'decimal.js';

interface CalculatorResultsProps {
  result: CalculationResult | null;
}

const CalculatorResults: React.FC<CalculatorResultsProps> = ({ result }) => {
  const { t } = useTranslation();

  if (!result || !result.isValid) {
    return null;
  }

  const formatNumber = (value: Decimal): string => {
    return value.toFixed(6);
  };

  const formatCurrency = (value: Decimal): string => {
    return `$${value.toFixed(6)}`;
  };

  const formatPercentage = (value: Decimal): string => {
    return `${value.toFixed(6)}%`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* 基础计算结果 */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <div className="w-2 h-6 bg-primary-500 rounded-full mr-3"></div>
          {t('results.basic')}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg">
            <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
              {t('results.stopLossPrice')}
            </div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {formatCurrency(result.basic.stopLossPrice)}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg">
            <div className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">
              {t('results.takeProfitPrice')}
            </div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {formatCurrency(result.basic.takeProfitPrice)}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg">
            <div className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-1">
              {t('results.positionMargin')}
            </div>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {formatCurrency(result.basic.positionMargin)}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-lg">
            <div className="text-sm text-orange-600 dark:text-orange-400 font-medium mb-1">
              {t('results.tradingFee')}
            </div>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
              {formatCurrency(result.basic.tradingFee)}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-4 rounded-lg">
            <div className="text-sm text-red-600 dark:text-red-400 font-medium mb-1">
              {t('results.riskAmount')}
            </div>
            <div className="text-2xl font-bold text-red-900 dark:text-red-100">
              {formatCurrency(result.basic.riskAmount)}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 p-4 rounded-lg">
            <div className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-1">
              {t('results.notionalValue')}
            </div>
            <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
              {formatCurrency(result.basic.notionalValue)}
            </div>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-4 rounded-lg">
            <div className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mb-1">
              {t('results.profitLoss')}
            </div>
            <div className={`text-2xl font-bold ${
              result.basic.profitLoss.gte(0) 
                ? 'text-emerald-600 dark:text-emerald-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {result.basic.profitLoss.gte(0) ? '+' : ''}{formatCurrency(result.basic.profitLoss)}
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-cyan-50 to-sky-50 dark:from-cyan-900/20 dark:to-sky-900/20 p-4 rounded-lg">
            <div className="text-sm text-cyan-600 dark:text-cyan-400 font-medium mb-1">
              {t('results.positionSize')}
            </div>
            <div className="text-2xl font-bold text-cyan-900 dark:text-cyan-100">
              {formatNumber(result.basic.positionSize)}
            </div>
          </div>
        </div>
      </div>

      {/* 浮盈加仓结果 */}
      {result.addPosition && (
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <div className="w-2 h-6 bg-gold-500 rounded-full mr-3"></div>
            {t('results.addPosition')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-gold-50 to-yellow-100 dark:from-gold-900/20 dark:to-yellow-800/20 p-4 rounded-lg">
              <div className="text-sm text-gold-600 dark:text-gold-400 font-medium mb-1">
                {t('results.triggerPrice')}
              </div>
              <div className="text-2xl font-bold text-gold-900 dark:text-gold-100">
                {formatCurrency(result.addPosition.triggerPrice)}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900/20 dark:to-orange-800/20 p-4 rounded-lg">
              <div className="text-sm text-amber-600 dark:text-amber-400 font-medium mb-1">
                {t('results.newAvgPrice')}
              </div>
              <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                {formatCurrency(result.addPosition.newAvgPrice)}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-900/20 dark:to-amber-800/20 p-4 rounded-lg">
              <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium mb-1">
                {t('results.addMargin')}
              </div>
              <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                {formatCurrency(result.addPosition.addMargin)}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-lime-50 to-green-100 dark:from-lime-900/20 dark:to-green-800/20 p-4 rounded-lg">
              <div className="text-sm text-lime-600 dark:text-lime-400 font-medium mb-1">
                {t('results.newStopLoss')}
              </div>
              <div className="text-2xl font-bold text-lime-900 dark:text-lime-100">
                {formatCurrency(result.addPosition.newStopLoss)}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-900/20 dark:to-teal-800/20 p-4 rounded-lg">
              <div className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mb-1">
                {t('results.newTakeProfit')}
              </div>
              <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                {formatCurrency(result.addPosition.newTakeProfit)}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-teal-50 to-cyan-100 dark:from-teal-900/20 dark:to-cyan-800/20 p-4 rounded-lg">
              <div className="text-sm text-teal-600 dark:text-teal-400 font-medium mb-1">
                {t('results.newRiskRatio')}
              </div>
              <div className="text-2xl font-bold text-teal-900 dark:text-teal-100">
                {formatPercentage(result.addPosition.newRiskRatio)}
              </div>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 p-4 rounded-lg">
              <div className="text-sm text-sky-600 dark:text-sky-400 font-medium mb-1">
                {t('results.addNotionalValue')}
              </div>
              <div className="text-2xl font-bold text-sky-900 dark:text-sky-100">
                {formatCurrency(result.addPosition.addNotionalValue)}
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 p-4 rounded-lg">
              <div className="text-sm text-violet-600 dark:text-violet-400 font-medium mb-1">
                {t('results.totalNotionalValue')}
              </div>
              <div className="text-2xl font-bold text-violet-900 dark:text-violet-100">
                {formatCurrency(result.addPosition.totalNotionalValue)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 复利计算结果 */}
      {result.compound.length > 0 && (
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <div className="w-2 h-6 bg-emerald-500 rounded-full mr-3"></div>
            {t('results.compound')}
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-dark-600">
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                    轮次
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                    {t('results.totalFundsAfter')}
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                    {t('results.profit')}
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                    {t('results.cumulativeProfit')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.compound.map((round, index) => (
                  <motion.tr
                    key={round.round}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-gray-100 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-700/50"
                  >
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                      {t('results.round', { round: round.round })}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-gray-900 dark:text-white">
                      {formatCurrency(round.totalFunds)}
                    </td>
                    <td className={`py-3 px-4 text-right font-mono ${
                      round.profit.gte(0) 
                        ? 'text-emerald-600 dark:text-emerald-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {round.profit.gte(0) ? '+' : ''}{formatCurrency(round.profit)}
                    </td>
                    <td className={`py-3 px-4 text-right font-mono ${
                      round.cumulativeProfit.gte(0) 
                        ? 'text-emerald-600 dark:text-emerald-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {round.cumulativeProfit.gte(0) ? '+' : ''}{formatCurrency(round.cumulativeProfit)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CalculatorResults;