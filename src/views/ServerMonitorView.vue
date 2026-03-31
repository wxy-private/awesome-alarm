<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, computed } from 'vue'
import { useRoute } from 'vue-router'
import * as echarts from 'echarts'

const route = useRoute()

const appName = computed(() => route.query.appName as string || '交易系统')
const appId = computed(() => route.query.appId as string || 'APP-PRD-001')
const status = computed(() => route.query.status as string || 'normal') // normal, warning, critical

// Theme color is always blue regardless of status
const themeColor = computed(() => '#4A9EFF')

const gradientClass = computed(() => {
  return 'bg-[radial-gradient(circle,rgba(74,158,255,0.15)_0%,transparent_70%)]'
})

const getStatusConfig = () => {
  if (status.value === 'critical') {
    return { color: '#FF453A', text: '服务故障' }
  }
  if (status.value === 'warning') {
    return { color: '#FF9F0A', text: '服务警戒' }
  }
  return { color: '#32D74B', text: '正常运行' }
}

const statusConfig = computed(() => getStatusConfig())

interface ServiceItem {
  key: string
  name: string
  abbr: string
  volume: string
  latency: string
  tone: 'blue' | 'pink' | 'orange'
}

const services = ref<ServiceItem[]>([
  { key: 'order',     name: 'order-service',     abbr: 'ORD',  volume: '1.24M', latency: '120ms', tone: 'blue' },
  { key: 'payment',   name: 'payment-gateway',   abbr: 'PAY',  volume: '842K',  latency: '85ms',  tone: 'pink' },
  { key: 'inventory', name: 'inventory-sync',    abbr: 'INV',  volume: '320K',  latency: '450ms', tone: 'orange' },
  { key: 'auth',      name: 'user-auth',         abbr: 'AUTH', volume: '2.1M',  latency: '40ms',  tone: 'blue' },
  { key: 'notify',    name: 'notification-svc',  abbr: 'NTF',  volume: '580K',  latency: '65ms',  tone: 'blue' },
])

const activeService   = ref<string>('order')
const activeTimeRange = ref<number>(30)

const timeRanges = [
  { label: '30m', value: 30   },
  { label: '1h',  value: 60   },
  { label: '6h',  value: 360  },
  { label: '24h', value: 1440 },
]

const selectService = (key: string) => { activeService.value = key }

const chart0Ref = ref<HTMLDivElement | null>(null)
const chart1Ref = ref<HTMLDivElement | null>(null)
const chart2Ref = ref<HTMLDivElement | null>(null)
const chart3Ref = ref<HTMLDivElement | null>(null)

const allChartRefs = [chart0Ref, chart1Ref, chart2Ref, chart3Ref]

interface ChartInstance {
  chart: echarts.ECharts | null
  resizeObserver?: ResizeObserver | null
  hideTooltipHandler?: (e: MouseEvent | TouchEvent) => void
}

const chartInstances: ChartInstance[] = Array.from({ length: 4 }, () => ({ chart: null }))

const generateData = (points: number, min: number, max: number) => {
  const now = Math.floor(Date.now() / 1000)
  return Array.from({ length: points + 1 }, (_, i) => ({
    time:  now - (points - i) * 60,
    value: Math.random() * (max - min) + min,
  }))
}

const volumeData   = generateData(100, 10, 50)
const responseData = generateData(100, 10, 40)
const successData  = generateData(100, 95, 100)
const tpsData      = generateData(100, 2000, 4000)

// API list data
interface ApiItem {
  method: 'POST' | 'GET'
  path: string
  volume: string
  avgMs: number
  successRate: number
  errorsNum: number
  p99Ms: number
  data: { time: number; value: number }[]
}

const getApiScore = (api: ApiItem): number => {
  let s = 0
  if (api.p99Ms > 500) s += 3
  else if (api.p99Ms > 200) s += 1
  if (api.successRate < 99) s += 2
  if (api.errorsNum > 100) s += 2
  else if (api.errorsNum > 10) s += 1
  return s
}

