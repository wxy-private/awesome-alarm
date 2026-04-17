<template>
  <div class="detail-page">
    <header class="detail-header">
      <div class="detail-header__title-wrap">
        <h1 class="detail-title">系统详情监控</h1>
        <p class="detail-subtitle">
          <span class="detail-subtitle__dot" />
          实时性能观测平台 · 正在运行
        </p>
      </div>
      <div class="detail-header__actions">
        <button type="button" class="action-btn action-btn--ghost">
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <polyline points="7 10 12 15 17 10" stroke-linecap="round" stroke-linejoin="round" />
            <line x1="12" y1="15" x2="12" y2="3" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          导出数据报告
        </button>
        <button type="button" class="action-btn action-btn--primary" @click="handleRefresh">
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M21 12a9 9 0 1 1-2.64-6.36" stroke-linecap="round" />
            <path d="M21 3v6h-6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          立即刷新
        </button>
      </div>
    </header>

    <section class="chart-grid">
      <article class="chart-card">
        <h3 class="chart-card__title">交易量</h3>
        <div ref="chartVolumeRef" class="chart-canvas" />
      </article>
      <article class="chart-card">
        <h3 class="chart-card__title">响应时间</h3>
        <div ref="chartLatencyRef" class="chart-canvas" />
      </article>
      <article class="chart-card">
        <h3 class="chart-card__title">响应率</h3>
        <div ref="chartStabilityRef" class="chart-canvas" />
      </article>
      <article class="chart-card">
        <h3 class="chart-card__title">正确率</h3>
        <div ref="chartAccuracyRef" class="chart-canvas" />
      </article>
    </section>

    <section class="table-card">
      <div class="table-search">
        <svg
          class="table-search__icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="11" cy="11" r="8" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M21 21l-4.35-4.35" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="搜索接口..."
          class="table-search__input"
        />
      </div>

      <div class="table-scroll-wrap">
        <table class="detail-table">
          <thead>
            <tr>
              <th class="detail-table__sticky-col">接口名称</th>
              <th>运行状态</th>
              <th>平均耗时</th>
              <th>QPS</th>
              <th>错误率</th>
              <th>最近更新时间</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in paginatedInterfaces"
              :key="item.name"
              class="detail-table__row"
              @click="openInterfaceDialog(item)"
            >
              <td class="detail-table__api detail-table__sticky-col">{{ item.name }}</td>
              <td>
                <span class="status-pill" :class="getStatusClass(item.status)">
                  <span class="status-pill__dot" />
                  {{ item.status }}
                </span>
              </td>
              <td>{{ item.latency }}</td>
              <td>{{ item.qps }}</td>
              <td>{{ item.errorRate }}</td>
              <td>{{ item.updatedAt }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="table-pagination">
        <button
          type="button"
          class="page-btn"
          :disabled="currentPage <= 1"
          @click="currentPage = Math.max(1, currentPage - 1)"
        >
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <span class="page-indicator">
          <span class="page-current">{{ currentPage }}</span>
          / {{ totalPages }}
        </span>
        <button
          type="button"
          class="page-btn"
          :disabled="currentPage >= totalPages"
          @click="currentPage = Math.min(totalPages, currentPage + 1)"
        >
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>
    </section>

    <div
      v-if="showInterfaceDialog && selectedInterface"
      class="api-dialog-mask"
      @click="closeInterfaceDialog"
    >
      <div class="api-dialog" @click.stop>
        <header class="api-dialog__header">
          <div>
            <div class="api-dialog__title-wrap">
              <h3 class="api-dialog__title">{{ selectedInterface.name }}</h3>
              <span class="api-dialog__status" :class="getStatusClass(selectedInterface.status)">
                <span class="api-dialog__status-dot"></span>
                {{ selectedInterface.status }}
              </span>
            </div>
          </div>
          <button type="button" class="api-dialog__close" @click="closeInterfaceDialog">×</button>
        </header>

        <section class="api-dialog__trace">
          <h4 class="api-dialog__section-title">
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              style="margin-right: 8px"
            >
              <path
                d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            调用链路与节点耗时
          </h4>
          <div class="api-dialog__trace-item">
            <div class="api-dialog__trace-dot api-dialog__trace-dot--blue"></div>
            <div class="api-dialog__trace-content">
              <div class="api-dialog__trace-title">API 网关</div>
              <div class="api-dialog__trace-time api-dialog__trace-time--blue">4ms</div>
            </div>
          </div>
          <div class="api-dialog__trace-item">
            <div class="api-dialog__trace-dot api-dialog__trace-dot--orange"></div>
            <div class="api-dialog__trace-content">
              <div class="api-dialog__trace-title">认证服务</div>
              <div class="api-dialog__trace-time api-dialog__trace-time--orange">3ms</div>
            </div>
          </div>
          <div class="api-dialog__trace-item">
            <div class="api-dialog__trace-dot api-dialog__trace-dot--purple"></div>
            <div class="api-dialog__trace-content">
              <div class="api-dialog__trace-title">业务服务</div>
              <div class="api-dialog__trace-time api-dialog__trace-time--purple">8ms</div>
            </div>
          </div>
          <div class="api-dialog__trace-item">
            <div class="api-dialog__trace-dot api-dialog__trace-dot--green"></div>
            <div class="api-dialog__trace-content">
              <div class="api-dialog__trace-title">缓存/数据库</div>
              <div class="api-dialog__trace-time api-dialog__trace-time--green">5ms</div>
            </div>
          </div>
        </section>

        <section class="api-dialog__errors">
          <h4 class="api-dialog__section-title">最近错误分布</h4>
          <ul class="api-dialog__errors-list">
            <li
              v-for="err in selectedInterfaceCallDetail.errors"
              :key="err.code"
              class="api-dialog__error-item"
            >
              <span class="api-dialog__error-code">{{ err.code }}</span>
              <span class="api-dialog__error-count">{{ err.count }} 次</span>
            </li>
          </ul>
        </section>

        <section class="api-dialog__calls">
          <h4 class="api-dialog__section-title">近5次调用记录</h4>
          <div class="api-dialog__calls-header">
            <span>时间</span>
            <span>方法</span>
            <span>路径</span>
          </div>
          <ul class="api-dialog__calls-list">
            <li
              v-for="log in selectedInterfaceCallDetail.recentCalls"
              :key="log.id"
              class="api-dialog__call-item"
            >
              <span class="api-dialog__call-time">{{ log.time }}</span>
              <span class="api-dialog__call-method">{{ log.method.split(' ')[0] }}</span>
              <span class="api-dialog__call-path">{{ log.method.split(' ')[1] }}</span>
            </li>
          </ul>
        </section>

        <section class="api-dialog__context">
          <h4 class="api-dialog__section-title">请求上下文 (Request Context)</h4>
          <ul class="api-dialog__context-list">
            <li class="api-dialog__context-item">
              <span class="api-dialog__context-key">ENVIRONMENT</span>
              <span class="api-dialog__context-value">{{
                selectedInterfaceCallDetail.context.env
              }}</span>
            </li>
            <li class="api-dialog__context-item">
              <span class="api-dialog__context-key">INSTANCE</span>
              <span class="api-dialog__context-value">{{
                selectedInterfaceCallDetail.context.instance
              }}</span>
            </li>
            <li class="api-dialog__context-item">
              <span class="api-dialog__context-key">REGION</span>
              <span class="api-dialog__context-value">{{
                selectedInterfaceCallDetail.context.region
              }}</span>
            </li>
            <li class="api-dialog__context-item">
              <span class="api-dialog__context-key">VERSION</span>
              <span class="api-dialog__context-value">{{
                selectedInterfaceCallDetail.context.version
              }}</span>
            </li>
            <li class="api-dialog__context-item">
              <span class="api-dialog__context-key">CALLER</span>
              <span class="api-dialog__context-value">{{
                selectedInterfaceCallDetail.context.caller
              }}</span>
            </li>
            <li class="api-dialog__context-item">
              <span class="api-dialog__context-key">LAST_DEPLOY</span>
              <span class="api-dialog__context-value">{{
                selectedInterfaceCallDetail.context.lastDeploy
              }}</span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { Chart } from '@antv/g2'

const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = 8

type InterfaceItem = {
  name: string
  status: '正常' | '警告' | '异常'
  latency: string
  qps: string
  errorRate: string
  updatedAt: string
}

type InterfaceCallDetail = {
  peakQps: string
  p95Latency: string
  successRate: string
  timeoutRate: string
  retryRate: string
  traceNodes: Array<{ name: string; cost: string; costPercent: number }>
  errors: Array<{ code: string; message: string; count: number }>
  recentCalls: Array<{ id: string; time: string; method: string; status: string; cost: string }>
  context: {
    env: string
    instance: string
    region: string
    version: string
    caller: string
    lastDeploy: string
  }
}

const interfaces: InterfaceItem[] = Array.from({ length: 36 }, (_, idx) => {
  const statusPool = ['正常', '警告', '异常'] as const
  const servicePool = [
    'UserAuth_API',
    'Inventory_Sync',
    'Payment_Gateway',
    'Analytics_Push',
    'Logistics_Tracker',
    'Order_Center',
    'Notification_Hub',
    'CRM_DataBridge',
    'Report_Engine',
  ]
  const serviceName = servicePool[idx % servicePool.length] ?? 'Unknown_Service'
  const status = statusPool[idx % statusPool.length] ?? '正常'

  return {
    name: `${serviceName}_${String(idx + 1).padStart(2, '0')}`,
    status,
    latency: `${(20 + (idx % 9) * 7).toFixed(0)}ms`,
    qps: `${120 + idx * 13}`,
    errorRate: `${((idx % 7) * 0.12).toFixed(2)}%`,
    updatedAt: `2026-03-24 ${String((8 + idx) % 24).padStart(2, '0')}:${String((idx * 7) % 60).padStart(2, '0')}`,
  }
})

const showInterfaceDialog = ref(false)
const selectedInterface = ref<InterfaceItem | null>(null)

const selectedInterfaceCallDetail = computed<InterfaceCallDetail>(() => {
  const item = selectedInterface.value
  if (!item) {
    return {
      peakQps: '-',
      p95Latency: '-',
      successRate: '-',
      timeoutRate: '-',
      retryRate: '-',
      traceNodes: [],
      errors: [],
      recentCalls: [],
      context: {
        env: '-',
        instance: '-',
        region: '-',
        version: '-',
        caller: '-',
        lastDeploy: '-',
      },
    }
  }

  const baseQps = Number(item.qps)
  const baseLatency = Number(item.latency.replace('ms', ''))
  const minute = item.updatedAt.slice(-2)

  return {
    peakQps: `${Math.round(baseQps * 1.45)}`,
    p95Latency: `${Math.round(baseLatency * 1.35)}ms`,
    successRate: `${(100 - Number(item.errorRate.replace('%', ''))).toFixed(2)}%`,
    timeoutRate: `${(Number(item.errorRate.replace('%', '')) * 0.35 + 0.03).toFixed(2)}%`,
    retryRate: `${(Number(item.errorRate.replace('%', '')) * 0.7 + 0.08).toFixed(2)}%`,
    traceNodes: [
      { name: 'API Gateway', cost: `${Math.round(baseLatency * 0.18)}ms`, costPercent: 18 },
      { name: 'Auth Service', cost: `${Math.round(baseLatency * 0.14)}ms`, costPercent: 14 },
      { name: 'Biz Service', cost: `${Math.round(baseLatency * 0.42)}ms`, costPercent: 42 },
      { name: 'Cache/DB', cost: `${Math.round(baseLatency * 0.26)}ms`, costPercent: 26 },
    ],
    errors: [
      { code: 'E_TIMEOUT', message: '下游服务响应超时', count: 12 + (baseQps % 9) },
      { code: 'E_RATE_LIMIT', message: '触发限流策略', count: 5 + (baseQps % 5) },
      { code: 'E_BAD_REQUEST', message: '参数校验失败', count: 3 + (baseQps % 4) },
      { code: 'E_UPSTREAM_502', message: '上游网关错误', count: 2 + (baseQps % 3) },
    ],
    recentCalls: [
      {
        id: `${item.name}-1`,
        time: `15:${minute}:02`,
        method: 'POST /v1/request',
        status: '200',
        cost: `${baseLatency - 4}ms`,
      },
      {
        id: `${item.name}-2`,
        time: `15:${minute}:18`,
        method: 'POST /v1/request',
        status: '200',
        cost: `${baseLatency + 3}ms`,
      },
      {
        id: `${item.name}-3`,
        time: `15:${minute}:31`,
        method: 'GET /v1/detail',
        status: '200',
        cost: `${baseLatency - 1}ms`,
      },
      {
        id: `${item.name}-4`,
        time: `15:${minute}:46`,
        method: 'POST /v1/request',
        status: '429',
        cost: `${baseLatency + 16}ms`,
      },
      {
        id: `${item.name}-5`,
        time: `15:${minute}:57`,
        method: 'GET /v1/detail',
        status: '200',
        cost: `${baseLatency}ms`,
      },
    ],
    context: {
      env: 'prod',
      instance: `${item.name.toLowerCase()}-pod-02`,
      region: 'cn-east-1',
      version: 'v2.14.3',
      caller: 'order-center / workflow-engine',
      lastDeploy: '2026-03-24 22:10',
    },
  }
})

function openInterfaceDialog(item: InterfaceItem) {
  selectedInterface.value = item
  showInterfaceDialog.value = true
}

function closeInterfaceDialog() {
  showInterfaceDialog.value = false
}

const filteredInterfaces = computed(() => {
  const kw = searchKeyword.value.trim().toLowerCase()
  if (!kw) return interfaces
  return interfaces.filter((i) => i.name.toLowerCase().includes(kw))
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredInterfaces.value.length / pageSize)),
)

