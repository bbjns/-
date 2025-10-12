import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../stores/authStore'
import { toast } from 'react-hot-toast'
import { 
  Crown, 
  CheckCircle, 
  CreditCard, 
  DollarSign, 
  Zap,
  Star,
  Shield,
  Users,
  Settings,
  BarChart3
} from 'lucide-react'

const MembershipPage = () => {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const [selectedPlan, setSelectedPlan] = useState<'premium' | 'vip' | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'stripe' | 'usdt' | 'alipay'>('stripe')
  const [isProcessing, setIsProcessing] = useState(false)

  const plans = [
    {
      id: 'free',
      name: t('membership.free'),
      price: 0,
      period: '永久',
      features: [
        '基础计算功能',
        '每日10次计算',
        '标准主题',
        '邮件支持'
      ],
      icon: Users,
      color: 'gray',
      popular: false
    },
    {
      id: 'premium',
      name: t('membership.premium'),
      price: 29.99,
      period: '月',
      features: [
        '无限次计算',
        '高级分析功能',
        '所有主题',
        '优先支持',
        '历史记录保存',
        '数据导出'
      ],
      icon: Star,
      color: 'blue',
      popular: true
    },
    {
      id: 'vip',
      name: t('membership.vip'),
      price: 99.99,
      period: '月',
      features: [
        '所有高级功能',
        '自定义主题',
        'API访问',
        '专属顾问',
        '定制化服务',
        '白标解决方案'
      ],
      icon: Crown,
      color: 'purple',
      popular: false
    }
  ]

  const paymentMethods = [
    {
      id: 'stripe',
      name: '信用卡',
      icon: CreditCard,
      description: '支持 Visa, MasterCard, American Express'
    },
    {
      id: 'usdt',
      name: 'USDT',
      icon: DollarSign,
      description: '使用 USDT 加密货币支付'
    },
    {
      id: 'alipay',
      name: '支付宝',
      icon: Zap,
      description: '使用支付宝扫码支付'
    }
  ]

  const handleUpgrade = async (planId: string) => {
    if (planId === 'free') return
    
    setSelectedPlan(planId as 'premium' | 'vip')
    setIsProcessing(true)
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('会员升级成功！')
      setSelectedPlan(null)
    } catch (error) {
      toast.error('支付失败，请重试')
    } finally {
      setIsProcessing(false)
    }
  }

  const getCurrentPlan = () => {
    return plans.find(plan => plan.id === user?.membership.type) || plans[0]
  }

  const isCurrentPlan = (planId: string) => {
    return user?.membership.type === planId
  }

  const canUpgrade = (planId: string) => {
    if (planId === 'free') return false
    if (user?.membership.type === 'free') return true
    if (user?.membership.type === 'premium' && planId === 'vip') return true
    return false
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('membership.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            选择适合您的会员方案，享受更多专业功能
          </p>
        </div>

        {/* Current Plan Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                getCurrentPlan().color === 'gray' ? 'bg-gray-100' :
                getCurrentPlan().color === 'blue' ? 'bg-blue-100' :
                'bg-purple-100'
              }`}>
                {(() => {
                  const Icon = getCurrentPlan().icon
                  return <Icon className={`w-6 h-6 ${
                    getCurrentPlan().color === 'gray' ? 'text-gray-600' :
                    getCurrentPlan().color === 'blue' ? 'text-blue-600' :
                    'text-purple-600'
                  }`} />
                })()}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  当前方案：{getCurrentPlan().name}
                </h3>
                <p className="text-gray-500">
                  {user?.membership.isActive ? '会员有效' : '免费用户'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">到期时间</p>
              <p className="font-semibold text-gray-900">
                {user?.membership.endDate 
                  ? new Date(user.membership.endDate).toLocaleDateString()
                  : '永久有效'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => {
            const Icon = plan.icon
            const isCurrent = isCurrentPlan(plan.id)
            const canUpgradePlan = canUpgrade(plan.id)
            
            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-xl shadow-lg p-8 ${
                  plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''
                } ${isCurrent ? 'ring-2 ring-green-500' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      最受欢迎
                    </span>
                  </div>
                )}
                
                {isCurrent && (
                  <div className="absolute -top-4 right-4">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      当前方案
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-lg flex items-center justify-center ${
                    plan.color === 'gray' ? 'bg-gray-100' :
                    plan.color === 'blue' ? 'bg-blue-100' :
                    'bg-purple-100'
                  }`}>
                    <Icon className={`w-8 h-8 ${
                      plan.color === 'gray' ? 'text-gray-600' :
                      plan.color === 'blue' ? 'text-blue-600' :
                      'text-purple-600'
                    }`} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    ${plan.price}
                    {plan.price > 0 && (
                      <span className="text-lg text-gray-500">/{plan.period}</span>
                    )}
                  </div>
                  {plan.price === 0 && (
                    <p className="text-gray-500">永久免费</p>
                  )}
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={!canUpgradePlan || isProcessing}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    isCurrent
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : canUpgradePlan
                      ? plan.color === 'blue'
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isCurrent ? '当前方案' : 
                   canUpgradePlan ? '立即升级' : 
                   '不可升级'}
                </button>
              </div>
            )
          })}
        </div>

        {/* Payment Method Selection Modal */}
        {selectedPlan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                选择支付方式
              </h3>

              <div className="space-y-4 mb-6">
                {paymentMethods.map((method) => {
                  const Icon = method.icon
                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPaymentMethod(method.id as any)}
                      className={`w-full p-4 border rounded-lg text-left transition-colors ${
                        selectedPaymentMethod === method.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-6 h-6 text-gray-600" />
                        <div>
                          <h4 className="font-medium text-gray-900">{method.name}</h4>
                          <p className="text-sm text-gray-500">{method.description}</p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="flex-1 btn btn-outline"
                >
                  取消
                </button>
                <button
                  onClick={() => handleUpgrade(selectedPlan)}
                  disabled={isProcessing}
                  className="flex-1 btn btn-primary"
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>处理中...</span>
                    </div>
                  ) : (
                    '确认支付'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Features Comparison */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            功能对比
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">功能</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-700">免费版</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-700">高级版</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-700">VIP版</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  { feature: '基础计算', free: '✓', premium: '✓', vip: '✓' },
                  { feature: '每日计算次数', free: '10次', premium: '无限', vip: '无限' },
                  { feature: '高级分析', free: '✗', premium: '✓', vip: '✓' },
                  { feature: '主题选择', free: '1个', premium: '3个', vip: '无限' },
                  { feature: '历史记录', free: '✗', premium: '✓', vip: '✓' },
                  { feature: '数据导出', free: '✗', premium: '✓', vip: '✓' },
                  { feature: 'API访问', free: '✗', premium: '✗', vip: '✓' },
                  { feature: '专属支持', free: '✗', premium: '✗', vip: '✓' }
                ].map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-4 px-6 font-medium text-gray-900">{row.feature}</td>
                    <td className="py-4 px-6 text-center text-gray-600">{row.free}</td>
                    <td className="py-4 px-6 text-center text-gray-600">{row.premium}</td>
                    <td className="py-4 px-6 text-center text-gray-600">{row.vip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MembershipPage