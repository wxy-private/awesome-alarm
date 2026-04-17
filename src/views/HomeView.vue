<template>
  <div class="monitor-home">
    <header class="monitor-header">
      <div class="header-top">
        <div class="brand">
          <div class="brand-icon" aria-hidden="true">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="10" fill="rgba(255,255,255,0.22)" />
              <path
                d="M8 22c3-4 5-2 8-6s4 4 8 0 4 6 8 2"
                stroke="#fff"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <div class="brand-text">
            <h1 class="brand-title">系统监控中心</h1>
            <p class="brand-sub">实时监控仪表板</p>
          </div>
        </div>
        <div class="header-actions">
          <button type="button" class="icon-btn" aria-label="刷新">
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M21 12a9 9 0 1 1-2.64-6.36" stroke-linecap="round" />
              <path d="M21 3v6h-6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
          <button type="button" class="icon-btn icon-btn-bell" aria-label="通知">
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 7h18s-3 0-3-7"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke-linecap="round" />
            </svg>
            <span class="badge">3</span>
          </button>
        </div>
      </div>

      <div class="summary-row">
        <button
          v-for="stat in statusStats"
          :key="stat.status"
          type="button"
          class="summary-card"
          :class="{ 'summary-card--active': statusFilter === stat.status }"
          @click="toggleStatusFilter(stat.status)"
        >
          <span class="dot" :class="`dot--${stat.dotClass}`" />
          <span class="summary-num">{{ stat.count }}</span>
          <span class="summary-label">{{ stat.label }}</span>
        </button>
      </div>
    </header>

    <div class="monitor-body">
      <div class="list-sticky-header">
        <div class="section-head">
          <span class="section-title">系统列表</span>
          <span class="section-meta">共 {{ filteredSystems.length }} 个系统</span>
        </div>

        <div class="search-wrap">
          <input
            v-model="searchKeyword"
            type="text"
            class="search-input"
            placeholder="输入系统名称搜索"
          />
        </div>
      </div>

      <article v-for="row in filteredSystems" :key="row.id" class="system-card">
        <div class="system-card__head">
          <button type="button" class="detail-btn" @click.stop="onDetail(row)">详情</button>
          <div
            class="system-icon"
            :class="[row.isCore ? 'system-icon--core' : ['system-icon--sm', row.iconClass]]"
            aria-hidden="true"
          >
            <svg
              v-if="row.isCore"
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="18" cy="18" r="17" fill="#1B3D2F" />
              <path
                d="M9 20c2.5-3.5 4-1.5 7-5s3.5 4.5 7 1 3.5 5 7 2"
                stroke="#52C41A"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <div class="system-card__titles">
            <h2 class="system-name">{{ row.name }}</h2>
            <div
              class="system-status"
              :class="`system-status--${row.dotClass.replace('dot--', '')}`"
            >
              <span class="dot dot--sm" :class="row.dotClass" />
              <span>{{ row.status }}</span>
            </div>
          </div>
        </div>

        <div class="metrics-grid">
          <div class="metric-cell">
            <div class="metric-top">
              <span class="metric-label">交易量</span>
              <span class="trend" :class="row.metrics.txTrendClass">
                <svg
                  v-if="row.metrics.txTrend !== 'flat'"
                  viewBox="0 0 12 12"
                  width="10"
                  height="10"
                  fill="currentColor"
                >
                  <path v-if="row.metrics.txTrend === 'up'" d="M6 1L11 7H7v4H5V7H1z" />
                  <path v-else d="M6 11L1 5h4V1h2v4h4z" />
                </svg>
                <span v-else class="trend-dash">—</span>
                {{ row.metrics.txTrendVal }}
              </span>
            </div>
            <div class="metric-value">{{ row.metrics.txVolume }}</div>
            <SparklineChart :data="row.metrics.sparkBlue" color="#3498DB" />
          </div>
          <div class="metric-cell">
            <div class="metric-top">
              <span class="metric-label">响应时间</span>
              <span class="trend" :class="row.metrics.rtTrendClass">
                <svg
                  v-if="row.metrics.rtTrend !== 'flat'"
                  viewBox="0 0 12 12"
                  width="10"
                  height="10"
                  fill="currentColor"
                >
                  <path v-if="row.metrics.rtTrend === 'up'" d="M6 1L11 7H7v4H5V7H1z" />
                  <path v-else d="M6 11L1 5h4V1h2v4h4z" />
                </svg>
                <span v-else class="trend-dash">—</span>
                {{ row.metrics.rtTrendVal }}
              </span>
            </div>
            <div class="metric-value">{{ row.metrics.responseTime }}</div>
            <SparklineChart :data="row.metrics.sparkOrange" color="#E67E22" />
          </div>
          <div class="metric-cell">
            <div class="metric-top">
              <span class="metric-label">响应率</span>
              <span class="trend trend--flat">{{ row.metrics.responseRateTrend }}</span>
            </div>
            <div class="metric-value">{{ row.metrics.responseRate }}</div>
            <div class="spark-bar spark-bar--green" />
          </div>
          <div class="metric-cell">
            <div class="metric-top">
              <span class="metric-label">正确率</span>
              <span class="trend" :class="row.metrics.accTrendClass">
                <svg
                  v-if="row.metrics.accTrend !== 'flat'"
                  viewBox="0 0 12 12"
                  width="10"
                  height="10"
                  fill="currentColor"
                >
                  <path v-if="row.metrics.accTrend === 'up'" d="M6 1L11 7H7v4H5V7H1z" />
                  <path v-else d="M6 11L1 5h4V1h2v4h4z" />
                </svg>
                <span v-else class="trend-dash">—</span>
                {{ row.metrics.accTrendVal }}
              </span>
            </div>
            <div class="metric-value">{{ row.metrics.accuracyRate }}</div>
            <div class="spark-bar spark-bar--purple" />
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import SparklineChart from '../components/SparklineChart.vue'

