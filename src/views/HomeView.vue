<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

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
  responseTextClass: 'text-cyan' | 'text-magenta';
  areaPath: string;
  linePath: string;
}

const keyword = ref('');
const isSearching = ref(false);
const keyboardOffset = ref(0);

const cards: CardItem[] = [
  {
    key: 'payment',
    name: 'Payment Gateway',
    appId: 'APP-PRD-001',
    tone: 'cyan',
    responseTime: 42,
    responseRate: '99.9%',
    accuracy: '98.5%',
    responseDashoffset: 1.13,
    accuracyDashoffset: 2.26,
    responseStroke: 'url(#grad-cyan)',
    accuracyStroke: 'url(#grad-cyan)',
    responseTextClass: 'text-cyan',
    areaPath:
      'M0,40 L0,25 C20,25 30,15 50,15 C70,15 80,30 100,20 C120,10 130,5 150,15 C170,25 180,10 200,5 L200,40 Z',
    linePath:
      'M0,25 C20,25 30,15 50,15 C70,15 80,30 100,20 C120,10 130,5 150,15 C170,25 180,10 200,5',
  },
  {
    key: 'auth',
    name: 'User Auth Service',
    appId: 'APP-PRD-042',
    tone: 'magenta',
    responseTime: 845,
    responseRate: '85.0%',
    accuracy: '91.2%',
    responseDashoffset: 16.96,
    accuracyDashoffset: 10.17,
    responseStroke: 'url(#grad-magenta)',
    accuracyStroke: 'url(#grad-cyan)',
    responseTextClass: 'text-magenta',
    areaPath:
      'M0,40 L0,15 C20,15 30,25 50,20 C70,15 80,5 100,10 C120,15 130,25 150,20 C170,15 180,35 200,30 L200,40 Z',
    linePath:
      'M0,15 C20,15 30,25 50,20 C70,15 80,5 100,10 C120,15 130,25 150,20 C170,15 180,35 200,30',
  },
  {
    key: 'inventory',
    name: 'Inventory DB',
    appId: 'APP-DB-011',
    tone: 'cyan',
    responseTime: 12,
    responseRate: '100%',
    accuracy: '100%',
    responseDashoffset: 0,
    accuracyDashoffset: 0,
    responseStroke: 'url(#grad-cyan)',
    accuracyStroke: 'url(#grad-cyan)',
    responseTextClass: 'text-cyan',
    areaPath:
      'M0,40 L0,30 C20,30 30,35 50,30 C70,25 80,30 100,25 C120,20 130,25 150,20 C170,15 180,10 200,15 L200,40 Z',
    linePath:
      'M0,30 C20,30 30,35 50,30 C70,25 80,30 100,25 C120,20 130,25 150,20 C170,15 180,10 200,15',
  },
  {
    key: 'recommendation',
    name: 'Recommendation Engine',
    appId: 'APP-ML-004',
    tone: 'cyan',
    responseTime: 156,
    responseRate: '96.0%',
    accuracy: '95.0%',
    responseDashoffset: 4.5,
    accuracyDashoffset: 5.6,
    responseStroke: 'url(#grad-cyan)',
    accuracyStroke: 'url(#grad-cyan)',
    responseTextClass: 'text-cyan',
    areaPath:
      'M0,40 L0,20 C20,10 30,25 50,15 C70,5 80,35 100,20 C120,5 130,25 150,15 C170,5 180,15 200,10 L200,40 Z',
    linePath:
      'M0,20 C20,10 30,25 50,15 C70,5 80,35 100,20 C120,5 130,25 150,15 C170,5 180,15 200,10',
  },
  {
    key: 'notification',
    name: 'Notification Service',
    appId: 'APP-MSG-088',
    tone: 'orange',
    responseTime: 512,
    responseRate: '60.0%',
    accuracy: '75.0%',
    responseDashoffset: 45.2,
    accuracyDashoffset: 28.2,
    responseStroke: 'url(#grad-magenta)',
    accuracyStroke: 'url(#grad-magenta)',
    responseTextClass: 'text-magenta',
    areaPath:
      'M0,40 L0,5 C20,5 30,10 50,5 C70,5 80,35 100,38 C120,38 130,35 150,38 C170,38 180,39 200,39 L200,40 Z',
    linePath:
      'M0,5 C20,5 30,10 50,5 C70,5 80,35 100,38 C120,38 130,35 150,38 C170,38 180,39 200,39',
  },
  {
    key: 'cdn',
    name: 'CDN Edge Node US',
    appId: 'INF-CDN-001',
    tone: 'cyan',
    responseTime: 8,
    responseRate: '100%',
    accuracy: '100%',
    responseDashoffset: 0,
    accuracyDashoffset: 0,
    responseStroke: 'url(#grad-cyan)',
    accuracyStroke: 'url(#grad-cyan)',
    responseTextClass: 'text-cyan',
    areaPath: 'M0,25 Q50,15 100,25 T200,25 L200,40 L0,40 Z',
    linePath: 'M0,25 Q50,15 100,25 T200,25',
  },
];

