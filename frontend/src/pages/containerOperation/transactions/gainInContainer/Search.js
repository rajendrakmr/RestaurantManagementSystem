import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import Paginator from "@/components/Paginator";
import { setBreadcrumbs } from "@/store/slice/bredCrumbs";
import { useDispatch } from "react-redux";
import RowFormInputField from "@/components/Form/RowFormInputField";
import { apiRequest } from "@/store/services/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import moment from 'moment';
import Edit from "./Edit";
import LoadingFetchLoader from "@/components/LoadingFetchLoader";
import { fetchCommonData, searchConfig } from "@/utils/commonHelper";
const Search = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setBreadcrumbs([
            { label: "Container Operation", path: "" },
            { label: "Transaction", path: "" },
            { label: "Gain In - Container", path: "" },
            { label: "Edit" }
        ]));
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
    };
    const [formData, setFormData] = useState(initial);
    const [errors, setErrors] = useState({});
    const handleChange = (e) => {
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
            setLoading(true);
            const url = `/editGateIn?page=${page}&size=${pageSize}`;
            const response = await apiRequest({ url: url, method: "POST", data: payload });
            if (response.success.content.length > 0) {
                setPageSize(pageSize);
                setDataItems(response.success.content);
                setTotalCount(response.success.totalElements);
                setTotalPages(response.success.totalPages);
            }
        }
        catch (error) {
            console.error(error);
        }
        finally {
            setLoading(false);
            setSearchLoading(false);
        }
    };
    const [formEditData, setFormEditData] = useState({});
    const [isEditLoading, setIsEditLoading] = useState(false);
    const handleEdit = useCallback(async (row) => {
        try {
            setIsEditLoading(true);
            const url = `/editGateInPage?chitNo=${row.chit_no}`;
            const response = await apiRequest({ url, method: "GET" });
            if (response?.success) {
                const item = response?.success;
                console.log('itemitemitemitem', item, item?.gate_out_through);
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
                const pagination = '?size=10&page=0';
                let query = `&q=${item?.vessel_no}`;
                await fetchCommonData({ t_field_a: 'vesselNo', field_a: 'vesselNo', t_field_b: 'vesselName', field_b: 'vesselName', t_field_c: 'voyageNumber', field_c: 'voyageNumber', url: `${api_url}${pagination}${query}`, setForm: setFormEditData, });
                setIsEdit(true);
            }
            else {
                toast.error("Failed to load edit data", { position: "top-right", autoClose: 6000 });
            }
        }
        catch (error) {
            toast.error(error?.message || "Something went wrong while fetching edit data", { position: "top-right", autoClose: 5000, });
        }
        finally {
            setIsEditLoading(false);
        }
    }, []);
    const hasAtLeastOneValue = (data) => {
        return Object.values(data).some((value) => value !== "" && value !== null && value !== undefined);
    };
    const handleSearchForm = useCallback(async (e) => {
        e.preventDefault();
        try {
            if (!hasAtLeastOneValue(formData)) {
                toast.warn("Please enter at least one search field", { position: "top-right", autoClose: 6000, });
                return;
            }
            setSearchLoading(true);
            fetchRecords(formData, 0, pageSize);
        }
        catch (err) {
            let apiError = "Something went wrong. Please try again.";
            toast.error(apiError, { position: "top-right", autoClose: 6000 });
        }
    }, [formData, pageSize]);
    const resetform = useCallback(async (e) => {
        if (hasAtLeastOneValue(formData)) {
            fetchRecords(initial, 0, pageSize);
        }
    }, [initial, pageSize]);
    useEffect(() => {
        fetchRecords();
    }, []);
    const onPageChange = useCallback((pageNumber) => {
        const zeroBasedPage = pageNumber - 1;
        setPage(zeroBasedPage);
        fetchRecords(formData, zeroBasedPage, pageSize);
    }, [formData, pageSize]);
    const columns = [
        { key: "chit_no", label: "Chit No" },
        { key: "container_no", label: "In Container No" },
        { key: "vehicle_no", label: "Vehicle No" },
        { key: "gateInDateTime", label: "Time (DD/MM/YYYY HH:MI)" },
        { key: "party_cd", label: "Agent" },
        { key: "eir", label: "EIR" },
        { key: "vessel_no", label: "Vessel No" },
        { key: "loading_status", label: "Loading Status" },
        { key: "container_size", label: "Container Size" },
        { key: "foreign_coastal_flag", label: "Voyage" }
    ];
    return (isEdit ? (_jsx(Edit, { initialForm: formEditData, setIsEdit: setIsEdit, apiRequest: apiRequest })) :
        (_jsxs("div", { className: "_rkContentBorder container-fluid py-3", style: { border: "1px solid black", marginTop: "7px", marginBottom: "70px" }, children: [_jsx("div", { className: "d-flex justify-content-between align-items-center text-white px-3 py-1 mb-3 fw-bold", style: { backgroundColor: "#023e8a" }, children: _jsx("span", { style: { fontSize: "12px" }, children: "\uD83D\uDC49 Gate In - Container >> Search" }) }), _jsxs("form", { onSubmit: handleSearchForm, children: [_jsxs("div", { className: "row", children: [_jsx(RowFormInputField, { row: "col-md-3", col1: "col-md-4", col2: "col-md-8", label: "Chit No", name: "chitNo", inputValue: formData.chitNo, error: errors.chitNo, onChange: handleChange }), _jsx(RowFormInputField, { row: "col-md-3", col1: "col-md-4", col2: "col-md-8", label: "In Container No", name: "containerNo", inputValue: formData.containerNo, error: errors.containerNo, onChange: handleChange }), _jsx(RowFormInputField, { row: "col-md-3", col1: "col-md-4", col2: "col-md-8", label: "Vehicle No", name: "vehicleNo", inputValue: formData.vehicleNo, error: errors.vehicleNo, onChange: handleChange }), _jsx(RowFormInputField, { row: "col-md-3", col1: "col-md-4", col2: "col-md-8", placeholder: "DD-MM-YYYY", label: "Date", name: "gateInDate", inputValue: formData.gateInDate, error: errors.gateInDate, onChange: handleChange }), _jsx(RowFormInputField, { row: "col-md-3", col1: "col-md-4", col2: "col-md-8", label: "Agent", name: "agent", inputValue: formData.agent, error: errors.agent, onChange: handleChange }), _jsx(RowFormInputField, { row: "col-md-3", col1: "col-md-4", col2: "col-md-8", label: "EIR", name: "eir", inputValue: formData.eir, error: errors.eir, onChange: handleChange }), _jsx(RowFormInputField, { row: "col-md-3", col1: "col-md-4", col2: "col-md-8", label: "Vessel No", name: "vesselNo", inputValue: formData.vesselNo, error: errors.vesselNo, onChange: handleChange }), _jsx(RowFormInputField, { row: "col-md-3", col1: "col-md-4", col2: "col-md-8", label: "Loading Status", name: "loadingStatus", inputValue: formData.loadingStatus, error: errors.loadingStatus, onChange: handleChange }), _jsx(RowFormInputField, { row: "col-md-3", col1: "col-md-4", col2: "col-md-8", label: "Voyage", name: "voyage", inputValue: formData.voyage, error: errors.voyage, onChange: handleChange }), _jsx(RowFormInputField, { row: "col-md-3", col1: "col-md-4", col2: "col-md-8", label: "Container Size", name: "containerSize", inputValue: formData.containerSize, error: errors.containerSize, onChange: handleChange })] }), _jsxs("div", { className: "d-flex gap-3 justify-content-start mt-2", children: [_jsx("button", { type: "button", onClick: resetform, disabled: loading, className: "btn btn-secondary btn-sm custom-form-control ", children: "Clear" }), _jsxs("button", { type: "submit", className: `btn btn-success btn-sm px-4 custom-form-control position-relative ${searchLoding ? "loading" : ""}`, disabled: searchLoding, style: {
                                        minWidth: "100px"
                                    }, children: [searchLoding && _jsx("span", { className: "spinner-center" }), !searchLoding && _jsx("span", { className: "btn-text", children: "Search" })] })] })] }), _jsx("div", { className: "text-white px-3   mb-1 mt-3 fw-bold", style: { backgroundColor: "#023e8a" }, children: _jsx("span", { style: { fontSize: "12px" }, children: "\u27A4 Container Gate In" }) }), _jsxs("div", { className: "table-wrapper", children: [_jsxs("table", { className: "custom-table", children: [_jsx("thead", { className: "text-white", children: _jsx("tr", { children: columns?.map((column) => (_jsx("th", { children: column.label }))) }) }), _jsx("tbody", { children: loading ? (_jsx("tr", { children: _jsx("td", { colSpan: columns.length, className: "table-loader", children: _jsx(LoadingSpinner, { size: 110 }) }) })) : dataItems.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: columns.length, className: "text-center", children: "No records found" }) })) : (dataItems.map((row, rowIndex) => (_jsxs("tr", { children: [_jsx("td", { children: _jsx("a", { href: "#", onClick: (e) => { e.preventDefault(); handleEdit(row); }, children: row['chit_no'] }) }), _jsx("td", { children: row.container_no }), _jsx("td", { children: row.vehicle_no }), _jsx("td", { children: moment(row.gateInDateTime).format('MM/DD/YYYY HH:MM') }), _jsx("td", { children: row.party_cd }), _jsx("td", { children: row.eir }), _jsx("td", { children: row.vessel_no }), _jsx("td", { children: row.loading_status }), _jsx("td", { children: row.container_size }), _jsx("td", { children: row.foreign_coastal_flag === "F" ? "Foreign" : "Coastal" })] }, row.chit_no ?? rowIndex)))) })] }), _jsxs("div", { className: "table-footer", children: [_jsx("span", { className: "record-info", children: totalCount > 0 && (_jsxs(_Fragment, { children: ["Showing ", page + 1, "/", totalPages, " of ", totalCount] })) }), totalCount > pageSize && (_jsx(Paginator, { currentPage: page, totalCount: totalCount, pageSize: pageSize, onPageChange: onPageChange }))] }), isEditLoading && _jsx(LoadingFetchLoader, {})] })] })));
};
export default Search;
