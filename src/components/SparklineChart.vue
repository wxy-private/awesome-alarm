<template>
  <div ref="containerRef" class="sparkline-container" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Chart } from '@antv/g2'

const props = defineProps<{
  data: number[]
  color?: string
}>()

const containerRef = ref<HTMLElement>()
let chart: InstanceType<typeof Chart> | null = null

function initChart() {
  if (!containerRef.value || !props.data.length) return
  const chartData = props.data.map((v, i) => ({ index: i, value: v }))
  const w = containerRef.value.offsetWidth || 100
  chart = new Chart({
    container: containerRef.value,
    width: w,
    height: 28,
    padding: 0,
    margin: 0,
    data: chartData,
    axis: false,
    children: [
      {
        type: 'line',
        encode: { x: 'index', y: 'value' },
        style: {
          stroke: props.color || '#3498DB',
          lineWidth: 1.5,
        },
      },
    ],
  })
  chart.render()
}

function destroyChart() {
  if (chart) {
    chart.destroy()
    chart = null
  }
}

onMounted(() => {
  nextTick(() => initChart())
})

onUnmounted(() => {
  destroyChart()
})

watch(
  () => [props.data, props.color],
  () => {
    destroyChart()
    nextTick(() => initChart())
  },
  { deep: true }
)
</script>

<style scoped>
.sparkline-container {
  width: 100%;
  height: 28px;
  margin-top: 8px;
}
</style>