const normalizedKeyword = computed(() => keyword.value.trim().toLowerCase());

const filteredCards = computed(() => {
  const term = normalizedKeyword.value;
  if (!term) return cards;
  return cards.filter((card) => `${card.name} ${card.appId}`.toLowerCase().includes(term));
});

const searchDockStyle = computed(() => ({
  '--kb-offset': `${keyboardOffset.value}px`,
}));

const formatPercent = (value: string) => `${Math.round(Number.parseFloat(value))}%`;

const updateKeyboardOffset = () => {
  if (!isSearching.value) {
    keyboardOffset.value = 0;
    return;
  }

  const viewport = window.visualViewport;
  if (!viewport) {
    keyboardOffset.value = 0;
    return;
  }

  const overlap = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
  keyboardOffset.value = overlap;
};

const handleSearchFocus = () => {
  isSearching.value = true;
  updateKeyboardOffset();
};

const handleSearchBlur = () => {
  isSearching.value = false;
  keyboardOffset.value = 0;
};

onMounted(() => {
  window.addEventListener('resize', updateKeyboardOffset);
  window.visualViewport?.addEventListener('resize', updateKeyboardOffset);
  window.visualViewport?.addEventListener('scroll', updateKeyboardOffset);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateKeyboardOffset);
  window.visualViewport?.removeEventListener('resize', updateKeyboardOffset);
  window.visualViewport?.removeEventListener('scroll', updateKeyboardOffset);
});
</script>

