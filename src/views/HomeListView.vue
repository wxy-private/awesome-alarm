<script setup lang="ts">
import { computed, onMounted, ref, watch, reactive } from "vue";
import { useRouter } from "vue-router";

type Tone = "cyan" | "magenta" | "orange";
interface CardItem {
	key: string;
	name: string;
	appId: string;
	tone: Tone;
	responseTime: number;
	responseRate: string;
	accuracy: string;
}

const router = useRouter();
const keyword = ref("");
const isSearching = ref(false);
const showTrend = ref(false);
const layoutMode = ref<"list" | "card">("card");
const timeRange = ref<5 | 10 | 15>(10);

type SortKey = "responseTime" | "responseRate" | "accuracy" | null;
const sortKey = ref<SortKey>(null);
const sortOrder = ref<"asc" | "desc">("desc");

const handleSort = (key: SortKey) => {
	if (sortKey.value === key) {
		if (sortOrder.value === "desc") {
			sortOrder.value = "asc";
		} else {
			sortKey.value = null; // reset sort
		}
	} else {
		sortKey.value = key;
		sortOrder.value = "desc";
	}
};

const makeCard = (
	key: string,
	name: string,
	appId: string,
	tone: Tone,
	responseTime: number,
	responseRate: string,
	accuracy: string,
): CardItem => ({ key, name, appId, tone, responseTime, responseRate, accuracy });

const cards = ref<CardItem[]>([
	makeCard("payment", "Payment Gateway", "APP-PRD-001", "cyan", 42, "99.9%", "98.5%"),
	makeCard("auth", "User Auth Service", "APP-PRD-042", "magenta", 368, "85.0%", "91.2%"),
	makeCard("inventory", "Inventory DB", "APP-DB-011", "cyan", 12, "100%", "100%"),
	makeCard(
		"recommendation",
		"Recommendation Engine",
		"APP-ML-004",
		"cyan",
		156,
		"96.0%",
		"95.0%",
	),
	makeCard(
		"notification",
		"Notification Service",
		"APP-MSG-088",
		"orange",
		421,
		"60.0%",
		"75.0%",
	),
	makeCard("cdn", "CDN Edge Node US", "INF-CDN-001", "cyan", 8, "100%", "100%"),
	makeCard("search", "Search Service", "APP-SVC-007", "cyan", 23, "99.5%", "97.8%"),
	makeCard("analytics", "Analytics Engine", "APP-ML-012", "cyan", 88, "98.2%", "96.1%"),
	makeCard("gateway", "API Gateway", "INF-GW-003", "cyan", 5, "100%", "100%"),
	makeCard("cache", "Redis Cache Cluster", "INF-DB-002", "cyan", 3, "100%", "100%"),
	makeCard("email", "Email Delivery", "APP-MSG-021", "orange", 274, "72.0%", "88.0%"),
	makeCard("billing", "Billing Service", "APP-PRD-055", "cyan", 67, "99.1%", "99.0%"),
	makeCard("storage", "Object Storage", "INF-STG-001", "cyan", 18, "99.8%", "99.9%"),
	makeCard("ml-train", "ML Training Pipeline", "APP-ML-033", "magenta", 620, "78.0%", "82.5%"),
	makeCard("websocket", "WebSocket Server", "APP-SVC-019", "cyan", 11, "99.7%", "98.3%"),
	makeCard("scheduler", "Job Scheduler", "APP-SVC-044", "cyan", 45, "97.5%", "96.8%"),
	makeCard("log", "Log Aggregator", "INF-LOG-001", "cyan", 29, "99.3%", "99.1%"),
	makeCard("push", "Push Notification", "APP-MSG-066", "orange", 337, "65.0%", "79.0%"),
	makeCard("config", "Config Center", "INF-CFG-001", "cyan", 7, "100%", "100%"),
	makeCard("monitor", "Health Monitor", "INF-MON-001", "cyan", 14, "99.9%", "99.8%"),
]);