// Generate 18 API items
const apiItems: ApiItem[] = [
  { method: 'POST', path: '/api/v2/order/create',      volume: '842K', avgMs: 145, successRate: 99.8, errorsNum: 16,   p99Ms: 280, data: generateData(20, 10, 50) },
  { method: 'GET',  path: '/api/v2/order/status/{id}', volume: '2.1M', avgMs: 42,  successRate: 99.9, errorsNum: 5,    p99Ms: 85,  data: generateData(20, 10, 50) },
  { method: 'POST', path: '/api/v2/inventory/lock',    volume: '820K', avgMs: 450, successRate: 98.5, errorsNum: 1200, p99Ms: 850, data: generateData(20, 10, 50) },
  { method: 'GET',  path: '/api/v1/user/profile',      volume: '3.5M', avgMs: 25,  successRate: 99.9, errorsNum: 12,   p99Ms: 65,  data: generateData(20, 10, 50) },
  { method: 'POST', path: '/api/v1/payment/process',   volume: '450K', avgMs: 210, successRate: 99.5, errorsNum: 85,   p99Ms: 420, data: generateData(20, 10, 50) },
  { method: 'GET',  path: '/api/v2/products/list',     volume: '5.2M', avgMs: 85,  successRate: 99.7, errorsNum: 340,  p99Ms: 190, data: generateData(20, 10, 50) },
  { method: 'POST', path: '/api/v1/auth/login',        volume: '1.2M', avgMs: 180, successRate: 99.2, errorsNum: 450,  p99Ms: 350, data: generateData(20, 10, 50) },
  { method: 'GET',  path: '/api/v1/cart/items',        volume: '2.8M', avgMs: 65,  successRate: 99.8, errorsNum: 45,   p99Ms: 140, data: generateData(20, 10, 50) },
  { method: 'POST', path: '/api/v2/checkout/submit',   volume: '380K', avgMs: 320, successRate: 98.9, errorsNum: 210,  p99Ms: 680, data: generateData(20, 10, 50) },
  { method: 'GET',  path: '/api/v1/notifications',     volume: '4.1M', avgMs: 35,  successRate: 99.9, errorsNum: 8,    p99Ms: 95,  data: generateData(20, 10, 50) },
  { method: 'POST', path: '/api/v1/review/add',        volume: '150K', avgMs: 120, successRate: 99.6, errorsNum: 25,   p99Ms: 240, data: generateData(20, 10, 50) },
  { method: 'GET',  path: '/api/v2/search/query',      volume: '6.5M', avgMs: 110, successRate: 99.4, errorsNum: 890,  p99Ms: 310, data: generateData(20, 10, 50) },
  { method: 'POST', path: '/api/v1/user/register',     volume: '85K',  avgMs: 240, successRate: 99.1, errorsNum: 65,   p99Ms: 480, data: generateData(20, 10, 50) },
  { method: 'GET',  path: '/api/v1/shipping/rates',    volume: '920K', avgMs: 165, successRate: 99.5, errorsNum: 110,  p99Ms: 340, data: generateData(20, 10, 50) },
  { method: 'POST', path: '/api/v2/wishlist/add',      volume: '640K', avgMs: 55,  successRate: 99.8, errorsNum: 32,   p99Ms: 120, data: generateData(20, 10, 50) },
  { method: 'GET',  path: '/api/v1/promotions/active', volume: '1.8M', avgMs: 45,  successRate: 99.9, errorsNum: 15,   p99Ms: 105, data: generateData(20, 10, 50) },
  { method: 'POST', path: '/api/v1/support/ticket',    volume: '45K',  avgMs: 185, successRate: 99.7, errorsNum: 18,   p99Ms: 380, data: generateData(20, 10, 50) },
  { method: 'GET',  path: '/api/v1/recommendations',   volume: '3.2M', avgMs: 220, successRate: 98.8, errorsNum: 420,  p99Ms: 550, data: generateData(20, 10, 50) },
]

const sortedApiItems = computed(() => [...apiItems].sort((a, b) => getApiScore(b) - getApiScore(a)))

