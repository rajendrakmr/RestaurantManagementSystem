import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify"; 
import { setBreadcrumbs } from "@/store/slice/bredCrumbs";
import { useDispatch } from "react-redux";
import RowFormInputField from "@/components/Form/RowFormInputField";
import { apiRequest } from "@/store/services/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import moment from 'moment'
import Edit from "./Edit";
import LoadingFetchLoader from "@/components/LoadingFetchLoader";
 
import './search.css'
export interface Column {
    key: string;
    label: string;
}
export interface GateInRecord {
    id: number;
    name: string;
    code: string;
    vehicleNo: string;
    txtInTime: string;
    chAgentCode: string;
    eir: string;
    vesselNo: string;
    loadingStatus: string;
    containerStatus: string;
    foreignCoastalFlag: string;
}


const Search: React.FC = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(
            setBreadcrumbs([
                { label: "Table Management", path: "" },
                { label: "All Tables" }
            ])
        );
    }, [dispatch]);
    const initial = {
        chitNo: "",
        containerNo: "",
        vehicleNo: "",
        gateInDate: "",
        agent: "",
        eir: "",
        vesselNo: "",
        loadingStatus: "",
        containerSize: "",
        voyage: ""
    }
    const [formData, setFormData] = useState(initial);
    const [errors, setErrors] = useState<Record<string, any>>({});
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prevData) => ({
            ...prevData,
            [e.target.name]: e.target.value,
        }));
        setErrors({ ...errors, [e.target.name]: "" });
    };


    const [pageSize, setPageSize] = useState(15);
    const [page, setPage] = useState(0);
    const [isEdit, setIsEdit] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchLoding, setSearchLoading] = useState(false);
    const [dataItems, setDataItems] = useState([]); 
    const fetchRecords = async (payload = formData, page = 0, pageSize = 15) => {
        try {
            setLoading(true)
            const url = `/tables`
            const response = await apiRequest({ url: url, method: "GET", }); 
            if (response.length > 0) {
                setPageSize(pageSize)
                setDataItems(response) 
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false)
            setSearchLoading(false)
        }
    };


    const [formEditData, setFormEditData] = useState({});
    const [isEditLoading, setIsEditLoading] = useState(false);

    const handleEdit = useCallback(async (row: any) => {
        try {
            setIsEditLoading(true)
            const url = `/tables`;
            const response = await apiRequest({ url, method: "GET" });
            if (response?.success) {
                const item = response?.success 
                setFormEditData({
                    chitNo: item?.chit_no,
                    vehicleNo: item?.vehicle_no,
                    fromLocId: item?.from_loc_id,
                    txtInTime: moment(item?.gateInDateTime).format('DD/MM/YYYY h:mm'),
                    impExpTrns: item?.imp_exp_trns,
                    beSbNo: item?.boe_no, 
                }); 
                setIsEdit(true)
            } else {
                toast.error("Failed to load edit data", { position: "top-right", autoClose: 6000 });
            }
        } catch (error: any) {
            toast.error(error?.message || "Something went wrong while fetching edit data", { position: "top-right", autoClose: 5000, });
        } finally {
            setIsEditLoading(false)
        }
    }, []);

    const hasAtLeastOneValue = (data: Record<string, any>) => {
        return Object.values(data).some(
            (value) => value !== "" && value !== null && value !== undefined
        );
    };

    const handleSearchForm = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        try {

            if (!hasAtLeastOneValue(formData)) {
                toast.warn("Please enter at least one search field", { position: "top-right", autoClose: 6000, });
                return;
            }
            setSearchLoading(true)

            fetchRecords(formData, 0, pageSize);
        } catch (err: any) {
            let apiError = "Something went wrong. Please try again.";
            toast.error(apiError, { position: "top-right", autoClose: 6000 });
        }
    }, [formData, pageSize]);

    const resetform = useCallback(async (e: React.FormEvent) => {
        if (hasAtLeastOneValue(formData)) {
            fetchRecords(initial, 0, pageSize);
        }
    }, [initial, pageSize])

    useEffect(() => {
        fetchRecords();
    }, []);
  
    const columns: Column[] = [
        { key: "action", label: "Action" },
        { key: "status", label: "Status" },
        { key: "qrCode", label: "QR Code" },
        { key: "tableNumber", label: "Table Number" },
        { key: "tableName", label: "Table Name" },
        { key: "capacity", label: "Capacty" },
        { key: "section", label: "Section" }
    ]

 
    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this table?")) {
            console.log("Delete table:", id);
        }
    };

    const handleDownloadQR = (qr: string) => {
        const link = document.createElement("a");
        link.href = qr;
        link.download = "table-qr.png";
        link.click();
    };

    return (isEdit ? (<Edit initialForm={formEditData} setIsEdit={setIsEdit} apiRequest={apiRequest} />) :
        (<div className="_rkContentBorder container-fluid py-3" style={{ border: "1px solid black", marginTop: "7px", marginBottom: "70px" }}>
            <div
                className="d-flex justify-content-between align-items-center text-white px-3 py-1 mb-3 fw-bold"
                style={{ backgroundColor: "#023e8a" }}
            >
                <span style={{ fontSize: "12px" }}>
                    Tables Search
                </span>

                {/* <a
                    href="#"
                    style={{ fontSize: "11px" }}
                    className="text-white"
                    onClick={(e) => {
                        e.preventDefault();
                        console.log("Add clicked");
                    }}
                >
                    Click here to add new Container Gate In
                </a> */}
            </div>

            <form onSubmit={handleSearchForm}>
                <div className="row">
                    <RowFormInputField row="col-md-3" col1="col-md-4" col2="col-md-8" label="Table No" name="chitNo" inputValue={formData.chitNo} error={errors.chitNo} onChange={handleChange} />
                    <RowFormInputField row="col-md-3" col1="col-md-4" col2="col-md-8" label="Capacity" name="containerNo" inputValue={formData.containerNo} error={errors.containerNo} onChange={handleChange} />
                    <RowFormInputField row="col-md-3" col1="col-md-4" col2="col-md-8" label="Table Name" name="vehicleNo" inputValue={formData.vehicleNo} error={errors.vehicleNo} onChange={handleChange} />


                </div>
                <div className="d-flex gap-3 justify-content-start mt-2">
                    <button type="button" onClick={resetform} disabled={loading} className="btn btn-secondary btn-sm custom-form-control ">
                        Clear
                    </button>
                    <button
                        type="submit"
                        className={`btn btn-success btn-sm px-4 custom-form-control position-relative ${searchLoding ? "loading" : ""}`}
                        disabled={searchLoding}
                        style={{
                            minWidth: "100px"
                        }}
                    >
                        {searchLoding && <span className="spinner-center"></span>}
                        {!searchLoding && <span className="btn-text">Search</span>}
                    </button>

                </div>
            </form>

            <div className="text-white px-3   mb-1 mt-3 fw-bold" style={{ backgroundColor: "#023e8a" }}>
                <span style={{ fontSize: "12px" }}>
                    ➤ Lists
                </span>
            </div>
            <div className="table-wrapper">
                <table className="custom-table">
                    <thead className="text-white">
                        <tr>
                            {columns?.map((column) => (
                                <th>{column.label}</th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={columns.length} className="table-loader">
                                    <LoadingSpinner size={110} />
                                </td>
                            </tr>
                        ) : dataItems.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="text-center">
                                    No records found
                                </td>
                            </tr>
                        ) : (
                            dataItems.map((row: any, rowIndex: number) => (
                                <tr key={row.tableNumber ?? rowIndex} className="table-row">
                                    <td>
                                        <div className="action-buttons">

                                            <button
                                                className="btn-action edit"
                                                onClick={() => handleEdit(row)}
                                            >
                                                ✏️
                                            </button>

                                            <button
                                                className="btn-action delete"
                                                onClick={() => handleDelete(row._id)}
                                            >
                                                🗑️
                                            </button>

                                            <button
                                                className="btn-action download"
                                                onClick={() => handleDownloadQR(row.qrCode)}
                                            >
                                                ⬇️
                                            </button>

                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${row.status === "Y" ? "active" : "inactive"}`}>
                                            {row.status === "Y" ? "Active" : "In-Active"}
                                        </span>
                                    </td>

                                    <td className="qr-cell">
                                        <div className="qr-wrapper">
                                            <img
                                                src={row.qrCode}
                                                alt={`QR Table ${row.tableNumber}`}
                                                className="qr-img"
                                            />
                                        </div>
                                    </td>

                                    <td className="fw-bold">#{row.tableNumber}</td>
                                    <td>{row.tableName || "-"}</td>

                                    <td>
                                        <span className="capacity-pill">
                                            {row.capacity} Seats
                                        </span>
                                    </td>

                                    <td>
                                        <span className="section-tag">
                                            {row.section || "Main"}
                                        </span>
                                    </td>

                                    {/* 🔥 ACTIONS COLUMN */}


                                </tr>

                            ))
                        )}
                    </tbody>

                </table> 

                {
                    isEditLoading && <LoadingFetchLoader />
                }
            </div>

        </div>)

    );
};

export default Search;
