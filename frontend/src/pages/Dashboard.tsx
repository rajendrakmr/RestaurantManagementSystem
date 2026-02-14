import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import { useDispatch, useSelector } from "react-redux";
import { setBreadcrumbs } from "@/store/slice/bredCrumbs";
import { setMenu } from "@/store/slice/menuSlice";
import axios from "axios";
import { apiRequest } from "@/store/services/api";
import { RootState } from "@/store";
import { staffMenu, superAdminMenu, tenantAdminMenu } from "@/utils/commonHelper";

interface DashboardData {
  totalTables: number;
  ordersToday: number;
  pendingOrders: number;
  completedOrders: number;
  documentStatus: { uploaded: number; pending: number; rejected: number };
}

interface Table {
  _id: string;
  tableNumber: number;
  qrCode: string; // base64 image
}
const Dashboard: React.FC = () => {
  const userInfo: any = useSelector((state: RootState) => state.auth.userInfo);
  const dispatch = useDispatch();
  const [data, setData] = useState<DashboardData>({
    totalTables: 0,
    ordersToday: 0,
    pendingOrders: 0,
    completedOrders: 0,
    documentStatus: { uploaded: 0, pending: 0, rejected: 0 }
  });

  useEffect(() => {
    if (userInfo.role === "superadmin") {
      dispatch(setMenu(superAdminMenu));
    } else if (userInfo.role === "admin") {
      dispatch(setMenu(tenantAdminMenu));
    } else if (userInfo.role === "staff") {
      dispatch(setMenu(staffMenu));
    }

  }, [userInfo, dispatch]);

  useEffect(() => {
    dispatch(setBreadcrumbs([]));
  }, [dispatch]);




  const [tables, setTables] = useState<Table[]>([]);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const res = await apiRequest({ url: '/tables', method: "GET" });
        console.log('resresresres', res)
        setTables(res);
      } catch (err) {
        console.error("Error fetching tables:", err);
      }
    };

    fetchTables();
  }, []);



  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await axios.get("/api/dashboard"); // create a backend route to return stats
        setData(res.data);
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      }
    };
    fetchDashboardData();
  }, []);
  const staticTenantData = {
    todayRevenue: 24500,
    weeklyRevenue: 158000,
    totalOrdersToday: 86,
    pendingOrders: 12,
    completedOrders: 64,
    totalTables: 20,
    occupiedTables: 14,
    topItems: [
      { name: "Paneer Butter Masala", count: 32 },
      { name: "Chicken Biryani", count: 27 },
      { name: "Masala Dosa", count: 19 }
    ],
    recentOrders: [
      { table: 4, amount: 850, status: "Preparing" },
      { table: 7, amount: 1200, status: "Completed" },
      { table: 2, amount: 540, status: "Pending" }
    ]
  };

  return (
    <div className="_rkContentBorder row py-3" style={{ marginBottom: "70px" }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap grid-margin mb-3">
        <div>
          <h4 className="mb-1">Restaurant Dashboard</h4>
          <p className="text-muted mb-0">Welcome, The Curry Code 😎</p>
        </div>
      </div>

      <div className="tenant-dashboard">

        {/* Top KPI Cards */}
        <div className="row g-3">

          <div className="col-xl-3 col-md-6">
            <div className="tenant-kpi revenue">
              <p>Today's Revenue</p>
              <h3>₹ {staticTenantData.todayRevenue}</h3>
            </div>
          </div>

          <div className="col-xl-3 col-md-6">
            <div className="tenant-kpi orders">
              <p>Orders Today</p>
              <h3>{staticTenantData.totalOrdersToday}</h3>
            </div>
          </div>

          <div className="col-xl-3 col-md-6">
            <div className="tenant-kpi pending">
              <p>Pending Orders</p>
              <h3>{staticTenantData.pendingOrders}</h3>
            </div>
          </div>

          <div className="col-xl-3 col-md-6">
            <div className="tenant-kpi tables">
              <p>Occupied Tables</p>
              <h3>{staticTenantData.occupiedTables}/{staticTenantData.totalTables}</h3>
            </div>
          </div>

        </div>

        {/* Middle Section */}
        <div className="row g-3 mt-3">

          {/* Weekly Revenue */}
          <div className="col-lg-8">
            <div className="dashboard-card">
              <h6>Weekly Revenue Overview</h6>
              <div className="chart-placeholder">
                📊 Weekly Revenue Chart Placeholder
              </div>
            </div>
          </div>

          {/* Top Selling Items */}
          <div className="col-lg-4">
            <div className="dashboard-card">
              <h6>Top Selling Items</h6>
              <ul className="top-items">
                {staticTenantData.topItems.map((item, index) => (
                  <li key={index}>
                    <span>{item.name}</span>
                    <strong>{item.count} orders</strong>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="row g-3 mt-3">

          <div className="col-lg-6">
            <div className="dashboard-card">
              <h6>Recent Orders</h6>
              <ul className="activity-list">
                {staticTenantData.recentOrders.map((order, index) => (
                  <li key={index}>
                    <strong>Table {order.table}</strong>
                    <span className={
                      order.status === "Completed"
                        ? "text-success"
                        : order.status === "Preparing"
                          ? "text-warning"
                          : "text-danger"
                    }>
                      ₹{order.amount} - {order.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="dashboard-card">
              <h6>Weekly Summary</h6>
              <p>Total Weekly Revenue</p>
              <h3>₹ {staticTenantData.weeklyRevenue}</h3>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;
