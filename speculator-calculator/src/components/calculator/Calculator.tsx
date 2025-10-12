"use client";
import { useState, useMemo } from 'react';
import Decimal from 'decimal.js';
import { useTranslations } from 'next-intl';

Decimal.set({ precision: 40, toExpNeg: -30, toExpPos: 100 });

type Side = 'long' | 'short';

function toD(x: string | number): Decimal {
  if (x === '' || x === undefined || x === null) return new Decimal(0);
  try { return new Decimal(x as unknown as Decimal.Value); } catch { return new Decimal(0); }
}

function round6(d: Decimal): string {
  return d.toDecimalPlaces(6, Decimal.ROUND_HALF_UP).toFixed(6);
}

export function Calculator() {
  const t = useTranslations('calculator');

  const [totalCapital, setTotalCapital] = useState<string>('10000');
  const [leverage, setLeverage] = useState<string>('10');
  const [side, setSide] = useState<Side>('long');
  const [entryPrice, setEntryPrice] = useState<string>('100');
  const [riskPercent, setRiskPercent] = useState<string>('1');
  const [feePercent, setFeePercent] = useState<string>('0.05');

  const [useRR, setUseRR] = useState<boolean>(true);
  const [stopPrice, setStopPrice] = useState<string>('');
  const [rr, setRr] = useState<string>('2'); // 1:x
  const [tpPrice, setTpPrice] = useState<string>('');

  const [profitTriggerPct, setProfitTriggerPct] = useState<string>('10'); // of capital
  const [addPercentOfCapital, setAddPercentOfCapital] = useState<string>('50');

  const [compoundRounds, setCompoundRounds] = useState<string>('10');
  const [compoundRoiPerRound, setCompoundRoiPerRound] = useState<string>('2');

  const base = useMemo(() => {
    const cap = toD(totalCapital);
    const lev = toD(leverage);
    const entry = toD(entryPrice);
    const riskPct = toD(riskPercent).div(100);
    const feePct = toD(feePercent).div(100);

    const marginRisk = cap.mul(riskPct); // max risk capital
    const positionNotional = marginRisk.mul(lev).abs();
    const direction = side === 'long' ? new Decimal(1) : new Decimal(-1);

    // Stop/TP logic
    let stop = toD(stopPrice);
    let tp = toD(tpPrice);

    if (useRR) {
      const rrX = toD(rr);
      // distance to stop in price terms based on margin risk and notional size
      // risk per unit move: notional / entry
      const perUnitPnl = positionNotional.div(entry);
      const maxLoss = marginRisk; // risk capital
      const unitMoveToStop = maxLoss.div(perUnitPnl); // price distance
      stop = entry.sub(unitMoveToStop.mul(direction));
      tp = entry.add(unitMoveToStop.mul(rrX).mul(direction));
    }

    // const priceMoveStop = entry.sub(stop).abs();
    // const priceMoveTp = tp.sub(entry).abs();

    const perUnitPnl = positionNotional.div(entry);
    const pnlAtStop = perUnitPnl.mul(stop.sub(entry));
    const pnlAtTp = perUnitPnl.mul(tp.sub(entry));

    const feesOpen = positionNotional.mul(feePct);
    const feesCloseStop = positionNotional.mul(feePct);
    const feesCloseTp = positionNotional.mul(feePct);

    return {
      stop,
      tp,
      marginUsed: marginRisk,
      feesOpen,
      feesCloseStop,
      feesCloseTp,
      pnlAtStop: pnlAtStop.sub(feesOpen).sub(feesCloseStop),
      pnlAtTp: pnlAtTp.sub(feesOpen).sub(feesCloseTp),
      notional: positionNotional,
      riskUsedPct: riskPct.mul(100),
    };
  }, [totalCapital, leverage, entryPrice, riskPercent, feePercent, side, stopPrice, rr, tpPrice, useRR]);

  const addon = useMemo(() => {
    const cap = toD(totalCapital);
    const entry = toD(entryPrice);
    const triggerProfitPct = toD(profitTriggerPct).div(100);
    const addPct = toD(addPercentOfCapital).div(100);

    const triggerProfit = cap.mul(triggerProfitPct);
    const addAmount = cap.mul(addPct);

    // Trigger when Unrealized PnL reaches triggerProfit: per unit pnl * price move = triggerProfit
    const perUnitPnl = base.notional.div(entry);
    const moveNeeded = triggerProfit.div(perUnitPnl);
    const direction = side === 'long' ? new Decimal(1) : new Decimal(-1);
    const triggerPrice = entry.add(moveNeeded.mul(direction));

    const addNotional = addAmount.mul(toD(leverage));
    const avgPrice = base.notional.mul(entry).add(addNotional.mul(triggerPrice)).div(base.notional.add(addNotional));
    const newNotional = base.notional.add(addNotional);

    // Recompute SL/TP around new avg price with same riskPct and rr
    const riskPct = toD(riskPercent).div(100);
    const maxLoss = toD(totalCapital).mul(riskPct);
    const perUnitPnlNew = newNotional.div(avgPrice);
    const unitMoveToStop = maxLoss.div(perUnitPnlNew);
    const stopAfter = avgPrice.sub(unitMoveToStop.mul(direction));
    const rrX = toD(rr);
    const tpAfter = avgPrice.add(unitMoveToStop.mul(rrX).mul(direction));

    return {
      triggerPrice,
      addNotional,
      addMargin: addAmount.mul(riskPct),
      avgPrice,
      newNotional,
      stopAfter,
      tpAfter,
      riskAfterPct: riskPct.mul(100),
    };
  }, [base, totalCapital, leverage, entryPrice, profitTriggerPct, addPercentOfCapital, side, riskPercent, rr]);

  const comp = useMemo(() => {
    const cap0 = toD(totalCapital);
    const rounds = toD(compoundRounds).toNumber();
    const roi = toD(compoundRoiPerRound).div(100);
    const rows: { round: number; capital: string }[] = [];
    let cur = cap0;
    for (let i = 1; i <= Math.max(0, rounds); i++) {
      cur = cur.mul(Decimal.add(1, roi));
      rows.push({ round: i, capital: round6(cur) });
    }
    return rows;
  }, [totalCapital, compoundRounds, compoundRoiPerRound]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="card p-4 space-y-4">
        <h3 className="font-semibold">{t('base')}</h3>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm col-span-1">{t('totalCapital')}</label>
          <input className="col-span-1 bg-transparent border rounded px-2 py-1" value={totalCapital} onChange={e=>setTotalCapital(e.target.value)} />

          <label className="text-sm">{t('leverage')}</label>
          <input className="bg-transparent border rounded px-2 py-1" value={leverage} onChange={e=>setLeverage(e.target.value)} />

          <label className="text-sm">{t('side')}</label>
          <select className="bg-transparent border rounded px-2 py-1" value={side} onChange={e=>setSide(e.target.value as Side)}>
            <option value="long">{t('long')}</option>
            <option value="short">{t('short')}</option>
          </select>

          <label className="text-sm">{t('entryPrice')}</label>
          <input className="bg-transparent border rounded px-2 py-1" value={entryPrice} onChange={e=>setEntryPrice(e.target.value)} />

          <label className="text-sm">{t('riskPercent')}</label>
          <input className="bg-transparent border rounded px-2 py-1" value={riskPercent} onChange={e=>setRiskPercent(e.target.value)} />

          <label className="text-sm">{t('feePercent')}</label>
          <input className="bg-transparent border rounded px-2 py-1" value={feePercent} onChange={e=>setFeePercent(e.target.value)} />

          <label className="text-sm">{t('mode')}</label>
          <select className="bg-transparent border rounded px-2 py-1" value={useRR ? 'rr':'sl'} onChange={e=>setUseRR(e.target.value==='rr')}>
            <option value="rr">{t('rr')}</option>
            <option value="sl">{t('stopPrice')}</option>
          </select>

          {useRR ? (
            <>
              <label className="text-sm">{t('rr')}</label>
              <input className="bg-transparent border rounded px-2 py-1" value={rr} onChange={e=>setRr(e.target.value)} />
              <label className="text-sm">{t('tpPrice')}</label>
              <input className="bg-transparent border rounded px-2 py-1" value={tpPrice} onChange={e=>setTpPrice(e.target.value)} />
            </>
          ) : (
            <>
              <label className="text-sm">{t('stopPrice')}</label>
              <input className="bg-transparent border rounded px-2 py-1" value={stopPrice} onChange={e=>setStopPrice(e.target.value)} />
            </>
          )}
        </div>
      </div>

      <div className="card p-4 space-y-4">
        <h3 className="font-semibold">{t('addOnCalc')}</h3>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">{t('profitTrigger')}</label>
          <input className="bg-transparent border rounded px-2 py-1" value={profitTriggerPct} onChange={e=>setProfitTriggerPct(e.target.value)} />

          <label className="text-sm">{t('addPercent')}</label>
          <input className="bg-transparent border rounded px-2 py-1" value={addPercentOfCapital} onChange={e=>setAddPercentOfCapital(e.target.value)} />
        </div>
      </div>

      <div className="card p-4 space-y-4">
        <h3 className="font-semibold">{t('compoundCalc')}</h3>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">{t('rounds')}</label>
          <input className="bg-transparent border rounded px-2 py-1" value={compoundRounds} onChange={e=>setCompoundRounds(e.target.value)} />

          <label className="text-sm">{t('roiPerRound')}</label>
          <input className="bg-transparent border rounded px-2 py-1" value={compoundRoiPerRound} onChange={e=>setCompoundRoiPerRound(e.target.value)} />
        </div>
      </div>

      <div className="xl:col-span-3 card p-4 mt-2">
        <h3 className="font-semibold mb-3">{t('results')}</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="font-medium mb-2">{t('base')}</div>
            <div>{t('slPrice')}: {round6(base.stop)}</div>
            <div>{t('tpPriceOut')}: {round6(base.tp)}</div>
            <div>{t('marginUsed')}: {round6(base.marginUsed)}</div>
            <div>{t('fees')}: {round6(base.feesOpen.add(base.feesCloseTp))}</div>
            <div>{t('pnlClose')}: {round6(base.pnlAtTp)}</div>
            <div>{t('riskUsed')}: {round6(base.riskUsedPct)}%</div>
            <div>{t('notional')}: {round6(base.notional)}</div>
          </div>
          <div>
            <div className="font-medium mb-2">{t('addOnCalc')}</div>
            <div>{t('addTriggerPrice')}: {round6(addon.triggerPrice)}</div>
            <div>{t('avgEntryAfter')}: {round6(addon.avgPrice)}</div>
            <div>{t('addNotional')}: {round6(addon.addNotional)}</div>
            <div>{t('addMargin')}: {round6(addon.addMargin)}</div>
            <div>{t('slTpAfter')}: {round6(addon.stopAfter)} / {round6(addon.tpAfter)}</div>
            <div>{t('riskAfter')}: {round6(addon.riskAfterPct)}%</div>
            <div>{t('totalNotionalAfter')}: {round6(addon.newNotional)}</div>
          </div>
          <div>
            <div className="font-medium mb-2">{t('compoundCalc')}</div>
            <div className="grid grid-cols-2 gap-2">
              {comp.map(r => (
                <div key={r.round} className="contents">
                  <div>{t('round', {n: String(r.round)})}</div>
                  <div className="text-right">{r.capital}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
