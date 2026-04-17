<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import * as echarts from 'echarts';

type Tone = 'cyan' | 'magenta' | 'orange';

interface CardItem {
  key: string;
  name: string;
  appId: string;
  tone: Tone;
  responseTime: number;
  responseRate: string;
  accuracy: string;
  responseDashoffset: number;
  accuracyDashoffset: number;
  responseStroke: string;
  accuracyStroke: string;
  responseTextClass: 'text-[#00e5ff]' | 'text-[#FF3D3D]';
}

const router = useRouter();
const keyword = ref('');
const isSearching = ref(false);
const keyboardOffset = ref(0);

const goToDetail = (card: CardItem) => {
  router.push({ name: 'serverMonitor', query: { appName: card.name, appId: card.appId, tone: card.tone } });
};

const makeCard = (
  key: string, name: string, appId: string, tone: Tone,
  responseTime: number, responseRate: string, accuracy: string,
  responseDashoffset: number, accuracyDashoffset: number,
  responseStroke: string, accuracyStroke: string,
  responseTextClass: 'text-[#00e5ff]' | 'text-[#FF3D3D]'
): CardItem => ({ key, name, appId, tone, responseTime, responseRate, accuracy, responseDashoffset, accuracyDashoffset, responseStroke, accuracyStroke, responseTextClass });

const cards: CardItem[] = [
  makeCard('payment',        'Payment Gateway',       'APP-PRD-001', 'cyan',    42,  '99.9%', '98.5%',  1.13,  2.26,  'url(#grad-cyan)',    'url(#grad-cyan)',    'text-[#00e5ff]'),
  makeCard('auth',           'User Auth Service',     'APP-PRD-042', 'magenta', 845, '85.0%', '91.2%',  16.96, 10.17, 'url(#grad-magenta)', 'url(#grad-cyan)',    'text-[#FF3D3D]'),
  makeCard('inventory',      'Inventory DB',          'APP-DB-011',  'cyan',    12,  '100%',  '100%',   0,     0,     'url(#grad-cyan)',    'url(#grad-cyan)',    'text-[#00e5ff]'),
  makeCard('recommendation', 'Recommendation Engine', 'APP-ML-004',  'cyan',    156, '96.0%', '95.0%',  4.5,   5.6,   'url(#grad-cyan)',    'url(#grad-cyan)',    'text-[#00e5ff]'),
  makeCard('notification',   'Notification Service',  'APP-MSG-088', 'orange',  512, '60.0%', '75.0%',  45.2,  28.2,  'url(#grad-magenta)', 'url(#grad-magenta)', 'text-[#FF3D3D]'),
  makeCard('cdn',            'CDN Edge Node US',      'INF-CDN-001', 'cyan',    8,   '100%',  '100%',   0,     0,     'url(#grad-cyan)',    'url(#grad-cyan)',    'text-[#00e5ff]'),
  makeCard('search',         'Search Service',        'APP-SVC-007', 'cyan',    23,  '99.5%', '97.8%',  0.56,  2.49,  'url(#grad-cyan)',    'url(#grad-cyan)',    'text-[#00e5ff]'),
  makeCard('analytics',      'Analytics Engine',      'APP-ML-012',  'cyan',    88,  '98.2%', '96.1%',  2.04,  4.28,  'url(#grad-cyan)',    'url(#grad-cyan)',    'text-[#00e5ff]'),
  makeCard('gateway',        'API Gateway',           'INF-GW-003',  'cyan',    5,   '100%',  '100%',   0,     0,     'url(#grad-cyan)',    'url(#grad-cyan)',    'text-[#00e5ff]'),
  makeCard('cache',          'Redis Cache Cluster',   'INF-DB-002',  'cyan',    3,   '100%',  '100%',   0,     0,     'url(#grad-cyan)',    'url(#grad-cyan)',    'text-[#00e5ff]'),
  makeCard('email',          'Email Delivery',        'APP-MSG-021', 'orange',  320, '72.0%', '88.0%',  31.7,  13.6,  'url(#grad-magenta)', 'url(#grad-cyan)',    'text-[#FF3D3D]'),
  makeCard('billing',        'Billing Service',       'APP-PRD-055', 'cyan',    67,  '99.1%', '99.0%',  1.02,  1.13,  'url(#grad-cyan)',    'url(#grad-cyan)',    'text-[#00e5ff]'),
  makeCard('storage',        'Object Storage',        'INF-STG-001', 'cyan',    18,  '99.8%', '99.9%',  0.23,  0.11,  'url(#grad-cyan)',    'url(#grad-cyan)',    'text-[#00e5ff]'),
  makeCard('ml-train',       'ML Training Pipeline',  'APP-ML-033',  'magenta', 1240,'78.0%', '82.5%',  24.88, 19.81, 'url(#grad-magenta)', 'url(#grad-magenta)', 'text-[#FF3D3D]'),
  makeCard('websocket',      'WebSocket Server',      'APP-SVC-019', 'cyan',    11,  '99.7%', '98.3%',  0.34,  1.92,  'url(#grad-cyan)',    'url(#grad-cyan)',    'text-[#00e5ff]'),
  makeCard('scheduler',      'Job Scheduler',         'APP-SVC-044', 'cyan',    45,  '97.5%', '96.8%',  2.83,  3.62,  'url(#grad-cyan)',    'url(#grad-cyan)',    'text-[#00e5ff]'),
  makeCard('log',            'Log Aggregator',        'INF-LOG-001', 'cyan',    29,  '99.3%', '99.1%',  0.79,  1.02,  'url(#grad-cyan)',    'url(#grad-cyan)',    'text-[#00e5ff]'),
  makeCard('push',           'Push Notification',     'APP-MSG-066', 'orange',  430, '65.0%', '79.0%',  39.6,  23.7,  'url(#grad-magenta)', 'url(#grad-magenta)', 'text-[#FF3D3D]'),
  makeCard('config',         'Config Center',         'INF-CFG-001', 'cyan',    7,   '100%',  '100%',   0,     0,     'url(#grad-cyan)',    'url(#grad-cyan)',    'text-[#00e5ff]'),
  makeCard('monitor',        'Health Monitor',        'INF-MON-001', 'cyan',    14,  '99.9%', '99.8%',  0.11,  0.23,  'url(#grad-cyan)',    'url(#grad-cyan)',    'text-[#00e5ff]'),
];