const getStatus = (card: CardItem): "critical" | "warning" | "normal" => {
	const rr = parseFloat(card.responseRate);
	const acc = parseFloat(card.accuracy);
	if (rr < 80 || acc < 85) return "critical";
	if (rr < 95 || acc < 95) return "warning";
	return "normal";
};

// Deterministic LCG spark path — 50 points, wider viewBox
const sparkPaths = reactive(new Map<string, string>());
const buildSparkPath = (card: CardItem): string => {
	const status = getStatus(card);
	let seed = card.key.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
	const rand = () => {
		seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
		return seed / 0xffffffff;
	};
	const n = 50;
	let v =
		status === "normal"
			? 60 + rand() * 28
			: status === "warning"
				? 35 + rand() * 30
				: 12 + rand() * 32;
	const vol = status === "critical" ? 26 : status === "warning" ? 18 : 9;
	const pts: number[] = [];
	for (let i = 0; i < n; i++) {
		v = Math.max(4, Math.min(96, v + (rand() - 0.5) * vol));
		pts.push(v);
	}
	return pts
		.map((val, i) => `${((i / (n - 1)) * 80).toFixed(1)},${(18 - (val / 100) * 18).toFixed(1)}`)
		.join(" ");
};

const rrColor = (card: CardItem) => {
	const n = parseFloat(card.responseRate);
	return n < 80 ? "val-crit" : n < 95 ? "val-warn" : "val-default";
};
const accColor = (card: CardItem) => {
	const n = parseFloat(card.accuracy);
	return n < 85 ? "val-crit" : n < 95 ? "val-warn" : "val-default";
};

const activeFilter = ref<"all" | "critical" | "warning" | "normal">("all");

const normalizedKeyword = computed(() => keyword.value.trim().toLowerCase());

const filteredCards = computed(() => {
	let result = [...cards.value];
	if (activeFilter.value !== "all")
		result = result.filter((c) => getStatus(c) === activeFilter.value);
	const term = normalizedKeyword.value;
	if (term) result = result.filter((c) => `${c.name} ${c.appId}`.toLowerCase().includes(term));
	
	// Apply sorting
	if (sortKey.value) {
		result.sort((a, b) => {
			let valA, valB;
			if (sortKey.value === "responseTime") {
				valA = a.responseTime;
				valB = b.responseTime;
			} else if (sortKey.value === "responseRate") {
				valA = parseFloat(a.responseRate);
				valB = parseFloat(b.responseRate);
			} else {
				valA = parseFloat(a.accuracy);
				valB = parseFloat(b.accuracy);
			}
			
			if (sortOrder.value === "desc") {
				return valB - valA;
			} else {
				return valA - valB;
			}
		});
	} else {
		// Default order by status
		const order = { critical: 0, warning: 1, normal: 2 } as const;
		result.sort((a, b) => order[getStatus(a)] - order[getStatus(b)]);
	}
	
	return result;
});

const goToDetail = (card: CardItem) => {
	router.push({
		name: "serverMonitor",
		query: { appName: card.name, appId: card.appId, status: getStatus(card) },
	});
};

// 去掉了 % 符号，纯数值返回
const fmt = (v: string) => `${Math.round(parseFloat(v))}`;

const getDashOffset = (valStr: string) => {
	const val = parseFloat(valStr);
	return 113.097 * (1 - val / 100);
};

// Simulate data change when time range changes
watch(timeRange, () => {
	cards.value.forEach((card: CardItem) => {
		// Randomize metrics slightly
		const currentRR = parseFloat(card.responseRate);
		const currentAcc = parseFloat(card.accuracy);
		
		const newRR = Math.min(100, Math.max(50, currentRR + (Math.random() - 0.5) * 5)).toFixed(1) + "%";
		const newAcc = Math.min(100, Math.max(60, currentAcc + (Math.random() - 0.5) * 5)).toFixed(1) + "%";
		const newTime = Math.max(1, Math.round(card.responseTime * (0.8 + Math.random() * 0.4)));

		card.responseRate = newRR;
		card.accuracy = newAcc;
		card.responseTime = newTime;
		
		// Regenerate spark paths
		sparkPaths.set(card.key, buildSparkPath(card));
	});
});