const paginatedInterfaces = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredInterfaces.value.slice(start, start + pageSize)
})

watch(searchKeyword, () => {
  currentPage.value = 1
})

watch(filteredInterfaces, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value
  }
})

function getStatusClass(status: string) {
  switch (status) {
    case '正常':
      return 'status-pill--running'
    case '警告':
      return 'status-pill--warning'
    case '异常':
      return 'status-pill--active'
    default:
      return 'status-pill--default'
  }
}

function handleRefresh() {
  initAllCharts()
}

const chartVolumeRef = ref<HTMLElement>()
const chartLatencyRef = ref<HTMLElement>()
const chartStabilityRef = ref<HTMLElement>()
const chartAccuracyRef = ref<HTMLElement>()

const charts: Chart[] = []

function genChartData(
  count: number,
  yMin: number,
  yMax: number,
  waveType: 'wave' | 'flat' | 'flat100' | 'latency',
): { time: string; value: number }[] {
  const data: { time: string; value: number }[] = []
  const range = yMax - yMin
  for (let i = 0; i <= count; i++) {
    const t = i / count
    let value: number
    if (waveType === 'flat100') {
      value =
        yMin +
        range * (0.76 + Math.sin(t * Math.PI * 3.2) * 0.2 + Math.sin(t * Math.PI * 2.1) * 0.12)
    } else if (waveType === 'flat') {
      value =
        yMin +
        range * (0.68 + Math.sin(t * Math.PI * 2.8) * 0.24 + Math.sin(t * Math.PI * 1.9) * 0.14)
    } else if (waveType === 'latency') {
      const wave = Math.sin(t * Math.PI * 4.2) * 0.72 + Math.sin(t * Math.PI * 2.8) * 0.5
      value = yMin + range * (0.45 + wave * 0.6)
    } else {
      const wave = Math.sin(t * Math.PI * 3.2) * 0.68 + Math.sin(t * Math.PI * 2.1) * 0.44
      value = yMin + range * (0.38 + wave * 0.66)
    }
    data.push({
      time: `${String(Math.floor(t * 24)).padStart(2, '0')}:00`,
      value: Math.max(yMin, Math.min(yMax, value)),
    })
  }
  return data
}