const getCardStatus = (card: CardItem): 'critical' | 'warning' | 'normal' => {
  const rr = parseFloat(card.responseRate);
  const acc = parseFloat(card.accuracy);
  if (rr < 80 || acc < 85) return 'critical';
  if (rr < 95 || acc < 95) return 'warning';
  return 'normal';
};

const activeFilter = ref<'all' | 'critical' | 'warning' | 'normal'>('all');
const activeTimeRange = ref<5 | 15 | 30>(5);
const timeRanges = [
  { label: '5m',  value: 5  as const },
  { label: '15m', value: 15 as const },
  { label: '30m', value: 30 as const },
];

const cardCounts = computed(() => ({
  normal:   cards.filter(c => getCardStatus(c) === 'normal').length,
  warning:  cards.filter(c => getCardStatus(c) === 'warning').length,
  critical: cards.filter(c => getCardStatus(c) === 'critical').length,
}));

const normalizedKeyword = computed(() => keyword.value.trim().toLowerCase());
const filteredCards = computed(() => {
  let result: CardItem[] = cards;
  if (activeFilter.value === 'critical') result = result.filter(c => getCardStatus(c) === 'critical');
  else if (activeFilter.value === 'warning') result = result.filter(c => getCardStatus(c) === 'warning');
  else if (activeFilter.value === 'normal') result = result.filter(c => getCardStatus(c) === 'normal');
  const term = normalizedKeyword.value;
  if (!term) return result;
  return result.filter((card) => `${card.name} ${card.appId}`.toLowerCase().includes(term));
});

