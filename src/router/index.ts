import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeListView.vue'),
    },
    {
      path: '/server-monitor',
      name: 'serverMonitor',
      component: () => import('../views/ServerMonitorView.vue'),
    },
  ],
});

export default router;