function createChart(
  container: HTMLElement,
  data: { time: string; value: number }[],
  color: string,
) {
  const width = Math.max(240, container.clientWidth || container.offsetWidth || 0)
  const height = Math.max(200, container.clientHeight || 0)

  const chart = new Chart({
    container,
    autoFit: false,
    width,
    height,
    paddingLeft: 8,
    paddingRight: 0,
    paddingTop: 8,
    paddingBottom: 8,
    theme: 'classicDark',
  })

  chart.options({
    type: 'view',
    data: { value: data },
    scale: {
      x: { type: 'point', range: [0, 1], padding: 0 },
      y: { nice: true, tickCount: 3 },
    },
    axis: {
      x: {
        title: false,
        tick: true,
        tickLine: true,
        line: true,
        labelFill: '#8e8e93',
        lineStroke: 'rgba(255,255,255,0.45)',
        tickStroke: 'rgba(255,255,255,0.35)',
        labelSpacing: 6,
        grid: false,
      },
      y: {
        title: false,
        tick: false,
        tickLine: false,
        line: true,
        labelFill: '#8e8e93',
        labelSpacing: 4,
        lineStroke: 'rgba(255,255,255,0.45)',
        grid: true,
        gridStroke: 'rgba(255,255,255,0.08)',
      },
    },
    children: [
      {
        type: 'area',
        encode: { x: 'time', y: 'value', shape: 'smooth' },
        style: {
          fill: `l(270) 0:${color}59 1:${color}00`,
        },
      },
      {
        type: 'line',
        encode: { x: 'time', y: 'value', shape: 'smooth' },
        style: {
          stroke: color,
          lineWidth: 2,
        },
      },
    ],
  })

  void chart.render()
  return chart
}