const searchDockStyle = computed(() => ({ '--kb-offset': `${keyboardOffset.value}px` }));
const formatPercent = (value: string) => `${Math.round(Number.parseFloat(value))}%`;

const chartRefs = ref<(HTMLDivElement | null)[]>([]);
const chartInstances: (echarts.ECharts | null)[] = [];

const generateSparkData = (points = 50) => {
  const data: number[] = [];
  let v = Math.random() * 60 + 20;
  for (let i = 0; i < points; i++) {
    v = Math.max(5, Math.min(95, v + (Math.random() - 0.5) * 15));
    data.push(v);
  }
  return data;
};

const sparkPoints = computed(() => activeTimeRange.value * 6); // ~6 points per minute

const initSparkChart = (el: HTMLDivElement, idx: number) => {
  if (chartInstances[idx]) chartInstances[idx]!.dispose();
  const chart = echarts.init(el);
  chartInstances[idx] = chart;
  chart.setOption({
    grid: { left: 0, right: 0, top: 2, bottom: 2 },
    xAxis: { type: 'category', show: false, boundaryGap: false },
    yAxis: { type: 'value', show: false },
    series: [{
      type: 'line',
      data: generateSparkData(sparkPoints.value),
      smooth: true,
      showSymbol: false,
      lineStyle: { color: '#4A9EFF', width: 1 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(74,158,255,0.2)' },
          { offset: 1, color: 'rgba(74,158,255,0)' },
        ]),
      },
    }],
  });
  const ro = new ResizeObserver(() => chart.resize());
  ro.observe(el);
};

const initAllCharts = () => {
  nextTick(() => {
    filteredCards.value.forEach((_, i) => {
      const el = chartRefs.value[i];
      if (el) initSparkChart(el, i);
    });
  });
};

watch(filteredCards, () => {
  chartInstances.forEach((c) => c?.dispose());
  chartInstances.length = 0;
  initAllCharts();
});

watch(activeTimeRange, () => {
  chartInstances.forEach((c) => c?.dispose());
  chartInstances.length = 0;
  initAllCharts();
});

const updateKeyboardOffset = () => {
  if (!isSearching.value) { keyboardOffset.value = 0; return; }
  const viewport = window.visualViewport;
  if (!viewport) { keyboardOffset.value = 0; return; }
  keyboardOffset.value = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
};

const handleSearchFocus = () => { isSearching.value = true; updateKeyboardOffset(); };
const handleSearchBlur = () => { isSearching.value = false; keyboardOffset.value = 0; };

onMounted(() => {
  window.addEventListener('resize', updateKeyboardOffset);
  window.visualViewport?.addEventListener('resize', updateKeyboardOffset);
  window.visualViewport?.addEventListener('scroll', updateKeyboardOffset);
  initAllCharts();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateKeyboardOffset);
  window.visualViewport?.removeEventListener('resize', updateKeyboardOffset);
  window.visualViewport?.removeEventListener('scroll', updateKeyboardOffset);
  chartInstances.forEach((c) => c?.dispose());
});
</script>

