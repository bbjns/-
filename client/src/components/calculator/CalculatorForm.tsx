import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCalculatorStore } from '../../stores/calculatorStore'
import { Calculator, AlertCircle } from 'lucide-react'

const CalculatorForm = () => {
  const { t } = useTranslation()
  const { input, setInput, calculate, isLoading, error } = useCalculatorStore()
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const validateInput = () => {
    const errors: Record<string, string> = {}

    if (!input.totalFunds || input.totalFunds <= 0) {
      errors.totalFunds = t('validation.required')
    }
    if (!input.leverage || input.leverage < 1 || input.leverage > 1000) {
      errors.leverage = t('validation.min') + ' 1, ' + t('validation.max') + ' 1000'
    }
    if (!input.entryPrice || input.entryPrice <= 0) {
      errors.entryPrice = t('validation.required')
    }
    if (!input.riskPercentage || input.riskPercentage <= 0 || input.riskPercentage > 100) {
      errors.riskPercentage = t('validation.min') + ' 0, ' + t('validation.max') + ' 100'
    }
    if (input.stopLossSettings.type === 'price' && (!input.stopLossSettings.stopLossPrice || input.stopLossSettings.stopLossPrice <= 0)) {
      errors.stopLossPrice = t('validation.required')
    }
    if (input.stopLossSettings.type === 'ratio' && (!input.stopLossSettings.profitLossRatio || input.stopLossSettings.profitLossRatio <= 0)) {
      errors.profitLossRatio = t('validation.required')
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCalculate = async () => {
    if (validateInput()) {
      await calculate()
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setInput({ [field]: value })
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors({ ...validationErrors, [field]: '' })
    }
  }

  const handleStopLossTypeChange = (type: 'price' | 'ratio') => {
    setInput({
      stopLossSettings: {
        ...input.stopLossSettings,
        type,
        stopLossPrice: type === 'price' ? input.stopLossSettings.stopLossPrice : undefined,
        profitLossRatio: type === 'ratio' ? input.stopLossSettings.profitLossRatio : undefined
      }
    })
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center space-x-3">
            <Calculator className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">{t('calculator.title')}</h1>
              <p className="text-blue-100">{t('app.tagline')}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Inputs */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">{t('calculator.basicCalculation')}</h3>
              
              {/* Total Funds */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('calculator.inputs.totalFunds')}
                </label>
                <input
                  type="number"
                  value={input.totalFunds}
                  onChange={(e) => handleInputChange('totalFunds', parseFloat(e.target.value) || 0)}
                  className={`input w-full ${validationErrors.totalFunds ? 'border-red-500' : ''}`}
                  placeholder="10000"
                />
                {validationErrors.totalFunds && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.totalFunds}</p>
                )}
              </div>

              {/* Leverage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('calculator.inputs.leverage')}
                </label>
                <input
                  type="number"
                  value={input.leverage}
                  onChange={(e) => handleInputChange('leverage', parseFloat(e.target.value) || 0)}
                  className={`input w-full ${validationErrors.leverage ? 'border-red-500' : ''}`}
                  placeholder="10"
                  min="1"
                  max="1000"
                />
                {validationErrors.leverage && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.leverage}</p>
                )}
              </div>

              {/* Position Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('calculator.inputs.positionType')}
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="long"
                      checked={input.positionType === 'long'}
                      onChange={(e) => handleInputChange('positionType', e.target.value)}
                      className="mr-2"
                    />
                    {t('calculator.inputs.long')}
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="short"
                      checked={input.positionType === 'short'}
                      onChange={(e) => handleInputChange('positionType', e.target.value)}
                      className="mr-2"
                    />
                    {t('calculator.inputs.short')}
                  </label>
                </div>
              </div>

              {/* Entry Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('calculator.inputs.entryPrice')}
                </label>
                <input
                  type="number"
                  value={input.entryPrice}
                  onChange={(e) => handleInputChange('entryPrice', parseFloat(e.target.value) || 0)}
                  className={`input w-full ${validationErrors.entryPrice ? 'border-red-500' : ''}`}
                  placeholder="100"
                  step="0.000001"
                />
                {validationErrors.entryPrice && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.entryPrice}</p>
                )}
              </div>

              {/* Risk Percentage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('calculator.inputs.riskPercentage')}
                </label>
                <input
                  type="number"
                  value={input.riskPercentage}
                  onChange={(e) => handleInputChange('riskPercentage', parseFloat(e.target.value) || 0)}
                  className={`input w-full ${validationErrors.riskPercentage ? 'border-red-500' : ''}`}
                  placeholder="2"
                  min="0"
                  max="100"
                  step="0.01"
                />
                {validationErrors.riskPercentage && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.riskPercentage}</p>
                )}
              </div>

              {/* Fee Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('calculator.inputs.feeRate')}
                </label>
                <input
                  type="number"
                  value={input.feeRate}
                  onChange={(e) => handleInputChange('feeRate', parseFloat(e.target.value) || 0)}
                  className="input w-full"
                  placeholder="0.1"
                  min="0"
                  step="0.001"
                />
              </div>
            </div>

            {/* Advanced Inputs */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">{t('calculator.inputs.stopLossType')}</h3>
              
              {/* Stop Loss Type */}
              <div>
                <div className="flex space-x-4 mb-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="price"
                      checked={input.stopLossSettings.type === 'price'}
                      onChange={(e) => handleStopLossTypeChange(e.target.value as 'price')}
                      className="mr-2"
                    />
                    {t('calculator.inputs.stopLossPrice')}
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="ratio"
                      checked={input.stopLossSettings.type === 'ratio'}
                      onChange={(e) => handleStopLossTypeChange(e.target.value as 'ratio')}
                      className="mr-2"
                    />
                    {t('calculator.inputs.profitLossRatio')}
                  </label>
                </div>

                {input.stopLossSettings.type === 'price' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('calculator.inputs.stopLossPrice')}
                    </label>
                    <input
                      type="number"
                      value={input.stopLossSettings.stopLossPrice || ''}
                      onChange={(e) => handleInputChange('stopLossSettings', {
                        ...input.stopLossSettings,
                        stopLossPrice: parseFloat(e.target.value) || undefined
                      })}
                      className={`input w-full ${validationErrors.stopLossPrice ? 'border-red-500' : ''}`}
                      placeholder="95"
                      step="0.000001"
                    />
                    {validationErrors.stopLossPrice && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.stopLossPrice}</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('calculator.inputs.profitLossRatio')}
                    </label>
                    <input
                      type="number"
                      value={input.stopLossSettings.profitLossRatio || ''}
                      onChange={(e) => handleInputChange('stopLossSettings', {
                        ...input.stopLossSettings,
                        profitLossRatio: parseFloat(e.target.value) || undefined
                      })}
                      className={`input w-full ${validationErrors.profitLossRatio ? 'border-red-500' : ''}`}
                      placeholder="2"
                      min="0"
                      step="0.1"
                    />
                    {validationErrors.profitLossRatio && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.profitLossRatio}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Pyramid Trading Settings */}
              {input.calculationType === 'pyramid' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">{t('calculator.pyramidTrading')}</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('calculator.inputs.pyramidTrigger')}
                    </label>
                    <input
                      type="number"
                      value={input.pyramidSettings?.profitTriggerPercentage || 0}
                      onChange={(e) => handleInputChange('pyramidSettings', {
                        ...input.pyramidSettings,
                        profitTriggerPercentage: parseFloat(e.target.value) || 0
                      })}
                      className="input w-full"
                      placeholder="10"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('calculator.inputs.pyramidPercentage')}
                    </label>
                    <input
                      type="number"
                      value={input.pyramidSettings?.pyramidPercentage || 0}
                      onChange={(e) => handleInputChange('pyramidSettings', {
                        ...input.pyramidSettings,
                        pyramidPercentage: parseFloat(e.target.value) || 0
                      })}
                      className="input w-full"
                      placeholder="50"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                </div>
              )}

              {/* Compound Interest Settings */}
              {input.calculationType === 'compound' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">{t('calculator.compoundInterest')}</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('calculator.inputs.compoundRounds')}
                    </label>
                    <input
                      type="number"
                      value={input.compoundSettings?.rounds || 0}
                      onChange={(e) => handleInputChange('compoundSettings', {
                        ...input.compoundSettings,
                        rounds: parseInt(e.target.value) || 0
                      })}
                      className="input w-full"
                      placeholder="5"
                      min="1"
                      max="50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('calculator.inputs.compoundProfit')}
                    </label>
                    <input
                      type="number"
                      value={input.compoundSettings?.profitPercentage || 0}
                      onChange={(e) => handleInputChange('compoundSettings', {
                        ...input.compoundSettings,
                        profitPercentage: parseFloat(e.target.value) || 0
                      })}
                      className="input w-full"
                      placeholder="10"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Calculate Button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleCalculate}
              disabled={isLoading}
              className="btn btn-primary btn-lg px-8 py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>{t('common.loading')}</span>
                </div>
              ) : (
                t('calculator.calculate')
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CalculatorForm