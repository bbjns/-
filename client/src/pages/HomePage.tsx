import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { 
  Calculator, 
  TrendingUp, 
  Shield, 
  BarChart3, 
  Users, 
  Crown,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

const HomePage = () => {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuthStore()

  const features = [
    {
      icon: Calculator,
      title: t('calculator.basicCalculation'),
      description: '精确计算止损止盈、仓位大小、保证金需求等基础交易参数',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: TrendingUp,
      title: t('calculator.pyramidTrading'),
      description: '智能浮盈加仓计算，优化平均成本，最大化收益潜力',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: BarChart3,
      title: t('calculator.compoundInterest'),
      description: '复利计算功能，模拟多轮交易后的资金增长情况',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Shield,
      title: '风险管理',
      description: '精确的风险控制计算，保护您的交易资金安全',
      color: 'from-red-500 to-red-600'
    }
  ]

  const membershipPlans = [
    {
      name: t('membership.free'),
      price: '0',
      features: [
        '基础计算功能',
        '每日10次计算',
        '标准主题',
        '邮件支持'
      ],
      color: 'gray',
      popular: false
    },
    {
      name: t('membership.premium'),
      price: '29.99',
      features: [
        '无限次计算',
        '高级分析功能',
        '所有主题',
        '优先支持',
        '历史记录保存'
      ],
      color: 'blue',
      popular: true
    },
    {
      name: t('membership.vip'),
      price: '99.99',
      features: [
        '所有高级功能',
        '自定义主题',
        'API访问',
        '专属顾问',
        '定制化服务'
      ],
      color: 'purple',
      popular: false
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {t('app.name')}
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              {t('app.tagline')}
            </p>
            <p className="text-lg text-blue-200 mb-12 max-w-3xl mx-auto">
              {t('app.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/calculator"
                className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                <Calculator className="w-6 h-6 mr-2" />
                开始计算
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              {!isAuthenticated && (
                <Link
                  to="/register"
                  className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-900 font-semibold rounded-lg transition-colors"
                >
                  <Users className="w-6 h-6 mr-2" />
                  免费注册
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              核心功能
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              专业的投机交易计算工具，为您的交易决策提供精确的数据支持
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-6`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Calculator Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              精确到小数点后6位
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              采用最先进的计算逻辑，确保所有计算结果精确到小数点后6位
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4">专业级计算精度</h3>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-300" />
                    精确到小数点后6位
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-300" />
                    实时风险控制计算
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-300" />
                    多策略支持
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-300" />
                    历史记录保存
                  </li>
                </ul>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-6">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">99.999999</div>
                  <div className="text-blue-200">计算精度示例</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Membership Plans */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              选择适合您的会员方案
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              从免费版到VIP版，满足不同用户的需求
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {membershipPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-white rounded-xl shadow-lg p-8 ${
                  plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      最受欢迎
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <div className={`w-16 h-16 bg-gradient-to-r ${
                    plan.color === 'gray' ? 'from-gray-500 to-gray-600' :
                    plan.color === 'blue' ? 'from-blue-500 to-blue-600' :
                    'from-purple-500 to-purple-600'
                  } rounded-lg flex items-center justify-center mx-auto mb-4`}>
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    ${plan.price}
                    <span className="text-lg text-gray-500">/月</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={isAuthenticated ? '/membership' : '/register'}
                  className={`w-full py-3 px-6 rounded-lg font-semibold text-center transition-colors ${
                    plan.popular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  {isAuthenticated ? '管理会员' : '立即注册'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            开始您的专业交易计算之旅
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            立即体验最专业的投机交易计算器，让数据驱动您的交易决策
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/calculator"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 hover:bg-gray-100 font-semibold rounded-lg transition-colors"
            >
              <Calculator className="w-6 h-6 mr-2" />
              免费试用
            </Link>
            {!isAuthenticated && (
              <Link
                to="/register"
                className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold rounded-lg transition-colors"
              >
                <Users className="w-6 h-6 mr-2" />
                注册账户
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage