import React, { lazy, ReactNode, LazyExoticComponent, ComponentType } from 'react';

interface BaseNavItem {
  component: LazyExoticComponent<ComponentType<any>> | ComponentType<any>;
  url: string;
  icon?: ReactNode;
  badge?: {
    color: string;
    text: string;
  };
}

interface NavGroup extends BaseNavItem {
  items: BaseNavItem[];
}
type NavItem = BaseNavItem | NavGroup;



const routes: NavItem[] = [
  { url: '/addDpeServiceCharge', component: lazy(() => import('@/pages/containerOperation/transactions/directPortSvcCharge/Add')), },
  { url: '/editDpeServiceCharge', component: lazy(() => import('@/pages/containerOperation/transactions/directPortSvcCharge/Search')), },
  { url: '/addGateOut', component: lazy(() => import('@/pages/containerOperation/transactions/getOutContainer/Add')), },
  { url: '/editGateOut', component: lazy(() => import('@/pages/containerOperation/transactions/getOutContainer/Search')), },
  { url: '/addGateIn', component: lazy(() => import('@/pages/containerOperation/transactions/gainInContainer/Add')), },
  { url: '/editGateIn', component: lazy(() => import('@/pages/containerOperation/transactions/gainInContainer/Search')), },
  { url: '/addUserAccess', component: lazy(() => import('@/pages/security/transactions/userAccess/Add')), },
  { url: '/editUserAccess', component: lazy(() => import('@/pages/security/transactions/userAccess/Edit')), },
 
  { url: '/dashboard', component: lazy(() => import('@/pages/Dashboard')) },
  { url: '/orders/live', component: lazy(() => import('@/pages/orders/OrdersDashboard')) },
   { url: '/orders/history', component: lazy(() => import('@/pages/orders/OrderHistory')) },
  { url: '/super/dashboard', component: lazy(() => import('@/pages/dashboard/SuperAdminDashboard')) },
  { url: '/staff/dashboard', component: lazy(() => import('@/pages/dashboard/StaffAdminDashboard')) },
  { url: '/tables/add', component: lazy(() => import('@/pages/tables/Add')) },
  { url: '/tables/list', component: lazy(() => import('@/pages/tables/Search')) },
];

export default routes;