type SystemStatus = '正常' | '警告' | '异常'
type TrendType = 'up' | 'down' | 'flat'

interface SystemMetrics {
  txVolume: string
  txTrend: TrendType
  txTrendVal: string
  txTrendClass: string
  sparkBlue: number[]
  responseTime: string
  rtTrend: TrendType
  rtTrendVal: string
  rtTrendClass: string
  sparkOrange: number[]
  responseRate: string
  responseRateTrend: string
  accuracyRate: string
  accTrend: TrendType
  accTrendVal: string
  accTrendClass: string
}

interface SystemItem {
  id: string
  name: string
  status: SystemStatus
  dotClass: string
  iconClass: string
  isCore: boolean
  metrics: SystemMetrics
}

const toneClasses = ['tone-a', 'tone-b', 'tone-c', 'tone-d', 'tone-e']

const statusMap: Record<SystemStatus, { dotClass: string }> = {
  正常: { dotClass: 'dot--ok' },
  警告: { dotClass: 'dot--warn' },
  异常: { dotClass: 'dot--err' },
}

const allSystems = ref<SystemItem[]>([])
const searchKeyword = ref('')
const statusFilter = ref<SystemStatus | null>(null)

function randArr(base: number[], vary = 3): number[] {
  return base.map((v) => Math.max(0, v + Math.floor((Math.random() - 0.5) * vary * 2)))
}

function genMetrics(i: number): SystemMetrics {
  const sparkB = [12, 18, 14, 22, 16, 24, 19, 26, 22, 28]
  const sparkO = [24, 20, 22, 16, 20, 14, 18, 12, 16, 10]
  const trends: { t: TrendType; val: string; cls: string }[] = [
    { t: 'up', val: '+12.5%', cls: 'trend--up' },
    { t: 'down', val: '-8.2%', cls: 'trend--down' },
    { t: 'flat', val: '+0.01%', cls: 'trend--flat' },
    { t: 'up', val: '+0.03%', cls: 'trend--up' },
  ]
  const tx = trends[i % 4]!
  const rt = trends[(i + 1) % 4]!
  const acc = trends[(i + 2) % 4]!
  return {
    txVolume: i === 0 ? '12.8万 笔' : `${(8 + (i % 12) * 0.5).toFixed(1)}万 笔`,
    txTrend: tx.t,
    txTrendVal: tx.val,
    txTrendClass: tx.cls,
    sparkBlue: i === 0 ? sparkB : randArr(sparkB),
    responseTime: i === 0 ? '45 ms' : `${30 + (i % 50)} ms`,
    rtTrend: rt.t,
    rtTrendVal: rt.val,
    rtTrendClass: rt.cls,
    sparkOrange: i === 0 ? sparkO : randArr(sparkO),
    responseRate: `${(99.9 - (i % 10) * 0.01).toFixed(2)}%`,
    responseRateTrend: '+0.01%',
    accuracyRate: `${(99.9 - (i % 5) * 0.01).toFixed(2)}%`,
    accTrend: acc.t,
    accTrendVal: acc.val,
    accTrendClass: acc.cls,
  }
}