onMounted(() => {
	for (const card of cards.value) sparkPaths.set(card.key, buildSparkPath(card));
});
</script>

<template>
	<div class="list-page h-[100dvh] flex flex-col text-white overflow-hidden">
		<!-- ── Header ── -->
		<header class="shrink-0 z-20 glass-header pt-4">
			<div class="flex items-center justify-between px-3 sm:px-5 lg:px-8 xl:px-12 pb-2">
				<h1 class="text-base font-semibold tracking-tight">应用监控</h1>
				<button 
					class="text-[#8A8A8E] hover:text-white transition-colors p-1.5 rounded-md bg-white/[0.03] hover:bg-white/[0.08] flex items-center justify-center"
					@click="layoutMode = layoutMode === 'list' ? 'card' : 'list'"
					:title="layoutMode === 'list' ? '切换到卡片视图' : '切换到列表视图'">
					<svg v-if="layoutMode === 'list'" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
						<rect x="3" y="3" width="7" height="7" rx="1.5" stroke-width="2"/>
						<rect x="14" y="3" width="7" height="7" rx="1.5" stroke-width="2"/>
						<rect x="3" y="14" width="7" height="7" rx="1.5" stroke-width="2"/>
						<rect x="14" y="14" width="7" height="7" rx="1.5" stroke-width="2"/>
					</svg>
					<svg v-else class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
						<line x1="4" y1="7" x2="20" y2="7" stroke-width="2" stroke-linecap="round"/>
						<line x1="4" y1="12" x2="20" y2="12" stroke-width="2" stroke-linecap="round"/>
						<line x1="4" y1="17" x2="20" y2="17" stroke-width="2" stroke-linecap="round"/>
					</svg>
				</button>
			</div>

			<!-- Search Bar 置顶 (iOS Style) -->
			<div class="px-3 sm:px-5 lg:px-8 xl:px-12 pb-2 flex gap-3 items-center overflow-hidden">
				<div
					class="flex-1 h-[36px] rounded-[10px] bg-white/[0.06] border border-white/[0.08] flex items-center px-2 transition-all duration-300">
					<svg class="w-[16px] h-[16px] text-[#8A8A8E] shrink-0 ml-1" viewBox="0 0 24 24">
						<path
							d="M10.5 4a6.5 6.5 0 1 0 4.06 11.58l4.93 4.92a1 1 0 0 0 1.42-1.42l-4.92-4.93A6.5 6.5 0 0 0 10.5 4zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9z"
							fill="currentColor" />
					</svg>
					<input
						v-model="keyword"
						class="flex-1 h-full bg-transparent border-0 outline-none text-white text-[15px] ml-1.5 placeholder:text-[#8A8A8E]"
						type="text"
						placeholder="搜索应用"
						@focus="isSearching = true"
						@blur="isSearching = false" />
					<button
						v-show="keyword"
						class="w-[16px] h-[16px] rounded-full bg-white/[0.12] text-white/60 flex items-center justify-center mr-1 cursor-pointer hover:bg-white/[0.2] transition-colors"
						type="button"
						@mousedown.prevent
						@click="keyword = ''">
						<svg class="w-2.5 h-2.5" viewBox="0 0 14 14" fill="none">
							<path d="M3 3L11 11M3 11L11 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
						</svg>
					</button>
				</div>
				<button 
					v-show="isSearching || keyword"
					class="text-[15px] text-[#4A9EFF] shrink-0 active:text-[#4A9EFF]/70 transition-all duration-300"
					@mousedown.prevent
					@click="keyword = ''; isSearching = false">
					取消
				</button>
			</div>

			<!-- Filter chips & Time selector -->
			<div class="flex items-center justify-between px-3 sm:px-5 lg:px-8 xl:px-12 pt-1 pb-3 w-full">
				<!-- 左侧：状态筛选 -->
				<div class="flex gap-1.5 overflow-x-auto chip-row bg-white/[0.03] p-0.5 rounded-lg">
					<button
						v-for="f in [
							{ label: '全部', value: 'all' },
							{ label: '故障', value: 'critical' },
							{ label: '警戒', value: 'warning' },
						] as const"
						:key="f.value"
						class="flex-none text-[11px] px-3 py-1 rounded-md transition-all duration-200 whitespace-nowrap"
						:class="
							activeFilter === f.value
								? 'text-[#050505] bg-white font-bold shadow-lg'
								: 'text-[#8A8A8E] hover:text-white hover:bg-white/[0.05]'
						"
						@click="activeFilter = f.value">
						{{ f.label }}
					</button>
				</div>

				<!-- 右侧：时间切换 -->
				<div class="flex gap-1 shrink-0 bg-white/[0.03] p-0.5 rounded-lg">
					<button
						v-for="t in [5, 10, 15] as const"
						:key="t"
						@click="timeRange = t"
						class="text-[10px] px-2.5 py-1 rounded-md transition-colors"
						:class="
							timeRange === t
								? 'text-[#050505] bg-[#4A9EFF] shadow-[0_0_10px_rgba(74,158,255,0.3)] font-bold'
								: 'text-[#8A8A8E] hover:text-white hover:bg-white/[0.05]'
						">
						{{ t }}m
					</button>
				</div>
			</div>

			<!-- Column header bar -->
			<div v-show="layoutMode === 'list'" class="flex items-center px-3 sm:px-5 lg:px-8 xl:px-12 pb-[8px] pt-1">
				<!-- App name column -->
				<div class="flex items-center gap-[5px] flex-1 min-w-0">
					<button
						class="col-icon-btn flex items-center justify-center w-[22px] h-[22px] rounded-md transition-all duration-200 shrink-0"
						:class="
							showTrend
								? 'bg-[rgba(74,158,255,0.12)] text-[#4A9EFF] border border-[rgba(74,158,255,0.2)]'
								: 'bg-white/[0.06] text-[#8A8A8E] border border-white/[0.08] hover:text-white'
						"
						@click="showTrend = !showTrend"
						:title="showTrend ? '隐藏交易量' : '显示交易量'">
						<svg
							v-if="!showTrend"
							class="w-[13px] h-[13px]"
							viewBox="0 0 16 16"
							fill="none">
							<path
								d="M1 12 L4.5 7.5 L7.5 9.5 L11 4.5 L15 7"
								stroke="currentColor"
								stroke-width="1.4"
								stroke-linecap="round"
								stroke-linejoin="round" />
							<circle cx="15" cy="7" r="1.2" fill="currentColor" />
						</svg>
						<svg v-else class="w-[13px] h-[13px]" viewBox="0 0 16 16" fill="none">
							<path
								d="M1 12 L4.5 7.5 L7.5 9.5 L11 4.5 L15 7"
								stroke="currentColor"
								stroke-width="1.4"
								stroke-linecap="round"
								stroke-linejoin="round" />
							<line
								x1="2"
								y1="14.5"
								x2="14"
								y2="14.5"
								stroke="currentColor"
								stroke-width="1.2"
								stroke-linecap="round" />
						</svg>
					</button>
				</div>

				<!-- Headers with Units included -->
				<div
					v-if="showTrend"
					class="col-trend text-[9px] uppercase tracking-wider text-[#444] text-right font-medium cursor-pointer flex items-center justify-end gap-0.5 hover:text-white/60 transition-colors select-none"
					@click="handleSort('responseTime')">
					交易量
					<div class="flex flex-col opacity-50" :class="{'opacity-100 text-[#4A9EFF]': sortKey === 'responseTime'}">
						<svg class="w-1.5 h-1.5" :class="{'opacity-30': sortKey === 'responseTime' && sortOrder === 'desc'}" viewBox="0 0 10 10" fill="currentColor"><path d="M5 2L8 6H2z"/></svg>
						<svg class="w-1.5 h-1.5" :class="{'opacity-30': sortKey === 'responseTime' && sortOrder === 'asc'}" viewBox="0 0 10 10" fill="currentColor"><path d="M5 8L2 4H8z"/></svg>
					</div>
				</div>
				<div v-else 
					class="col-alert text-[9px] uppercase tracking-wider text-[#444] text-right font-medium cursor-pointer flex items-center justify-end gap-0.5 hover:text-white/60 transition-colors select-none"
					@click="handleSort('responseTime')">
					响应时间(ms)
					<div class="flex flex-col opacity-50" :class="{'opacity-100 text-[#4A9EFF]': sortKey === 'responseTime'}">
						<svg class="w-1.5 h-1.5" :class="{'opacity-30': sortKey === 'responseTime' && sortOrder === 'desc'}" viewBox="0 0 10 10" fill="currentColor"><path d="M5 2L8 6H2z"/></svg>
						<svg class="w-1.5 h-1.5" :class="{'opacity-30': sortKey === 'responseTime' && sortOrder === 'asc'}" viewBox="0 0 10 10" fill="currentColor"><path d="M5 8L2 4H8z"/></svg>
					</div>
				</div>

				<div 
					class="col-rr text-[9px] uppercase tracking-wider text-[#444] text-right font-medium cursor-pointer flex items-center justify-end gap-0.5 hover:text-white/60 transition-colors select-none"
					@click="handleSort('responseRate')">
					响应率(%)
					<div class="flex flex-col opacity-50" :class="{'opacity-100 text-[#4A9EFF]': sortKey === 'responseRate'}">
						<svg class="w-1.5 h-1.5" :class="{'opacity-30': sortKey === 'responseRate' && sortOrder === 'desc'}" viewBox="0 0 10 10" fill="currentColor"><path d="M5 2L8 6H2z"/></svg>
						<svg class="w-1.5 h-1.5" :class="{'opacity-30': sortKey === 'responseRate' && sortOrder === 'asc'}" viewBox="0 0 10 10" fill="currentColor"><path d="M5 8L2 4H8z"/></svg>
					</div>
				</div>
				<div 
					class="col-acc text-[9px] uppercase tracking-wider text-[#444] text-right font-medium cursor-pointer flex items-center justify-end gap-0.5 hover:text-white/60 transition-colors select-none"
					@click="handleSort('accuracy')">
					准确率(%)
					<div class="flex flex-col opacity-50" :class="{'opacity-100 text-[#4A9EFF]': sortKey === 'accuracy'}">
						<svg class="w-1.5 h-1.5" :class="{'opacity-30': sortKey === 'accuracy' && sortOrder === 'desc'}" viewBox="0 0 10 10" fill="currentColor"><path d="M5 2L8 6H2z"/></svg>
						<svg class="w-1.5 h-1.5" :class="{'opacity-30': sortKey === 'accuracy' && sortOrder === 'asc'}" viewBox="0 0 10 10" fill="currentColor"><path d="M5 8L2 4H8z"/></svg>
					</div>
				</div>
			</div>
		</header>

		<!-- ── List body ── -->
		<div class="flex-1 overflow-y-auto pb-[calc(env(safe-area-inset-bottom,0px)+20px)] pt-1 relative z-10">
			<!-- 去除背景卡片，仅保留内容与分割线 -->
			<template v-if="filteredCards.length > 0">
				<!-- List View -->
			<div v-if="layoutMode === 'list'">
				<div
					v-for="card in filteredCards"
					:key="card.key"
					class="list-row flex items-center px-3 sm:px-5 lg:px-8 xl:px-12 border-b border-white/[0.04] last:border-0 cursor-pointer transition-colors duration-150 hover:bg-white/[0.02]"
					:class="getStatus(card) === 'normal' ? 'py-[6px]' : 'py-[8px]'"
					@click="goToDetail(card)">
					<div class="flex-1 min-w-0 flex items-center gap-[7px]">
						<!-- Status Indicator Line -->
						<div class="w-[3px] h-[24px] rounded-full shrink-0 transition-colors duration-300"
							:class="{
								'bg-transparent': getStatus(card) === 'normal',
								'bg-[#FF9F0A] shadow-[0_0_8px_#FF9F0A]': getStatus(card) === 'warning',
								'bg-[#FF453A] shadow-[0_0_8px_#FF453A]': getStatus(card) === 'critical'
							}"
						></div>
						<div class="min-w-0">
						<div
							class="truncate leading-tight"
							:class="
								getStatus(card) === 'normal'
									? 'text-[12px] font-medium text-white/75'
									: 'text-[13px] font-semibold text-white'
							">
							{{ card.name }}
						</div>
						<div
							class="font-mono tracking-[0.2px] mt-[2px] truncate"
							:class="
								getStatus(card) === 'normal'
									? 'text-[9.5px] text-[#555555]'
									: 'text-[10px] text-[#8A8A8E]'
							">
							{{ card.appId }}
						</div>
					</div>
				</div>

				<div v-if="showTrend" class="col-trend flex items-center">
					<svg viewBox="0 0 80 18" class="w-full h-[22px]">
						<polyline
							:points="sparkPaths.get(card.key) ?? ''"
							fill="none"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
							:stroke="
								getStatus(card) === 'critical'
									? '#FF453A'
									: getStatus(card) === 'warning'
										? '#FF9F0A'
										: '#4A9EFF'
							"
							:opacity="getStatus(card) === 'normal' ? '0.6' : '0.9'" />
					</svg>
				</div>

				<div v-else class="col-alert flex justify-end items-center">
					<span
						class="text-[12px] font-mono"
						:class="{
							'text-[#FF453A] font-bold': getStatus(card) === 'critical',
							'text-[#FF9F0A] font-bold': getStatus(card) === 'warning',
							'val-default': getStatus(card) === 'normal',
						}"
						>{{ card.responseTime }}</span
					>
				</div>

				<div class="col-rr text-right">
					<span class="text-[12px] font-mono font-semibold" :class="rrColor(card)">{{
						fmt(card.responseRate)
					}}</span>
				</div>

				<div class="col-acc text-right">
					<span class="text-[12px] font-mono" :class="accColor(card)">{{
						fmt(card.accuracy)
					}}</span>
				</div>
				
				<!-- Chevron Icon -->
				<div class="ml-2 flex items-center justify-end shrink-0 w-4">
					<svg class="w-3.5 h-3.5 text-white/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
						<path d="M9 18l6-6-6-6"/>
					</svg>
				</div>
					</div>
				</div>

				<!-- Card View -->
				<div v-else class="grid grid-cols-2 gap-3 px-3 sm:px-5 lg:px-8 xl:px-12 pt-2 pb-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
					<div
						v-for="card in filteredCards"
						:key="'card-' + card.key"
						class="monitor-card border rounded-[18px] p-3 flex flex-col gap-2 backdrop-blur-xl cursor-pointer transition-all duration-200"
						:class="'card-' + getStatus(card)"
						@click="goToDetail(card)">
						<!-- Card header: name + status + appId -->
						<div class="flex items-start justify-between gap-1">
							<div class="flex flex-col gap-[2px] min-w-0 flex-1">
								<div class="text-[12px] font-semibold flex items-center gap-[6px] min-w-0">
									<div
										class="w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-300"
										:class="{
											'bg-[#4A9EFF] shadow-[0_0_5px_#4A9EFF]': getStatus(card) === 'normal',
											'bg-[#FF9F0A] breathe-warn': getStatus(card) === 'warning',
											'bg-[#FF453A] breathe-crit': getStatus(card) === 'critical',
										}"
									/>
									<span class="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-white/90">{{ card.name }}</span>
								</div>
								<span class="font-mono text-[10px] text-white/40 tracking-[0.4px] overflow-hidden text-ellipsis whitespace-nowrap pl-[12px]">{{ card.appId }}</span>
							</div>
							<svg class="w-3.5 h-3.5 text-white/20 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
								<path d="M9 18l6-6-6-6"/>
							</svg>
						</div>

						<!-- Metrics -->
						<div class="flex justify-start items-center mt-1 px-1 gap-4">
							<!-- 响应率 -->
							<div class="flex flex-col items-center gap-1">
								<div class="relative w-10 h-10 flex items-center justify-center">
									<svg class="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 44 44">
										<circle class="donut-bg" cx="22" cy="22" r="18" />
										<circle class="donut-progress" cx="22" cy="22" r="18"
											:stroke="parseFloat(card.responseRate) < 80 ? '#FF453A' : parseFloat(card.responseRate) < 95 ? '#FF9F0A' : '#4A9EFF'"
											:style="{ strokeDashoffset: getDashOffset(card.responseRate) }" />
									</svg>
									<span class="relative z-[1] font-mono text-[10px] font-bold leading-none" :class="rrColor(card)">{{ fmt(card.responseRate) }}</span>
								</div>
								<span class="text-[9px] text-white/40 uppercase">响应率(%)</span>
							</div>
							<!-- 准确率 -->
							<div class="flex flex-col items-center gap-1">
								<div class="relative w-10 h-10 flex items-center justify-center">
									<svg class="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 44 44">
										<circle class="donut-bg" cx="22" cy="22" r="18" />
										<circle class="donut-progress" cx="22" cy="22" r="18"
											:stroke="parseFloat(card.accuracy) < 85 ? '#FF453A' : parseFloat(card.accuracy) < 95 ? '#FF9F0A' : '#4A9EFF'"
											:style="{ strokeDashoffset: getDashOffset(card.accuracy) }" />
									</svg>
									<span class="relative z-[1] font-mono text-[10px] font-bold leading-none" :class="accColor(card)">{{ fmt(card.accuracy) }}</span>
								</div>
								<span class="text-[9px] text-white/40 uppercase">准确率(%)</span>
							</div>
							<!-- 耗时 -->
							<div class="flex flex-col gap-1 text-right ml-auto justify-end h-full pb-1">
								<span class="text-[9px] text-white/40 uppercase scale-90 origin-right">耗时</span>
								<span class="font-mono text-[13px]" :class="{'text-[#FF453A] font-bold': getStatus(card) === 'critical', 'text-[#FF9F0A] font-bold': getStatus(card) === 'warning', 'val-default': getStatus(card) === 'normal'}">
									{{ card.responseTime }}<span class="text-[9px] text-white/30 ml-0.5">ms</span>
								</span>
							</div>
						</div>

						<!-- Spark chart -->
						<div class="mt-1 h-[24px] w-full flex items-end opacity-80">
							<svg viewBox="0 0 80 18" class="w-full h-full" preserveAspectRatio="none">
								<polyline
									:points="sparkPaths.get(card.key) ?? ''"
									fill="none"
									stroke-width="1.5"
									stroke-linecap="round"
									stroke-linejoin="round"
									:stroke="getStatus(card) === 'critical' ? '#FF453A' : getStatus(card) === 'warning' ? '#FF9F0A' : '#4A9EFF'"
									:opacity="getStatus(card) === 'normal' ? '0.6' : '0.9'" />
							</svg>
						</div>
					</div>
				</div>
			</template>

			<div
				v-if="filteredCards.length === 0"
				class="mx-4 mt-8 text-center text-white/28 border border-dashed border-white/10 rounded-2xl py-10 text-[13px]">
				未找到匹配的应用
			</div>
			
			<!-- 到底提示 -->
			<div
				v-else
				class="flex items-center justify-center gap-2 py-6 text-white/30">
				<span class="w-10 h-[1px] bg-gradient-to-r from-transparent to-white/10"></span>
				<span class="text-[11px] tracking-wider">END</span>
				<span class="w-10 h-[1px] bg-gradient-to-l from-transparent to-white/10"></span>
			</div>
		</div>
	</div>
