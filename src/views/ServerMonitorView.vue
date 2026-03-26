<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'

interface ServiceItem {
  key: string
  name: string
  abbr: string
  volume: string
  latency: string
  tone: 'cyan' | 'pink' | 'orange'
}

const services = ref<ServiceItem[]>([
  { key: 'order', name: 'order-service', abbr: 'ORD', volume: '1.24M', latency: '120ms', tone: 'cyan' },
  { key: 'payment', name: 'payment-gateway', abbr: 'PAY', volume: '842K', latency: '85ms', tone: 'pink' },
  { key: 'inventory', name: 'inventory-sync', abbr: 'INV', volume: '320K', latency: '450ms', tone: 'orange' },
  { key: 'auth', name: 'user-auth', abbr: 'AUTH', volume: '2.1M', latency: '40ms', tone: 'cyan' },
  { key: 'notify', name: 'notification-svc', abbr: 'NTF', volume: '580K', latency: '65ms', tone: 'cyan' },
])

const activeService = ref<string>('order')
const activeTimeRange = ref<number>(5)

const timeRanges = [
  { label: '5m', value: 5 },
  { label: '10m', value: 10 },
  { label: '15m', value: 15 }
]

const selectService = (key: string) => {
  activeService.value = key
}

const chart0Ref = ref<HTMLDivElement | null>(null)
const chart1Ref = ref<HTMLDivElement | null>(null)
const chart2Ref = ref<HTMLDivElement | null>(null)
const chart3Ref = ref<HTMLDivElement | null>(null)
const chart4Ref = ref<HTMLDivElement | null>(null)
const chart5Ref = ref<HTMLDivElement | null>(null)
const chart6Ref = ref<HTMLDivElement | null>(null)

const allChartRefs = [
  chart0Ref, chart1Ref, chart2Ref, chart3Ref,
  chart4Ref, chart5Ref, chart6Ref
]

interface ChartInstance {
  chart: echarts.ECharts | null
  resizeObserver?: ResizeObserver | null
  hideTooltipHandler?: (e: MouseEvent | TouchEvent) => void
}

const chartInstances: ChartInstance[] = [
  { chart: null },
  { chart: null },
  { chart: null },
  { chart: null },
  { chart: null },
  { chart: null },
  { chart: null },
]

const generateData = (points: number, min: number, max: number) => {
  const data = []
  const now = Math.floor(Date.now() / 1000)
  for (let i = points; i >= 0; i--) {
    data.push({
      time: now - i * 60,
      value: Math.random() * (max - min) + min
    })
  }
  return data
}

const volumeData = generateData(100, 10, 50)
const responseData = generateData(100, 10, 40)
const successData = generateData(100, 95, 100)
const tpsData = generateData(100, 2000, 4000)

const api1Data = generateData(20, 10, 50)
const api2Data = generateData(20, 10, 50)
const api3Data = generateData(20, 10, 50)

