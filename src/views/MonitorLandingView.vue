<script setup lang="ts">
import {
  AreaSeries,
  LineSeries,
  createChart,
  type AreaData,
  type IChartApi,
  type ISeriesApi,
  type LineData,
  type UTCTimestamp,
} from 'lightweight-charts';
import { nextTick, onBeforeUnmount, onMounted, type ComponentPublicInstance } from 'vue';

type Tone = 'cyan' | 'magenta';

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
    trend: [18, 19, 21, 22, 20, 18, 17, 19, 22, 24, 22, 20, 23, 27],
  },
  {
    name: 'User Auth Service',
    appId: 'APP-PRD-042',
    responseTime: 845,
    tone: 'magenta',
    responseRate: 85.0,
    accuracy: 91.2,
    trend: [24, 23, 21, 20, 21, 23, 25, 27, 25, 22, 20, 21, 18, 16],
  },
  {
    name: 'Inventory DB',
    appId: 'APP-DB-011',
    responseTime: 12,
    tone: 'cyan',
    responseRate: 100,
    accuracy: 100,
    trend: [17, 16, 16, 15, 16, 17, 18, 18, 19, 20, 20, 22, 23, 22],
  },
  {
    name: 'Recommendation Engine',
    appId: 'APP-ML-004',
    responseTime: 156,
    tone: 'cyan',
    responseRate: 96,
    accuracy: 95,
    trend: [18, 19, 20, 21, 22, 23, 22, 20, 19, 19, 20, 21, 22, 24],
  },
];

const chartRefs: Array<HTMLDivElement | null> = [];
const charts: IChartApi[] = [];
const lineSeriesList: ISeriesApi<'Line'>[] = [];
const areaSeriesList: ISeriesApi<'Area'>[] = [];
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

const createAreaData = (trend: number[]): AreaData[] =>
  trend.map((value, i) => ({
    time: (1700000000 + i * 60) as UTCTimestamp,
    value,
  }));

const getToneColor = (tone: Tone) => (tone === 'magenta' ? '#ff3ea8' : '#16d9ff');

const initCharts = () => {
  cards.forEach((card, index) => {
    const container = chartRefs[index];
    if (!container) return;

    const color = getToneColor(card.tone);

    const chart = createChart(container, {
      width: container.clientWidth,
      height: 48,
      layout: {
        background: { color: 'transparent' },
        textColor: 'rgba(255,255,255,0.45)',
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

    const area = chart.addSeries(AreaSeries, {
      topColor: `${color}2e`,
      bottomColor: 'transparent',
      lineColor: 'transparent',
      lineWidth: 1,
      lastValueVisible: false,
      priceLineVisible: false,
    });

    const line = chart.addSeries(LineSeries, {
      color,
      lineWidth: 3,
      lineType: 2,
      lastValueVisible: false,
      priceLineVisible: false,
    });

    const lineData = createLineData(card.trend);
    const areaData = createAreaData(card.trend);

    area.setData(areaData);
    line.setData(lineData);
    chart.timeScale().fitContent();

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      chart.applyOptions({ width: entry.contentRect.width });
    });

    observer.observe(container);
    resizeObservers.push(observer);
    charts.push(chart);
    areaSeriesList.push(area);
    lineSeriesList.push(line);
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
  lineSeriesList.length = 0;
  areaSeriesList.length = 0;
});
</script>

<template>
  <div class="monitor-page min-h-screen text-white">
    <div class="ambient pointer-events-none fixed inset-0">
      <div class="ambient-cyan" />
      <div class="ambient-magenta" />
      <div class="ambient-white" />
    </div>

    <div class="relative z-10 mx-auto w-full max-w-[420px] px-3.5 pb-6 pt-4">
      <header class="mb-3 flex items-end justify-between px-1">
        <h1 class="title">Monitor</h1>
        <div class="legend">
          <div class="legend-item"><span class="dot dot-cyan" />18 正常</div>
          <div class="legend-item"><span class="dot dot-orange" />1 警戒</div>
          <div class="legend-item"><span class="dot dot-magenta" />2 严重</div>
        </div>
      </header>

      <section
        v-for="(card, index) in cards"
        :key="card.appId"
        class="panel"
      >
        <div class="flex items-start justify-between">
          <div class="min-w-0">
            <div class="app-title">
              <span class="dot" :class="card.tone === 'magenta' ? 'dot-magenta' : 'dot-cyan'" />
              <span class="truncate">{{ card.name }}</span>
            </div>
            <div class="app-id">{{ card.appId }}</div>
          </div>

          <div class="text-right">
            <div class="latency" :class="card.tone === 'magenta' ? 'text-[#ff4aa8]' : 'text-[#22ddff]'">{{ card.responseTime }}</div>
            <div class="muted">响应时间 (MS)</div>
          </div>
        </div>

        <div class="mt-1.5">
          <div class="muted mb-1">交易量 (1小时)</div>
          <div class="relative h-12 w-full overflow-hidden rounded-md">
            <div :ref="(el) => setChartRef(el, index)" class="h-full w-full" />
          </div>
        </div>

        <div class="metrics">
          <div class="metric-item">
            <div
              class="halo-ring"
              :style="{
                '--ring-color': card.tone === 'magenta' ? '#ff4aa8' : '#16d9ff',
                '--ring-angle': `${card.responseRate * 3.6}deg`,
              }"
            >
              <div class="halo-core" />
            </div>
            <div>
              <div class="metric-value" :class="card.tone === 'magenta' ? 'text-[#ff6ab8]' : 'text-white'">
                {{ Number.isInteger(card.responseRate) ? `${card.responseRate}%` : `${card.responseRate.toFixed(1)}%` }}
              </div>
              <div class="muted">响应率</div>
            </div>
          </div>

          <div class="metric-item">
            <div
              class="halo-ring"
              :style="{
                '--ring-color': '#16d9ff',
                '--ring-angle': `${card.accuracy * 3.6}deg`,
              }"
            >
              <div class="halo-core" />
            </div>
            <div>
              <div class="metric-value text-white">
                {{ Number.isInteger(card.accuracy) ? `${card.accuracy}%` : `${card.accuracy.toFixed(1)}%` }}
              </div>
              <div class="muted">正确率</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.monitor-page {
  background:
    radial-gradient(circle at 88% 82%, rgba(255, 54, 156, 0.1), transparent 36%),
    radial-gradient(circle at 8% 8%, rgba(22, 217, 255, 0.12), transparent 42%),
    #040507;
}

