import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Decimal from 'decimal.js';
import { motion } from 'framer-motion';
import {
  CalculatorInput,
  CalculationResult,
  TradeDirection,
} from '../../types';
import { calculate } from '../../utils/calculator';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface FormData {
  totalFunds: string;
  leverage: string;
  direction: TradeDirection;
  entryPrice: string;
  riskRatio: string;
  feeRate: string;
  stopLoss?: string;
  profitLossRatio?: string;
  profitAddEnabled: boolean;
  profitThreshold?: string;
  addPositionRatio?: string;
  useStopLoss: boolean; // 用于切换止损价/盈亏比
}

interface CalculatorFormProps {
  onCalculate: (result: CalculationResult) => void;
}

const CalculatorForm: React.FC<CalculatorFormProps> = ({ onCalculate }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isCalculating, setIsCalculating] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      totalFunds: '10000',
      leverage: '10',
      direction: 'long',
      entryPrice: '50000',
      riskRatio: '2',
      feeRate: '0.1',
      profitAddEnabled: false,
      useStopLoss: true,
      stopLoss: '48000',
      profitLossRatio: '2',
      profitThreshold: '10',
      addPositionRatio: '50',
    },
  });

  const watchUseStopLoss = watch('useStopLoss');
  const watchProfitAddEnabled = watch('profitAddEnabled');

  const onSubmit = async (data: FormData) => {
    try {
      setIsCalculating(true);

      // 检查非VIP用户限制
      if (!user?.isVip) {
        const totalFunds = new Decimal(data.totalFunds);
        if (totalFunds.gt(100000)) {
          toast.error('非VIP用户总资金限制为10万，请升级VIP解除限制');
          return;
        }
      }

      // 构建计算器输入
      const input: CalculatorInput = {
        totalFunds: new Decimal(data.totalFunds),
        leverage: new Decimal(data.leverage),
        direction: data.direction,
        entryPrice: new Decimal(data.entryPrice),
        riskRatio: new Decimal(data.riskRatio),
        feeRate: new Decimal(data.feeRate),
        profitAddEnabled: data.profitAddEnabled,
      };

      // 设置止损价或盈亏比
      if (data.useStopLoss && data.stopLoss) {
        input.stopLoss = new Decimal(data.stopLoss);
      } else if (!data.useStopLoss && data.profitLossRatio) {
        input.profitLossRatio = new Decimal(data.profitLossRatio);
      }

      // 设置浮盈加仓参数
      if (data.profitAddEnabled) {
        if (data.profitThreshold) {
          input.profitThreshold = new Decimal(data.profitThreshold);
        }
        if (data.addPositionRatio) {
          input.addPositionRatio = new Decimal(data.addPositionRatio);
        }
      }

      // 执行计算
      const result = calculate(input);

      if (!result.isValid) {
        toast.error(result.errors.join('\\n'));
        return;
      }

      onCalculate(result);
      toast.success('计算完成！');
    } catch (error) {
      console.error('计算错误:', error);
      toast.error('计算过程中发生错误，请检查输入参数');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleReset = () => {
    reset();
    toast.success('参数已重置');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('calculator.title')}
        </h2>
        {!user?.isVip && (
          <div className="bg-gold-100 text-gold-800 px-3 py-1 rounded-full text-sm">
            免费版本
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 基础参数 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('calculator.totalFunds')}
            </label>
            <Controller
              name="totalFunds"
              control={control}
              rules={{
                required: t('validation.required'),
                validate: (value) => {
                  const num = parseFloat(value);
                  return num > 0 || t('validation.positive');
                },
              }}
              render={({ field }) => (
                <input
                  {...field}
                  type="number"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                  placeholder="10000"
                />
              )}
            />
            {errors.totalFunds && (
              <p className="mt-1 text-sm text-red-600">{errors.totalFunds.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('calculator.leverage')}
            </label>
            <Controller
              name="leverage"
              control={control}
              rules={{
                required: t('validation.required'),
                validate: (value) => {
                  const num = parseFloat(value);
                  return (num > 0 && num <= 1000) || t('validation.range', { min: 1, max: 1000 });
                },
              }}
              render={({ field }) => (
                <input
                  {...field}
                  type="number"
                  step="0.1"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                  placeholder="10"
                />
              )}
            />
            {errors.leverage && (
              <p className="mt-1 text-sm text-red-600">{errors.leverage.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('calculator.direction')}
            </label>
            <Controller
              name="direction"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                >
                  <option value="long">{t('calculator.long')}</option>
                  <option value="short">{t('calculator.short')}</option>
                </select>
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('calculator.entryPrice')}
            </label>
            <Controller
              name="entryPrice"
              control={control}
              rules={{
                required: t('validation.required'),
                validate: (value) => {
                  const num = parseFloat(value);
                  return num > 0 || t('validation.positive');
                },
              }}
              render={({ field }) => (
                <input
                  {...field}
                  type="number"
                  step="0.000001"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                  placeholder="50000"
                />
              )}
            />
            {errors.entryPrice && (
              <p className="mt-1 text-sm text-red-600">{errors.entryPrice.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('calculator.riskRatio')} (%)
            </label>
            <Controller
              name="riskRatio"
              control={control}
              rules={{
                required: t('validation.required'),
                validate: (value) => {
                  const num = parseFloat(value);
                  return (num >= 0 && num <= 100) || t('validation.range', { min: 0, max: 100 });
                },
              }}
              render={({ field }) => (
                <input
                  {...field}
                  type="number"
                  step="0.1"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                  placeholder="2"
                />
              )}
            />
            {errors.riskRatio && (
              <p className="mt-1 text-sm text-red-600">{errors.riskRatio.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('calculator.feeRate')} (%)
            </label>
            <Controller
              name="feeRate"
              control={control}
              rules={{
                required: t('validation.required'),
                validate: (value) => {
                  const num = parseFloat(value);
                  return (num >= 0 && num <= 10) || t('validation.range', { min: 0, max: 10 });
                },
              }}
              render={({ field }) => (
                <input
                  {...field}
                  type="number"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                  placeholder="0.1"
                />
              )}
            />
            {errors.feeRate && (
              <p className="mt-1 text-sm text-red-600">{errors.feeRate.message}</p>
            )}
          </div>
        </div>

        {/* 止损设置 */}
        <div className="border-t border-gray-200 dark:border-dark-600 pt-6">
          <div className="flex items-center space-x-4 mb-4">
            <Controller
              name="useStopLoss"
              control={control}
              render={({ field }) => (
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={field.value}
                    onChange={() => setValue('useStopLoss', true)}
                    className="mr-2 text-primary-600"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('calculator.stopLoss')}
                  </span>
                </label>
              )}
            />
            <Controller
              name="useStopLoss"
              control={control}
              render={({ field }) => (
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={!field.value}
                    onChange={() => setValue('useStopLoss', false)}
                    className="mr-2 text-primary-600"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('calculator.profitLossRatio')}
                  </span>
                </label>
              )}
            />
          </div>

          {watchUseStopLoss ? (
            <div>
              <Controller
                name="stopLoss"
                control={control}
                rules={{
                  required: watchUseStopLoss ? t('validation.required') : false,
                }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    step="0.000001"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                    placeholder="48000"
                  />
                )}
              />
              {errors.stopLoss && (
                <p className="mt-1 text-sm text-red-600">{errors.stopLoss.message}</p>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">1 :</span>
                <Controller
                  name="profitLossRatio"
                  control={control}
                  rules={{
                    required: !watchUseStopLoss ? t('validation.required') : false,
                  }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      step="0.1"
                      className="flex-1 px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                      placeholder="2"
                    />
                  )}
                />
              </div>
              {errors.profitLossRatio && (
                <p className="mt-1 text-sm text-red-600">{errors.profitLossRatio.message}</p>
              )}
            </div>
          )}
        </div>

        {/* 浮盈加仓设置 */}
        <div className="border-t border-gray-200 dark:border-dark-600 pt-6">
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('calculator.profitAddEnabled')}
            </label>
            <Controller
              name="profitAddEnabled"
              control={control}
              render={({ field }) => (
                <button
                  type="button"
                  onClick={() => setValue('profitAddEnabled', !field.value)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    field.value ? 'bg-primary-600' : 'bg-gray-200 dark:bg-dark-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      field.value ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              )}
            />
          </div>

          {watchProfitAddEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('calculator.profitThreshold')} (%)
                </label>
                <Controller
                  name="profitThreshold"
                  control={control}
                  rules={{
                    required: watchProfitAddEnabled ? t('validation.required') : false,
                  }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      step="0.1"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                      placeholder="10"
                    />
                  )}
                />
                {errors.profitThreshold && (
                  <p className="mt-1 text-sm text-red-600">{errors.profitThreshold.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('calculator.addPositionRatio')} (%)
                </label>
                <Controller
                  name="addPositionRatio"
                  control={control}
                  rules={{
                    required: watchProfitAddEnabled ? t('validation.required') : false,
                  }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      step="0.1"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                      placeholder="50"
                    />
                  )}
                />
                {errors.addPositionRatio && (
                  <p className="mt-1 text-sm text-red-600">{errors.addPositionRatio.message}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex space-x-4 pt-6">
          <button
            type="submit"
            disabled={isCalculating}
            className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
          >
            {isCalculating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                计算中...
              </>
            ) : (
              t('calculator.calculate')
            )}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-3 border border-gray-300 dark:border-dark-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
          >
            {t('calculator.reset')}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default CalculatorForm;