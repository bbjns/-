import { useTranslation } from 'react-i18next'
import { useCalculatorStore } from '../../stores/calculatorStore'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Shield, 
  Target,
  BarChart3,
  Calculator as CalculatorIcon
} from 'lucide-react'

const CalculatorResults = () => {
  const { t } = useTranslation()
  const { result, input } = useCalculatorStore()

  if (!result) return null

  const formatNumber = (num: number, decimals: number = 6) => {
    return num.toFixed(decimals).replace(/\.?0+$/, '')
  }

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(num)
  }

  const formatPercentage = (num: number) => {
    return `${num.toFixed(2)}%`
  }

  const getProfitLossColor = (value: number) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600'
  }

  const getProfitLossIcon = (value: number) => {
    return value >= 0 ? TrendingUp : TrendingDown
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="space-y-6">
        {/* Basic Results */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
            <div className="flex items-center space-x-3">
              <CalculatorIcon className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">{t('calculator.results.basic.title')}</h2>
                <p className="text-green-100">基础交易计算结果</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Stop Loss Price */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="w-5 h-5 text-red-600" />
                  <h3 className="font-semibold text-red-800">{t('calculator.results.basic.stopLossPrice')}</h3>
                </div>
                <p className="text-2xl font-bold text-red-600">
                  {formatNumber(result.basic.stopLossPrice)}
                </p>
              </div>

              {/* Take Profit Price */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-green-800">{t('calculator.results.basic.takeProfitPrice')}</h3>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {formatNumber(result.basic.takeProfitPrice)}
                </p>
              </div>

              {/* Position Size */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-800">{t('calculator.results.basic.positionSize')}</h3>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {formatNumber(result.basic.positionSize)}
                </p>
              </div>

              {/* Margin Required */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="w-5 h-5 text-yellow-600" />
                  <h3 className="font-semibold text-yellow-800">{t('calculator.results.basic.marginRequired')}</h3>
                </div>
                <p className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(result.basic.marginRequired)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
              {/* Fees */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">{t('calculator.results.basic.fees')}</h3>
                <p className="text-2xl font-bold text-gray-600">
                  {formatCurrency(result.basic.fees)}
                </p>
              </div>

              {/* Profit/Loss */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  {(() => {
                    const Icon = getProfitLossIcon(result.basic.profitLoss)
                    return <Icon className="w-5 h-5" />
                  })()}
                  <h3 className="font-semibold text-gray-800">{t('calculator.results.basic.profitLoss')}</h3>
                </div>
                <p className={`text-2xl font-bold ${getProfitLossColor(result.basic.profitLoss)}`}>
                  {formatCurrency(result.basic.profitLoss)}
                </p>
              </div>

              {/* Risk Percentage */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">{t('calculator.results.basic.riskPercentage')}</h3>
                <p className="text-2xl font-bold text-gray-600">
                  {formatPercentage(result.basic.riskPercentage)}
                </p>
              </div>

              {/* Nominal Position Value */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">{t('calculator.results.basic.nominalPositionValue')}</h3>
                <p className="text-2xl font-bold text-gray-600">
                  {formatCurrency(result.basic.nominalPositionValue)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pyramid Trading Results */}
        {result.pyramid && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-8 h-8" />
                <div>
                  <h2 className="text-2xl font-bold">{t('calculator.results.pyramid.title')}</h2>
                  <p className="text-purple-100">浮盈加仓计算结果</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Trigger Price */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-800 mb-2">{t('calculator.results.pyramid.triggerPrice')}</h3>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatNumber(result.pyramid.triggerPrice)}
                  </p>
                </div>

                {/* New Average Price */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">{t('calculator.results.pyramid.newAveragePrice')}</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatNumber(result.pyramid.newAveragePrice)}
                  </p>
                </div>

                {/* Additional Position Value */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-2">{t('calculator.results.pyramid.additionalPositionValue')}</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(result.pyramid.additionalPositionValue)}
                  </p>
                </div>

                {/* Additional Margin */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-800 mb-2">{t('calculator.results.pyramid.additionalMargin')}</h3>
                  <p className="text-2xl font-bold text-yellow-600">
                    {formatCurrency(result.pyramid.additionalMargin)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                {/* New Stop Loss Price */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-800 mb-2">{t('calculator.results.pyramid.newStopLossPrice')}</h3>
                  <p className="text-2xl font-bold text-red-600">
                    {formatNumber(result.pyramid.newStopLossPrice)}
                  </p>
                </div>

                {/* New Take Profit Price */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-2">{t('calculator.results.pyramid.newTakeProfitPrice')}</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {formatNumber(result.pyramid.newTakeProfitPrice)}
                  </p>
                </div>

                {/* New Risk Percentage */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h3 className="font-semibold text-orange-800 mb-2">{t('calculator.results.pyramid.newRiskPercentage')}</h3>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatPercentage(result.pyramid.newRiskPercentage)}
                  </p>
                </div>

                {/* Total Position Value */}
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <h3 className="font-semibold text-indigo-800 mb-2">{t('calculator.results.pyramid.totalPositionValue')}</h3>
                  <p className="text-2xl font-bold text-indigo-600">
                    {formatCurrency(result.pyramid.totalPositionValue)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Compound Interest Results */}
        {result.compound && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-cyan-600 text-white p-6">
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-8 h-8" />
                <div>
                  <h2 className="text-2xl font-bold">{t('calculator.results.compound.title')}</h2>
                  <p className="text-indigo-100">复利计算结果</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">{t('calculator.results.compound.round')}</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">{t('calculator.results.compound.totalFunds')}</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">{t('calculator.results.compound.profit')}</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">{t('calculator.results.compound.newPositionSize')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.compound.map((round, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">{round.round}</td>
                        <td className="py-3 px-4 text-gray-600">{formatCurrency(round.totalFunds)}</td>
                        <td className={`py-3 px-4 font-semibold ${getProfitLossColor(round.profit)}`}>
                          {formatCurrency(round.profit)}
                        </td>
                        <td className="py-3 px-4 text-gray-600">{formatNumber(round.newPositionSize)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CalculatorResults