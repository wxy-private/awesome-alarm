<script setup lang="ts">
import {
  LineSeries,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type LineData,
  type UTCTimestamp,
} from 'lightweight-charts';
import { nextTick, onBeforeUnmount, onMounted, type ComponentPublicInstance } from 'vue';

type Tone = 'cyan' | 'magenta' | 'orange';

interface MonitorCard {
  name: string;
  appId: string;
  responseTime: number;
  tone: Tone;
  responseRate: number;
  accuracy: number;
  trend: number[];
}

const cards: MonitorCard[] = [
  {
    name: 'Payment Gateway',
    appId: 'APP-PRD-001',
    responseTime: 42,
    tone: 'cyan',
    responseRate: 99.9,
    accuracy: 98.5,
    trend: [25, 25, 20, 15, 15, 30, 20, 10, 5, 15, 25, 10, 5],
  },
  {
    name: 'User Auth Service',
    appId: 'APP-PRD-042',
    responseTime: 845,
    tone: 'magenta',
    responseRate: 85.0,
    accuracy: 91.2,
    trend: [15, 15, 25, 20, 15, 5, 10, 15, 25, 20, 15, 35, 30],
  },
  {
    name: 'Inventory DB',
    appId: 'APP-DB-011',
    responseTime: 12,
    tone: 'cyan',
    responseRate: 100,
    accuracy: 100,
    trend: [30, 30, 35, 30, 25, 30, 25, 20, 25, 20, 15, 10, 15],
  },
  {
    name: 'Recommendation Engine',
    appId: 'APP-ML-004',
    responseTime: 156,
    tone: 'cyan',
    responseRate: 96,
    accuracy: 95,
    trend: [20, 10, 25, 15, 5, 35, 20, 5, 25, 15, 5, 15, 10],
  },
  {
    name: 'Notification Service',
    appId: 'APP-MSG-088',
    responseTime: 512,
    tone: 'orange',
    responseRate: 60,
    accuracy: 75,
    trend: [5, 5, 10, 5, 5, 35, 38, 38, 35, 38, 38, 39, 39],
  },
  {
    name: 'CDN Edge Node US',
    appId: 'INF-CDN-001',
    responseTime: 8,
    tone: 'cyan',
    responseRate: 100,
    accuracy: 100,
    trend: [25, 22, 18, 15, 18, 22, 25, 28, 25, 22, 20, 22, 25],
  },
];

const chartRefs: Array<HTMLDivElement | null> = [];
const charts: IChartApi[] = [];
const seriesList: ISeriesApi<'Line'>[] = [];
const resizeObservers: ResizeObserver[] = [];

const setChartRef = (el: Element | ComponentPublicInstance | null, index: number) => {
  if (el && '$el' in el) {
    chartRefs[index] = (el.$el as HTMLDivElement) ?? null;
    return;
  }
  chartRefs[index] = el as HTMLDivElement | null;
};

const createLineData = (trend: number[]): LineData[] =>
  trend.map((value, i) => ({
    time: (1700000000 + i * 60) as UTCTimestamp,
    value,
  }));

const getLineColor = (tone: Tone) => {
  if (tone === 'magenta' || tone === 'orange') return '#FF4A9A';
  return '#00E5FF';
};

const initCharts = () => {
  cards.forEach((card, index) => {
    const container = chartRefs[index];
    if (!container) return;

    const chart = createChart(container, {
      width: container.clientWidth,
      height: 40,
      layout: {
        background: { color: 'transparent' },
        textColor: 'rgba(255,255,255,0.5)',
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      rightPriceScale: {
        visible: false,
        borderVisible: false,
      },
      leftPriceScale: {
        visible: false,
        borderVisible: false,
      },
      timeScale: {
        visible: false,
        borderVisible: false,
      },
      crosshair: {
        vertLine: { visible: false, labelVisible: false },
        horzLine: { visible: false, labelVisible: false },
      },
      handleScroll: false,
      handleScale: false,
    });

    const series = chart.addSeries(LineSeries, {
      color: getLineColor(card.tone),
      lineWidth: 2,
      lineType: 2,
      lastValueVisible: false,
      priceLineVisible: false,
    });

    series.setData(createLineData(card.trend));
    chart.timeScale().fitContent();

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      chart.applyOptions({ width: entry.contentRect.width });
    });

    observer.observe(container);
    resizeObservers.push(observer);
    charts.push(chart);
    seriesList.push(series);
  });
};

onMounted(async () => {
  await nextTick();
  initCharts();
});

onBeforeUnmount(() => {
  resizeObservers.forEach((observer) => observer.disconnect());
  charts.forEach((chart) => chart.remove());
  charts.length = 0;
  seriesList.length = 0;
});
</script>