function generateSystems(count: number): SystemItem[] {
  const names = [
    'Payment Core',
    'Order Service',
    'User API',
    'Risk Engine',
    'Settlement',
    'Notification Hub',
    'Auth Gateway',
    'Cache Cluster',
    'Message Queue',
    'File Storage',
    'Search Index',
  ]
  const statuses: SystemStatus[] = ['正常', '正常', '正常', '正常', '警告', '异常']
  const list: SystemItem[] = []
  for (let i = 0; i < count; i++) {
    const status = statuses[i % statuses.length] as SystemStatus
    const m = statusMap[status]
    const nameIdx = i === 0 ? 0 : ((i - 1) % (names.length - 1)) + 1
    const baseName = names[nameIdx]
    const suffix =
      i === 0 ? '' : i > names.length - 1 ? ` #${Math.floor((i - 1) / (names.length - 1)) + 1}` : ''
    list.push({
      id: `sys-${i}`,
      name: baseName + suffix,
      status,
      dotClass: m.dotClass,
      iconClass: toneClasses[i % toneClasses.length]!,
      isCore: i === 0,
      metrics: genMetrics(i),
    })
  }
  return list
}

allSystems.value = generateSystems(30)

function fuzzyMatch(text: string, keyword: string): boolean {
  if (!keyword.trim()) return true
  const k = keyword.trim().toLowerCase()
  const t = text.toLowerCase()
  let ki = 0
  for (let i = 0; i < t.length && ki < k.length; i++) {
    if (t[i] === k[ki]) ki++
  }
  return ki === k.length
}

const filteredSystems = computed(() => {
  let list = allSystems.value
  if (statusFilter.value) {
    list = list.filter((s) => s.status === statusFilter.value)
  }
  if (searchKeyword.value.trim()) {
    list = list.filter((s) => fuzzyMatch(s.name, searchKeyword.value))
  }
  return list
})

const statusStats = computed(() => {
  const ok = allSystems.value.filter((s) => s.status === '正常').length
  const warn = allSystems.value.filter((s) => s.status === '警告').length
  const err = allSystems.value.filter((s) => s.status === '异常').length
  return [
    { status: '正常' as SystemStatus, count: ok, label: '正常', dotClass: 'ok' },
    { status: '警告' as SystemStatus, count: warn, label: '警告', dotClass: 'warn' },
    { status: '异常' as SystemStatus, count: err, label: '异常', dotClass: 'err' },
  ]
})

function toggleStatusFilter(status: SystemStatus) {
  statusFilter.value = statusFilter.value === status ? null : status
}

const router = useRouter()

function onDetail(row: SystemItem) {
  router.push({
    name: 'detail',
    params: { id: row.id },
    query: { name: row.name },
  })
}
</script>

<style scoped>
.monitor-home {
  flex: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0d0d0d;
  font-family:
    'PingFang SC',
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
  overflow: hidden;
}

.monitor-header {
  flex-shrink: 0;
  background: #8e94f2;
  border-radius: 0 0 32px 32px;
  padding: 20px 20px 24px;
}

.header-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.brand-icon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.brand-icon svg {
  width: 100%;
  height: 100%;
  display: block;
}

.brand-title {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  line-height: 1.25;
}

.brand-sub {
  margin-top: 4px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.72);
  line-height: 1.3;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.icon-btn {
  position: relative;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.22);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.icon-btn:active {
  opacity: 0.88;
}