function initAllCharts() {
  charts.forEach((c) => {
    try {
      c?.destroy()
    } catch {
      // ignore
    }
  })
  charts.length = 0

  nextTick(() => {
    if (chartVolumeRef.value) {
      const data = genChartData(7, 0, 100, 'wave')
      charts.push(createChart(chartVolumeRef.value, data, '#3498DB'))
    }
    if (chartLatencyRef.value) {
      const data = genChartData(7, 0, 500, 'latency')
      charts.push(createChart(chartLatencyRef.value, data, '#E67E22'))
    }
    if (chartStabilityRef.value) {
      const data = genChartData(7, 0, 100, 'flat')
      charts.push(createChart(chartStabilityRef.value, data, '#52C41A'))
    }
    if (chartAccuracyRef.value) {
      const data = genChartData(7, 0, 100, 'flat100')
      charts.push(createChart(chartAccuracyRef.value, data, '#9B59B6'))
    }
  })
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  initAllCharts()
  const wrap = chartVolumeRef.value?.parentElement
  if (wrap) {
    resizeObserver = new ResizeObserver(() => initAllCharts())
    resizeObserver.observe(wrap)
  }
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  charts.forEach((c) => {
    try {
      c?.destroy()
    } catch {
      // ignore
    }
  })
})
</script>