<template>
  <div class="monitor-page min-h-screen text-white">
    <div class="ambient-glow pointer-events-none fixed inset-0 overflow-hidden">
      <div class="glow-tl" />
    </div>

    <div class="relative z-10 mx-auto flex w-full max-w-[600px] flex-col gap-4 px-4 pb-8">
      <header class="header sticky top-0 z-20 flex items-end justify-between pb-4 pt-6">
        <h1 class="text-[24px] font-semibold leading-none tracking-[-0.5px]">Monitor</h1>
        <div class="flex gap-3 text-[13px] text-white/50">
          <div class="flex items-center gap-1"><span class="dot dot-cyan" />18 正常</div>
          <div class="flex items-center gap-1"><span class="dot dot-orange pulse-orange" />1 警戒</div>
          <div class="flex items-center gap-1"><span class="dot dot-magenta pulse-magenta" />2 严重</div>
        </div>
      </header>

      <section
        v-for="(card, index) in cards"
        :key="card.appId"
        class="card"
      >
        <div class="flex items-start justify-between">
          <div class="min-w-0">
            <div class="app-name">
              <span
                class="dot"
                :class="
                  card.tone === 'magenta'
                    ? 'dot-magenta'
                    : card.tone === 'orange'
                      ? 'dot-orange'
                      : 'dot-cyan'
                "
              />
              <span class="truncate">{{ card.name }}</span>
            </div>
            <div class="app-id">{{ card.appId }}</div>
          </div>

          <div class="shrink-0 text-right">
            <div
              class="rt-value"
              :class="card.tone === 'magenta' || card.tone === 'orange' ? 'text-[#FF4081]' : 'text-[#00E5FF]'"
            >
              {{ card.responseTime }}
            </div>
            <div class="rt-label">响应时间 (ms)</div>
          </div>
        </div>

        <div>
          <div class="section-label">交易量 (1小时)</div>
          <div class="relative h-10 w-full">
            <div :ref="(el) => setChartRef(el, index)" class="h-full w-full" />
            <div
              class="pointer-events-none absolute inset-x-0 bottom-0 h-8"
              :class="
                card.tone === 'magenta' || card.tone === 'orange'
                  ? 'bg-gradient-to-t from-[#ff408133] to-transparent'
                  : 'bg-gradient-to-t from-[#00e5ff33] to-transparent'
              "
            />
          </div>
        </div>

        <div class="donuts-section">
          <div class="donut-item">
            <div
              class="donut-ring"
              :style="{
                background: `conic-gradient(${card.tone === 'magenta' || card.tone === 'orange' ? '#FF4081' : '#00E5FF'} ${card.responseRate * 3.6}deg, rgba(255,255,255,0.06) ${card.responseRate * 3.6}deg)`
              }"
            >
              <div class="donut-inner" />
            </div>
            <div>
              <div
                class="donut-value"
                :class="card.tone === 'magenta' || card.tone === 'orange' ? 'text-[#FF4081]' : 'text-white'"
              >
                {{ Number.isInteger(card.responseRate) ? `${card.responseRate}%` : `${card.responseRate.toFixed(1)}%` }}
              </div>
              <div class="donut-title">响应率</div>
            </div>
          </div>

          <div class="donut-item">
            <div
              class="donut-ring"
              :style="{
                background: `conic-gradient(#00E5FF ${card.accuracy * 3.6}deg, rgba(255,255,255,0.06) ${card.accuracy * 3.6}deg)`
              }"
            >
              <div class="donut-inner" />
            </div>
            <div>
              <div class="donut-value text-white">
                {{ Number.isInteger(card.accuracy) ? `${card.accuracy}%` : `${card.accuracy.toFixed(1)}%` }}
              </div>
              <div class="donut-title">正确率</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.monitor-page {
  background-color: #020203;
}

.ambient-glow::before,
.ambient-glow::after,
.ambient-glow .glow-tl {
  content: '';
  position: absolute;
  border-radius: 50%;
}

.ambient-glow::before {
  width: 80vw;
  height: 80vw;
  top: -20vh;
  left: -20vw;
  filter: blur(100px);
  opacity: 0.25;
  background: radial-gradient(circle, #00e5ff, transparent 70%);
}

.ambient-glow::after {
  width: 60vw;
  height: 60vw;
  right: -10vw;
  bottom: -10vh;
  filter: blur(100px);
  opacity: 0.2;
  background: radial-gradient(circle, #ff4081, transparent 70%);
}

.ambient-glow .glow-tl {
  width: 40vw;
  height: 40vw;
  top: 5vh;
  left: 5vw;
  filter: blur(80px);
  background: radial-gradient(circle, rgba(255, 255, 255, 0.15), transparent 70%);
}

.header {
  background: linear-gradient(180deg, rgba(2, 2, 3, 0.9) 0%, rgba(2, 2, 3, 0.7) 60%, rgba(2, 2, 3, 0) 100%);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.card {
  max-height: 25vh;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow: hidden;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.08);
  padding: 16px;
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1), 0 4px 30px rgba(0, 0, 0, 0.3);
}

.app-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.3px;
}

.app-id {
  margin-top: 4px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 0.5px;
}

.rt-value {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 24px;
  font-weight: 300;
  letter-spacing: -1px;
  line-height: 1;
}

.rt-label {
  margin-top: 4px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.section-label {
  margin-bottom: 4px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.donuts-section {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.03);
  padding-top: 8px;
}

.donut-item {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.donut-ring {
  position: relative;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 9999px;
}

.donut-inner {
  position: absolute;
  inset: 4px;
  border-radius: 9999px;
  background: #111217;
}

.donut-value {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.1;
}

.donut-title {
  margin-top: 2px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  flex-shrink: 0;
}

.dot-cyan {
  background: #00e5ff;
  box-shadow: 0 0 8px #00e5ff;
}

.dot-magenta {
  background: #ff4081;
  box-shadow: 0 0 8px #ff4081;
}

.dot-orange {
  background: #ff9100;
  box-shadow: 0 0 8px #ff9100;
}

.pulse-magenta {
  animation: pulse-magenta 2s infinite;
}

.pulse-orange {
  animation: pulse-orange 2s infinite;
}

@keyframes pulse-magenta {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 64, 129, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(255, 64, 129, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 64, 129, 0);
  }
}

@keyframes pulse-orange {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 145, 0, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(255, 145, 0, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 145, 0, 0);
  }
}

@media (max-width: 375px) {
  .card {
    max-height: none;
  }

  .app-name {
    font-size: 15px;
  }

  .rt-value {
    font-size: 22px;
  }
}
</style>
