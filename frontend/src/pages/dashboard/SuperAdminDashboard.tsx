import React, { useEffect, useState } from "react";
import "../Dashboard.css";
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
const staticSuperData = {
    totalTenants: 128,
    activeTenants: 102,
    inactiveTenants: 26,
    totalRevenue: 1450000,
    monthlyRevenue: [12000, 15000, 18000, 22000, 25000, 30000, 35000, 38000, 40000, 45000, 50000, 60000],
    planDistribution: {
        basic: 60,
        pro: 45,
        enterprise: 23
    },
    recentTenants: [
        { name: "The Curry Code", plan: "Pro", createdAt: "2025-02-01" },
        { name: "Spice Palace", plan: "Basic", createdAt: "2025-02-05" },
        { name: "Urban Tandoor", plan: "Enterprise", createdAt: "2025-02-07" }
    ],
    recentPayments: [
        { tenant: "The Curry Code", amount: 4999, status: "success" },
        { tenant: "Spice Palace", amount: 1999, status: "success" },
        { tenant: "Urban Tandoor", amount: 9999, status: "pending" }
    ]
};

const SuperAdminDashboard: React.FC = () => {
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

    return (
        <div className="_rkContentBorder row py-3" style={{ marginBottom: "70px" }}>

            <div className="super-dashboard">

                {/* KPI Cards */}
                <div className="row g-3">

                    <div className="d-flex justify-content-between align-items-center flex-wrap grid-margin mb-3">
                        <div>
                            <h4 className="mb-1">Restaurant Dashboard</h4>
                            <p className="text-muted mb-0">Welcome, The Curry Code 😎</p>
                        </div>
                    </div>

                    <div className="col-xl-3 col-md-6">
                        <div className="kpi-card green">
                            <p>Active Tenants</p>
                            <h3>{staticSuperData.activeTenants}</h3>
                        </div>
                    </div>

                    <div className="col-xl-3 col-md-6">
                        <div className="kpi-card purple">
                            <p>Total Revenue</p>
                            <h3>₹ {staticSuperData.totalRevenue}</h3>
                        </div>
                    </div>

                    <div className="col-xl-3 col-md-6">
                        <div className="kpi-card orange">
                            <p>This Month Revenue</p>
                            <h3>₹ {staticSuperData.monthlyRevenue[11]}</h3>
                        </div>
                    </div>

                </div>

                {/* Charts Placeholder Section */}
                <div className="row g-3 mt-3">

                    <div className="col-lg-8">
                        <div className="dashboard-card">
                            <h6>Revenue Overview (Static)</h6>
                            <div className="chart-placeholder">
                                📊 Revenue Chart Placeholder
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div className="dashboard-card">
                            <h6>Plan Distribution</h6>
                            <ul className="plan-list">
                                <li>Basic: {staticSuperData.planDistribution.basic}</li>
                                <li>Pro: {staticSuperData.planDistribution.pro}</li>
                                <li>Enterprise: {staticSuperData.planDistribution.enterprise}</li>
                            </ul>
                        </div>
                    </div>

                </div>

                {/* Activity Section */}
                <div className="row g-3 mt-3">

                    <div className="col-lg-6">
                        <div className="dashboard-card">
                            <h6>Recent Restaurants</h6>
                            <ul className="activity-list">
                                {staticSuperData.recentTenants.map((tenant, index) => (
                                    <li key={index}>
                                        <strong>{tenant.name}</strong>
                                        <span>{tenant.plan}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div className="dashboard-card">
                            <h6>Recent Payments</h6>
                            <ul className="activity-list">
                                {staticSuperData.recentPayments.map((payment, index) => (
                                    <li key={index}>
                                        <strong>{payment.tenant}</strong>
                                        <span className={payment.status === "success" ? "text-success" : "text-warning"}>
                                            ₹{payment.amount} - {payment.status}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default SuperAdminDashboard;