<style scoped>
.detail-page {
  min-height: 100vh;
  background: #0d0d0d;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  color: #fff;
  box-sizing: border-box;
  overflow: visible;
}

.detail-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.detail-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.25;
}

.detail-subtitle {
  margin: 6px 0 0;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #8e8e93;
}

.detail-subtitle__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #00e5ff;
  box-shadow: 0 0 8px rgba(0, 229, 255, 0.8);
}

.detail-header__actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.action-btn {
  height: 34px;
  border-radius: 10px;
  border: 1px solid transparent;
  padding: 0 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  cursor: pointer;
}

.action-btn--ghost {
  background: #1b1b1d;
  border-color: rgba(255, 255, 255, 0.08);
  color: #d6d6d8;
}

.action-btn--primary {
  background: #00e5ff;
  color: #0b1418;
  font-weight: 600;
}

.chart-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.chart-card {
  background: #151517;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 14px;
}

.chart-card__title {
  margin: 0 0 8px;
  font-size: 13px;
  color: #8e8e93;
  font-weight: 500;
}

.chart-canvas {
  width: 100%;
  height: 200px;
}

.table-card {
  flex: 1;
  min-height: 0;
  background: #151517;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 14px;
  display: flex;
  flex-direction: column;
}

.table-search {
  position: relative;
  margin-bottom: 10px;
}