<template>
  <div class="monitor-page min-h-screen overflow-x-hidden text-white relative bg-[linear-gradient(180deg,#0a0a0a_0%,#020202_100%)] leading-[1.5]">

    <svg class="w-0 h-0 absolute" aria-hidden="true">
      <defs>
        <linearGradient id="grad-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#00E5FF" />
          <stop offset="100%" stop-color="#2962FF" />
        </linearGradient>
        <linearGradient id="grad-magenta" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FF3D3D" />
          <stop offset="100%" stop-color="#CC1414" />
        </linearGradient>
      </defs>
    </svg>

    <!-- Sticky header -->
    <header class="sticky top-0 z-10 bg-[rgba(5,5,5,0.85)] backdrop-blur-xl border-b border-white/[0.08]">
      <div class="mx-auto w-full px-3 pt-3 pb-2 sm:px-5 sm:max-w-3xl lg:px-8 lg:max-w-[1280px] xl:px-12 xl:max-w-[1440px]">
        <div class="flex justify-between items-center">
          <h1 class="text-[22px] font-semibold tracking-tight">Monitor</h1>
          <div class="text-xs text-[#8A8A8E] flex gap-2.5">
            <div class="flex items-center gap-1">
              <div class="w-1.5 h-1.5 rounded-full shrink-0 bg-[#4A9EFF] shadow-[0_0_6px_#4A9EFF]" />
              <span>{{ cardCounts.normal }} 正常</span>
            </div>
            <div class="flex items-center gap-1">
              <div class="w-1.5 h-1.5 rounded-full shrink-0 bg-[#FF9F0A] shadow-[0_0_6px_#FF9F0A]" />
              <span>{{ cardCounts.warning }} 警戒</span>
            </div>
            <div class="flex items-center gap-1">
              <div class="w-1.5 h-1.5 rounded-full shrink-0 bg-[#FF3333] shadow-[0_0_6px_#FF3333]" />
              <span>{{ cardCounts.critical }} 严重</span>
            </div>
          </div>
        </div>

        <!-- Filter chips + time range -->
        <div class="flex items-center justify-between gap-2 mt-2">
          <div class="flex gap-1.5 overflow-x-auto pb-0.5 filter-chip-row flex-1">
            <button
              v-for="f in ([
                { label: '全部', value: 'all' },
                { label: '异常', value: 'critical' },
                { label: '警戒', value: 'warning' },
                { label: '正常', value: 'normal' },
              ] as const)"
              :key="f.value"
              class="flex-none text-[11px] px-3 py-1 rounded-full border transition-all duration-200 whitespace-nowrap"
              :class="activeFilter === f.value
                ? 'text-white border-white/30 bg-white/10 font-medium'
                : 'text-[#666] border-white/[0.08] bg-transparent hover:text-white/70 hover:border-white/15'"
              @click="activeFilter = f.value"
            >{{ f.label }}</button>
          </div>
          <!-- Time range toggle -->
          <div class="flex items-center gap-0.5 bg-white/[0.04] rounded-lg p-0.5 shrink-0">
            <button
              v-for="tr in timeRanges"
              :key="tr.value"
              class="text-[10px] px-2 py-[3px] rounded-md transition-all duration-200 whitespace-nowrap"
              :class="activeTimeRange === tr.value
                ? 'bg-[#4A9EFF] text-[#050505] font-bold shadow'
                : 'text-white/40 hover:text-white/70'"
              @click="activeTimeRange = tr.value"
            >{{ tr.label }}</button>
          </div>
        </div>
      </div>
    </header>

    <!-- Cards container -->
    <div class="relative z-[1] mx-auto w-full px-3 pb-[calc(24px+52px+env(safe-area-inset-bottom,0px))] sm:px-5 sm:max-w-3xl lg:px-8 lg:max-w-[1280px] xl:px-12 xl:max-w-[1440px]">
      <div class="grid grid-cols-2 gap-2 mt-2 sm:grid-cols-3 sm:gap-2.5 lg:grid-cols-4 lg:gap-3 xl:grid-cols-5">
        <div
          v-for="(card, i) in filteredCards"
          :key="card.key"
          class="monitor-card border rounded-[18px] p-2.5 flex flex-col gap-1.5 backdrop-blur-xl cursor-pointer transition-all duration-200 lg:p-3 lg:gap-2"
          :class="'card-' + getCardStatus(card)"
          @click="goToDetail(card)"
        >
          <!-- Card header: name + chevron -->
          <div class="flex items-start justify-between gap-1">
            <div class="flex flex-col gap-[2px] min-w-0 flex-1">
              <div class="text-[11px] font-semibold flex items-center gap-[5px] min-w-0">
                <!-- Status dot: blue=normal, orange=warning, magenta=critical -->
                <div
                  class="w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-300"
                  :class="{
                    'bg-[#4A9EFF] shadow-[0_0_5px_#4A9EFF]': getCardStatus(card) === 'normal',
                    'bg-[#FF9F0A] shadow-[0_0_5px_#FF9F0A]': getCardStatus(card) === 'warning',
                    'bg-[#FF3333] shadow-[0_0_5px_#FF3333]': getCardStatus(card) === 'critical',
                  }"
                />
                <span class="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{{ card.name }}</span>
              </div>
              <span class="font-mono text-[9px] text-white/35 tracking-[0.4px] overflow-hidden text-ellipsis whitespace-nowrap">{{ card.appId }}</span>
            </div>
            <svg class="w-3.5 h-3.5 text-white/20 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>

          <!-- Donuts row -->
          <div class="flex justify-around gap-1">
            <!-- 响应率 -->
            <div class="flex flex-col items-center gap-[2px]">
              <div class="relative w-9 h-9 flex items-center justify-center">
                <svg class="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 44 44">
                  <circle class="donut-bg" cx="22" cy="22" r="18" />
                  <circle class="donut-progress" cx="22" cy="22" r="18"
                    :stroke="card.responseStroke"
                    :style="{ strokeDashoffset: card.responseDashoffset }" />
                </svg>
                <span class="relative z-[1] font-mono text-[10px] font-bold leading-none" :class="card.responseTextClass">{{ formatPercent(card.responseRate) }}</span>
              </div>
              <span class="text-[8px] text-white/35 whitespace-nowrap">响应率</span>
            </div>
            <!-- 正确率 -->
            <div class="flex flex-col items-center gap-[2px]">
              <div class="relative w-9 h-9 flex items-center justify-center">
                <svg class="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 44 44">
                  <circle class="donut-bg" cx="22" cy="22" r="18" />
                  <circle class="donut-progress" cx="22" cy="22" r="18"
                    :stroke="card.accuracyStroke"
                    :style="{ strokeDashoffset: card.accuracyDashoffset }" />
                </svg>
                <span class="relative z-[1] font-mono text-[10px] font-bold leading-none text-white/80">{{ formatPercent(card.accuracy) }}</span>
              </div>
              <span class="text-[8px] text-white/35 whitespace-nowrap">正确率</span>
            </div>
          </div>

          <!-- 交易量: secondary -->
          <div class="flex items-center gap-1 px-0.5">
            <span class="font-mono text-[10px] text-white/28 leading-none">{{ card.responseTime }}</span>
            <span class="text-[8px] text-white/18 uppercase tracking-[0.3px]">交易量</span>
          </div>

          <!-- Spark chart -->
          <div class="w-full h-7 lg:h-9" :ref="el => chartRefs[i] = el as HTMLDivElement | null"></div>
        </div>
      </div>

      <div v-if="filteredCards.length === 0" class="mt-2 text-center text-white/50 border border-dashed border-white/15 rounded-[14px] px-3 py-3.5 bg-white/[0.03] text-sm">
        未找到匹配的应用
      </div>
    </div>

    <!-- Search dock -->
    <div class="search-dock" :style="searchDockStyle">
      <div
        class="h-[42px] rounded-2xl border border-white/15 bg-white/10 backdrop-blur-2xl flex items-center px-3 pointer-events-auto shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_8px_32px_rgba(0,0,0,0.4)] transition-[border-color,box-shadow,background] duration-200"
        :class="{ 'search-focused': isSearching }"
      >
        <svg class="w-[18px] h-[18px] text-white/60 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M10.5 4a6.5 6.5 0 1 0 4.06 11.58l4.93 4.92a1 1 0 0 0 1.42-1.42l-4.92-4.93A6.5 6.5 0 0 0 10.5 4zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9z" fill="currentColor" />
        </svg>
        <input
          v-model="keyword"
          class="flex-1 h-full min-w-0 bg-transparent border-0 outline-none text-white/95 text-[15px] ml-2 placeholder:text-white/45"
          type="text"
          placeholder="搜索应用"
          @focus="handleSearchFocus"
          @blur="handleSearchBlur"
        />
        <button
          v-if="keyword"
          class="w-5 h-5 border-0 rounded-full bg-white/[0.18] text-white/70 grid place-items-center text-base leading-none ml-1.5 cursor-pointer"
          type="button"
          @click="keyword = ''"
          aria-label="清除搜索"
        >×</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Font & tap highlight — complex multi-value properties */
