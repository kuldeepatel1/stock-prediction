import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Star, StarOff } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import StockChart from '../components/StockChart';
import PredictionCard from '../components/PredictionCard';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  ResponsiveContainer as SmallResponsive,
  LineChart as SmallLineChart,
  Line as SmallLine,
  XAxis as SmallXAxis,
  YAxis as SmallYAxis,
  CartesianGrid as SmallGrid,
  Tooltip as SmallTooltip,
  ComposedChart,
  Area,
} from 'recharts';
import {
  fetchCompanies,
  fetchHistoricalData,
  fetchPrediction,
  fetchCurrentPrice
} from '../services/api';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [selectedTicker, setSelectedTicker] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const chartSectionRef = useRef(null);

  /* ------------------ Load Companies ------------------ */
  const { data: companies, isLoading: companiesLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: fetchCompanies
  });

  /* ------------------ Load Favorites ------------------ */
  useEffect(() => {
    const raw = localStorage.getItem('favorites');
    const arr = raw ? JSON.parse(raw) : [];
    setFavorites(Array.isArray(arr) ? arr : []);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  /* ------------------ Date Helpers ------------------ */
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 5);
    return maxDate.toISOString().split('T')[0];
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return 'Select Date';
    const date = new Date(dateStr + 'T00:00:00');
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    const shortYear = year.toString().slice(-2);
    return `${day.toString().padStart(2, '0')}-${(month + 1).toString().padStart(2, '0')}-${shortYear}`;
  };

  const adjustSelectedDate = (addDays = 0, addMonths = 0) => {
    const base = selectedDate
      ? new Date(selectedDate + 'T00:00:00')
      : (() => {
          const d = new Date();
          d.setDate(d.getDate() + 1);
          return d;
        })();

    if (addDays) base.setDate(base.getDate() + addDays);
    if (addMonths) base.setMonth(base.getMonth() + addMonths);

    setSelectedDate(base.toISOString().split('T')[0]);
  };

  /* ------------------ Favorite Companies ------------------ */
  const favoriteCompanies = useMemo(() => {
    if (!companies) return [];
    return companies.filter((c) => favorites.includes(c.ticker));
  }, [companies, favorites]);

  const selectedCompany = companies?.find(
    (c) => c.ticker === selectedTicker
  );

  /* ------------------ Toggle Favorite ------------------ */
  const toggleFavorite = (ticker) => {
    if (!ticker) return;
    const set = new Set(favorites);
    const isRemoving = set.has(ticker);
    if (isRemoving) set.delete(ticker);
    else set.add(ticker);
    const updated = Array.from(set);
    localStorage.setItem('favorites', JSON.stringify(updated));
    setFavorites(updated);
    if (isRemoving && selectedTicker === ticker) {
      setSelectedTicker('');
    }
  };

  /* ------------------ Parse Selected Date ------------------ */
  const parseSelectedDate = () => {
    if (!selectedDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return {
        year: tomorrow.getFullYear(),
        month: tomorrow.getMonth() + 1,
        day: tomorrow.getDate()
      };
    }
    const date = new Date(selectedDate + 'T00:00:00');
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate()
    };
  };

  const { year, month, day } = parseSelectedDate();

  /* ------------------ Prediction ------------------ */
  const {
    data: prediction,
    isLoading: predLoading,
    error: predError
  } = useQuery({
    queryKey: ['prediction', selectedTicker, year, month, day],
    queryFn: () =>
      fetchPrediction(selectedTicker, year, month, day),
    enabled: !!selectedTicker
  });

  /* ------------------ Fetch Current Price ------------------ */
  const {
    data: currentPriceData,
    isLoading: quoteLoading
  } = useQuery({
    queryKey: ['quote', selectedTicker],
    queryFn: () => fetchCurrentPrice(selectedTicker),
    enabled: !!selectedTicker
  });

  /* ------------------ Fetch Historical Data ------------------ */
  const {
    data: historicalData,
    isLoading: histLoading,
    error: histError
  } = useQuery({
    queryKey: ['historical', selectedTicker],
    queryFn: () => fetchHistoricalData(selectedTicker),
    enabled: !!selectedTicker
  });

  // Create merged prediction with current price
  const mergedPrediction = useMemo(() => {
    if (!prediction) return null;
    return {
      ...prediction,
      currentPrice: currentPriceData?.currentPrice ?? prediction.currentPrice
    };
  }, [prediction, currentPriceData]);

  // Helper to get numeric price from historical entry
  const getPrice = (d) => (d?.price ?? d?.close ?? d?.close_price ?? 0);

  /* ------------------ Indicator Calculations ------------------ */
  const indicators = useMemo(() => {
    const data = (historicalData ?? []).map((d) => ({ ts: new Date(d.date).getTime(), price: getPrice(d) }));
    if (!data || data.length === 0) return null;

    // SMA helper
    const sma = (period) => {
      const res = [];
      for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
          res.push({ ts: data[i].ts, value: null });
          continue;
        }
        let sum = 0;
        for (let j = i - period + 1; j <= i; j++) sum += data[j].price;
        res.push({ ts: data[i].ts, value: sum / period });
      }
      return res;
    };

    // Bollinger Bands (20, 2)
    const bbPeriod = 20;
    const bbMiddle = sma(bbPeriod);

    const bbUpper = [];
    const bbLower = [];

    for (let i = 0; i < data.length; i++) {
      if (i < bbPeriod - 1) {
        bbUpper.push(null);
        bbLower.push(null);
        continue;
      }

      const slice = data.slice(i - bbPeriod + 1, i + 1).map(d => d.price);
      const mean = bbMiddle[i]?.value ?? 0;

      const variance =
        slice.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / bbPeriod;

      const stdDev = Math.sqrt(variance || 0);

      bbUpper.push(mean + 2 * stdDev);
      bbLower.push(mean - 2 * stdDev);
    }

    // EMA helper
    const emaSeries = (period) => {
      const res = [];
      const k = 2 / (period + 1);
      let prevEma = data[0].price;
      for (let i = 0; i < data.length; i++) {
        const price = data[i].price;
        const ema = i === 0 ? price : price * k + prevEma * (1 - k);
        res.push({ ts: data[i].ts, value: ema });
        prevEma = ema;
      }
      return res;
    };

    // MACD (12/26) and signal(9)
    const ema12 = emaSeries(12).map((p) => p.value);
    const ema26 = emaSeries(26).map((p) => p.value);
    const macdLine = data.map((d, i) => ({ ts: d.ts, value: (ema12[i] ?? 0) - (ema26[i] ?? 0) }));
    // signal (9) on macdLine
    const signal = [];
    if (macdLine.length) {
      let prev = macdLine[0].value;
      const kSig = 2 / (9 + 1);
      for (let i = 0; i < macdLine.length; i++) {
        const v = i === 0 ? macdLine[i].value : macdLine[i].value * kSig + prev * (1 - kSig);
        signal.push({ ts: macdLine[i].ts, value: v });
        prev = v;
      }
    }

    // RSI (14)
    const rsiPeriod = 14;
    const rsi = [];
    let gains = 0,
      losses = 0;
    for (let i = 0; i < data.length; i++) {
      if (i === 0) {
        rsi.push({ ts: data[i].ts, value: null });
        continue;
      }
      const change = data[i].price - data[i - 1].price;
      const gain = Math.max(change, 0);
      const loss = Math.max(-change, 0);
      if (i <= rsiPeriod) {
        gains += gain;
        losses += loss;
        rsi.push({ ts: data[i].ts, value: i === rsiPeriod ? 100 - 100 / (1 + gains / losses || 1) : null });
        if (i === rsiPeriod) {
          gains = gains / rsiPeriod;
          losses = losses / rsiPeriod;
        }
        continue;
      }
      gains = (gains * (rsiPeriod - 1) + gain) / rsiPeriod;
      losses = (losses * (rsiPeriod - 1) + loss) / rsiPeriod;
      const rs = gains / (losses || 1);
      rsi.push({ ts: data[i].ts, value: 100 - 100 / (1 + rs) });
    }

    // ADX (14) simplified
    const adxPeriod = 14;
    const trs = [];
    const plusDM = [];
    const minusDM = [];
    for (let i = 0; i < data.length; i++) {
      if (i === 0) {
        trs.push(0);
        plusDM.push(0);
        minusDM.push(0);
        continue;
      }
      const high = data[i].price;
      const low = data[i].price;
      const prevHigh = data[i - 1].price;
      const prevLow = data[i - 1].price;
      const upMove = high - prevHigh;
      const downMove = prevLow - low;
      plusDM.push(upMove > downMove && upMove > 0 ? upMove : 0);
      minusDM.push(downMove > upMove && downMove > 0 ? downMove : 0);
      const tr = Math.max(Math.abs(high - prevHigh), Math.abs(low - prevLow), Math.abs(high - low));
      trs.push(tr);
    }

    // smooth TR, +DM, -DM using Wilder's smoothing
    const smoothTR = [];
    const smoothPlus = [];
    const smoothMinus = [];
    let trSum = 0,
      plusSum = 0,
      minusSum = 0;
    for (let i = 0; i < data.length; i++) {
      if (i < adxPeriod) {
        trSum += trs[i];
        plusSum += plusDM[i];
        minusSum += minusDM[i];
        smoothTR.push(0);
        smoothPlus.push(0);
        smoothMinus.push(0);
        continue;
      }
      if (i === adxPeriod) {
        trSum += trs[i];
        plusSum += plusDM[i];
        minusSum += minusDM[i];
        smoothTR.push(trSum);
        smoothPlus.push(plusSum);
        smoothMinus.push(minusSum);
        continue;
      }
      const prevTR = smoothTR[smoothTR.length - 1];
      const prevPlus = smoothPlus[smoothPlus.length - 1];
      const prevMinus = smoothMinus[smoothMinus.length - 1];
      const newTR = prevTR - prevTR / adxPeriod + trs[i];
      const newPlus = prevPlus - prevPlus / adxPeriod + plusDM[i];
      const newMinus = prevMinus - prevMinus / adxPeriod + minusDM[i];
      smoothTR.push(newTR);
      smoothPlus.push(newPlus);
      smoothMinus.push(newMinus);
    }

    const plusDI = [];
    const minusDI = [];
    for (let i = 0; i < data.length; i++) {
      const tr = smoothTR[i] || 0;
      if (tr === 0) {
        plusDI.push({ ts: data[i].ts, value: null });
        minusDI.push({ ts: data[i].ts, value: null });
        continue;
      }
      const pdi = (smoothPlus[i] / tr) * 100 || 0;
      const mdi = (smoothMinus[i] / tr) * 100 || 0;
      plusDI.push({ ts: data[i].ts, value: pdi });
      minusDI.push({ ts: data[i].ts, value: mdi });
    }

    const dx = [];
    for (let i = 0; i < data.length; i++) {
      const p = plusDI[i].value ?? 0;
      const m = minusDI[i].value ?? 0;
      const val = (Math.abs(p - m) / ((p + m) || 1)) * 100;
      dx.push(val);
    }

    const adx = [];
    let adxPrev = 0;
    for (let i = 0; i < data.length; i++) {
      if (i < adxPeriod * 2) {
        adx.push({ ts: data[i].ts, value: null });
        adxPrev += dx[i] || 0;
        continue;
      }
      if (i === adxPeriod * 2) {
        adxPrev = adxPrev / adxPeriod;
        adx.push({ ts: data[i].ts, value: adxPrev });
        continue;
      }
      adxPrev = (adxPrev * (adxPeriod - 1) + dx[i]) / adxPeriod;
      adx.push({ ts: data[i].ts, value: adxPrev });
    }

    // Prepare merged series for charts
    const merged = data.map((d, i) => ({
      ts: d.ts,
      date: d.ts,
      close: d.price,
      sma20: sma(20)[i]?.value ?? null,
      upper: bbUpper[i],
      middle: bbMiddle[i]?.value ?? null,
      lower: bbLower[i],
      macd: macdLine[i]?.value ?? 0,
      macdSignal: signal[i]?.value ?? 0,
      rsi: rsi[i]?.value ?? null,
      adx: adx[i]?.value ?? null,
    }));

    return { merged };
  }, [historicalData]);

  // Calculate min and max dates for indicators charts
  const minDate = indicators ? Math.min(...indicators.merged.map(d => d.date)) : 0;
  const maxDate = indicators ? Math.max(...indicators.merged.map(d => d.date)) : 0;

  // Scroll to chart section when a stock is selected
  useEffect(() => {
    if (selectedTicker && chartSectionRef.current) {
      chartSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedTicker]);

  if (companiesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Favorites</h1>
        <Link to="/dashboard" className="text-blue-600 text-sm">
          Back to Dashboard
        </Link>
      </div>

      {favorites.length === 0 ? (
        <div className="bg-white p-6 rounded-xl text-center border">
          <p>No favorites yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div ref={chartSectionRef} className="lg:col-span-2 bg-white p-6 rounded-xl border">
            {!selectedTicker ? (
              <div className="h-64 flex items-center justify-center text-gray-600">
                Click a favorite on the right to view chart & prediction.
              </div>
            ) : (
              <>
                <div className="flex justify-between mb-4">
                  <div>
                    <h2 className="font-semibold text-lg">
                      {selectedCompany?.name}{' '}
                      <span className="text-gray-500">({selectedCompany?.ticker})</span>
                    </h2>
                  </div>

                  <div className="flex gap-3">
                    <input
                      type="date"
                      min={getMinDate()}
                      max={getMaxDate()}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="border rounded-lg p-2 text-sm"
                    />
                    <button onClick={() => selectedTicker && toggleFavorite(selectedTicker)}>
                      {favorites.includes(selectedTicker) ? (
                        <Star className="text-yellow-500" />
                      ) : (
                        <StarOff />
                      )}
                    </button>
                  </div>
                </div>

                {histLoading ? (
                  <div className="h-64 flex items-center justify-center">
                    <LoadingSpinner />
                  </div>
                ) : histError ? (
                  <p className="text-red-600">Error loading chart data.</p>
                ) : (
                  <StockChart
                    data={historicalData ?? []}
                    prediction={mergedPrediction}
                  />
                )}

                {/* Technical indicators - 2x2 grid */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {indicators && (
                    <>
                      <div className="bg-white p-3 rounded border">
                        <div className="text-sm font-medium mb-2">Moving Average (SMA 20)</div>
                        <div className="h-28">
                          <SmallResponsive width="100%" height="100%">
                            <SmallLineChart data={indicators.merged} margin={{ top: 6, right: 8, left: 8, bottom: 6 }}>
                              <SmallGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                              <SmallXAxis dataKey="date" type="number" domain={[minDate, maxDate]} tickFormatter={(t)=> new Date(t).toLocaleDateString('en-IN',{month:'short'})} />
                              <SmallYAxis hide={true} />
                              <SmallTooltip formatter={(v)=>`₹${Number(v).toLocaleString('en-IN', {minimumFractionDigits:2})}`} labelFormatter={(l)=> new Date(l).toLocaleDateString()} />
                              <SmallLine type="linear" dataKey="close" stroke="#cbd5e1" dot={false} strokeWidth={1} />
                              <SmallLine type="linear" dataKey="sma20" stroke="#2563eb" dot={false} strokeWidth={2} />
                            </SmallLineChart>
                          </SmallResponsive>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded border">
                        <div className="text-sm font-medium mb-2">MACD (12,26,9)</div>
                        <div className="h-28">
                          <SmallResponsive width="100%" height="100%">
                            <SmallLineChart data={indicators.merged} margin={{ top: 6, right: 8, left: 8, bottom: 6 }}>
                              <SmallGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                              <SmallXAxis dataKey="date" type="number" domain={[minDate, maxDate]} tickFormatter={(t)=> new Date(t).toLocaleDateString('en-IN',{month:'short'})} />
                              <SmallYAxis hide={true} />
                              <SmallTooltip formatter={(v)=>Number(v).toFixed(2)} labelFormatter={(l)=> new Date(l).toLocaleDateString()} />
                              <SmallLine type="linear" dataKey="macd" stroke="#2563eb" dot={false} strokeWidth={2} />
                              <SmallLine type="linear" dataKey="macdSignal" stroke="#16a34a" dot={false} strokeWidth={1} />
                            </SmallLineChart>
                          </SmallResponsive>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded border">
                        <div className="text-sm font-medium mb-2">RSI (14)</div>
                        <div className="h-28">
                          <SmallResponsive width="100%" height="100%">
                            <SmallLineChart data={indicators.merged} margin={{ top: 6, right: 8, left: 8, bottom: 6 }}>
                              <SmallGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                              <SmallXAxis dataKey="date" type="number" domain={[minDate, maxDate]} tickFormatter={(t)=> new Date(t).toLocaleDateString('en-IN',{month:'short'})} />
                              <SmallYAxis domain={[0,100]} />
                              <SmallTooltip formatter={(v)=>Number(v).toFixed(2)} labelFormatter={(l)=> new Date(l).toLocaleDateString()} />
                              <SmallLine type="linear" dataKey="rsi" stroke="#f59e0b" dot={false} strokeWidth={2} />
                            </SmallLineChart>
                          </SmallResponsive>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded border">
                        <div className="text-sm font-medium mb-2">ADX (14)</div>
                        <div className="h-28">
                          <SmallResponsive width="100%" height="100%">
                            <SmallLineChart data={indicators.merged} margin={{ top: 6, right: 8, left: 8, bottom: 6 }}>
                              <SmallGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                              <SmallXAxis dataKey="date" type="number" domain={[minDate, maxDate]} tickFormatter={(t)=> new Date(t).toLocaleDateString('en-IN',{month:'short'})} />
                              <SmallYAxis hide={true} />
                              <SmallTooltip formatter={(v)=>v ? Number(v).toFixed(2) : '—'} labelFormatter={(l)=> new Date(l).toLocaleDateString()} />
                              <SmallLine type="linear" dataKey="adx" stroke="#7c3aed" dot={false} strokeWidth={2} />
                            </SmallLineChart>
                          </SmallResponsive>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Bollinger Bands Chart */}
                {indicators && (
                  <div className="mt-6 bg-white p-4 rounded-xl border">
                    <h4 className="text-sm font-semibold mb-2">
                      Bollinger Bands (20, 2)
                    </h4>
                    <div className="h-40">
                      <SmallResponsive width="100%" height="100%">
                        <ComposedChart data={indicators.merged} margin={{ top: 6, right: 8, left: 8, bottom: 6 }}>
                          <SmallGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                          <SmallXAxis dataKey="date" type="number" domain={[minDate, maxDate]} tickFormatter={(t) => new Date(t).toLocaleDateString('en-IN', { month: 'short' })} />
                          <SmallYAxis hide />
                          <SmallTooltip formatter={(v) => v ? `Rs ${Number(v).toLocaleString('en-IN')}` : '—'} labelFormatter={(l) => new Date(l).toLocaleDateString()} />
                          <Area type="monotone" dataKey="upper" stroke="none" fill="#fde68a" fillOpacity={0.4} />
                          <Area type="monotone" dataKey="lower" stroke="none" fill="#ffffff" fillOpacity={1} />
                          <SmallLine type="linear" dataKey="upper" stroke="#f59e0b" dot={false} strokeDasharray="5 5" />
                          <SmallLine type="linear" dataKey="middle" stroke="#2563eb" dot={false} strokeWidth={2} />
                          <SmallLine type="linear" dataKey="lower" stroke="#f59e0b" dot={false} strokeDasharray="5 5" />
                          <SmallLine type="linear" dataKey="close" stroke="#111827" dot={false} strokeWidth={1.5} />
                        </ComposedChart>
                      </SmallResponsive>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Price near upper band = overbought • near lower band = oversold
                    </p>
                  </div>
                )}

                {/* Quick Select Buttons */}
                <div className="mt-6 bg-white p-4 rounded-xl border">
                  <h4 className="text-sm font-medium mb-3">Quick Select Prediction Date</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => adjustSelectedDate(1, 0)}
                      className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition"
                    >
                      Tomorrow
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustSelectedDate(7, 0)}
                      className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition"
                    >
                      +1 Week
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustSelectedDate(0, 1)}
                      className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition"
                    >
                      +1 Month
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Predicting for: <span className="font-medium text-gray-800">{formatDateDisplay(selectedDate)}</span>
                  </p>
                </div>

                {/* Prediction card */}
                {selectedCompany && (
                  <div className="mt-6">
                    <PredictionCard
                      company={selectedCompany}
                      year={year}
                      month={month}
                      day={day}
                      prediction={mergedPrediction}
                      isLoading={predLoading}
                      error={predError}
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="bg-white p-6 rounded-xl border self-start h-fit max-h-[70vh] overflow-y-auto">
            <h4 className="font-semibold mb-3">Your Favorites</h4>

            <div className="space-y-3">
              {favoriteCompanies.length === 0 ? (
                <p className="text-sm text-gray-500">No favorites added</p>
              ) : (
                favoriteCompanies.map((c) => (
                  <button
                    key={c.ticker}
                    onClick={() =>
                      setSelectedTicker((prev) =>
                        prev === c.ticker ? '' : c.ticker
                      )
                    }
                    aria-pressed={selectedTicker === c.ticker}
                    className={`w-full text-left p-3 rounded-lg border transition ${selectedTicker === c.ticker
                      ? 'bg-blue-50 border-blue-500'
                      : 'hover:bg-gray-50'
                      }`}
                  >
                    <p className="font-semibold">{c.ticker}</p>
                    <p className="text-sm text-gray-600">{c.name}</p>
                  </button>
                ))
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default Favorites;

