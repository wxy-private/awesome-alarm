<script setup lang="ts">
import { createChart, type ISeriesApi, type UTCTimestamp, LineSeries } from 'lightweight-charts';
import { onBeforeUnmount, onMounted, ref } from 'vue';

const chartRef = ref<HTMLDivElement | null>(null);
let lineSeries: ISeriesApi<'Line'> | null = null;

const data = [
  { time: '2026-03-19', value: 102.4 },
  { time: '2026-03-20', value: 104.2 },
  { time: '2026-03-21', value: 103.8 },
  { time: '2026-03-22', value: 108.1 },
  { time: '2026-03-23', value: 110.6 },
  { time: '2026-03-24', value: 109.9 },
  { time: '2026-03-25', value: 112.7 },
];

const toTimestamp = (date: string): UTCTimestamp =>
  (Math.floor(new Date(date).getTime() / 1000) as UTCTimestamp);

onMounted(() => {
  if (!chartRef.value) return;

  const chart = createChart(chartRef.value, {
    layout: {
      background: { color: '#ffffff' },
      textColor: '#374151',
    },
    grid: {
      vertLines: { color: '#f1f5f9' },
      horzLines: { color: '#f1f5f9' },
    },
    width: chartRef.value.clientWidth,
    height: 280,
    timeScale: { borderColor: '#e2e8f0' },
    rightPriceScale: { borderColor: '#e2e8f0' },
  });

  lineSeries = chart.addSeries(LineSeries, {
    color: '#3b82f6',
    lineWidth: 2,
  });

  lineSeries!.setData(data.map((item) => ({ time: toTimestamp(item.time), value: item.value })));

  const resizeObserver = new ResizeObserver((entries) => {
    const entry = entries[0];
    if (!entry) return;
    const { width } = entry.contentRect;
    chart.applyOptions({ width });
  });

  resizeObserver.observe(chartRef.value);

  onBeforeUnmount(() => {
    resizeObserver.disconnect();
    chart.remove();
    lineSeries = null;
  });
});
</script>

<template>
  <div ref="chartRef" class="w-full rounded-xl border border-slate-200 bg-white p-3 shadow-sm" />
</template>
