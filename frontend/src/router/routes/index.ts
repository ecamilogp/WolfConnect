import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'chat-empty',
        component: () => import('@/pages/chat/ChatEmptyPage.vue'),
      },
      {
        path: 'chat/:chatId',
        name: 'chat',
        component: () => import('@/pages/chat/ChatPage.vue'),
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('@/pages/profile/ProfilePage.vue'),
      },
      {
        path: 'admin/users',
        name: 'admin-users',
        component: () => import('@/pages/admin/AdminUsersPage.vue'),
        meta: { requiresAdmin: true },
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('@/pages/settings/SettingsPage.vue'),
      },
    ],
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/auth/LoginPage.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/pages/auth/RegisterPage.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/pages/errors/NotFoundPage.vue'),
  },
]