const hexToRgb = (hex: string) => {
  const value = hex.replace('#', '').trim()
  if (value.length !== 6) return null
  const r = Number.parseInt(value.slice(0, 2), 16)
  const g = Number.parseInt(value.slice(2, 4), 16)
  const b = Number.parseInt(value.slice(4, 6), 16)
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null
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
  const sorted = [...data].sort((a, b) => a.time - b.time)
  const seriesData = sorted.map(d => [d.time * 1000, d.value])

  const option = {
    grid: {
      left: type === 'line' ? 2 : 0,
      right: type === 'line' ? 5 : 0,
      top: 5,
      bottom: type === 'line' ? 2 : 0,
      containLabel: type === 'line'
    },
    xAxis: {
      type: 'time',
      show: type === 'line',
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 10,
        hideOverlap: true,
        formatter: (value: number) => {
          const d = new Date(value)
          return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
        }
      },
      splitLine: { show: false },
      axisLine: { show: true, lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } },
      axisTick: { show: true, lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } }
    },
    yAxis: {
      type: 'value',
      show: type === 'line',
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 10,
        hideOverlap: true,
        formatter: (value: number) => {
          if (value >= 1000) return (value / 1000).toFixed(1) + 'k'
          return value
        }
      },
      splitNumber: 3,
      splitLine: { show: true, lineStyle: { color: 'rgba(255, 255, 255, 0.05)', type: 'dashed' } },
      axisLine: { show: true, lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } },
      axisTick: { show: true, lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } }
    },
    series: [
      {
        data: seriesData,
        type: 'line',
        smooth: true,
        showSymbol: false,
        lineStyle: {
          color: color,
          width: 1,
        },
        areaStyle: type === 'area' && rgb ? {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)` },
            { offset: 1, color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)` }
          ])
        } : undefined
      }
    ],
    tooltip: {
      show: true,
      trigger: 'axis',
      enterable: true,
      triggerOn: 'mousemove|click',
      axisPointer: {
        type: 'cross',
        label: {
          fontSize: 9,
          padding: [2, 4]
        },
        crossStyle: {
          color: 'rgba(255, 255, 255, 0.4)'
        }
      },
      backgroundColor: 'rgba(10, 10, 10, 0.85)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      textStyle: {
        color: '#fff',
        fontSize: 10
      },
      padding: [4, 8],
      confine: false,
      appendToBody: true,
      formatter: (params: any) => {
        if (!params || !params.length) return ''
        const d = new Date(params[0].value[0])
        const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`
        const val = Number(params[0].value[1]).toFixed(1)
        return `<div class="font-mono">${timeStr} <br/> <span style="color:${color}; font-weight:bold">${val}</span></div>`
      }
    }
  }

  instance.chart.setOption(option)

  const ro = new ResizeObserver(() => {
    instance.chart?.resize()
  })
  ro.observe(el)
  instance.resizeObserver = ro

  // 监听外部点击事件以隐藏 tooltip
  const hideTooltip = (e: MouseEvent | TouchEvent) => {
    if (el && !el.contains(e.target as Node)) {
      instance.chart?.dispatchAction({
        type: 'hideTip'
      })
    }
  }
  document.addEventListener('touchstart', hideTooltip)
  document.addEventListener('click', hideTooltip)
  instance.hideTooltipHandler = hideTooltip
}

const metrics = ref({
  instances: 8,
  cpu: '42%',
  memory: '6.2G',
  qps: '12.5K',
  errorRate: '0.05%',
  p99: '180ms',
  restarts: 0,
  health: '98%'
})

const refreshAllData = (minutes: number) => {
  const points = minutes * 20 // 粗略模拟点数随时间范围增加
  const newVolume = generateData(points, 10, 50)
  const newResp = generateData(points, 10, 40)
  const newSuccess = generateData(points, 95, 100)
  const newTps = generateData(points, 2000, 4000)
  
  const newApi1 = generateData(Math.max(10, points / 5), 10, 50)
  const newApi2 = generateData(Math.max(10, points / 5), 10, 50)
  const newApi3 = generateData(Math.max(10, points / 5), 10, 50)

  const newRefs = [
    { data: newVolume, type: 'line' as const, color: '#00D4AA' },
    { data: newResp, type: 'line' as const, color: '#00D4AA' },
    { data: newSuccess, type: 'line' as const, color: '#00D4AA' },
    { data: newTps, type: 'line' as const, color: '#00D4AA' },
    { data: newApi1, type: 'area' as const, color: '#00D4AA' },
    { data: newApi2, type: 'area' as const, color: '#00D4AA' },
    { data: newApi3, type: 'area' as const, color: '#00D4AA' }
  ]

  chartInstances.forEach((c, i) => {
    if (c.chart) {
      const sorted = [...newRefs[i].data].sort((a, b) => a.time - b.time)
      const seriesData = sorted.map(d => [d.time * 1000, d.value])
      c.chart.setOption({
        series: [{ data: seriesData }]
      })
    }
  })

  // 模拟刷新8个核心指标
  metrics.value = {
    instances: Math.floor(Math.random() * 5) + 5,
    cpu: `${Math.floor(Math.random() * 60) + 20}%`,
    memory: `${(Math.random() * 4 + 4).toFixed(1)}G`,
    qps: `${(Math.random() * 10 + 5).toFixed(1)}K`,
    errorRate: `${(Math.random() * 0.1).toFixed(2)}%`,
    p99: `${Math.floor(Math.random() * 100) + 100}ms`,
    restarts: Math.floor(Math.random() * 2),
    health: `${Math.floor(Math.random() * 5) + 95}%`
  }

  // 模拟刷新服务卡片的交易量数据
  services.value.forEach(svc => {
    const base = svc.volume.includes('M') ? 1 : 100
    const unit = svc.volume.includes('M') ? 'M' : 'K'
    const newVal = (Math.random() * base + base).toFixed(svc.volume.includes('M') ? 2 : 0)
    svc.volume = `${newVal}${unit}`
  })
}

const selectTimeRange = (val: number) => {
  activeTimeRange.value = val
  refreshAllData(val)
}

onMounted(() => {
  const refs = [
    { data: volumeData, color: '#00D4AA', type: 'line' as const },
    { data: responseData, color: '#00D4AA', type: 'line' as const },
    { data: successData, color: '#00D4AA', type: 'line' as const },
    { data: tpsData, color: '#00D4AA', type: 'line' as const },
    { data: api1Data, color: '#00D4AA', type: 'area' as const },
    { data: api2Data, color: '#00D4AA', type: 'area' as const },
    { data: api3Data, color: '#00D4AA', type: 'area' as const },
  ]

  nextTick(() => {
    allChartRefs.forEach((chartRef, i) => {
      if (chartRef.value) {
        requestAnimationFrame(() => {
          if (!chartRef.value) return
          console.log('inti--------------------');
          
          initChart(chartRef.value, chartInstances[i], refs[i].data, refs[i].color, refs[i].type)
        })
      }
    })
  })
})

onBeforeUnmount(() => {
  chartInstances.forEach((c) => {
    if (c.chart) {
      c.chart.dispose()
      c.chart = null
    }
    if (c.resizeObserver) {
      c.resizeObserver.disconnect()
      c.resizeObserver = null
    }
    if (c.hideTooltipHandler) {
      document.removeEventListener('touchstart', c.hideTooltipHandler)
      document.removeEventListener('click', c.hideTooltipHandler)
    }
  })
})

const goBack = () => {
  history.back()
}
</script>

<template>
  <div class="server-page min-h-screen pb-10 relative">
    <div class="nav-bar">
      <button class="nav-back-btn" @click="goBack">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
      </button>
      <span class="nav-title">应用监控</span>
      <div class="w-10"></div>
    </div>

    <div class="container px-1 py-2 flex flex-col gap-3">

      <div class="app-hero-card mt-2">
        <div class="hero-card-glow"></div>
        <div class="glass-card p-4 relative overflow-hidden">
          <div class="hero-card-glow-inner"></div>
          
          <div class="absolute top-4 right-4 flex items-center gap-1.5 px-2 py-1 rounded-full bg-[rgba(50,215,75,0.1)] border border-[rgba(50,215,75,0.2)]">
            <div class="w-1.5 h-1.5 rounded-full bg-[#32D74B] shadow-[0_0_8px_rgba(50,215,75,0.8)]"></div>
            <span class="text-[10px] text-[#32D74B] font-medium tracking-wider">正常运行</span>
          </div>

          <div class="flex flex-col gap-3">
            <div class="pr-20">
              <h1 class="text-xl font-bold tracking-tight">交易系统</h1>
              <p class="text-xs text-tertiary mt-0.5 tracking-wider">交易研发中心</p>
            </div>
            <div class="flex flex-col gap-1.5">
              <div class="flex items-center gap-2 text-sm text-secondary">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <span>张伟 (负责人) · 李明 · 王强 · 赵玲</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div class="flex justify-between items-center mb-1.5">
          <div class="section-title !mb-0">服务列表</div>
          <div class="flex items-center gap-1 bg-[rgba(255,255,255,0.03)] p-0.5 rounded-lg">
            <button
              v-for="tr in timeRanges"
              :key="tr.value"
              class="text-[10px] px-2.5 py-1 rounded-md transition-all duration-200"
              :class="activeTimeRange === tr.value ? 'bg-[#00D4AA] text-[#050505] font-bold shadow-[0_0_8px_rgba(0,212,170,0.4)]' : 'text-secondary hover:text-primary hover:bg-[rgba(255,255,255,0.05)]'"
              @click="selectTimeRange(tr.value)"
            >
              {{ tr.label }}
            </button>
          </div>
        </div>
        <div class="service-list">
          <button
            v-for="svc in services"
            :key="svc.key"
            class="service-chip flex-none px-2.5 py-2 flex flex-col gap-1.5 text-left"
            :class="{ active: activeService === svc.key, [`tone-${svc.tone}`]: activeService !== svc.key }"
            @click="selectService(svc.key)"
          >
            <div class="flex items-center justify-between gap-2">
              <span class="text-[12px] font-bold tracking-wide text-primary whitespace-nowrap">{{ svc.name }}</span>
              <span class="text-[10px] px-1 py-0.5 rounded bg-[rgba(255,255,255,0.06)] text-[var(--success)] font-mono whitespace-nowrap">{{ svc.volume }}</span>
            </div>
          </button>
        </div>
        <div class="glass-card mt-2 overflow-hidden">
          <div class="flex">
            <div class="flex-1 flex flex-col gap-0.5 p-2 text-center">
              <span class="text-[10px] text-tertiary">实例数</span>
              <span class="text-xs font-mono">{{ metrics.instances }}</span>
            </div>
            <div class="flex-1 flex flex-col gap-0.5 p-2 text-center border-l border-[rgba(255,255,255,0.08)]">
              <span class="text-[10px] text-tertiary">CPU</span>
              <span class="text-xs font-mono">{{ metrics.cpu }}</span>
            </div>
            <div class="flex-1 flex flex-col gap-0.5 p-2 text-center border-l border-[rgba(255,255,255,0.08)]">
              <span class="text-[10px] text-tertiary">内存</span>
              <span class="text-xs font-mono">{{ metrics.memory }}</span>
            </div>
            <div class="flex-1 flex flex-col gap-0.5 p-2 text-center border-l border-[rgba(255,255,255,0.08)]">
              <span class="text-[10px] text-tertiary">QPS</span>
              <span class="text-xs font-mono">{{ metrics.qps }}</span>
            </div>
          </div>
          <div class="h-px bg-[rgba(255,255,255,0.08)]"></div>
          <div class="flex">
            <div class="flex-1 flex flex-col gap-0.5 p-2 text-center">
              <span class="text-[10px] text-tertiary">错误率</span>
              <span class="text-xs font-mono text-[#32D74B]">{{ metrics.errorRate }}</span>
            </div>
            <div class="flex-1 flex flex-col gap-0.5 p-2 text-center border-l border-[rgba(255,255,255,0.08)]">
              <span class="text-[10px] text-tertiary">延迟P99</span>
              <span class="text-xs font-mono">{{ metrics.p99 }}</span>
            </div>
            <div class="flex-1 flex flex-col gap-0.5 p-2 text-center border-l border-[rgba(255,255,255,0.08)]">
              <span class="text-[10px] text-tertiary">重启次数</span>
              <span class="text-xs font-mono">{{ metrics.restarts }}</span>
            </div>
            <div class="flex-1 flex flex-col gap-0.5 p-2 text-center border-l border-[rgba(255,255,255,0.08)]">
              <span class="text-[10px] text-tertiary">健康度</span>
              <span class="text-xs font-mono text-[#32D74B]">{{ metrics.health }}</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div class="section-title mb-1">趋势图</div>
        <div class="grid grid-cols-2 gap-1.5">
          <div class="glass-card p-1.5 relative overflow-hidden flex flex-col">
            <div class="absolute -top-5 -right-5 w-20 h-20 bg-[radial-gradient(circle,rgba(0,212,170,0.1)_0%,transparent_70%)] blur-[20px] pointer-events-none"></div>
            <div class="text-[11px] text-secondary pl-0.5">交易量</div>
            <div class="flex-1 min-h-[75px]">
              <div ref="chart0Ref" class="w-full h-full"></div>
            </div>
          </div>

          <div class="glass-card p-1.5 relative overflow-hidden flex flex-col">
            <div class="absolute -top-5 -right-5 w-20 h-20 bg-[radial-gradient(circle,rgba(0,212,170,0.1)_0%,transparent_70%)] blur-[20px] pointer-events-none"></div>
            <div class="text-[11px] text-secondary pl-0.5">响应时间</div>
            <div class="flex-1 min-h-[75px]">
              <div ref="chart1Ref" class="w-full h-full"></div>
            </div>
          </div>

          <div class="glass-card p-1.5 relative overflow-hidden flex flex-col">
            <div class="absolute -top-5 -right-5 w-20 h-20 bg-[radial-gradient(circle,rgba(0,212,170,0.1)_0%,transparent_70%)] blur-[20px] pointer-events-none"></div>
            <div class="text-[11px] text-secondary pl-0.5">成功率</div>
            <div class="flex-1 min-h-[75px]">
              <div ref="chart2Ref" class="w-full h-full"></div>
            </div>
          </div>

          <div class="glass-card p-1.5 relative overflow-hidden flex flex-col">
            <div class="absolute -top-5 -right-5 w-20 h-20 bg-[radial-gradient(circle,rgba(0,212,170,0.1)_0%,transparent_70%)] blur-[20px] pointer-events-none"></div>
            <div class="text-[11px] text-secondary pl-0.5">TPS</div>
            <div class="flex-1 min-h-[75px]">
              <div ref="chart3Ref" class="w-full h-full"></div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div class="section-title mb-1">接口列表</div>
        <div class="glass-card overflow-hidden">

          <div class="interface-card border-b border-[rgba(255,255,255,0.05)]">
            <div class="flex items-center gap-2 pb-2 border-b border-[rgba(255,255,255,0.05)]">
              <span class="method-badge method-post">POST</span>
              <span class="text-sm font-mono break-all flex-1">/api/v2/order/create</span>
            </div>
            <div class="flex items-center justify-between mt-3">
              <div class="flex flex-col gap-0.5 flex-none min-w-[36px]">
                <span class="text-[10px] text-tertiary">调用量</span>
                <span class="text-xs font-mono">842K</span>
              </div>
              <div class="flex-1 h-[35px] mx-2">
                <div ref="chart4Ref" class="w-full h-full"></div>
              </div>
              <div class="flex flex-col gap-0.5 flex-none min-w-[44px] text-right">
                <span class="text-[10px] text-tertiary">平均耗时</span>
                <span class="text-xs font-mono">145ms</span>
              </div>
              <div class="flex flex-col gap-0.5 flex-none min-w-[40px] text-right">
                <span class="text-[10px] text-tertiary">成功率</span>
                <span class="text-xs font-mono text-[#32D74B]">99.8%</span>
              </div>
              <div class="flex flex-col gap-0.5 flex-none min-w-[36px] text-right">
                <span class="text-[10px] text-tertiary">错误数</span>
                <span class="text-xs font-mono text-secondary">16</span>
              </div>
              <div class="flex flex-col gap-0.5 flex-none min-w-[36px] text-right">
                <span class="text-[10px] text-tertiary">P99</span>
                <span class="text-xs font-mono text-[#FF9F0A]">280ms</span>
              </div>
            </div>
          </div>

          <div class="interface-card border-b border-[rgba(255,255,255,0.05)]">
            <div class="flex items-center gap-2 pb-2 border-b border-[rgba(255,255,255,0.05)]">
              <span class="method-badge method-get">GET</span>
              <span class="text-sm font-mono break-all flex-1">/api/v2/order/status/{id}</span>
            </div>
            <div class="flex items-center justify-between mt-3">
              <div class="flex flex-col gap-0.5 flex-none min-w-[36px]">
                <span class="text-[10px] text-tertiary">调用量</span>
                <span class="text-xs font-mono">2.1M</span>
              </div>
              <div class="flex-1 h-[35px] mx-2">
                <div ref="chart5Ref" class="w-full h-full"></div>
              </div>
              <div class="flex flex-col gap-0.5 flex-none min-w-[44px] text-right">
                <span class="text-[10px] text-tertiary">平均耗时</span>
                <span class="text-xs font-mono">42ms</span>
              </div>
              <div class="flex flex-col gap-0.5 flex-none min-w-[40px] text-right">
                <span class="text-[10px] text-tertiary">成功率</span>
                <span class="text-xs font-mono text-[#32D74B]">99.9%</span>
              </div>
              <div class="flex flex-col gap-0.5 flex-none min-w-[36px] text-right">
                <span class="text-[10px] text-tertiary">错误数</span>
                <span class="text-xs font-mono text-secondary">5</span>
              </div>
              <div class="flex flex-col gap-0.5 flex-none min-w-[36px] text-right">
                <span class="text-[10px] text-tertiary">P99</span>
                <span class="text-xs font-mono">85ms</span>
              </div>
            </div>
          </div>

          <div class="interface-card border-b border-[rgba(255,255,255,0.05)]">
            <div class="flex items-center gap-2 pb-2 border-b border-[rgba(255,255,255,0.05)]">
              <span class="method-badge method-post">POST</span>
              <span class="text-sm font-mono break-all flex-1">/api/v2/inventory/lock</span>
            </div>
            <div class="flex items-center justify-between mt-3">
              <div class="flex flex-col gap-0.5 flex-none min-w-[36px]">
                <span class="text-[10px] text-tertiary">调用量</span>
                <span class="text-xs font-mono">820K</span>
              </div>
              <div class="flex-1 h-[35px] mx-2">
                <div ref="chart6Ref" class="w-full h-full"></div>
              </div>
              <div class="flex flex-col gap-0.5 flex-none min-w-[44px] text-right">
                <span class="text-[10px] text-tertiary">平均耗时</span>
                <span class="text-xs font-mono text-[#FF9F0A]">450ms</span>
              </div>
              <div class="flex flex-col gap-0.5 flex-none min-w-[40px] text-right">
                <span class="text-[10px] text-tertiary">成功率</span>
                <span class="text-xs font-mono">98.5%</span>
              </div>
              <div class="flex flex-col gap-0.5 flex-none min-w-[36px] text-right">
                <span class="text-[10px] text-tertiary">错误数</span>
                <span class="text-xs font-mono text-[#D927B0]">1.2K</span>
              </div>
              <div class="flex flex-col gap-0.5 flex-none min-w-[36px] text-right">
                <span class="text-[10px] text-tertiary">P99</span>
                <span class="text-xs font-mono text-[#D927B0]">850ms</span>
              </div>
            </div>
          </div>

          <div class="p-3 text-center border-t border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)]">
            <span class="text-sm text-secondary">查看全部 24 个接口</span>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.server-page {
  --bg-base: #020202;
  --surface-dark: #080808;
  --surface-light: #121212;
  --border-color: rgba(255, 255, 255, 0.08);
  --border-highlight: rgba(255, 255, 255, 0.15);
  --neon-pink: #D927B0;
  --neon-blue: #4A36FF;
  --neon-blue-glow: rgba(74, 54, 255, 0.5);
  --text-primary: #FFFFFF;
  --text-secondary: #8A8A8E;
  --text-tertiary: #555555;
  --success: #32D74B;
  --radius-card: 20px;
  --radius-inner: 12px;
  --font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif;

  background-color: #050505;
  color: var(--text-primary);
  font-family: var(--font-family);
  line-height: 1.4;
  background: linear-gradient(180deg, #0a0a0a 0%, #020202 100%);
}

.server-page::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
      radial-gradient(ellipse 80% 50% at 20% 40%, rgba(0, 212, 170, 0.08) 0%, transparent 50%),
      radial-gradient(ellipse 60% 40% at 80% 20%, rgba(217, 39, 176, 0.06) 0%, transparent 50%),
      radial-gradient(ellipse 50% 60% at 50% 80%, rgba(74, 54, 255, 0.05) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.container {
  position: relative;
  z-index: 1;
}

.nav-bar {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(5, 5, 5, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-color);
}

.nav-back-btn {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}
.nav-back-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}
.nav-back-btn:active {
  transform: scale(0.95);
}

.nav-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 0;
}

.text-secondary { color: var(--text-secondary); }
.text-tertiary { color: var(--text-tertiary); }

.glass-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-card);
  box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.app-hero-card {
  position: relative;
}

.hero-card-glow,
.hero-card-glow::before,
.hero-card-glow::after {
  content: '';
  position: absolute;
  top: 10%;
  bottom: 10%;
  z-index: -1;
  filter: blur(20px);
  opacity: 0.3;
  border-radius: 100px;
  pointer-events: none;
}

.hero-card-glow::before {
  left: 5%;
  right: 50%;
  background: var(--neon-pink);
}

.hero-card-glow::after {
  left: 50%;
  right: 5%;
  background: var(--neon-blue);
}

.hero-card-glow-inner {
  position: absolute;
  top: -50%;
  right: -30%;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(0, 212, 170, 0.15) 0%, transparent 70%);
  filter: blur(40px);
  pointer-events: none;
}

.section-title {
  font-size: 13px;
  text-transform: uppercase;
  color: var(--text-secondary);
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
  padding-left: 4px;
}

.service-list {
  display: flex;
  overflow-x: auto;
  gap: 10px;
  padding-bottom: 8px;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
.service-list::-webkit-scrollbar { display: none; }

.service-chip {
  background: var(--surface-dark);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-inner);
  transition: all 0.2s ease;
  cursor: pointer;
  min-width: fit-content;
}

.service-chip.active {
  border-color: rgba(217, 39, 176, 0.5);
  background: linear-gradient(180deg, rgba(217, 39, 176, 0.08) 0%, rgba(217, 39, 176, 0.03) 100%), var(--surface-dark);
}

.service-chip.tone-cyan.active {
  border-color: rgba(0, 212, 170, 0.5);
  background: linear-gradient(180deg, rgba(0, 212, 170, 0.08) 0%, rgba(0, 212, 170, 0.03) 100%), var(--surface-dark);
}

.service-chip.tone-orange.active {
  border-color: rgba(255, 159, 10, 0.5);
  background: linear-gradient(180deg, rgba(255, 159, 10, 0.08) 0%, rgba(255, 159, 10, 0.03) 100%), var(--surface-dark);
}

.service-chip:active {
  transform: scale(0.97);
}

.metric-value-large {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -1px;
  margin-top: 4px;
}

.interface-card {
  padding: 16px;
  display: flex;
  flex-direction: column;
  transition: background 0.2s ease;
}

.method-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
  flex: none;
}
.method-get {
  color: var(--neon-blue);
  background: rgba(74, 54, 255, 0.15);
  border: 1px solid rgba(74, 54, 255, 0.3);
}
.method-post {
  color: var(--neon-pink);
  background: rgba(217, 39, 176, 0.15);
  border: 1px solid rgba(217, 39, 176, 0.3);
}
:deep(.tv-lightweight-charts__branding) {
  display: none !important;
  opacity: 0 !important;
  visibility: hidden !important;
}
</style>