.icon-btn-bell .badge {
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 8px;
  background: #f5222d;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  line-height: 16px;
  text-align: center;
  box-sizing: border-box;
}

.summary-row {
  display: flex;
  gap: 10px;
  margin-top: 22px;
}

.summary-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 8px 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.28);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  cursor: pointer;
  transition: all 0.2s;
}

.summary-card:hover {
  background: rgba(255, 255, 255, 0.2);
}

.summary-card--active {
  background: rgba(255, 255, 255, 0.28);
  border: 2px solid rgba(255, 255, 255, 0.9);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot--sm {
  width: 6px;
  height: 6px;
}

.dot--ok {
  background: #52c41a;
}

.dot--warn {
  background: #faad14;
}

.dot--err {
  background: #f5222d;
}

.summary-num {
  font-size: 26px;
  font-weight: 700;
  color: #fff;
  line-height: 1;
}

.summary-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.88);
}

.monitor-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0 10px 20px 10px;
  -webkit-overflow-scrolling: touch;
  position: relative;
}

.list-sticky-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #0d0d0d;
  margin: -10px -10px 0;
  padding: 20px 10px 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-title {
  font-size: 17px;
  font-weight: 600;
  color: #fff;
}

.section-meta {
  font-size: 12px;
  color: #8e8e93;
}

.search-wrap {
  margin-bottom: 16px;
}

.search-input {
  width: 100%;
  height: 40px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
}

.search-input::placeholder {
  color: #8e8e93;
}

.search-input:focus {
  border-color: #8e94f2;
}

.system-card {
  position: relative;
  background: #161618;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 10px;
  margin-bottom: 12px;
}

.system-card__head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
  padding-right: 52px;
}

.system-card .detail-btn {
  position: absolute;
  top: 20px;
  right: 20px;
}

.system-icon {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
}

.system-icon svg {
  width: 100%;
  height: 100%;
  display: block;
}

.system-icon--core {
  display: flex;
  align-items: center;
  justify-content: center;
}

.system-icon--core circle {
  fill: #1b3d2f;
}

.system-icon--sm {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.system-icon--sm.tone-a {
  background: radial-gradient(circle at 30% 30%, #2d4a3e, #1b3d2f);
}
.system-icon--sm.tone-b {
  background: radial-gradient(circle at 30% 30%, #4a3d2d, #3d351b);
}
.system-icon--sm.tone-c {
  background: radial-gradient(circle at 30% 30%, #2d3a4a, #1b2d3d);
}
.system-icon--sm.tone-d {
  background: radial-gradient(circle at 30% 30%, #3a2d4a, #2d1b3d);
}
.system-icon--sm.tone-e {
  background: radial-gradient(circle at 30% 30%, #4a2d2d, #3d1b1b);
}

.system-card__titles {
  flex: 1;
  min-width: 0;
}

.system-name {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  line-height: 1.3;
}

.system-status {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  font-size: 12px;
}

.system-status--ok {
  color: #52c41a;
}

.system-status--warn {
  color: #faad14;
}

.system-status--err {
  color: #f5222d;
}

.metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.metric-cell {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 14px 12px 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.metric-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 6px;
}

.metric-label {
  font-size: 11px;
  color: #8e8e93;
  line-height: 1.3;
}

.metric-value {
  margin-top: 6px;
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
}

.trend {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}

.trend svg {
  flex-shrink: 0;
}

.trend--up {
  color: #52c41a;
}

.trend--down {
  color: #f5222d;
}

.trend--flat {
  color: #8e8e93;
}

.trend-dash {
  margin-right: 1px;
}

.spark-bar {
  height: 4px;
  margin-top: 10px;
  border-radius: 2px;
}

.spark-bar--green {
  background: #52c41a;
}

.spark-bar--purple {
  background: #9b59b6;
}

.detail-btn {
  padding: 4px 10px;
  font-size: 12px;
  color: #8e94f2;
  background: rgba(142, 148, 242, 0.15);
  border: 1px solid rgba(142, 148, 242, 0.4);
  border-radius: 8px;
  cursor: pointer;
}

.detail-btn:active {
  opacity: 0.8;
}
</style>