<template>
  <div class="monitor-page min-h-screen">
    <svg class="svg-defs" aria-hidden="true">
      <defs>
        <linearGradient id="grad-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#00E5FF" />
          <stop offset="100%" stop-color="#2962FF" />
        </linearGradient>
        <linearGradient id="grad-magenta" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FF4081" />
          <stop offset="100%" stop-color="#7C4DFF" />
        </linearGradient>
        <linearGradient id="grad-cyan-fade" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="rgba(0, 229, 255, 0.2)" />
          <stop offset="100%" stop-color="rgba(41, 98, 255, 0)" />
        </linearGradient>
        <linearGradient id="grad-magenta-fade" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="rgba(255, 64, 129, 0.2)" />
          <stop offset="100%" stop-color="rgba(124, 77, 255, 0)" />
        </linearGradient>
      </defs>
    </svg>

    <div class="app-container">
      <header class="header">
        <div class="header-top">
          <h1>Monitor</h1>
          <div class="header-stats">
            <div class="stat-badge"><div class="dot cyan" /> 18 正常</div>
            <div class="stat-badge"><div class="dot orange" /> 1 警戒</div>
            <div class="stat-badge"><div class="dot magenta" /> 2 严重</div>
          </div>
        </div>
      </header>

      <div
        v-for="card in filteredCards"
        :key="card.key"
        class="card"
      >
        <div class="card-header">
          <div class="app-identity">
            <div class="app-name">
              <div class="dot" :class="card.tone" />
              <span class="app-name-text">{{ card.name }}</span>
            </div>
            <div class="meta-row">
              <span class="app-id">{{ card.appId }}</span>
              <span class="section-label-inline">交易量 (1小时)</span>
            </div>
            <div class="response-time">
              <div class="rt-value" :class="card.responseTextClass">{{ card.responseTime }}</div>
              <div class="rt-label">响应时间 (ms)</div>
            </div>
          </div>

          <div class="donuts-section">
            <div class="donut-container">
              <div class="donut-wrapper">
                <svg viewBox="0 0 44 44">
                  <circle class="donut-bg" cx="22" cy="22" r="18" />
                  <circle
                    class="donut-progress"
                    cx="22"
                    cy="22"
                    r="18"
                    :stroke="card.responseStroke"
                    :style="{ strokeDashoffset: `${card.responseDashoffset}` }"
                  />
                </svg>
              </div>
              <div class="donut-label">
                <span class="donut-value" :class="card.responseTextClass">{{ formatPercent(card.responseRate) }}</span>
                <span class="donut-title">响应率</span>
              </div>
            </div>
            <div class="donut-container">
              <div class="donut-wrapper">
                <svg viewBox="0 0 44 44">
                  <circle class="donut-bg" cx="22" cy="22" r="18" />
                  <circle
                    class="donut-progress"
                    cx="22"
                    cy="22"
                    r="18"
                    :stroke="card.accuracyStroke"
                    :style="{ strokeDashoffset: `${card.accuracyDashoffset}` }"
                  />
                </svg>
              </div>
              <div class="donut-label">
                <span class="donut-value">{{ formatPercent(card.accuracy) }}</span>
                <span class="donut-title">正确率</span>
              </div>
            </div>
          </div>
        </div>

        <div class="trend-section">
          <div class="trend-chart">
            <svg viewBox="0 0 200 40" preserveAspectRatio="none">
              <path
                :d="card.areaPath"
                :fill="card.tone === 'magenta' || card.tone === 'orange' ? 'url(#grad-magenta-fade)' : 'url(#grad-cyan-fade)'"
              />
              <path
                :d="card.linePath"
                fill="none"
                :stroke="card.tone === 'magenta' || card.tone === 'orange' ? 'url(#grad-magenta)' : 'url(#grad-cyan)'"
                stroke-width="2.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      <div v-if="filteredCards.length === 0" class="empty-state">未找到匹配的应用</div>
    </div>

    <div class="search-dock" :style="searchDockStyle">
      <div class="search-shell" :class="{ focused: isSearching }">
        <svg class="search-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M10.5 4a6.5 6.5 0 1 0 4.06 11.58l4.93 4.92a1 1 0 0 0 1.42-1.42l-4.92-4.93A6.5 6.5 0 0 0 10.5 4zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9z" fill="currentColor" />
        </svg>
        <input
          v-model="keyword"
          class="search-input"
          type="text"
          placeholder="搜索应用"
          @focus="handleSearchFocus"
          @blur="handleSearchBlur"
        />
        <button v-if="keyword" class="search-clear" type="button" @click="keyword = ''" aria-label="清除搜索">×</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.monitor-page {
  --white: #ffffff;
  --text-dim: rgba(255, 255, 255, 0.62);
  --glass-border: rgba(255, 255, 255, 0.18);
  --radius-lg: 24px;
  --font-stack: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  color-scheme: dark;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  -webkit-tap-highlight-color: transparent;
}

.monitor-page {
  background: #04060a;
  color: var(--white);
  font-family: var(--font-stack);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
  position: relative;
}

.app-container {
  position: relative;
  z-index: 1;
  padding: 0 16px calc(32px + 58px + env(safe-area-inset-bottom, 0px)) 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 600px;
  margin: 0 auto;
}

