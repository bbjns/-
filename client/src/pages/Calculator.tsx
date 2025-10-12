import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calculator as CalcUtils } from '../utils/calculator';
import './Calculator.css';

const Calculator: React.FC = () => {
  const { t } = useTranslation();

  // Form state
  const [accountBalance, setAccountBalance] = useState<number>(10000);
  const [leverage, setLeverage] = useState<number>(10);
  const [isLong, setIsLong] = useState<boolean>(true);
  const [entryPrice, setEntryPrice] = useState<number>(50000);
  const [riskRatio, setRiskRatio] = useState<number>(2);
  const [feeRate, setFeeRate] = useState<number>(0.05);
  const [useStopLoss, setUseStopLoss] = useState<boolean>(true);
  const [stopLoss, setStopLoss] = useState<number>(49000);
  const [riskRewardRatio, setRiskRewardRatio] = useState<number>(2);

  // Floating profit state
  const [enableFloatingProfit, setEnableFloatingProfit] = useState<boolean>(false);
  const [profitThreshold, setProfitThreshold] = useState<number>(10);
  const [additionRatio, setAdditionRatio] = useState<number>(50);

  // Compound interest state
  const [enableCompound, setEnableCompound] = useState<boolean>(false);
  const [compoundRounds, setCompoundRounds] = useState<number>(5);
  const [profitPerRound, setProfitPerRound] = useState<number>(10);

  // Results
  const [basicResult, setBasicResult] = useState<any>(null);
  const [floatingResult, setFloatingResult] = useState<any>(null);
  const [compoundResult, setCompoundResult] = useState<any[]>([]);

  const handleCalculate = () => {
    try {
      // Basic calculation
      const basic = CalcUtils.calculateBasic({
        accountBalance,
        leverage,
        isLong,
        entryPrice,
        riskRatio,
        feeRate,
        stopLoss: useStopLoss ? stopLoss : undefined,
        riskRewardRatio: !useStopLoss ? riskRewardRatio : undefined
      });
      setBasicResult(basic);

      // Floating profit calculation
      if (enableFloatingProfit) {
        const floating = CalcUtils.calculateFloatingProfit({
          accountBalance,
          leverage,
          isLong,
          entryPrice,
          profitThreshold,
          additionRatio,
          basicResult: basic
        });
        setFloatingResult(floating);
      } else {
        setFloatingResult(null);
      }

      // Compound interest calculation
      if (enableCompound) {
        const compound = CalcUtils.calculateCompound({
          initialCapital: accountBalance,
          profitRate: profitPerRound,
          rounds: compoundRounds
        });
        setCompoundResult(compound);
      } else {
        setCompoundResult([]);
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleReset = () => {
    setAccountBalance(10000);
    setLeverage(10);
    setIsLong(true);
    setEntryPrice(50000);
    setRiskRatio(2);
    setFeeRate(0.05);
    setUseStopLoss(true);
    setStopLoss(49000);
    setRiskRewardRatio(2);
    setEnableFloatingProfit(false);
    setProfitThreshold(10);
    setAdditionRatio(50);
    setEnableCompound(false);
    setCompoundRounds(5);
    setProfitPerRound(10);
    setBasicResult(null);
    setFloatingResult(null);
    setCompoundResult([]);
  };

  return (
    <div className="container calculator-page">
      <div className="calculator-grid">
        {/* Input Section */}
        <div className="calculator-inputs">
          <div className="card">
            <h2>{t('app.calculator')}</h2>

            <div className="input-group">
              <label>{t('calculator.accountBalance')}</label>
              <input
                type="number"
                value={accountBalance}
                onChange={(e) => setAccountBalance(Number(e.target.value))}
                step="100"
              />
            </div>

            <div className="grid grid-2">
              <div className="input-group">
                <label>{t('calculator.leverage')}</label>
                <input
                  type="number"
                  value={leverage}
                  onChange={(e) => setLeverage(Number(e.target.value))}
                  min="1"
                  max="125"
                />
              </div>

              <div className="input-group">
                <label>{t('calculator.direction')}</label>
                <select value={isLong ? 'long' : 'short'} onChange={(e) => setIsLong(e.target.value === 'long')}>
                  <option value="long">{t('calculator.long')}</option>
                  <option value="short">{t('calculator.short')}</option>
                </select>
              </div>
            </div>

            <div className="input-group">
              <label>{t('calculator.entryPrice')}</label>
              <input
                type="number"
                value={entryPrice}
                onChange={(e) => setEntryPrice(Number(e.target.value))}
                step="0.01"
              />
            </div>

            <div className="grid grid-2">
              <div className="input-group">
                <label>{t('calculator.riskRatio')} (%)</label>
                <input
                  type="number"
                  value={riskRatio}
                  onChange={(e) => setRiskRatio(Number(e.target.value))}
                  step="0.1"
                  min="0.1"
                  max="100"
                />
              </div>

              <div className="input-group">
                <label>{t('calculator.feeEstimate')} (%)</label>
                <input
                  type="number"
                  value={feeRate}
                  onChange={(e) => setFeeRate(Number(e.target.value))}
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div className="input-group">
              <div className="toggle-group">
                <label>
                  <input
                    type="radio"
                    checked={useStopLoss}
                    onChange={() => setUseStopLoss(true)}
                  />
                  {t('calculator.inputStopLoss')}
                </label>
                <label>
                  <input
                    type="radio"
                    checked={!useStopLoss}
                    onChange={() => setUseStopLoss(false)}
                  />
                  {t('calculator.inputRiskReward')}
                </label>
              </div>
            </div>

            {useStopLoss ? (
              <div className="input-group">
                <label>{t('calculator.stopLoss')}</label>
                <input
                  type="number"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(Number(e.target.value))}
                  step="0.01"
                />
              </div>
            ) : (
              <div className="input-group">
                <label>{t('calculator.riskRewardRatio')} (1:x)</label>
                <input
                  type="number"
                  value={riskRewardRatio}
                  onChange={(e) => setRiskRewardRatio(Number(e.target.value))}
                  step="0.1"
                  min="0.1"
                />
              </div>
            )}

            {/* Floating Profit Section */}
            <div className="section-divider">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={enableFloatingProfit}
                  onChange={(e) => setEnableFloatingProfit(e.target.checked)}
                />
                {t('calculator.floatingProfit')}
              </label>
            </div>

            {enableFloatingProfit && (
              <div className="grid grid-2">
                <div className="input-group">
                  <label>{t('calculator.profitThreshold')}</label>
                  <input
                    type="number"
                    value={profitThreshold}
                    onChange={(e) => setProfitThreshold(Number(e.target.value))}
                    step="1"
                  />
                </div>
                <div className="input-group">
                  <label>{t('calculator.additionRatio')}</label>
                  <input
                    type="number"
                    value={additionRatio}
                    onChange={(e) => setAdditionRatio(Number(e.target.value))}
                    step="1"
                  />
                </div>
              </div>
            )}

            {/* Compound Interest Section */}
            <div className="section-divider">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={enableCompound}
                  onChange={(e) => setEnableCompound(e.target.checked)}
                />
                {t('calculator.compoundInterest')}
              </label>
            </div>

            {enableCompound && (
              <div className="grid grid-2">
                <div className="input-group">
                  <label>{t('calculator.rounds')}</label>
                  <input
                    type="number"
                    value={compoundRounds}
                    onChange={(e) => setCompoundRounds(Number(e.target.value))}
                    min="1"
                    max="100"
                  />
                </div>
                <div className="input-group">
                  <label>{t('calculator.profitPerRound')}</label>
                  <input
                    type="number"
                    value={profitPerRound}
                    onChange={(e) => setProfitPerRound(Number(e.target.value))}
                    step="0.1"
                  />
                </div>
              </div>
            )}

            <div className="button-group">
              <button className="btn btn-primary" onClick={handleCalculate}>
                {t('calculator.calculate')}
              </button>
              <button className="btn btn-secondary" onClick={handleReset}>
                {t('calculator.reset')}
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="calculator-results">
          {basicResult && (
            <div className="card">
              <h3>{t('calculator.basicCalculation')}</h3>
              <div className="result-grid">
                <div className="result-item">
                  <span className="result-label">{t('calculator.stopLossPrice')}:</span>
                  <span className="result-value">{basicResult.stopLossPrice}</span>
                </div>
                <div className="result-item">
                  <span className="result-label">{t('calculator.takeProfitPrice')}:</span>
                  <span className="result-value">{basicResult.takeProfitPrice}</span>
                </div>
                <div className="result-item">
                  <span className="result-label">{t('calculator.usedMargin')}:</span>
                  <span className="result-value">{basicResult.usedMargin}</span>
                </div>
                <div className="result-item">
                  <span className="result-label">{t('calculator.fees')}:</span>
                  <span className="result-value">{basicResult.fees}</span>
                </div>
                <div className="result-item">
                  <span className="result-label">{t('calculator.profitLoss')}:</span>
                  <span className={`result-value ${basicResult.profitLoss >= 0 ? 'profit' : 'loss'}`}>
                    {basicResult.profitLoss}
                  </span>
                </div>
                <div className="result-item">
                  <span className="result-label">{t('calculator.riskPercentage')}:</span>
                  <span className="result-value">{basicResult.riskPercentage}%</span>
                </div>
                <div className="result-item">
                  <span className="result-label">{t('calculator.notionalValue')}:</span>
                  <span className="result-value">{basicResult.notionalValue}</span>
                </div>
              </div>
            </div>
          )}

          {floatingResult && (
            <div className="card">
              <h3>{t('calculator.floatingProfitCalculation')}</h3>
              <div className="result-grid">
                <div className="result-item">
                  <span className="result-label">{t('calculator.additionTriggerPrice')}:</span>
                  <span className="result-value">{floatingResult.additionTriggerPrice}</span>
                </div>
                <div className="result-item">
                  <span className="result-label">{t('calculator.newCostPrice')}:</span>
                  <span className="result-value">{floatingResult.newCostPrice}</span>
                </div>
                <div className="result-item">
                  <span className="result-label">{t('calculator.additionNotionalValue')}:</span>
                  <span className="result-value">{floatingResult.additionNotionalValue}</span>
                </div>
                <div className="result-item">
                  <span className="result-label">{t('calculator.additionMargin')}:</span>
                  <span className="result-value">{floatingResult.additionMargin}</span>
                </div>
                <div className="result-item">
                  <span className="result-label">{t('calculator.newStopLoss')}:</span>
                  <span className="result-value">{floatingResult.newStopLoss}</span>
                </div>
                <div className="result-item">
                  <span className="result-label">{t('calculator.newTakeProfit')}:</span>
                  <span className="result-value">{floatingResult.newTakeProfit}</span>
                </div>
                <div className="result-item">
                  <span className="result-label">{t('calculator.riskPercentage')}:</span>
                  <span className="result-value">{floatingResult.riskPercentage}%</span>
                </div>
                <div className="result-item">
                  <span className="result-label">{t('calculator.totalPositionValue')}:</span>
                  <span className="result-value">{floatingResult.totalPositionValue}</span>
                </div>
              </div>
            </div>
          )}

          {compoundResult.length > 0 && (
            <div className="card">
              <h3>{t('calculator.compoundCalculation')}</h3>
              <div className="compound-list">
                {compoundResult.map((item) => (
                  <div key={item.round} className="compound-item">
                    <span className="compound-round">{t('calculator.round', { round: item.round })}</span>
                    <span className="compound-value">{item.totalCapital}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calculator;
