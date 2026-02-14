import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import Paginator from "@/components/Paginator";
import { setBreadcrumbs } from "@/store/slice/bredCrumbs";
import { useDispatch } from "react-redux";
import RowFormInputField from "@/components/Form/RowFormInputField";
import { apiRequest } from "@/store/services/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import moment from 'moment'
import LoadingFetchLoader from "@/components/LoadingFetchLoader";
import { fetchCommonData, searchConfig } from "@/utils/commonHelper";
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
                { label: "Orders", path: "" }, 
                { label: "Order History" }
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
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const fetchRecords = async (payload = formData, page = 0, pageSize = 15) => {
        try {
            setLoading(true)
            const url = `/orders/history?from=2026-02-01&to=2026-02-14`
            const response = await apiRequest({ url: url, method: "GET" });
            if (response.data.length > 0) {
                setPageSize(pageSize)
                setDataItems(response.data)
                setTotalCount(response.totalRecords)
                setTotalPages(response.totalPages)
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
            const url = `/editGateInPage?chitNo=${row.chit_no}`;
            const response = await apiRequest({ url, method: "GET" });
            if (response?.success) {
                const item = response?.success
                console.log('itemitemitemitem', item, item?.gate_out_through)
                setFormEditData({
                    chitNo: item?.chit_no,
                    vehicleNo: item?.vehicle_no,
                    fromLocId: item?.from_loc_id,
                    txtInTime: moment(item?.gateInDateTime).format('DD/MM/YYYY h:mm'),
                    impExpTrns: item?.imp_exp_trns,
                    beSbNo: item?.boe_no,
                    vesselNo: row?.vessel_no,
                    localOrigin: item?.local_origin,
                    vesselName: item?.vessel_no,
                    voyageNo: item?.voyageNumber,
                    weightmentFlag: item?.weighment_flag,
                    securityWall: item?.security_wall,
                    gateInThrough: item?.gate_in_through,
                    containerNo: item?.container_no,
                    containerStatus: `${item?.container_size},${item?.loading_status}`,
                    packages: item?.bags,
                    quantity: item?.quantity,
                    eir: item?.eir,
                    icdCfsFcs: item?.icd_cfs_fsc_none,
                    hazardous: item?.hazardous,
                    customsExamination: item?.customs_examinations,
                    shutOut: item?.shut_out,
                    foreignCoastalFlag: row?.foreign_coastal_flag,
                    linerName: response?.linerName,
                    portName: response?.portName,
                    cargoName: response?.cargoName,
                    agentNames: response?.agentName,
                    locationName: response?.locationName,
                    shipperName: item?.shipper,
                    agentCode: item?.party_cd,
                    cargoCode: item?.cargo_code,
                    portCode: item?.trn_shp_port,
                    locationCode: item?.to_loc_id,
                    linerCode: item?.sical_line_code,
                });
                let api_url = searchConfig['vessel'].url;
                const pagination = '?size=10&page=0'
                let query = `&q=${item?.vessel_no}`
                await fetchCommonData({ t_field_a: 'vesselNo', field_a: 'vesselNo', t_field_b: 'vesselName', field_b: 'vesselName', t_field_c: 'voyageNumber', field_c: 'voyageNumber', url: `${api_url}${pagination}${query}`, setForm: setFormEditData, });


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
    const onPageChange = useCallback((pageNumber: number) => {
        const zeroBasedPage = pageNumber - 1;
        setPage(zeroBasedPage);
        fetchRecords(formData, zeroBasedPage, pageSize);
    }, [formData, pageSize]);

    const columns: Column[] = [
        { key: "action", label: "Order Status" }, 
        { key: "orderId", label: "Order ID" },
        { key: "tableId", label: "Table No" },
        { key: "mobile", label: "Customer Mobile" },
        { key: "deviceId", label: "Device ID" },
        { key: "total", label: "Bill Amount" },
        { key: "createdAt", label: "Bill Date" },
        { key: "items", label: "Items" },
        // { key: "items", label: "Total Qty" },
    ];



    return <div className="_rkContentBorder container-fluid py-3" style={{ border: "1px solid black", marginTop: "7px", marginBottom: "70px" }}>
        <div
            className="d-flex justify-content-between align-items-center text-white px-3 py-1 mb-3 fw-bold"
            style={{ backgroundColor: "#023e8a" }}
        >
            <span style={{ fontSize: "12px" }}>
                👉 Order History
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
                <RowFormInputField row="col-md-3" col1="col-md-4" col2="col-md-8" label="Chit No" name="chitNo" inputValue={formData.chitNo} error={errors.chitNo} onChange={handleChange} />
                <RowFormInputField row="col-md-3" col1="col-md-4" col2="col-md-8" label="In Container No" name="containerNo" inputValue={formData.containerNo} error={errors.containerNo} onChange={handleChange} />
                <RowFormInputField row="col-md-3" col1="col-md-4" col2="col-md-8" label="Vehicle No" name="vehicleNo" inputValue={formData.vehicleNo} error={errors.vehicleNo} onChange={handleChange} />


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
                ➤ Orders
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
                            <tr key={row.orderId ?? rowIndex}>
                                <td>{row.status}</td>
                                <td>
                                    <a href="#" onClick={(e) => { e.preventDefault(); handleEdit(row); }}>
                                        {row.orderId}
                                    </a>
                                </td>
                                <td>{row.tableId}</td>
                                <td>{row.mobile || "-"}</td>
                                {/* <td>{row.items?.length}</td> */}
                                  <td>{row.deviceId}</td>
                                <td>₹{row.total}</td>
                                <td>{moment(row.createdAt).format("DD/MM/YYYY HH:mm")}</td>
                                <td> {row.items?.reduce((sum: number, i: any) => sum + i.quantity, 0)} </td>
                            </tr>

                        ))
                    )}
                </tbody>

            </table>

            <div className="table-footer">
                <span className="record-info">
                    {totalCount > 0 && (
                        <>
                            Showing {page + 1}/{totalPages} of {totalCount}
                        </>
                    )}
                </span>

                {totalCount > pageSize && (
                    <Paginator
                        currentPage={page}
                        totalCount={totalCount}
                        pageSize={pageSize}
                        onPageChange={onPageChange}
                    />
                )}
            </div>

            {
                isEditLoading && <LoadingFetchLoader />
            }
        </div>

    </div>

};

export default Search;
