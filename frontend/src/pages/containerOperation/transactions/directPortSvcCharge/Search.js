import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useState } from "react";
import RowFormCheckField from "@/components/Form/RowFormCheckField";
import PopUpCheckBox from "@/components/PopUpCheckBox";
import { setBreadcrumbs } from "@/store/slice/bredCrumbs";
import { useDispatch } from "react-redux";
import { searchConfig } from "@/utils/commonHelper";
import { apiRequest } from "@/store/services/api";
;
import Edit from "./Edit";
import { useNavigate } from "react-router-dom";
const Search = () => {
    const initial = {
        adChitNo: "",
        adTime: "",
        containerNo: "",
        chAgentCode: "",
        chAgentName: "",
        shipBillNo: "",
        delDateTentive: "",
        delDateActual: "",
        loadingStatus: "",
        foreignCoastalFlag: "",
        containerSize: "",
        zoneId: "",
        details: []
    };
    const dispatch = useDispatch();
    const [formData, setFormData] = useState(initial);
    const [errors, setErrors] = useState({});
    const [modal, setModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [config, setConfig] = useState({});
    const [isEdit, setIsEdit] = useState(false);
    useEffect(() => {
        dispatch(setBreadcrumbs([
            { label: "Container Operation", path: "" },
            { label: "Transaction", path: "" },
            { label: "Direct Port Entry Service Charges", path: "" },
            { label: "Edit" }
        ]));
    }, [dispatch]);
    /**Handle Change (onchange request) */
    const handleChange = (e) => {
        setFormData((prevData) => ({
            ...prevData,
            [e.target.name]: e.target.value,
        }));
        setErrors({ ...errors, [e.target.name]: "" });
    };
    const onChangeSelect = useCallback(async (field, query) => {
        setModal(true);
        setErrors({});
        const cfg = searchConfig[field];
        cfg.search = query ? query : "";
        setConfig(cfg);
    }, []);
    const navigate = useNavigate();
    return (isEdit && formData.details.length > 0 ? (_jsx(Edit, { setIsEdit: setIsEdit, initialForm: formData, setInitialForm: setFormData, apiRequest: apiRequest })) : (_jsxs("div", { className: "_rkContentBorder container-fluid py-3", style: { border: "1px solid black", marginTop: "7px", marginBottom: "70px" }, children: [_jsx("div", { className: "d-flex justify-content-between align-items-center text-white px-3 py-1 mb-3 fw-bold", style: { backgroundColor: "#023e8a" }, children: _jsx("span", { style: { fontSize: "12px" }, children: "\uD83D\uDC49 DPE Service Charge >> Search" }) }), _jsx("div", { className: "row", children: _jsx(RowFormCheckField, { label: "Container No", isDefault: true, name: "containerNo", inputValue: formData.containerNo, error: errors.containerNo, required: true, onChange: handleChange, click: () => onChangeSelect("container", formData.containerNo) }) }), _jsx("div", { className: "text-white px-3 mb-3 mt-2 fw-bold", style: { backgroundColor: "#023e8a" }, children: _jsx("span", { style: { fontSize: "12px" }, children: "\u27A4 Details" }) }), _jsx("div", { className: "row", children: _jsxs("div", { className: "col-12", children: [_jsx("div", { style: { overflowX: "auto" }, children: _jsxs("table", { className: "custom-table text-white", children: [_jsx("thead", { style: { backgroundColor: "#023e8a" }, children: _jsxs("tr", { children: [_jsx("th", { style: { minWidth: "140px" }, children: "Action" }), _jsxs("th", { style: { minWidth: "155px" }, children: ["CFS No", _jsx("span", { className: "text-danger", children: "*" })] }), _jsxs("th", { children: ["CFS Date", _jsx("span", { className: "text-danger", children: "*" })] }), _jsxs("th", { style: { minWidth: "200px" }, children: ["Service", _jsx("span", { className: "text-danger", children: "*" })] }), _jsxs("th", { children: ["From", _jsx("span", { className: "text-danger", children: "*" })] }), _jsxs("th", { children: ["To", _jsx("span", { className: "text-danger", children: "*" })] }), _jsx("th", { style: { minWidth: "120px" }, children: "Rate" }), _jsx("th", { style: { minWidth: "160px" }, children: "Amount" }), _jsx("th", { style: { minWidth: "110px" }, children: "CGST" }), _jsx("th", { style: { minWidth: "110px" }, children: "SGST" }), _jsx("th", { style: { minWidth: "110px" }, children: "Total GST" }), _jsx("th", { style: { minWidth: "160px" }, children: "Total" }), _jsx("th", { style: { minWidth: "160px" }, children: "Payment No" }), _jsx("th", { style: { minWidth: "120px" }, children: "Payment Date" }), _jsx("th", { style: { minWidth: "200px" }, children: "Remarks" })] }) }), _jsx("tbody", { children: (isEdit && formData?.details?.length === 0) && _jsx("tr", { children: _jsxs("td", { colSpan: 12, style: { color: "black", height: "40px" }, className: "text-center", children: [isEdit && formData?.details?.length === 0 ? "Records not found" : "", " ", _jsx("a", { href: "#", style: { fontSize: "11px" }, onClick: (e) => { e.preventDefault(); navigate("/addDpeServiceCharge"); }, children: "Click here to Add New" })] }) }) })] }) }), _jsx("button", { type: "button", disabled: true, className: "btn btn-primary btn-sm mt-2 mr-4", style: {
                                borderRadius: "0px",
                                backgroundColor: "#023e8a",
                                color: "#fff"
                            }, children: "+ Add Row" })] }) }), _jsxs("div", { className: "d-flex gap-3 justify-content-end", children: [_jsx("button", { type: "submit", className: `btn btn-warning btn-sm px-4 custom-form-control position-relative ${false ? "loading" : ""}`, disabled: true, style: {
                            minWidth: "100px"
                        }, children: _jsx("span", { className: "btn-text", children: "Payment through POS" }) }), _jsx("button", { type: "submit", disabled: true, className: "btn btn-sm  btn-dark custom-form-control ", children: "Print Payment" })] }), modal && _jsx(PopUpCheckBox, { isOpen: modal, onClose: () => setModal(false), itemsPerPage: 12, apiRequest: apiRequest, setFormData: setFormData, config: config, setIsEdit: setIsEdit })] })));
};
export default Search;
