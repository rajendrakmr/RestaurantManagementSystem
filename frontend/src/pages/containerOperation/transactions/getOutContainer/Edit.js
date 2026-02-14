import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import RowFormInputField from "@/components/Form/RowFormInputField";
import { useCallback, useEffect, useState } from "react";
import { validationRequest } from "@/utils/validationRequest";
import { toast } from "react-toastify";
import RowFormSelectField from "@/components/Form/RowFormSelectField";
import RowFormCheckField from "@/components/Form/RowFormCheckField";
import PopUpCheckBox from "@/components/PopUpCheckBox";
import { containerStatusOption, fromLocationGateOutOption, gateInOption, icdFcsOption, securityOption, statusOption, transhipmentOption, voyageOption } from "@/pages/options";
import { setBreadcrumbs } from "@/store/slice/bredCrumbs";
import { useDispatch } from "react-redux";
import { searchConfig } from "@/utils/commonHelper";
const Add = ({ setIsEdit, apiRequest, initialForm }) => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setBreadcrumbs([
            { label: "Container Operation", path: "" },
            { label: "Transaction", path: "" },
            { label: "Gate Out - Container", path: "" },
            { label: "Edit" }
        ]));
    }, [dispatch]);
    const [formData, setFormData] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const handleChange = (e) => {
        setFormData((prevData) => ({
            ...prevData,
            [e.target.name]: e.target.value,
        }));
        setErrors({ ...errors, [e.target.name]: "" });
    };
    const validationRules = {
        vehicleNo: { required: true, minLength: 8, maxLength: 15 },
        fromLocId: { required: true, minLength: 2, maxLength: 20 },
        locationName: { required: true, minLength: 2, maxLength: 255 },
        agentNames: { required: true, minLength: 2, maxLength: 255 },
        portName: { required: true, minLength: 2, maxLength: 255 },
        linerName: { required: true, minLength: 2, maxLength: 255 },
        linerCode: { required: true, minLength: 2, maxLength: 15 },
        containerNo: { required: true, minLength: 11, maxLength: 11 },
        quantity: { required: true, gt: true, minLength: 1, maxLength: 15 },
        eir: { required: true, minLength: 2, maxLength: 20 },
        chitNo: { required: true, minLength: 2, maxLength: 20 },
        gateInThrough: { required: true, minLength: 1, maxLength: 20 }
    };
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const { isValid, errors } = validationRequest(formData, validationRules);
        setErrors(errors);
        if (!isValid) {
            toast.error("Please fill in all mandatory fields.", { position: "top-right", autoClose: 5000 });
            console.log("Validation Errors:", errors);
            return;
        }
        setSubmitting(true);
        const payload = {
            chitNo: formData?.chitNo,
            vehicleNo: formData?.vehicleNo,
            fromLocId: formData?.fromLocId,
            toLocId: formData?.locationCode,
            impExpTrns: formData?.impExpTrns,
            beSbNo: formData?.beSbNo,
            chAgentCode: formData?.chAgentCode,
            vesselNo: formData?.vesselNo,
            vesselName: formData?.vesselName,
            voyageNo: formData?.voyageNumber,
            shipperName: formData?.shipperName,
            localOrigin: formData?.localOrigin,
            portOfDestination: formData?.portCode,
            weightmentFlag: formData?.weightmentFlag,
            securityWall: formData?.securityWall,
            gateInThrough: formData?.gateInThrough,
            containerNo: formData?.containerNo,
            containerStatus: formData?.containerStatus,
            cargoName: formData?.cargoCode,
            packages: formData?.packages,
            quantity: formData?.quantity,
            linerCode: formData?.linerCode,
            linerName: formData?.linerName,
            eir: formData?.eir,
            icdCfsFcs: formData?.icdCfsFcs,
            hazardous: formData?.hazardous,
            customsExamination: formData?.customsExamination,
            shutOut: formData?.shutOut,
            foreignCoastalFlag: formData?.foreignCoastalFlag
        };
        try {
            const resp = await apiRequest({ url: "/api/gateOutUpdate", method: "POST", data: payload });
            toast.success(resp.message, { position: "top-right", autoClose: 6000 });
        }
        catch (err) {
            let apiError = "Something went wrong! Please try again.";
            if (!err.success && err.errors) {
                setErrors(err.errors);
            }
            toast.error(apiError, { position: "top-right", autoClose: 6000 });
        }
        finally {
            setSubmitting(false);
        }
    };
    const handleSelectChange = (selectedOption, name) => {
        setFormData((prev) => ({ ...prev, [name]: selectedOption?.value || "" }));
        setErrors({});
    };
    const [modal, setModal] = useState(false);
    const [config, setConfig] = useState({});
    const onChangeSelect = useCallback(async (field, query) => {
        setModal(true);
        setErrors({});
        const cfg = searchConfig[field];
        cfg.search = query ? query : "";
        setConfig(cfg);
    }, []);
    return (_jsxs("div", { className: "_rkContentBorder container-fluid py-3", style: { border: "1px solid black", marginTop: "7px", marginBottom: "70px" }, children: [_jsxs("div", { className: "d-flex justify-content-between align-items-center text-white px-3 py-1 mb-3 fw-bold", style: { backgroundColor: "#023e8a" }, children: [_jsx("span", { style: { fontSize: "12px" }, children: "\uD83D\uDC49 Gate Out - Container >> Edit" }), _jsx("a", { href: "#", style: { fontSize: "11px" }, className: "text-white", onClick: (e) => {
                            e.preventDefault();
                            setIsEdit(false);
                        }, children: "Back to Search Page" })] }), _jsxs("form", { onSubmit: handleFormSubmit, children: [_jsxs("div", { className: "row", children: [_jsx(RowFormInputField, { label: "Chit No", isDefault: true, name: "chitNo", inputValue: formData.chitNo, error: errors.chitNo, required: true, onChange: handleChange }), _jsx(RowFormInputField, { label: "Out Time", name: "txtInTime", inputValue: formData.txtInTime, error: errors.txtInTime, required: true, onChange: handleChange, isDefault: true }), _jsx(RowFormInputField, { label: "Vehicle No", max: 15, name: "vehicleNo", inputValue: formData.vehicleNo, error: errors.vehicleNo, required: true, onChange: handleChange }), _jsx(RowFormSelectField, { name: "impExpTrns", label: "Imp/Exp/Trans", options: transhipmentOption, value: formData.impExpTrns, error: errors.impExpTrns, onChange: handleSelectChange, isLoading: false, formData: formData }), _jsx(RowFormSelectField, { name: "fromLocId", label: "From Location", options: fromLocationGateOutOption, value: formData.fromLocId, error: errors.fromLocId, onChange: handleSelectChange, isLoading: false, formData: formData }), _jsx(RowFormCheckField, { label: "To Location", isDefault: true, name: "locationName", inputValue: formData.locationName, error: errors.locationName, required: true, onChange: handleChange, click: () => onChangeSelect("location", formData.locationName) }), _jsx(RowFormInputField, { label: "BE / SB No", max: 20, name: "beSbNo", inputValue: formData.beSbNo, error: errors.beSbNo, onChange: handleChange }), _jsx(RowFormCheckField, { label: "CH Agent Name", isDefault: true, name: "agentNames", inputValue: formData.agentNames, error: errors.agentNames, required: true, onChange: handleChange, click: () => onChangeSelect("agent", formData.agentNames) }), _jsx(RowFormCheckField, { label: "Shipper", isDefault: true, name: "shipperName", inputValue: formData.shipperName, error: errors.shipperName, onChange: handleChange, click: () => onChangeSelect("shipper", formData.shipperName) }), _jsx(RowFormCheckField, { label: "Vessel Name", isDefault: true, name: "vesselName", inputValue: formData.vesselName, error: errors.vesselName, onChange: handleChange, click: () => onChangeSelect("vessel", formData.vesselNo) }), _jsx(RowFormInputField, { label: "Vessel No", isDefault: true, name: "vesselNo", inputValue: formData.vesselNo, error: errors.vesselNo, onChange: handleChange }), _jsx(RowFormInputField, { label: "Voyage No", isDefault: true, name: "voyageNumber", inputValue: formData.voyageNumber, error: errors.voyageNumber, onChange: handleChange }), _jsx(RowFormInputField, { label: "Local Origin", max: 20, name: "localOrigin", inputValue: formData.localOrigin, error: errors.localOrigin, onChange: handleChange }), _jsx(RowFormCheckField, { label: "Port of Destination", isDefault: true, name: "portName", inputValue: formData.portName, error: errors.portName, required: true, onChange: handleChange, click: () => onChangeSelect("port", formData.portName) }), _jsx(RowFormSelectField, { name: "weightmentFlag", label: "Weightment", options: statusOption, value: formData.weightmentFlag, error: errors.weightmentFlag, onChange: handleSelectChange, isLoading: false, formData: formData }), _jsx(RowFormSelectField, { name: "securityWall", label: "Security Wall", options: securityOption, value: formData.securityWall, error: errors.securityWall, onChange: handleSelectChange, isLoading: false, formData: formData }), _jsx(RowFormSelectField, { name: "gateInThrough", label: "Gate Out Through", options: gateInOption, value: formData.gateInThrough, error: errors.gateInThrough, onChange: handleSelectChange, isLoading: false, required: true, formData: formData })] }), _jsx("div", { className: "text-white px-3 mb-3 mt-2 fw-bold", style: { backgroundColor: "#023e8a" }, children: _jsx("span", { style: { fontSize: "12px" }, children: "\u27A4 Container" }) }), _jsxs("div", { className: "row", children: [_jsx(RowFormInputField, { label: "Container No", max: 11, type: "stupr", name: "containerNo", inputValue: formData.containerNo, error: errors.containerNo, required: true, onChange: handleChange }), _jsx(RowFormSelectField, { name: "containerStatus", label: "Container Status", options: containerStatusOption, value: formData.containerStatus, error: errors.containerStatus, onChange: handleSelectChange, isLoading: false, formData: formData }), _jsx(RowFormCheckField, { isDefault: true, label: "Cargo", name: "cargoName", inputValue: formData.cargoName, error: errors.cargoName, onChange: handleChange, click: () => onChangeSelect("cargo", formData.cargoName) }), _jsx(RowFormSelectField, { name: "foreignCoastalFlag", label: "Voyage", options: voyageOption, value: formData.foreignCoastalFlag, error: errors.foreignCoastalFlag, onChange: handleSelectChange, isLoading: false, formData: formData }), _jsx(RowFormInputField, { label: "Packages", max: 10, name: "packages", inputValue: formData.packages, error: errors.packages, onChange: handleChange }), _jsx(RowFormInputField, { label: "Quantity (In MT)", type: "number", max: 15, name: "quantity", inputValue: formData.quantity, error: errors.quantity, required: true, onChange: handleChange }), _jsx(RowFormCheckField, { label: "Liner", isDefault: true, name: "linerName", required: true, inputValue: formData.linerName, error: errors.linerName, onChange: handleChange, click: () => onChangeSelect("liner", formData.linerName) }), _jsx(RowFormInputField, { label: "Liner Code", isDefault: true, name: "linerCode", required: true, inputValue: formData.linerCode, error: errors.linerCode, onChange: handleChange }), _jsx(RowFormInputField, { label: "EIR", name: "eir", type: "stupr", max: 20, inputValue: formData.eir, error: errors.eir, required: true, onChange: handleChange }), _jsx(RowFormSelectField, { name: "icdCfsFcs", label: "ICD/CFS/FCS", options: icdFcsOption, value: formData.icdCfsFcs, error: errors.icdCfsFcs, onChange: handleSelectChange, isLoading: false, formData: formData }), _jsx(RowFormSelectField, { name: "hazardous", label: "Hazardous", options: statusOption, value: formData.hazardous, error: errors.hazardous, onChange: handleSelectChange, isLoading: false, formData: formData }), _jsx(RowFormSelectField, { name: "customsExamination", label: "Custom Examination", options: statusOption, value: formData.customsExamination, error: errors.customsExamination, onChange: handleSelectChange, isLoading: false, formData: formData }), _jsx(RowFormSelectField, { name: "shutOut", label: "Shut Out", options: statusOption, value: formData.shutOut, error: errors.shutOut, onChange: handleSelectChange, isLoading: false, formData: formData })] }), _jsxs("div", { className: "d-flex gap-3 justify-content-end", children: [_jsx("button", { type: "button", disabled: submitting, className: "btn btn-sm btn-secondary custom-form-control", onClick: () => setIsEdit(false), children: "Back to Search Page" }), _jsxs("button", { type: "submit", className: `btn btn-success btn-sm px-4 custom-form-control position-relative ${submitting ? "loading" : ""}`, disabled: submitting, style: {
                                    minWidth: "100px"
                                }, children: [submitting && _jsx("span", { className: "spinner-center" }), !submitting && _jsx("span", { className: "btn-text", children: "Update" })] })] })] }), modal && _jsx(PopUpCheckBox, { isOpen: modal, onClose: () => setModal(false), itemsPerPage: 12, apiRequest: apiRequest, setFormData: setFormData, config: config })] }));
};
export default Add;