.ambient > div {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
}

.ambient-cyan {
  width: 54vw;
  height: 54vw;
  top: -14vw;
  left: -18vw;
  background: rgba(0, 225, 255, 0.22);
}

.ambient-magenta {
  width: 45vw;
  height: 45vw;
  bottom: -10vw;
  right: -12vw;
  background: rgba(255, 64, 140, 0.2);
}

.ambient-white {
  width: 30vw;
  height: 30vw;
  top: 12vh;
  right: 6vw;
  background: rgba(255, 255, 255, 0.08);
}

.title {
  font-size: 24px;
  line-height: 1;
  font-weight: 700;
  letter-spacing: -0.3px;
}

.legend {
  display: flex;
  gap: 8px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.58);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.panel {
  margin-top: 10px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.04) 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.16),
    inset 0 -14px 28px rgba(0, 0, 0, 0.16),
    0 10px 22px rgba(0, 0, 0, 0.24);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  padding: 12px 12px 10px;
}

.app-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 18px;
  line-height: 1.2;
  font-weight: 600;
  letter-spacing: -0.2px;
}

.app-id,
.muted {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.47);
  letter-spacing: 0.2px;
}

.app-id {
  margin-top: 4px;
}

.latency {
  font-size: 28px;
  line-height: 0.95;
  font-weight: 600;
  letter-spacing: -0.3px;
}

.metrics {
  margin-top: 6px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 8px;
}

.metric-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.halo-ring {
  --ring-color: #16d9ff;
  --ring-angle: 180deg;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  background: conic-gradient(var(--ring-color) var(--ring-angle), rgba(255, 255, 255, 0.08) var(--ring-angle));
  position: relative;
  box-shadow:
    0 0 10px color-mix(in srgb, var(--ring-color) 65%, transparent),
    0 0 22px color-mix(in srgb, var(--ring-color) 34%, transparent),
    inset 0 0 6px color-mix(in srgb, var(--ring-color) 45%, transparent);
}

.halo-core {
  position: absolute;
  inset: 5px;
  border-radius: inherit;
  background: transparent;
}

.metric-value {
  font-size: 17px;
  line-height: 1;
  font-weight: 600;
  letter-spacing: -0.2px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  flex-shrink: 0;
}

.dot-cyan {
  background: #16d9ff;
  box-shadow: 0 0 8px #16d9ff;
}

.dot-magenta {
  background: #ff3ea8;
  box-shadow: 0 0 8px #ff3ea8;
}

.dot-orange {
  background: #ff9500;
  box-shadow: 0 0 8px #ff9500;
}

@media (max-width: 380px) {
  .title {
    font-size: 22px;
  }

  .legend {
    gap: 6px;
    font-size: 10px;
  }

  .app-title {
    font-size: 16px;
  }

  .latency {
    font-size: 24px;
  }

  .metric-value {
    font-size: 15px;
  }

  .halo-ring {
    width: 36px;
    height: 36px;
  }
}
</style>