.table-search__icon {
  position: absolute;
  left: 10px;
  top: 50%;
  width: 14px;
  height: 14px;
  transform: translateY(-50%);
  color: #6b7280;
}

.table-search__input {
  width: 100%;
  height: 36px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: #1b1b1d;
  color: #fff;
  padding: 0 12px 0 32px;
  box-sizing: border-box;
  font-size: 13px;
  outline: none;
}

.table-search__input::placeholder {
  color: #6b7280;
}

.table-search__input:focus {
  border-color: rgba(0, 229, 255, 0.45);
}

.table-scroll-wrap {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  border-radius: 10px;
}

.detail-table {
  width: max-content;
  min-width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 13px;
}

.detail-table th,
.detail-table td {
  min-width: 140px;
  text-align: left;
  padding: 10px 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: #151517;
  white-space: nowrap;
}

.detail-table th {
  color: #8e8e93;
  font-weight: 500;
}

.detail-table td {
  border-bottom-color: rgba(255, 255, 255, 0.05);
}

.detail-table__sticky-col {
  position: sticky;
  left: 0;
  z-index: 3;
  min-width: 220px;
  box-shadow: 8px 0 12px -10px rgba(0, 0, 0, 0.7);
}

.detail-table th.detail-table__sticky-col {
  z-index: 4;
}

.detail-table__api {
  color: #fff;
  font-family: 'JetBrains Mono', 'SFMono-Regular', Consolas, monospace;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 999px;
  background: #1d1d1f;
  font-size: 11px;
  font-weight: 600;
}

.status-pill__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.status-pill--running {
  color: #00e5ff;
}

.status-pill--warning {
  color: #f97316;
}

.status-pill--active {
  color: #f3f4f6;
}

.status-pill--default {
  color: #9ca3af;
}

.table-pagination {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding-top: 12px;
}

.page-btn {
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 7px;
  color: #8e8e93;
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-indicator {
  font-size: 12px;
  color: #8e8e93;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.page-current {
  width: 24px;
  height: 24px;
  border-radius: 7px;
  background: #00e5ff;
  color: #0b1418;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.detail-table__row {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.detail-table__row:hover td {
  background: #1a1a1d;
}

.api-dialog-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(2px);
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.api-dialog {
  width: min(980px, 95vw);
  max-height: 88vh;
  overflow-y: auto;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: #0f1116;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  padding: 20px;
}

.api-dialog__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}

.api-dialog__header > div {
  display: flex;
  align-items: center;
  gap: 12px;
}

.api-dialog__title-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.api-dialog__title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}

.api-dialog__status {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  background: #1a1d23;
}

.api-dialog__status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.api-dialog__status.status-pill--running {
  color: #00e5ff;
}

.api-dialog__status.status-pill--warning {
  color: #f97316;
}

.api-dialog__status.status-pill--active {
  color: #f3f4f6;
}

.api-dialog__status.status-pill--default {
  color: #9ca3af;
}

.api-dialog__close {
  width: 28px;
  height: 28px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: transparent;
  color: #cfd3dc;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
}

.api-dialog__trace {
  margin-bottom: 20px;
}

.api-dialog__trace-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.api-dialog__trace-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  position: relative;
}

.api-dialog__trace-dot::after {
  content: '';
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 16px;
  background: #1a1d23;
}

.api-dialog__trace-item:last-child .api-dialog__trace-dot::after {
  display: none;
}