// Pagination logic
const currentPage = ref(1)
const itemsPerPage = 10
const totalPages = computed(() => Math.ceil(sortedApiItems.value.length / itemsPerPage))

const paginatedApiItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return sortedApiItems.value.slice(start, end)
})

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const apiChartRefs = ref<(HTMLDivElement | null)[]>([])
const apiChartInstances: ChartInstance[] = Array.from({ length: 18 }, () => ({ chart: null }))

// Watch for page changes to re-init charts for new items
import { watch } from 'vue'

watch(currentPage, () => {
  nextTick(() => {
    paginatedApiItems.value.forEach((api, i) => {
      const el = apiChartRefs.value[i]
      if (el) {
        if (apiChartInstances[i].chart) {
          apiChartInstances[i].chart?.dispose()
        }
        initChart(el, apiChartInstances[i], api.data, '#4A9EFF', 'area')
      }
    })
  })
})

// Last updated timer
const lastUpdatedSecs = ref(0)
let updateInterval: ReturnType<typeof setInterval> | null = null
// lastUpdatedText unused

const hexToRgb = (hex: string) => {
  const v = hex.replace('#', '').trim()
  if (v.length !== 6) return null
  const r = parseInt(v.slice(0, 2), 16)
  const g = parseInt(v.slice(2, 4), 16)
  const b = parseInt(v.slice(4, 6), 16)
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null
  return { r, g, b }
}

