import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../stores/authStore'
import { useCalculatorStore } from '../stores/calculatorStore'
import CalculatorForm from '../components/calculator/CalculatorForm'
import CalculatorResults from '../components/calculator/CalculatorResults'
import { 
  Calculator, 
  History, 
  Save, 
  Download,
  AlertCircle,
  Info
} from 'lucide-react'

const CalculatorPage = () => {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuthStore()
  const { 
    input, 
    result, 
    history, 
    loadHistory, 
    deleteHistoryItem,
    setInput 
  } = useCalculatorStore()
  const [showHistory, setShowHistory] = useState(false)
  const [calculationType, setCalculationType] = useState<'basic' | 'pyramid' | 'compound'>('basic')

  useEffect(() => {
    if (isAuthenticated) {
      loadHistory()
    }
  }, [isAuthenticated, loadHistory])

  const handleCalculationTypeChange = (type: 'basic' | 'pyramid' | 'compound') => {
    setCalculationType(type)
    setInput({ calculationType: type })
  }

  const handleLoadFromHistory = (historyItem: any) => {
    setInput(historyItem.input)
    setShowHistory(false)
  }

  const handleExportResults = () => {
    if (!result) return

    const data = {
      input,
      result,
      timestamp: new Date().toISOString(),
      calculationType: input.calculationType
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `calculation-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3 mb-4 sm:mb-0">
              <Calculator className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('calculator.title')}</h1>
                <p className="text-sm text-gray-500">{t('app.tagline')}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Calculation Type Selector */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => handleCalculationTypeChange('basic')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    calculationType === 'basic'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {t('calculator.basicCalculation')}
                </button>
                <button
                  onClick={() => handleCalculationTypeChange('pyramid')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    calculationType === 'pyramid'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {t('calculator.pyramidTrading')}
                </button>
                <button
                  onClick={() => handleCalculationTypeChange('compound')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    calculationType === 'compound'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {t('calculator.compoundInterest')}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                {isAuthenticated && (
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="btn btn-outline btn-sm"
                  >
                    <History className="w-4 h-4 mr-1" />
                    {t('calculator.history')}
                  </button>
                )}
                
                {result && (
                  <button
                    onClick={handleExportResults}
                    className="btn btn-outline btn-sm"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    导出
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Calculator Form */}
          <div className="lg:col-span-3">
            <CalculatorForm />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Info Card */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">计算说明</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• 所有计算结果精确到小数点后6位</li>
                      <li>• 支持杠杆交易计算</li>
                      <li>• 智能风险控制</li>
                      <li>• 实时数据更新</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Quick Tips */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">使用技巧</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• 风险占比建议控制在1-5%</li>
                  <li>• 杠杆倍数根据市场情况调整</li>
                  <li>• 定期检查止损止盈设置</li>
                  <li>• 保存重要计算结果</li>
                </ul>
              </div>

              {/* Membership Info */}
              {!isAuthenticated && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-yellow-900 mb-2">免费试用</h3>
                      <p className="text-sm text-yellow-800 mb-3">
                        注册账户可享受更多功能
                      </p>
                      <a
                        href="/register"
                        className="text-sm text-yellow-700 hover:text-yellow-900 font-medium"
                      >
                        立即注册 →
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="mt-8">
            <CalculatorResults />
          </div>
        )}

        {/* History Modal */}
        {showHistory && isAuthenticated && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t('calculator.history')}
                  </h3>
                  <button
                    onClick={() => setShowHistory(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-64">
                {history.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">暂无计算历史</p>
                ) : (
                  <div className="space-y-3">
                    {history.map((item) => (
                      <div
                        key={item.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {item.input.calculationType === 'basic' && t('calculator.basicCalculation')}
                              {item.input.calculationType === 'pyramid' && t('calculator.pyramidTrading')}
                              {item.input.calculationType === 'compound' && t('calculator.compoundInterest')}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {new Date(item.createdAt).toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600">
                              资金: ${item.input.totalFunds} | 杠杆: {item.input.leverage}x
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleLoadFromHistory(item)}
                              className="btn btn-outline btn-sm"
                            >
                              加载
                            </button>
                            <button
                              onClick={() => deleteHistoryItem(item.id)}
                              className="btn btn-outline btn-sm text-red-600 hover:bg-red-50"
                            >
                              删除
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CalculatorPage