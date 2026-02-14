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
const staticStaffData = {
    liveOrders: 18,
    pendingOrders: 7,
    preparingOrders: 6,
    readyOrders: 5,
    assignedTables: [2, 4, 6, 8],
    recentOrders: [
        { table: 2, items: 3, status: "Preparing" },
        { table: 5, items: 2, status: "Ready" },
        { table: 1, items: 4, status: "Pending" }
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



                </div>

                <div className="staff-dashboard">

                    {/* Quick Stats */}
                    <div className="row g-3">

                        <div className="col-md-3">
                            <div className="staff-kpi live">
                                <p>Live Orders</p>
                                <h3>{staticStaffData.liveOrders}</h3>
                            </div>
                        </div>

                        <div className="col-md-3">
                            <div className="staff-kpi pending">
                                <p>Pending</p>
                                <h3>{staticStaffData.pendingOrders}</h3>
                            </div>
                        </div>

                        <div className="col-md-3">
                            <div className="staff-kpi preparing">
                                <p>Preparing</p>
                                <h3>{staticStaffData.preparingOrders}</h3>
                            </div>
                        </div>

                        <div className="col-md-3">
                            <div className="staff-kpi ready">
                                <p>Ready</p>
                                <h3>{staticStaffData.readyOrders}</h3>
                            </div>
                        </div>

                    </div>

                    {/* Assigned Tables */}
                    <div className="row g-3 mt-3">
                        <div className="col-lg-4">
                            <div className="dashboard-card">
                                <h6>Assigned Tables</h6>
                                <div className="table-grid">
                                    {staticStaffData.assignedTables.map((table, index) => (
                                        <div key={index} className="table-box">
                                            Table {table}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Recent Orders */}
                        <div className="col-lg-8">
                            <div className="dashboard-card">
                                <h6>Recent Orders</h6>
                                <ul className="activity-list">
                                    {staticStaffData.recentOrders.map((order, index) => (
                                        <li key={index}>
                                            <strong>Table {order.table}</strong>
                                            <span className={
                                                order.status === "Ready"
                                                    ? "text-success"
                                                    : order.status === "Preparing"
                                                        ? "text-warning"
                                                        : "text-danger"
                                            }>
                                                {order.items} items - {order.status}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default SuperAdminDashboard;
