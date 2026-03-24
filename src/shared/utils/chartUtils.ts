import React from 'react';

interface ChartPoint {
  label: string;
  views: number;
  earned: number;
}

interface RawChartData {
  label: string;
  views: number;
  earned: number;
}

const DAY_NAMES = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'];

function interpolate(data: RawChartData[], count: number): { views: number; earned: number }[] {
  if (data.length === 0) return Array(count).fill({ views: 0, earned: 0 });
  if (data.length === 1) return Array(count).fill({ views: data[0].views, earned: data[0].earned });

  const result: { views: number; earned: number }[] = [];
  for (let i = 0; i < count; i++) {
    const t = (i / (count - 1)) * (data.length - 1);
    const low = Math.floor(t);
    const high = Math.min(low + 1, data.length - 1);
    const frac = t - low;
    result.push({
      views: Math.round(data[low].views + (data[high].views - data[low].views) * frac),
      earned: Math.round(data[low].earned + (data[high].earned - data[low].earned) * frac),
    });
  }
  return result;
}

export function renderAmount(value: string, mainClass = 'text-white', suffixColor = '#ffffff'): React.ReactNode {
  const m = value.match(/^(\$?-?[\d.,]+)([KM])(.*)$/);
  if (m) {
    return React.createElement(
      React.Fragment,
      null,
      React.createElement('span', { className: mainClass }, m[1]),
      React.createElement('span', { style: { color: suffixColor } }, m[2]),
      m[3] ? React.createElement('span', { className: mainClass }, m[3]) : null,
    );
  }
  return React.createElement('span', { className: mainClass }, value);
}

export function generateChartData(rawData: RawChartData[], period: string): ChartPoint[] {
  const now = new Date();

  if (period === '7j') {
    const points = interpolate(rawData, 7);
    return points.map((p, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      const label = i === 6 ? "Auj." : DAY_NAMES[d.getDay()] + ' ' + d.getDate();
      return { label, views: p.views, earned: p.earned };
    });
  }

  if (period === '1m') {
    const points = interpolate(rawData, 4);
    return points.map((p, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (3 - i) * 7);
      const label = i === 3 ? "Auj." : d.getDate() + ' ' + MONTH_NAMES[d.getMonth()];
      return { label, views: p.views, earned: p.earned };
    });
  }

  if (period === '3m') {
    const points = interpolate(rawData, 3);
    return points.map((p, i) => {
      const d = new Date(now);
      d.setMonth(d.getMonth() - (2 - i));
      const label = i === 2 ? MONTH_NAMES[now.getMonth()] : MONTH_NAMES[d.getMonth()];
      return { label, views: p.views, earned: p.earned };
    });
  }

  const points = interpolate(rawData, 6);
  return points.map((p, i) => {
    const d = new Date(now);
    d.setMonth(d.getMonth() - (5 - i));
    const label = i === 5 ? MONTH_NAMES[now.getMonth()] : MONTH_NAMES[d.getMonth()];
    return { label, views: p.views, earned: p.earned };
  });
}