.header {
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 20px 0 8px 0;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.header h1 {
  font-size: 24px;
  font-weight: 600;
  letter-spacing: -0.5px;
}

.header-stats {
  font-size: 13px;
  color: var(--text-dim);
  display: flex;
  gap: 12px;
}

.stat-badge {
  display: flex;
  align-items: center;
  gap: 4px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.dot.cyan {
  background: #00e5ff;
  box-shadow: 0 0 8px #00e5ff;
}

.dot.magenta {
  background: #ff4081;
  box-shadow: 0 0 8px #ff4081;
}

.dot.orange {
  background: #ff9100;
  box-shadow: 0 0 8px #ff9100;
}

.card {
  background: rgba(18, 24, 34, 0.9);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.08), 0 4px 20px rgba(0, 0, 0, 0.28);
  max-height: 20vh;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

.app-identity {
  min-width: 0;
  flex: 1;
  padding-right: 4px;
}

.app-name {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.3px;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.app-name-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
}

.app-id {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-dim);
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.section-label-inline {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.45);
  text-transform: uppercase;
  letter-spacing: 0.4px;
  white-space: nowrap;
}

.response-time {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-top: 2px;
}

.rt-value {
  font-family: var(--font-mono);
  font-size: 18px;
  font-weight: 400;
  letter-spacing: -0.4px;
  line-height: 1;
}

.rt-label {
  font-size: 10px;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.text-cyan {
  color: #00e5ff;
}

.text-magenta {
  color: #ff4081;
}

.donuts-section {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.donut-container {
  display: flex;
  align-items: center;
  gap: 4px;
}

.donut-wrapper {
  position: relative;
  width: 30px;
  height: 30px;
}

.donut-wrapper svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.donut-bg {
  fill: none;
  stroke: rgba(255, 255, 255, 0.06);
  stroke-width: 4;
}

.donut-progress {
  fill: none;
  stroke-width: 4;
  stroke-linecap: round;
  stroke-dasharray: 113.097;
  transition: stroke-dashoffset 1s ease-out;
}

.donut-label {
  display: flex;
  flex-direction: column;
}

.donut-value {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  line-height: 1;
}

.donut-title {
  font-size: 9px;
  color: var(--text-dim);
  line-height: 1.1;
}

.trend-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.trend-chart {
  width: 100%;
  height: 38px;
}

.trend-chart svg {
  width: 100%;
  height: 100%;
}

.search-dock {
  position: fixed;
  left: 50%;
  bottom: calc(env(safe-area-inset-bottom, 0px) + 12px + var(--kb-offset, 0px));
  transform: translateX(-50%);
  width: min(600px, calc(100vw - 32px));
  z-index: 30;
  pointer-events: none;
  transition: bottom 0.2s ease;
}

.search-shell {
  height: 44px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(250, 250, 252, 0.24);
  backdrop-filter: blur(6px) saturate(150%);
  -webkit-backdrop-filter: blur(6px) saturate(150%);
  display: flex;
  align-items: center;
  padding: 0 12px;
  transition: border-color 0.22s ease, box-shadow 0.22s ease, background 0.22s ease;
  pointer-events: auto;
}

.search-shell.focused {
  border-color: rgba(155, 206, 255, 0.62);
  background: rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 0 4px rgba(126, 198, 255, 0.18);
}

.search-icon {
  width: 19px;
  height: 19px;
  color: rgba(255, 255, 255, 0.72);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  height: 100%;
  min-width: 0;
  background: transparent;
  border: 0;
  outline: none;
  color: rgba(255, 255, 255, 0.95);
  font-size: 15px;
  margin-left: 8px;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.56);
}

.search-clear {
  width: 20px;
  height: 20px;
  border: 0;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.24);
  color: rgba(0, 0, 0, 0.55);
  display: grid;
  place-items: center;
  font-size: 16px;
  line-height: 1;
  margin-left: 6px;
}

.empty-state {
  text-align: center;
  color: rgba(255, 255, 255, 0.64);
  border: 1px dashed rgba(255, 255, 255, 0.24);
  border-radius: 16px;
  padding: 18px 12px;
  background: rgba(255, 255, 255, 0.05);
  font-size: 14px;
}

.svg-defs {
  width: 0;
  height: 0;
  position: absolute;
}
</style>