const initChart = (
  el: HTMLDivElement,
  instance: ChartInstance,
  data: { time: number; value: number }[],
  color: string,
  type: 'area' | 'line'
) => {
  instance.chart = echarts.init(el)
  const rgb = hexToRgb(color)
  const seriesData = [...data].sort((a, b) => a.time - b.time).map(d => [d.time * 1000, d.value])

  instance.chart.setOption({
    grid: {
      left:   type === 'line' ? 2 : 0,
      right:  type === 'line' ? 5 : 0,
      top:    5,
      bottom: type === 'line' ? 2 : 0,
      containLabel: type === 'line',
    },
    xAxis: {
      type: 'time',
      show: type === 'line',
      axisLabel: {
        color: 'rgba(255,255,255,0.45)',
        fontSize: 10,
        hideOverlap: true,
        formatter: (v: number) => {
          const d = new Date(v)
          return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
        },
      },
      splitLine: { show: false },
      axisLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.08)' } },
      axisTick: { show: true, lineStyle: { color: 'rgba(255,255,255,0.08)' } },
    },
    yAxis: {
      type: 'value',
      show: type === 'line',
      axisLabel: {
        color: 'rgba(255,255,255,0.45)',
        fontSize: 10,
        hideOverlap: true,
        formatter: (v: number) => v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v,
      },
      splitNumber: 3,
      splitLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.05)', type: 'dashed' } },
      axisLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.08)' } },
      axisTick: { show: true, lineStyle: { color: 'rgba(255,255,255,0.08)' } },
    },
    series: [{
      data: seriesData,
      type: 'line',
      smooth: true,
      showSymbol: false,
      lineStyle: { color, width: 1.5 },
      areaStyle: type === 'area' && rgb ? {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: `rgba(${rgb.r},${rgb.g},${rgb.b},0.28)` },
          { offset: 1, color: `rgba(${rgb.r},${rgb.g},${rgb.b},0)` },
        ]),
      } : undefined,
    }],
    tooltip: {
      show: true,
      trigger: 'axis',
      enterable: true,
      triggerOn: 'mousemove|click',
      axisPointer: {
        type: 'cross',
        label: { fontSize: 9, padding: [2, 4] },
        crossStyle: { color: 'rgba(255,255,255,0.35)' },
      },
      backgroundColor: 'rgba(8,8,8,0.9)',
      borderColor: `${color}40`,
      textStyle: { color: '#fff', fontSize: 10 },
      padding: [4, 8],
      confine: false,
      appendToBody: true,
      formatter: (params: any) => {
        if (!params?.length) return ''
        const d = new Date(params[0].value[0])
        const t = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`
        const val = Number(params[0].value[1]).toFixed(1)
        return `<div class="font-mono">${t}<br/><span style="color:${color};font-weight:bold">${val}</span></div>`
      },
    },
  })

  const ro = new ResizeObserver(() => instance.chart?.resize())
  ro.observe(el)
  instance.resizeObserver = ro

  const hideTooltip = (e: MouseEvent | TouchEvent) => {
    if (el && !el.contains(e.target as Node)) instance.chart?.dispatchAction({ type: 'hideTip' })
  }
  document.addEventListener('touchstart', hideTooltip)
  document.addEventListener('click', hideTooltip)
  instance.hideTooltipHandler = hideTooltip
}

const metrics = ref({
  instances: 8,
  cpu:       '42%',
  memory:    '6.2G',
  qps:       '12.5K',
  errorRate: '0.05%',
  p99:       '180ms',
  restarts:  0,
  health:    '98%',
})

const refreshAllData = (minutes: number) => {
  const points = Math.min(Math.floor(minutes * 4), 200)
  const apiPts = Math.max(10, Math.floor(points / 5))
  const configs = [
    { data: generateData(points, 10, 50),     type: 'line' as const },
    { data: generateData(points, 10, 40),     type: 'line' as const },
    { data: generateData(points, 95, 100),    type: 'line' as const },
    { data: generateData(points, 2000, 4000), type: 'line' as const },
  ]
  chartInstances.forEach((c, i) => {
    if (!c.chart) return
    const seriesData = [...configs[i].data].sort((a, b) => a.time - b.time).map(d => [d.time * 1000, d.value])
    c.chart.setOption({ series: [{ data: seriesData }] })
  })
  apiChartInstances.forEach(c => {
    if (!c.chart) return
    const seriesData = generateData(apiPts, 10, 50).sort((a, b) => a.time - b.time).map(d => [d.time * 1000, d.value])
    c.chart.setOption({ series: [{ data: seriesData }] })
  })
  lastUpdatedSecs.value = 0

  metrics.value = {
    instances: Math.floor(Math.random() * 5) + 5,
    cpu:       `${Math.floor(Math.random() * 60) + 20}%`,
    memory:    `${(Math.random() * 4 + 4).toFixed(1)}G`,
    qps:       `${(Math.random() * 10 + 5).toFixed(1)}K`,
    errorRate: `${(Math.random() * 0.1).toFixed(2)}%`,
    p99:       `${Math.floor(Math.random() * 100) + 100}ms`,
    restarts:  Math.floor(Math.random() * 2),
    health:    `${Math.floor(Math.random() * 5) + 95}%`,
  }

  services.value.forEach(svc => {
    const isM   = svc.volume.includes('M')
    const base  = isM ? 1 : 100
    const unit  = isM ? 'M' : 'K'
    const newVal = (Math.random() * base + base).toFixed(isM ? 2 : 0)
    svc.volume = `${newVal}${unit}`
  })
}

const selectTimeRange = (val: number) => {
  activeTimeRange.value = val
  refreshAllData(val)
}

const cleanupChart = (c: ChartInstance) => {
  c.chart?.dispose()
  c.chart = null
  c.resizeObserver?.disconnect()
  c.resizeObserver = null
  if (c.hideTooltipHandler) {
    document.removeEventListener('touchstart', c.hideTooltipHandler)
    document.removeEventListener('click', c.hideTooltipHandler)
  }
}

onMounted(() => {
  const trendRefs = [
    { data: volumeData,   color: themeColor.value, type: 'line' as const },
    { data: responseData, color: themeColor.value, type: 'line' as const },
    { data: successData,  color: themeColor.value, type: 'line' as const },
    { data: tpsData,      color: themeColor.value, type: 'line' as const },
  ]
  updateInterval = setInterval(() => { lastUpdatedSecs.value++ }, 1000)
  nextTick(() => {
    // Init trend charts + assign group
    allChartRefs.forEach((chartRef, i) => {
      if (chartRef.value) {
        requestAnimationFrame(() => {
          if (!chartRef.value) return
          initChart(chartRef.value, chartInstances[i], trendRefs[i].data, trendRefs[i].color, trendRefs[i].type)
          chartInstances[i].chart!.group = 'monitor-group'
        })
      }
    })
    // Init API sparkline charts
    sortedApiItems.value.forEach((item, i) => {
      requestAnimationFrame(() => {
        const el = apiChartRefs.value[i]
        if (!el) return
        initChart(el, apiChartInstances[i], item.data, themeColor.value, 'area')
      })
    })
    // Connect trend charts (double rAF ensures all are initialized first)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => { echarts.connect('monitor-group') })
    })
  })
})

onBeforeUnmount(() => {
  if (updateInterval) clearInterval(updateInterval)
  chartInstances.forEach(cleanupChart)
  apiChartInstances.forEach(cleanupChart)
})

const goBack = () => history.back()
</script>

<template>
  <div class="server-page min-h-screen pb-10 relative bg-[linear-gradient(180deg,#0a0a0a_0%,#020202_100%)] text-white leading-[1.4]">

    <!-- Nav bar -->
    <div class="sticky top-0 z-50 flex items-center justify-between px-3 py-3 bg-[rgba(5,5,5,0.85)] backdrop-blur-xl border-b border-white/[0.08] sm:px-5 lg:px-8 xl:px-12">
      <button
        class="w-9 h-9 grid place-items-center bg-white/[0.06] border border-white/[0.08] rounded-[10px] text-[#8A8A8E] cursor-pointer transition-all duration-200 hover:bg-white/10 hover:text-white active:scale-95"
        @click="goBack"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
      <span class="text-base font-semibold text-white">应用监控</span>
      <div class="w-9"></div>
    </div>

    <!-- Page container -->
    <div class="relative z-[1] mx-auto w-full px-3 py-2 flex flex-col gap-3 sm:px-5 sm:max-w-3xl lg:px-8 lg:max-w-[1280px] xl:px-12 xl:max-w-[1440px]">

      <!-- Hero card -->
      <div class="relative mt-2">
        <div class="hero-card-glow"></div>
        <div class="glass-card p-4 relative overflow-hidden">
          <div class="hero-card-glow-inner absolute -top-[50%] -right-[30%] w-[200px] h-[200px] blur-[40px] pointer-events-none" :class="gradientClass"></div>

          <div
            class="absolute top-4 right-4 flex items-center gap-1.5 px-2 py-1 rounded-full border"
            :style="{ backgroundColor: statusConfig.color + '15', borderColor: statusConfig.color + '33' }"
          >
            <div
              class="w-1.5 h-1.5 rounded-full status-pulse"
              :style="{ backgroundColor: statusConfig.color, boxShadow: `0 0 8px ${statusConfig.color}` }"
            ></div>
            <span class="text-[10px] font-medium tracking-wider" :style="{ color: statusConfig.color }">{{ statusConfig.text }}</span>
          </div>

          <div class="flex flex-col gap-3">
            <div class="pr-20">
              <h1 class="text-xl font-bold tracking-tight">{{ appName }}</h1>
              <p class="text-xs text-[#555555] mt-0.5 tracking-wider font-mono">{{ appId }}</p>
            </div>
            <!-- 所属中心 -->
            <div class="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-[#555555] shrink-0">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <span class="text-[11px] text-[#555555]">所属中心</span>
              <span class="text-[11px] font-medium text-[#8A8A8E]">·</span>
              <span
                class="text-[11px] font-semibold px-2 py-0.5 rounded-full border"
                :style="{ color: themeColor, backgroundColor: themeColor + '12', borderColor: themeColor + '30' }"
              >交易核心中心</span>
            </div>
            <!-- 负责人 -->
            <div class="flex items-center gap-2 text-sm text-[#8A8A8E]">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span>张伟 (负责人) · 李明 · 王强 · 赵玲</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Service list -->
      <div>
        <div class="flex justify-between items-center mb-1.5">
          <div class="section-title !mb-0">服务列表</div>
          <div class="flex items-center gap-1 bg-white/[0.03] p-0.5 rounded-lg">
            <button
              v-for="tr in timeRanges"
              :key="tr.value"
              class="text-[10px] px-2.5 py-1 rounded-md transition-all duration-200"
              :class="activeTimeRange === tr.value
                ? 'text-[#050505] font-bold shadow-lg'
                : 'text-[#8A8A8E] hover:text-white hover:bg-white/[0.05]'"
              :style="activeTimeRange === tr.value
                ? { backgroundColor: themeColor, boxShadow: `0 0 10px ${themeColor}55` }
                : {}"
              @click="selectTimeRange(tr.value)"
            >{{ tr.label }}</button>
          </div>
        </div>

        <!-- Service chips -->
        <div class="service-scroll flex overflow-x-auto gap-2.5 pb-2 [-webkit-overflow-scrolling:touch]">
          <button
            v-for="svc in services"
            :key="svc.key"
            class="flex-none px-2.5 py-2 flex flex-col gap-1.5 text-left border rounded-xl transition-all duration-200 cursor-pointer min-w-fit active:scale-[0.97]"
            :class="activeService === svc.key ? 'bg-[rgba(74,158,255,0.06)]' : 'bg-[#080808]'"
            :style="activeService === svc.key
              ? { borderColor: themeColor + '80', boxShadow: `0 0 14px ${themeColor}18` }
              : { borderColor: 'rgba(255,255,255,0.08)' }"
            @click="selectService(svc.key)"
          >
            <div class="flex items-center justify-between gap-2">
              <span class="text-[12px] font-bold tracking-wide text-white whitespace-nowrap">{{ svc.name }}</span>
              <span class="text-[10px] px-1 py-0.5 rounded bg-white/[0.06] text-[#32D74B] font-mono whitespace-nowrap">{{ svc.volume }}</span>
            </div>
          </button>
        </div>

        <!-- Metrics grid -->
        <div class="glass-card mt-2 overflow-hidden">
          <div class="flex">
            <div class="flex-1 flex flex-col gap-0.5 p-2 text-center">
              <span class="text-[10px] text-[#555555]">实例数</span>
              <span class="text-xs font-mono text-white">{{ metrics.instances }}</span>
            </div>
            <div class="flex-1 flex flex-col gap-0.5 p-2 text-center border-l border-white/[0.08]">
              <span class="text-[10px] text-[#555555]">CPU</span>
              <span class="text-xs font-mono text-white">{{ metrics.cpu }}</span>
            </div>
            <div class="flex-1 flex flex-col gap-0.5 p-2 text-center border-l border-white/[0.08]">
              <span class="text-[10px] text-[#555555]">内存</span>
              <span class="text-xs font-mono text-white">{{ metrics.memory }}</span>
            </div>
            <div class="flex-1 flex flex-col gap-0.5 p-2 text-center border-l border-white/[0.08]">
              <span class="text-[10px] text-[#555555]">QPS</span>
              <span class="text-xs font-mono" :style="{ color: themeColor }">{{ metrics.qps }}</span>
            </div>
          </div>
          <div class="h-px bg-white/[0.08]"></div>
          <div class="flex">
            <div class="flex-1 flex flex-col gap-0.5 p-2 text-center">
              <span class="text-[10px] text-[#555555]">错误率</span>
              <span class="text-xs font-mono text-[#32D74B]">{{ metrics.errorRate }}</span>
            </div>
            <div class="flex-1 flex flex-col gap-0.5 p-2 text-center border-l border-white/[0.08]">
              <span class="text-[10px] text-[#555555]">延迟P99</span>
              <span class="text-xs font-mono text-white">{{ metrics.p99 }}</span>
            </div>
            <div class="flex-1 flex flex-col gap-0.5 p-2 text-center border-l border-white/[0.08]">
              <span class="text-[10px] text-[#555555]">重启次数</span>
              <span class="text-xs font-mono text-white">{{ metrics.restarts }}</span>
            </div>
            <div class="flex-1 flex flex-col gap-0.5 p-2 text-center border-l border-white/[0.08]">
              <span class="text-[10px] text-[#555555]">健康度</span>
              <span class="text-xs font-mono text-[#32D74B]">{{ metrics.health }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Trend charts -->
      <div>
        <div class="section-title mb-1">趋势图</div>
        <div class="grid grid-cols-2 gap-1.5 lg:grid-cols-4">
          <div v-for="(label, idx) in ['交易量','响应时间','成功率','TPS']" :key="idx" class="glass-card p-1.5 relative overflow-hidden flex flex-col">
            <div class="absolute -top-5 -right-5 w-20 h-20 blur-[20px] pointer-events-none" :class="gradientClass"></div>
            <div class="text-[11px] text-[#8A8A8E] pl-0.5">{{ label }}</div>
            <div class="flex-1 min-h-[75px]">
              <div :ref="(el) => { if(el) allChartRefs[idx].value = el as HTMLDivElement }" class="w-full h-full"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- API list -->
      <div>
        <div class="section-title mb-1">接口列表</div>
        <div class="glass-card overflow-hidden">
          
          <div class="overflow-x-auto pb-1 custom-scrollbar">
            <div class="min-w-[580px]">
              <!-- 列头 -->
              <div class="flex items-center gap-2 py-2 border-b border-white/[0.06] bg-white/[0.02]">
                <div class="w-[40%] min-w-[150px] text-[9px] uppercase tracking-wider text-[#444] sticky left-0 pl-3 z-20  shadow-[4px_0_8px_-2px_rgba(0,0,0,0.6)]">
                  接口路径
                </div>
                <div class="w-[60px] shrink-0 text-[9px] uppercase tracking-wider text-[#444]">趋势</div>
                <div class="w-[48px] shrink-0 text-[9px] uppercase tracking-wider text-[#444] text-right">调用量</div>
                <div class="w-[48px] shrink-0 text-[9px] uppercase tracking-wider text-[#444] text-right">平均耗时</div>
                <div class="w-[44px] shrink-0 text-[9px] uppercase tracking-wider text-[#444] text-right">成功率</div>
                <div class="w-[40px] shrink-0 text-[9px] uppercase tracking-wider text-[#444] text-right">错误数</div>
                <div class="w-[44px] shrink-0 text-[9px] uppercase tracking-wider text-[#444] text-right pr-3">P99</div>
              </div>

              <!-- 动态 API 行 -->
              <div 
                v-for="(api, i) in paginatedApiItems" 
                :key="api.path + i"
                class="group flex items-center gap-2 border-b border-white/[0.04] hover:bg-white/[0.04] bg-white/[0.01] backdrop-blur-xl transition-colors duration-150 relative h-[48px]">
                <div class="flex items-center gap-1.5 w-[40%] min-w-[150px] sticky left-0 pl-3 z-20 bg-[#0d0d0d]/95 backdrop-blur-[40px] shadow-[4px_0_8px_-2px_rgba(0,0,0,0.6)] group-hover:bg-[#121212]/95 transition-colors h-full py-2.5">
                  <span class="w-[14px] h-[14px] flex items-center justify-center text-[9px] font-bold rounded shrink-0 border"
                    :class="api.method === 'GET' 
                      ? 'text-[#4A9EFF] bg-[rgba(74,158,255,0.12)] border-[rgba(74,158,255,0.2)]'
                      : 'text-[#D927B0] bg-[rgba(217,39,176,0.12)] border-[rgba(217,39,176,0.2)]'">
                    {{ api.method === 'GET' ? 'G' : 'P' }}
                  </span>
                  <span class="text-[11px] font-mono text-white/75 truncate" :title="api.path">{{ api.path }}</span>
                </div>
                <!-- 趋势图容器 -->
                <div class="w-[60px] h-[28px] shrink-0 relative z-0">
                  <div :ref="(el) => { if(el) apiChartRefs[i] = el as HTMLDivElement }" class="w-full h-full"></div>
                </div>
                
                <div class="w-[48px] shrink-0 text-right text-[11px] font-mono text-white relative z-0">{{ api.volume }}</div>
                
                <div class="w-[48px] shrink-0 text-right text-[11px] font-mono relative z-0"
                     :class="api.avgMs > 300 ? 'text-[#FF9F0A]' : 'text-white'">
                  {{ api.avgMs }}ms
                </div>
                
                <div class="w-[44px] shrink-0 text-right text-[11px] font-mono relative z-0"
                     :class="api.successRate < 99 ? 'text-[#FF453A]' : 'text-[#32D74B]'">
                  {{ api.successRate }}%
                </div>
                
                <div class="w-[40px] shrink-0 text-right text-[11px] font-mono relative z-0"
                     :class="api.errorsNum > 100 ? 'text-[#FF453A]' : 'text-[#8A8A8E]'">
                  {{ api.errorsNum >= 1000 ? (api.errorsNum/1000).toFixed(1) + 'K' : api.errorsNum }}
                </div>
                
                <div class="w-[44px] shrink-0 text-right text-[11px] font-mono pr-3 relative z-0"
                     :class="api.p99Ms > 500 ? 'text-[#FF453A]' : api.p99Ms > 200 ? 'text-[#FF9F0A]' : 'text-white'">
                  {{ api.p99Ms }}ms
                </div>
              </div>
            </div>
          </div>

          <!-- 分页器 -->
          <div class="flex items-center justify-between px-4 py-3 border-t border-white/[0.04]">
            <span class="text-[11px] text-[#555555]">
              共 {{ sortedApiItems.length }} 个接口，当前第 {{ currentPage }}/{{ totalPages }} 页
            </span>
            <div class="flex items-center gap-1">
              <button 
                @click="prevPage" 
                :disabled="currentPage === 1"
                class="w-7 h-7 flex items-center justify-center rounded-lg border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.05] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </button>
              <button 
                @click="nextPage" 
                :disabled="currentPage === totalPages"
                class="w-7 h-7 flex items-center justify-center rounded-lg border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.05] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* Font & smoothing — complex multi-value properties */
.server-page {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color: transparent;
  --neon-blue: #4A36FF;
}

/* Ambient background blobs — pseudo-element */
.server-page::before {
  content: '';
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 50% at 20% 40%, rgba(74,158,255,0.12), transparent 50%),
    radial-gradient(ellipse 60% 40% at 80% 20%, rgba(217,39,176,0.05) 0%, transparent 50%),
    radial-gradient(ellipse 50% 60% at 50% 80%, rgba(74,54,255,0.05) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

/* Glass card — reused component pattern via @apply */
.glass-card {
  @apply bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)];
}
@media (min-width: 1024px) { .glass-card { border-radius: 24px; } }

/* Section title — reused pattern via @apply */
.section-title {
  @apply text-[11px] uppercase text-[#555555] font-semibold tracking-[0.8px] mb-3 pl-1;
}

/* Hero card glow — pseudo-elements with v-bind dynamic color */
.hero-card-glow,
.hero-card-glow::before,
.hero-card-glow::after {
  content: '';
  position: absolute;
  top: 10%; bottom: 10%;
  z-index: -1;
  filter: blur(20px);
  opacity: 0.28;
  border-radius: 100px;
  pointer-events: none;
}
.hero-card-glow::before {
  left: 5%; right: 50%;
  background: v-bind('themeColor');
}
.hero-card-glow::after {
  left: 50%; right: 5%;
  background: var(--neon-blue);
}

/* Status pulse animation — keyframes + pseudo-element */
@keyframes pulse-ring {
  0%   { transform: scale(1); opacity: 0.8; }
  70%  { transform: scale(2.2); opacity: 0; }
  100% { transform: scale(2.2); opacity: 0; }
}
.status-pulse { position: relative; }
.status-pulse::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: inherit;
  animation: pulse-ring 2.4s ease-out infinite;
}

/* Hide scrollbar — vendor pseudo-element */
.service-scroll::-webkit-scrollbar,
.custom-scrollbar::-webkit-scrollbar { display: none; }
.service-scroll,
.custom-scrollbar { scrollbar-width: none; }

:deep(.tv-lightweight-charts__branding) {
  display: none !important;
  opacity: 0 !important;
  visibility: hidden !important;
}
</style>