</template>

<style scoped>
.list-page {
	position: relative;
	isolation: isolate;
	font-family:
		-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-webkit-tap-highlight-color: transparent;
	background: linear-gradient(180deg, #0a0a0a 0%, #020202 100%);
}

.list-page::before {
	content: "";
	position: fixed;
	inset: 0;
	background:
		radial-gradient(ellipse 80% 50% at 20% 40%, rgba(74, 158, 255, 0.12), transparent 50%),
		radial-gradient(ellipse 60% 40% at 80% 20%, rgba(217, 39, 176, 0.05) 0%, transparent 50%),
		radial-gradient(ellipse 50% 60% at 50% 80%, rgba(74, 54, 255, 0.05) 0%, transparent 50%);
	pointer-events: none;
	z-index: 0;
}

.list-page > * {
	position: relative;
	z-index: 1;
}

/* ── Glassmorphism header ── */
.glass-header {
	background: rgba(5, 5, 5, 0.85);
	backdrop-filter: blur(24px) saturate(180%);
	-webkit-backdrop-filter: blur(24px) saturate(180%);
	border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.chip-row {
	scrollbar-width: none;
}
.chip-row::-webkit-scrollbar {
	display: none;
}

/* ── Adjusted Column widths for Headers with Units ── */
.col-alert {
	width: 72px;
	flex-shrink: 0;
}
.col-trend {
	width: 86px;
	flex-shrink: 0;
}
.col-rr {
	width: 56px;
	flex-shrink: 0;
}
.col-acc {
	width: 56px;
	flex-shrink: 0;
}

/* ── Metric value colors ── */
.val-good {
	color: #32d74b;
}
.monitor-card .val-good {
	color: #4A9EFF;
}
.val-warn {
	color: #ff9f0a;
}
.val-crit {
	color: #ff453a;
}
.val-norm {
	color: rgba(255, 255, 255, 0.5);
}

/* ── Card styles from HomeView ── */
.monitor-card {
	box-shadow: 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05);
}

/* ── Donut chart styles ── */
.donut-bg { fill: none; stroke: rgba(255, 255, 255, 0.06); stroke-width: 2.5; }
.donut-progress {
	fill: none;
	stroke-width: 2.5;
	stroke-linecap: round;
	stroke-dasharray: 113.097;
	transition: stroke-dashoffset 1s ease-out;
}

.card-normal,
.card-warning,
.card-critical {
	background: rgba(74,158,255,0.03);
	border-color: rgba(74,158,255,0.12);
}
.card-normal:hover, .card-warning:hover, .card-critical:hover {
	background: rgba(74,158,255,0.06);
	border-color: rgba(74,158,255,0.25);
	transform: translateY(-2px);
	box-shadow: 0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08);
}

/* ── Row states ── */
.list-row:active {
	background: rgba(255, 255, 255, 0.05) !important;
}
@media (hover: hover) {
	.list-row:hover {
		background: rgba(255, 255, 255, 0.03);
	}
}
@keyframes breathe-warning {
	0%, 100% { opacity: 1; box-shadow: 0 0 5px #FF9F0A, 0 0 10px #FF9F0A; }
	50% { opacity: 0.5; box-shadow: 0 0 2px #FF9F0A; }
}

@keyframes breathe-critical {
	0%, 100% { opacity: 1; box-shadow: 0 0 5px #FF453A, 0 0 10px #FF453A; }
	50% { opacity: 0.5; box-shadow: 0 0 2px #FF453A; }
}

.breathe-warn {
	animation: breathe-warning 2s infinite ease-in-out;
}

.breathe-crit {
	animation: breathe-critical 1.5s infinite ease-in-out;
}
</style>
