import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './Membership.css';

const Membership: React.FC = () => {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const [selectedDuration, setSelectedDuration] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<'usdt' | 'alipay'>('usdt');
  const [loading, setLoading] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL || '/api';

  const prices = {
    1: 99,
    3: 249,
    6: 449,
    12: 799
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${apiUrl}/payment/create-order`, {
        duration: selectedDuration,
        paymentMethod,
        amount: prices[selectedDuration as keyof typeof prices]
      });

      // 这里应该跳转到支付页面或显示支付二维码
      alert(`订单创建成功！订单号: ${response.data.orderId}\n\n请完成支付后等待系统确认。`);
      
      // 刷新用户信息
      await refreshUser();
    } catch (error: any) {
      alert(error.response?.data?.message || '创建订单失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container membership-page">
      <div className="membership-grid">
        {/* Current Plan */}
        <div className="card current-plan">
          <h2>{t('membership.currentPlan')}</h2>
          <div className="plan-info">
            <div className="plan-status">
              <span className={`plan-badge ${user?.isPremium ? 'premium' : 'free'}`}>
                {user?.isPremium ? t('membership.premium') : t('membership.free')}
              </span>
            </div>
            {user?.isPremium && user.premiumExpireDate && (
              <div className="expire-info">
                <span>{t('membership.expireDate')}:</span>
                <span className="expire-date">
                  {new Date(user.premiumExpireDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          <div className="benefits">
            <h3>{t('membership.benefits')}</h3>
            <ul>
              <li className={user?.isPremium ? 'active' : ''}>
                ✓ {t('membership.benefit1')}
              </li>
              <li className={user?.isPremium ? 'active' : ''}>
                ✓ {t('membership.benefit2')}
              </li>
              <li className={user?.isPremium ? 'active' : ''}>
                ✓ {t('membership.benefit3')}
              </li>
              <li className={user?.isPremium ? 'active' : ''}>
                ✓ {t('membership.benefit4')}
              </li>
            </ul>
          </div>
        </div>

        {/* Upgrade Section */}
        <div className="card upgrade-section">
          <h2>{t('membership.upgrade')}</h2>

          <div className="duration-selector">
            <div className="duration-options">
              {[
                { value: 1, label: t('membership.month1') },
                { value: 3, label: t('membership.month3') },
                { value: 6, label: t('membership.month6') },
                { value: 12, label: t('membership.month12') }
              ].map((option) => (
                <div
                  key={option.value}
                  className={`duration-option ${selectedDuration === option.value ? 'selected' : ''}`}
                  onClick={() => setSelectedDuration(option.value)}
                >
                  <div className="duration-label">{option.label}</div>
                  <div className="duration-price">
                    ${prices[option.value as keyof typeof prices]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="payment-method">
            <h3>{t('membership.paymentMethod')}</h3>
            <div className="payment-options">
              <label className={`payment-option ${paymentMethod === 'usdt' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  value="usdt"
                  checked={paymentMethod === 'usdt'}
                  onChange={() => setPaymentMethod('usdt')}
                />
                <span>{t('membership.usdt')}</span>
              </label>
              <label className={`payment-option ${paymentMethod === 'alipay' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  value="alipay"
                  checked={paymentMethod === 'alipay'}
                  onChange={() => setPaymentMethod('alipay')}
                />
                <span>{t('membership.alipay')}</span>
              </label>
            </div>
          </div>

          <div className="payment-summary">
            <div className="summary-row">
              <span>{t('membership.amount')}:</span>
              <span className="amount">${prices[selectedDuration as keyof typeof prices]}</span>
            </div>
          </div>

          <button
            className="btn btn-primary btn-block"
            onClick={handlePayment}
            disabled={loading}
          >
            {loading ? t('common.loading') : t('membership.pay')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Membership;