.api-dialog__trace-dot--blue {
  background: #3498db;
  box-shadow: 0 0 8px rgba(52, 152, 219, 0.6);
}

.api-dialog__trace-dot--orange {
  background: #f97316;
  box-shadow: 0 0 8px rgba(249, 115, 22, 0.6);
}

.api-dialog__trace-dot--purple {
  background: #9b59b6;
  box-shadow: 0 0 8px rgba(155, 89, 182, 0.6);
}

.api-dialog__trace-dot--green {
  background: #27ae60;
  box-shadow: 0 0 8px rgba(39, 174, 96, 0.6);
}

.api-dialog__trace-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #1a1d23;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.api-dialog__trace-title {
  color: #e6ebf5;
  font-size: 13px;
  font-weight: 500;
}

.api-dialog__trace-time {
  font-size: 12px;
  font-weight: 600;
}

.api-dialog__trace-time--blue {
  color: #3498db;
}

.api-dialog__trace-time--orange {
  color: #f97316;
}

.api-dialog__trace-time--purple {
  color: #9b59b6;
}

.api-dialog__trace-time--green {
  color: #27ae60;
}

.api-dialog__section-title {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: #e6ebf5;
}

.api-dialog__errors {
  margin-bottom: 20px;
}

.api-dialog__errors-list {
  list-style: none;
  margin: 0;
  padding: 0;
  background: #1a1d23;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.api-dialog__error-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.api-dialog__error-item:last-child {
  border-bottom: none;
}

.api-dialog__error-code {
  color: #e6ebf5;
  font-size: 13px;
  font-family: 'JetBrains Mono', 'SFMono-Regular', Consolas, monospace;
}

.api-dialog__error-count {
  color: #8e8e93;
  font-size: 12px;
}

.api-dialog__calls {
  margin-bottom: 20px;
}

.api-dialog__calls-header {
  display: grid;
  grid-template-columns: 80px 60px 1fr;
  gap: 12px;
  padding: 8px 12px;
  background: #1a1d23;
  border-radius: 8px 8px 0 0;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-bottom: none;
  color: #8e8e93;
  font-size: 12px;
  font-weight: 500;
}

.api-dialog__calls-list {
  list-style: none;
  margin: 0;
  padding: 0;
  background: #1a1d23;
  border-radius: 0 0 8px 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-top: none;
  overflow: hidden;
}

.api-dialog__call-item {
  display: grid;
  grid-template-columns: 80px 60px 1fr;
  gap: 12px;
  padding: 10px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.api-dialog__call-item:last-child {
  border-bottom: none;
}

.api-dialog__call-time {
  color: #8e8e93;
  font-size: 12px;
}

.api-dialog__call-method {
  color: #3498db;
  font-size: 12px;
  font-weight: 600;
  font-family: 'JetBrains Mono', 'SFMono-Regular', Consolas, monospace;
}

.api-dialog__call-path {
  color: #e6ebf5;
  font-size: 12px;
  font-family: 'JetBrains Mono', 'SFMono-Regular', Consolas, monospace;
}

.api-dialog__context {
  margin-bottom: 20px;
}

.api-dialog__context-list {
  list-style: none;
  margin: 0;
  padding: 0;
  background: #1a1d23;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.api-dialog__context-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.api-dialog__context-item:last-child {
  border-bottom: none;
}

.api-dialog__context-key {
  color: #8e8e93;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  font-family: 'JetBrains Mono', 'SFMono-Regular', Consolas, monospace;
}

.api-dialog__context-value {
  color: #e6ebf5;
  font-size: 12px;
  font-family: 'JetBrains Mono', 'SFMono-Regular', Consolas, monospace;
}

@media (max-width: 768px) {
  .detail-page {
    padding: 16px;
    gap: 12px;
  }

  .detail-header {
    flex-direction: column;
  }

  .detail-header__actions {
    width: 100%;
  }

  .action-btn {
    flex: 1;
    justify-content: center;
  }
}
</style>
