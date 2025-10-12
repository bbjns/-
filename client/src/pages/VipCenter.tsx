import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

interface VipPackage {
  name: string;
  price: { toString(): string };
  duration: number;
  description: string;
}

interface VipPackages {
  monthly: VipPackage;
  yearly: VipPackage;
  lifetime: VipPackage;
}

interface PaymentOrder {
  orderId: string;
  packageInfo: VipPackage;
  paymentInfo: {
    walletAddress?: string;
    amount: string;
    network?: string;
    qrCode: string;
    instructions: string[];
  };
  expiresAt: string;
}

const VipCenter: React.FC = () => {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const [packages, setPackages] = useState<VipPackages | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<keyof VipPackages>('monthly');
  const [selectedMethod, setSelectedMethod] = useState<'usdt' | 'alipay'>('usdt');
  const [paymentOrder, setPaymentOrder] = useState<PaymentOrder | null>(null);
  const [transactionHash, setTransactionHash] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await axios.get('/payment/packages');
      setPackages(response.data.data);
    } catch (error) {
      toast.error('获取套餐信息失败');
    }
  };

  const createPaymentOrder = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post('/payment/orders', {
        packageType: selectedPackage,
        method: selectedMethod
      });
      
      setPaymentOrder(response.data.data);
      toast.success('支付订单创建成功');
    } catch (error: any) {
      toast.error(error.response?.data?.error || '创建支付订单失败');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmUsdtPayment = async () => {
    if (!paymentOrder || !transactionHash) {
      toast.error('请输入交易哈希');
      return;
    }

    try {
      setIsLoading(true);
      await axios.post('/payment/confirm-usdt', {
        orderId: paymentOrder.orderId,
        transactionHash
      });
      
      toast.success('支付确认成功，VIP已激活！');
      setPaymentOrder(null);
      setTransactionHash('');
      await refreshUser();
    } catch (error: any) {
      toast.error(error.response?.data?.error || '支付确认失败');
    } finally {
      setIsLoading(false);
    }
  };

  const formatVipExpiry = (date?: Date) => {
    if (!date) return '永久';
    return new Date(date).toLocaleDateString('zh-CN');
  };

  if (!packages) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('vip.title')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            升级VIP，解锁所有高级功能
          </p>
        </motion.div>

        {/* VIP状态 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {t('vip.status')}
          </h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-4 h-4 rounded-full ${user?.isVip ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {user?.isVip ? t('vip.isVip') : t('vip.notVip')}
                </div>
                {user?.isVip && user.vipExpiry && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t('vip.expiry')}: {formatVipExpiry(user.vipExpiry)}
                  </div>
                )}
              </div>
            </div>
            {user?.isVip && (
              <span className="bg-gold-100 text-gold-800 px-3 py-1 rounded-full text-sm font-medium">
                VIP会员
              </span>
            )}
          </div>
        </motion.div>

        {!paymentOrder ? (
          <>
            {/* VIP权益 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-6 mb-8"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                {t('vip.benefits')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { icon: '🚀', title: t('vip.benefit1') },
                  { icon: '🎯', title: t('vip.benefit2') },
                  { icon: '💎', title: t('vip.benefit3') },
                  { icon: '🔄', title: t('vip.benefit4') },
                  { icon: '👨‍💼', title: t('vip.benefit5') }
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                    <span className="text-2xl">{benefit.icon}</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{benefit.title}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* 套餐选择 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-6 mb-8"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                {t('vip.pricing')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(packages).map(([key, pkg]) => (
                  <div
                    key={key}
                    className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all ${
                      selectedPackage === key
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-dark-600 hover:border-primary-300'
                    }`}
                    onClick={() => setSelectedPackage(key as keyof VipPackages)}
                  >
                    {key === 'yearly' && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gold-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                          推荐
                        </span>
                      </div>
                    )}
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {pkg.name}
                      </h3>
                      <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                        ¥{pkg.price.toString()}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {pkg.description}
                      </p>
                      <div className={`w-4 h-4 rounded-full mx-auto ${
                        selectedPackage === key ? 'bg-primary-500' : 'bg-gray-300'
                      }`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* 支付方式 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-6 mb-8"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                {t('payment.selectMethod')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                    selectedMethod === 'usdt'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-dark-600 hover:border-primary-300'
                  }`}
                  onClick={() => setSelectedMethod('usdt')}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">₮</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {t('payment.usdt')}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        USDT-TRC20网络转账
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                    selectedMethod === 'alipay'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-dark-600 hover:border-primary-300'
                  }`}
                  onClick={() => setSelectedMethod('alipay')}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">支</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {t('payment.alipay')}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        支付宝扫码支付
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 确认支付 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <button
                onClick={createPaymentOrder}
                disabled={isLoading}
                className="btn-primary px-8 py-4 text-lg"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {t('common.loading')}
                  </>
                ) : (
                  `${t('payment.confirm')} - ¥${packages[selectedPackage].price.toString()}`
                )}
              </button>
            </motion.div>
          </>
        ) : (
          /* 支付页面 */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-8 max-w-md mx-auto"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {selectedMethod === 'usdt' ? t('payment.usdt') : t('payment.alipay')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {paymentOrder.packageInfo.name} - ¥{paymentOrder.packageInfo.price.toString()}
              </p>
            </div>

            <div className="text-center mb-6">
              <img
                src={paymentOrder.paymentInfo.qrCode}
                alt="支付二维码"
                className="w-48 h-48 mx-auto border border-gray-200 dark:border-dark-600 rounded-lg"
              />
            </div>

            {selectedMethod === 'usdt' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  钱包地址
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={paymentOrder.paymentInfo.walletAddress}
                    readOnly
                    className="flex-1 form-input rounded-r-none"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(paymentOrder.paymentInfo.walletAddress || '')}
                    className="px-4 py-2 bg-gray-200 dark:bg-dark-600 border border-l-0 border-gray-300 dark:border-dark-600 rounded-r-lg text-sm hover:bg-gray-300 dark:hover:bg-dark-500 transition-colors"
                  >
                    复制
                  </button>
                </div>
              </div>
            )}

            <div className="mb-6">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">支付说明：</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                {paymentOrder.paymentInfo.instructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ul>
            </div>

            {selectedMethod === 'usdt' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  交易哈希 (TxHash)
                </label>
                <input
                  type="text"
                  value={transactionHash}
                  onChange={(e) => setTransactionHash(e.target.value)}
                  className="form-input"
                  placeholder="请输入交易哈希"
                />
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => setPaymentOrder(null)}
                className="flex-1 btn-secondary"
              >
                {t('common.cancel')}
              </button>
              {selectedMethod === 'usdt' ? (
                <button
                  onClick={confirmUsdtPayment}
                  disabled={isLoading || !transactionHash}
                  className="flex-1 btn-primary"
                >
                  {isLoading ? t('common.loading') : '确认支付'}
                </button>
              ) : (
                <button
                  className="flex-1 btn-primary"
                  disabled
                >
                  等待支付确认
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default VipCenter;