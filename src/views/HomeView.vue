<script setup lang="ts">
import { computed, ref } from 'vue';

const keyword = ref('');
const isSearching = ref(false);

const normalizedKeyword = computed(() => keyword.value.trim().toLowerCase());

const appIndex = {
  payment: ['payment gateway', 'app-prd-001'],
  auth: ['user auth service', 'app-prd-042'],
  inventory: ['inventory db', 'app-db-011'],
  recommendation: ['recommendation engine', 'app-ml-004'],
  notification: ['notification service', 'app-msg-088'],
  cdn: ['cdn edge node us', 'inf-cdn-001'],
};

const matchMap = computed(() => {
  const term = normalizedKeyword.value;
  if (!term) {
    return {
      payment: true,
      auth: true,
      inventory: true,
      recommendation: true,
      notification: true,
      cdn: true,
    };
  }

  const match = (values: string[]) => values.some((item) => item.includes(term));

  return {
    payment: match(appIndex.payment),
    auth: match(appIndex.auth),
    inventory: match(appIndex.inventory),
    recommendation: match(appIndex.recommendation),
    notification: match(appIndex.notification),
    cdn: match(appIndex.cdn),
  };
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

    <div class="ambient-glow"><div class="glow-tl" /></div>

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

        <div class="search-shell" :class="{ focused: isSearching }">
          <svg class="search-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M10.5 4a6.5 6.5 0 1 0 4.06 11.58l4.93 4.92a1 1 0 0 0 1.42-1.42l-4.92-4.93A6.5 6.5 0 0 0 10.5 4zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9z" fill="currentColor" />
          </svg>
          <input
            v-model="keyword"
            class="search-input"
            type="text"
            placeholder="搜索应用"
            @focus="isSearching = true"
            @blur="isSearching = false"
          />
          <button
            v-if="keyword"
            class="search-clear"
            type="button"
            @click="keyword = ''"
            aria-label="清除搜索"
          >
            ×
          </button>
        </div>
      </header>

      <div class="card" v-if="matchMap.payment">
        <div class="card-header">
          <div class="app-identity">
            <div class="app-name"><div class="dot cyan" />Payment Gateway</div>
            <div class="app-id">APP-PRD-001</div>
          </div>
          <div class="response-time">
            <div class="rt-value text-cyan">42</div>
            <div class="rt-label">响应时间 (ms)</div>
          </div>
        </div>

        <div class="trend-section">
          <div class="section-label">交易量 (1小时)</div>
          <div class="trend-chart">
            <svg viewBox="0 0 200 40" preserveAspectRatio="none">
              <path d="M0,40 L0,25 C20,25 30,15 50,15 C70,15 80,30 100,20 C120,10 130,5 150,15 C170,25 180,10 200,5 L200,40 Z" fill="url(#grad-cyan-fade)" />
              <path d="M0,25 C20,25 30,15 50,15 C70,15 80,30 100,20 C120,10 130,5 150,15 C170,25 180,10 200,5" fill="none" stroke="url(#grad-cyan)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" filter="drop-shadow(0 2px 4px rgba(0, 229, 255, 0.3))" />
            </svg>
          </div>
        </div>

        <div class="donuts-section">
          <div class="donut-container">
            <div class="donut-wrapper">
              <svg viewBox="0 0 44 44">
                <circle class="donut-bg" cx="22" cy="22" r="18" />
                <circle class="donut-progress" cx="22" cy="22" r="18" stroke="url(#grad-cyan)" style="stroke-dashoffset: 1.13;" />
              </svg>
            </div>
            <div class="donut-label"><span class="donut-value">99.9%</span><span class="donut-title">响应率</span></div>
          </div>
          <div class="donut-container">
            <div class="donut-wrapper">
              <svg viewBox="0 0 44 44">
                <circle class="donut-bg" cx="22" cy="22" r="18" />
                <circle class="donut-progress" cx="22" cy="22" r="18" stroke="url(#grad-cyan)" style="stroke-dashoffset: 2.26;" />
              </svg>
            </div>
            <div class="donut-label"><span class="donut-value">98.5%</span><span class="donut-title">正确率</span></div>
          </div>
        </div>
      </div>

      <div class="card" v-if="matchMap.auth">
        <div class="card-header">
          <div class="app-identity">
            <div class="app-name"><div class="dot magenta" />User Auth Service</div>
            <div class="app-id">APP-PRD-042</div>
          </div>
          <div class="response-time">
            <div class="rt-value text-magenta">845</div>
            <div class="rt-label">响应时间 (ms)</div>
          </div>
        </div>

        <div class="trend-section">
          <div class="section-label">交易量 (1小时)</div>
          <div class="trend-chart">
            <svg viewBox="0 0 200 40" preserveAspectRatio="none">
              <path d="M0,40 L0,15 C20,15 30,25 50,20 C70,15 80,5 100,10 C120,15 130,25 150,20 C170,15 180,35 200,30 L200,40 Z" fill="url(#grad-magenta-fade)" />
              <path d="M0,15 C20,15 30,25 50,20 C70,15 80,5 100,10 C120,15 130,25 150,20 C170,15 180,35 200,30" fill="none" stroke="url(#grad-magenta)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" filter="drop-shadow(0 2px 4px rgba(255, 64, 129, 0.3))" />
            </svg>
          </div>
        </div>

        <div class="donuts-section">
          <div class="donut-container">
            <div class="donut-wrapper">
              <svg viewBox="0 0 44 44">
                <circle class="donut-bg" cx="22" cy="22" r="18" />
                <circle class="donut-progress" cx="22" cy="22" r="18" stroke="url(#grad-magenta)" style="stroke-dashoffset: 16.96;" />
              </svg>
            </div>
            <div class="donut-label"><span class="donut-value text-magenta">85.0%</span><span class="donut-title">响应率</span></div>
          </div>
          <div class="donut-container">
            <div class="donut-wrapper">
              <svg viewBox="0 0 44 44">
                <circle class="donut-bg" cx="22" cy="22" r="18" />
                <circle class="donut-progress" cx="22" cy="22" r="18" stroke="url(#grad-cyan)" style="stroke-dashoffset: 10.17;" />
              </svg>
            </div>
            <div class="donut-label"><span class="donut-value">91.2%</span><span class="donut-title">正确率</span></div>
          </div>
        </div>
      </div>

      <div class="card" v-if="matchMap.inventory">
        <div class="card-header">
          <div class="app-identity">
            <div class="app-name"><div class="dot cyan" />Inventory DB</div>
            <div class="app-id">APP-DB-011</div>
          </div>
          <div class="response-time">
            <div class="rt-value text-cyan">12</div>
            <div class="rt-label">响应时间 (ms)</div>
          </div>
        </div>

        <div class="trend-section">
          <div class="section-label">交易量 (1小时)</div>
          <div class="trend-chart">
            <svg viewBox="0 0 200 40" preserveAspectRatio="none">
              <path d="M0,40 L0,30 C20,30 30,35 50,30 C70,25 80,30 100,25 C120,20 130,25 150,20 C170,15 180,10 200,15 L200,40 Z" fill="url(#grad-cyan-fade)" />
              <path d="M0,30 C20,30 30,35 50,30 C70,25 80,30 100,25 C120,20 130,25 150,20 C170,15 180,10 200,15" fill="none" stroke="url(#grad-cyan)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
        </div>

        <div class="donuts-section">
          <div class="donut-container">
            <div class="donut-wrapper">
              <svg viewBox="0 0 44 44">
                <circle class="donut-bg" cx="22" cy="22" r="18" />
                <circle class="donut-progress" cx="22" cy="22" r="18" stroke="url(#grad-cyan)" style="stroke-dashoffset: 0;" />
              </svg>
            </div>
            <div class="donut-label"><span class="donut-value">100%</span><span class="donut-title">响应率</span></div>
          </div>
          <div class="donut-container">
            <div class="donut-wrapper">
              <svg viewBox="0 0 44 44">
                <circle class="donut-bg" cx="22" cy="22" r="18" />
                <circle class="donut-progress" cx="22" cy="22" r="18" stroke="url(#grad-cyan)" style="stroke-dashoffset: 0;" />
              </svg>
            </div>
            <div class="donut-label"><span class="donut-value">100%</span><span class="donut-title">正确率</span></div>
          </div>
        </div>
      </div>

      <div class="card" v-if="matchMap.recommendation">
        <div class="card-header">
          <div class="app-identity">
            <div class="app-name"><div class="dot cyan" />Recommendation Engine</div>
            <div class="app-id">APP-ML-004</div>
          </div>
          <div class="response-time">
            <div class="rt-value text-cyan">156</div>
            <div class="rt-label">响应时间 (ms)</div>
          </div>
        </div>

        <div class="trend-section">
          <div class="section-label">交易量 (1小时)</div>
          <div class="trend-chart">
            <svg viewBox="0 0 200 40" preserveAspectRatio="none">
              <path d="M0,40 L0,20 C20,10 30,25 50,15 C70,5 80,35 100,20 C120,5 130,25 150,15 C170,5 180,15 200,10 L200,40 Z" fill="url(#grad-cyan-fade)" />
              <path d="M0,20 C20,10 30,25 50,15 C70,5 80,35 100,20 C120,5 130,25 150,15 C170,5 180,15 200,10" fill="none" stroke="url(#grad-cyan)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
        </div>

        <div class="donuts-section">
          <div class="donut-container">
            <div class="donut-wrapper">
              <svg viewBox="0 0 44 44">
                <circle class="donut-bg" cx="22" cy="22" r="18" />
                <circle class="donut-progress" cx="22" cy="22" r="18" stroke="url(#grad-cyan)" style="stroke-dashoffset: 4.5;" />
              </svg>
            </div>
            <div class="donut-label"><span class="donut-value">96.0%</span><span class="donut-title">响应率</span></div>
          </div>
          <div class="donut-container">
            <div class="donut-wrapper">
              <svg viewBox="0 0 44 44">
                <circle class="donut-bg" cx="22" cy="22" r="18" />
                <circle class="donut-progress" cx="22" cy="22" r="18" stroke="url(#grad-cyan)" style="stroke-dashoffset: 5.6;" />
              </svg>
            </div>
            <div class="donut-label"><span class="donut-value">95.0%</span><span class="donut-title">正确率</span></div>
          </div>
        </div>
      </div>

      <div class="card" v-if="matchMap.notification">
        <div class="card-header">
          <div class="app-identity">
            <div class="app-name"><div class="dot orange" />Notification Service</div>
            <div class="app-id">APP-MSG-088</div>
          </div>
          <div class="response-time">
            <div class="rt-value text-magenta">512</div>
            <div class="rt-label">响应时间 (ms)</div>
          </div>
        </div>

        <div class="trend-section">
          <div class="section-label">交易量 (1小时)</div>
          <div class="trend-chart">
            <svg viewBox="0 0 200 40" preserveAspectRatio="none">
              <path d="M0,40 L0,5 C20,5 30,10 50,5 C70,5 80,35 100,38 C120,38 130,35 150,38 C170,38 180,39 200,39 L200,40 Z" fill="url(#grad-magenta-fade)" />
              <path d="M0,5 C20,5 30,10 50,5 C70,5 80,35 100,38 C120,38 130,35 150,38 C170,38 180,39 200,39" fill="none" stroke="url(#grad-magenta)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
        </div>

        <div class="donuts-section">
          <div class="donut-container">
            <div class="donut-wrapper">
              <svg viewBox="0 0 44 44">
                <circle class="donut-bg" cx="22" cy="22" r="18" />
                <circle class="donut-progress" cx="22" cy="22" r="18" stroke="url(#grad-magenta)" style="stroke-dashoffset: 45.2;" />
              </svg>
            </div>
            <div class="donut-label"><span class="donut-value text-magenta">60.0%</span><span class="donut-title">响应率</span></div>
          </div>
          <div class="donut-container">
            <div class="donut-wrapper">
              <svg viewBox="0 0 44 44">
                <circle class="donut-bg" cx="22" cy="22" r="18" />
                <circle class="donut-progress" cx="22" cy="22" r="18" stroke="url(#grad-magenta)" style="stroke-dashoffset: 28.2;" />
              </svg>
            </div>
            <div class="donut-label"><span class="donut-value text-magenta">75.0%</span><span class="donut-title">正确率</span></div>
          </div>
        </div>
      </div>

      <div class="card" v-if="matchMap.cdn">
        <div class="card-header">
          <div class="app-identity">
            <div class="app-name"><div class="dot cyan" />CDN Edge Node US</div>
            <div class="app-id">INF-CDN-001</div>
          </div>
          <div class="response-time">
            <div class="rt-value text-cyan">8</div>
            <div class="rt-label">响应时间 (ms)</div>
          </div>
        </div>
        <div class="trend-section">
          <div class="trend-chart">
            <svg viewBox="0 0 200 40" preserveAspectRatio="none">
              <path d="M0,25 Q50,15 100,25 T200,25" fill="none" stroke="url(#grad-cyan)" stroke-width="2" stroke-linecap="round" />
            </svg>
          </div>
        </div>
        <div class="donuts-section">
          <div class="donut-container">
            <div class="donut-wrapper">
              <svg viewBox="0 0 44 44">
                <circle class="donut-bg" cx="22" cy="22" r="18" />
                <circle class="donut-progress" cx="22" cy="22" r="18" stroke="url(#grad-cyan)" style="stroke-dashoffset: 0;" />
              </svg>
            </div>
            <div class="donut-label"><span class="donut-value">100%</span><span class="donut-title">响应率</span></div>
          </div>
          <div class="donut-container">
            <div class="donut-wrapper">
              <svg viewBox="0 0 44 44">
                <circle class="donut-bg" cx="22" cy="22" r="18" />
                <circle class="donut-progress" cx="22" cy="22" r="18" stroke="url(#grad-cyan)" style="stroke-dashoffset: 0;" />
              </svg>
            </div>
            <div class="donut-label"><span class="donut-value">100%</span><span class="donut-title">正确率</span></div>
          </div>
        </div>
      </div>

      <div
        v-if="!Object.values(matchMap).some(Boolean)"
        class="empty-state"
      >
        未找到匹配的应用
      </div>
    </div>
  </div>
</template>

<style scoped>
.monitor-page {
  --bg-deep: #05070b;
  --neon-cyan: #00e5ff;
  --neon-magenta: #ff4081;
  --neon-orange: #ff9100;
  --neon-blue: #2962ff;
  --white: #ffffff;
  --text-dim: rgba(255, 255, 255, 0.62);
  --glass-bg: rgba(255, 255, 255, 0.07);
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
  background:
    radial-gradient(circle at 85% 80%, rgba(255, 64, 129, 0.1), transparent 38%),
    radial-gradient(circle at 8% 10%, rgba(0, 229, 255, 0.1), transparent 42%),
    linear-gradient(180deg, #06080d 0%, #04060a 55%, #03050a 100%);
  color: var(--white);
  font-family: var(--font-stack);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
  position: relative;
}

.ambient-glow {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.ambient-glow::before,
.ambient-glow::after,
.ambient-glow .glow-tl {
  content: '';
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
}

.ambient-glow::before {
  width: 80vw;
  height: 80vw;
  background: radial-gradient(circle, var(--neon-cyan), transparent 70%);
  top: -20vh;
  left: -20vw;
  opacity: 0.25;
}

.ambient-glow::after {
  width: 60vw;
  height: 60vw;
  background: radial-gradient(circle, var(--neon-magenta), transparent 70%);
  bottom: -10vh;
  right: -10vw;
  opacity: 0.2;
}

.ambient-glow .glow-tl {
  width: 40vw;
  height: 40vw;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.15), transparent 70%);
  top: 5vh;
  left: 5vw;
  filter: blur(80px);
}

.app-container {
  position: relative;
  z-index: 1;
  padding: 0 16px 32px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 600px;
  margin: 0 auto;
}

.header {
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 20px 0 14px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
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

.search-shell {
  height: 38px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(250, 250, 252, 0.14);
  backdrop-filter: blur(24px) saturate(160%);
  -webkit-backdrop-filter: blur(24px) saturate(160%);
  display: flex;
  align-items: center;
  padding: 0 10px;
  transition: border-color 0.22s ease, box-shadow 0.22s ease, background 0.22s ease;
}

.search-shell.focused {
  border-color: rgba(155, 206, 255, 0.55);
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 0 4px rgba(126, 198, 255, 0.18);
}

.search-icon {
  width: 16px;
  height: 16px;
  color: rgba(255, 255, 255, 0.65);
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
  background: var(--neon-cyan);
  box-shadow: 0 0 8px var(--neon-cyan);
}

.dot.magenta {
  background: var(--neon-magenta);
  box-shadow: 0 0 8px var(--neon-magenta);
  animation: pulse-magenta 2s infinite;
}

.dot.orange {
  background: var(--neon-orange);
  box-shadow: 0 0 8px var(--neon-orange);
  animation: pulse-orange 2s infinite;
}

.card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  transition: transform 0.2s ease, background 0.2s ease;
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1), 0 4px 30px rgba(0, 0, 0, 0.3);
  max-height: 25vh;
}

.card:active {
  transform: scale(0.98);
  background: rgba(255, 255, 255, 0.12);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.app-identity {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.app-name {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.3px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.app-id {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-dim);
  letter-spacing: 0.5px;
}

.response-time {
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.rt-value {
  font-family: var(--font-mono);
  font-size: 24px;
  font-weight: 300;
  letter-spacing: -1px;
  line-height: 1;
}

.rt-label {
  font-size: 11px;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 4px;
}

.text-cyan {
  color: var(--neon-cyan);
}

.text-magenta {
  color: var(--neon-magenta);
}

.trend-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-label {
  font-size: 11px;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.trend-chart {
  width: 100%;
  height: 40px;
}

.trend-chart svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.donuts-section {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.03);
}

.donut-container {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.donut-wrapper {
  position: relative;
  width: 44px;
  height: 44px;
}

.donut-wrapper svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
  overflow: visible;
}

.donut-bg {
  fill: none;
  stroke: rgba(255, 255, 255, 0.05);
  stroke-width: 4;
}

.donut-progress {
  fill: none;
  stroke-width: 4;
  stroke-linecap: round;
  stroke-dasharray: 113.097;
  transition: stroke-dashoffset 1s ease-out;
  filter: drop-shadow(0 0 4px currentColor);
}

.donut-label {
  display: flex;
  flex-direction: column;
}

.donut-value {
  font-family: var(--font-mono);
  font-size: 15px;
  font-weight: 500;
}

.donut-title {
  font-size: 11px;
  color: var(--text-dim);
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
