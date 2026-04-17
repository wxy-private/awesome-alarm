<template>
  <!-- 外层容器：锁定宽度或适配屏幕，使用较小的 base size (10px) -->
  <div class="min-h-screen bg-[#0a0a0a] text-gray-400 font-mono p-4 text-[10px] uppercase tracking-tighter leading-tight select-none">
    
    <!-- Header: 紧凑布局 -->
    <header class="flex justify-between items-start mb-4">
      <div>
        <div class="flex items-center gap-1.5 mb-0.5">
          <span class="bg-[#00ff9d] text-black px-1 py-0.5 font-black text-[9px]">POST</span>
          <h1 class="text-lg text-white font-bold tracking-normal">/create-order</h1>
        </div>
        <p class="text-[9px] text-gray-500">IDENTIFIER <span class="text-gray-300 ml-1 italic">order-svc-v2</span></p>
      </div>
      <div class="text-right">
        <p class="text-[8px] text-gray-500 leading-none">OWNER / GROUP</p>
        <p class="text-gray-200 text-[11px] font-bold">LOGISTICS-ALPHA</p>
      </div>
    </header>

    <!-- Time Filter: 极窄高度 -->
    <div class="grid grid-cols-4 border border-[#1a1a1a] mb-5">
      <div v-for="t in ['1H', '6H', '24H', '7D']" :key="t" 
           :class="t === '6H' ? 'bg-[#00ff9d] text-black font-bold' : 'text-gray-500'" 
           class="py-1.5 text-center border-r border-[#1a1a1a] last:border-0 transition-colors">
        {{ t }}
      </div>
    </div>

    <!-- Metrics Grid: 2列紧凑排布 -->
    <div class="grid grid-cols-2 border-t border-l border-[#1a1a1a]">
      <div v-for="(m, i) in metrics" :key="i" class="p-2.5 border-r border-b border-[#1a1a1a] relative">
        <span class="absolute top-1 right-1 text-[7px] text-gray-700">C{{i+1}}</span>
        
        <div class="flex justify-between items-center mb-1">
          <span class="text-[9px] text-gray-500 font-medium">{{ m.label }}</span>
          <div class="w-1 h-1 rounded-full" :class="m.dotColor || 'bg-gray-700'"></div>
        </div>
        
        <div class="flex items-baseline gap-1">
          <span class="text-xl text-white font-semibold leading-none">{{ m.value }}</span>
          <span class="text-[9px] text-gray-600">{{ m.unit }}</span>
        </div>
        
        <div :class="m.trend > 0 ? 'text-[#00ff9d]' : 'text-[#ff4d4d]'" class="mt-1 flex items-center gap-0.5 text-[9px] font-bold">
          {{ m.trendStr }} <span class="text-[8px] opacity-70">↵</span>
        </div>
      </div>
    </div>

    <!-- Volumetric Analysis (Chart) -->
    <div class="mt-6">
      <div class="flex justify-between text-[8px] mb-3 text-gray-500 tracking-widest px-1">
        <span>VOLUMETRIC ANALYSIS / TREND_O</span>
        <span>ACTIVE_THREADS: <span class="text-gray-300">124</span></span>
      </div>
      
      <!-- 容器高度缩小 -->
      <div class="relative h-32 w-full">
        <div ref="chartRef" class="w-full h-full"></div>
      </div>

      <div class="flex justify-between text-gray-700 text-[8px] mt-1 px-1">
        <span>10:00</span><span>10:30</span><span>11:00</span><span>11:30</span><span>12:00</span>
      </div>
    </div>

    <!-- Error Distribution: 进度条精细化 -->
    <div class="mt-8 px-1">
      <div class="flex justify-between text-[8px] mb-4 border-b border-[#1a1a1a] pb-1.5 text-gray-500 tracking-widest">
        <span>ERROR_DISTRIBUTION / CODE_MAP</span>
        <span>SUM_PERCENT: 100%</span>
      </div>
      
      <div v-for="err in errorMap" :key="err.code" class="mb-4">
        <div class="flex justify-between mb-1.5 text-[10px]">
          <span class="text-gray-400"><span class="text-gray-200">{{ err.code }}</span> / {{ err.msg }}</span>
          <span class="text-white font-bold">{{ err.percent }}%</span>
        </div>
        <div class="h-[3px] bg-[#131313] w-full rounded-full overflow-hidden">
          <div class="h-full bg-[#00ff9d] shadow-[0_0_8px_rgba(0,255,157,0.4)]" :style="{ width: err.percent + '%' }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import * as echarts from 'echarts';

const metrics = [
  { label: 'TOTAL REQUESTS', value: '1.2M', unit: 'REQ', trend: 1, trendStr: '+12.4%', dotColor: 'bg-white/40' },
  { label: 'QPS', value: '842', unit: '/SEC', trend: -1, trendStr: '-2.1%', dotColor: 'bg-white/20' },
  { label: 'P99 LATENCY', value: '124', unit: 'MS', trend: 1, trendStr: '+4ms', dotColor: 'bg-white/40' },
  { label: 'SUCCESS RATE', value: '99.8', unit: '%', trend: 1, trendStr: 'STABLE', dotColor: 'bg-white/80' },
  { label: 'ERROR COUNT', value: '2.4K', unit: 'ERR', trend: -1, trendStr: '-140', dotColor: 'bg-white/40' },
  { label: 'AVG RT', value: '42.1', unit: 'MS', trend: 1, trendStr: '+0.2%', dotColor: 'bg-white/20' },
  { label: 'CPU TIME', value: '12.5', unit: 'NS', trend: 1, trendStr: '+1.2%', dotColor: 'bg-white/40' },
  { label: 'THROUGHPUT', value: '4.2', unit: 'GB/S', trend: 1, trendStr: '+0.5%', dotColor: 'bg-white/20' },
];

const errorMap = [
  { code: '404', msg: 'NOT FOUND', percent: 62 },
  { code: '500', msg: 'INTERNAL ERR', percent: 28 },
  { code: '403', msg: 'FORBIDDEN', percent: 10 },
];

const chartRef = ref<HTMLElement>();

onMounted(() => {
  if (!chartRef.value) return;
  const chart = echarts.init(chartRef.value);
  chart.setOption({
    grid: { left: -10, right: -10, top: 10, bottom: 0 },
    xAxis: { type: 'category', show: false, boundaryGap: false },
    yAxis: { type: 'value', show: false, min: 0, max: 100 },
    series: [{
      data: [35, 38, 30, 22, 28, 55, 82, 65, 20, 18, 40, 85],
      type: 'line',
      smooth: 0.4,
      symbol: 'none',
      lineStyle: { color: '#00ff9d', width: 1.5 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(0, 255, 157, 0.25)' },
          { offset: 0.8, color: 'rgba(0, 255, 157, 0)' }
        ])
      },
      markPoint: {
        data: [{ 
          coord: [6, 82], 
          symbol: 'circle', 
          symbolSize: 4,
          itemStyle: { color: '#ff4d4d' },
          label: { 
            show: true, 
            formatter: 'SPIKE_DETECTED', 
            position: 'right', 
            color: '#ff4d4d', 
            fontSize: 8, 
            fontWeight: 'bold',
            offset: [2, 0]
          } 
        }]
      }
    }]
  });
});
</script>

<style scoped>
/* 增加背景网格细节，增强工业感 */
.min-h-screen {
  background-image: radial-gradient(#1a1a1a 0.5px, transparent 0.5px);
  background-size: 16px 16px;
}

/* 优化字体，移动端通常需要稍细的字重 */
h1, span {
  -webkit-font-smoothing: antialiased;
}
</style>