.monitor-page {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color: transparent;
}

/* Ambient background blobs — pseudo-element, can't do in Tailwind */
.monitor-page::before {
  content: '';
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 50% at 20% 40%, rgba(74, 158, 255, 0.06) 0%, transparent 50%),
    radial-gradient(ellipse 60% 40% at 80% 20%, rgba(255, 51, 51, 0.05) 0%, transparent 50%),
    radial-gradient(ellipse 50% 60% at 50% 80%, rgba(74, 54, 255, 0.04) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

/* SVG donut stroke properties — SVG presentation attributes */
.donut-bg      { fill: none; stroke: rgba(255, 255, 255, 0.06); stroke-width: 4; }
.donut-progress {
  fill: none;
  stroke-width: 4;
  stroke-linecap: round;
  stroke-dasharray: 113.097;
  transition: stroke-dashoffset 1s ease-out;
}

/* Search dock — fixed with CSS var-based width calc */
.search-dock {
  position: fixed;
  left: 50%;
  bottom: calc(env(safe-area-inset-bottom, 0px) + 10px + var(--kb-offset, 0px));
  transform: translateX(-50%);
  width: calc(100vw - 24px);
  z-index: 30;
  pointer-events: none;
  transition: bottom 0.2s ease;
}
@media (min-width: 640px)  { .search-dock { width: min(768px,  calc(100vw - 40px)); } }
@media (min-width: 1024px) { .search-dock { width: min(1280px, calc(100vw - 64px)); } }
@media (min-width: 1440px) { .search-dock { width: min(1440px, calc(100vw - 96px)); } }

/* Filter chip row — hide scrollbar */
.filter-chip-row { scrollbar-width: none; }
.filter-chip-row::-webkit-scrollbar { display: none; }

/* Card status variants — background always theme-blue, only border/glow changes per status */
.monitor-card {
  box-shadow: 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05);
}
/* All cards share the same low-opacity theme background */
.card-normal,
.card-warning,
.card-critical {
  background: rgba(74,158,255,0.04);
}
.card-normal  { border-color: rgba(74,158,255,0.14); }
.card-normal:hover  { background: rgba(74,158,255,0.08); border-color: rgba(74,158,255,0.28); transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08); }
.card-normal:active { background: rgba(74,158,255,0.10); transform: translateY(0); box-shadow: 0 4px 16px rgba(0,0,0,0.4); }

.card-warning { border-color: rgba(255,159,10,0.30); }
.card-warning:hover  { background: rgba(74,158,255,0.08); border-color: rgba(255,159,10,0.48); transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08); }
.card-warning:active { transform: translateY(0); }

.card-critical { border-color: rgba(255,51,51,0.40); box-shadow: 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05), 0 0 18px rgba(255,51,51,0.12); }
.card-critical:hover  { background: rgba(74,158,255,0.08); border-color: rgba(255,51,51,0.60); transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 26px rgba(255,51,51,0.20); }
.card-critical:active { transform: translateY(0); }

/* Search focused state — complex multi-shadow */
.search-focused {
  border-color: rgba(155, 206, 255, 0.5) !important;
  background: rgba(255, 255, 255, 0.14) !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 0 0 3px rgba(126, 198, 255, 0.15), 0 8px 32px rgba(0, 0, 0, 0.4) !important;
}
</style>