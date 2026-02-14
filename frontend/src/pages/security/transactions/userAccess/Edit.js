import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useRef, useState } from "react";
import { validationRequest } from "@/utils/validationRequest";
import { toast } from "react-toastify";
import RowFormSelectField from "@/components/Form/RowFormSelectField";
import { setBreadcrumbs } from "@/store/slice/bredCrumbs";
import { useDispatch } from "react-redux";
import { apiRequest } from "@/store/services/api";
import LoadingFetchLoader from "@/components/LoadingFetchLoader";
import { Link, useNavigate } from "react-router-dom";
import { checkParentMenuCheck } from "@/utils/commonHelper";
const Add = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setBreadcrumbs([
            { label: "Security", path: "" },
            { label: "Transaction", path: "" },
            { label: "User Access", path: "" },
            { label: "Edit" }
        ]));
    }, [dispatch]);
    const [formData, setFormData] = useState({
        username: "",
        userID: "",
    });
    const [userLoading, setUserLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [menulist, setMenuList] = useState([]);
    const [success, setSuccess] = useState("");
    const auth = JSON.parse(localStorage.getItem("auth_data") || "null");
    const [userList, setUserList] = useState([]);
    const validationRules = {
        username: { required: true, minLength: 2, maxLength: 20 },
    };
    const fetchUserData = async () => {
        try {
            setUserLoading(true);
            const url = "/getAllEditUser";
            const response = await apiRequest({ url: url, method: "GET" });
            if (response.users.length > 0) {
                const users = response.users.map((user) => ({
                    value: user.id,
                    label: `${user.name} (${user.id})`,
                    item: user
                }));
                setUserList(users);
            }
        }
        catch (error) {
            console.error(error);
        }
        finally {
            setUserLoading(false);
        }
    };
    useEffect(() => {
        fetchUserData();
        // fetchData();
    }, []);
    const [menuRows, setMenuRows] = useState([]);
    const handleRowChange = useCallback(async (index, field, row) => {
        const isPreCheck = await checkParentMenuCheck(menuRows, row.menuId);
        setMenuRows((prev) => {
            const isChecking = row.isChecked ? 0 : 1;
            return prev.map((item) => {
                if (item.rootId !== row.rootId)
                    return item;
                if (isChecking === 1) {
                    if (item.menuId === row.menuId || item.leaf === 0) {
                        return {
                            ...item,
                            checked: 1,
                            isChecked: 1,
                        };
                    }
                }
                if (isChecking === 0 && isPreCheck) {
                    if (item.menuId === row.menuId) {
                        return {
                            ...item,
                            checked: 0,
                            isChecked: 0,
                        };
                    }
                }
                if (isChecking === 0 && !isPreCheck) {
                    return {
                        ...item,
                        checked: 0,
                        isChecked: 0,
                    };
                }
                return item;
            });
        });
    }, [menuRows]);
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const updateMenus = async () => {
        await sleep(1000);
        setMenuRows(menulist);
    };
    const handleSelectChange = useCallback(async (selectedOption, name) => {
        setLoading(true);
        const { item } = selectedOption;
        await updateMenus();
        setLoading(false);
        const url = `/add-edit/menu?userId=${item?.id}&isAdd=false`;
        const response = await apiRequest({ url: url, method: "GET" });
        if (Array.isArray(response.success) && response.success.length > 0) {
            setMenuRows(response.success);
        }
        setFormData((prev) => ({ ...prev, [name]: item?.name || "", userID: item?.id }));
        setErrors({});
    }, [menulist]);
    const handleFormSubmit = useCallback(async (e) => {
        e.preventDefault();
        const { isValid, errors } = validationRequest(formData, validationRules);
        setErrors(errors);
        if (!isValid) {
            toast.error("Please fill in all mandatory fields.", { position: "top-right", autoClose: 6000 });
            console.log("Validation Errors:", errors);
            return;
        }
        const selectedMenus = menuRows.filter(menu => menu.isChecked).map(menu => ({ moduleId: menu.moduleId, menuId: menu.menuId }));
        if (selectedMenus.length === 0) {
            toast.error("Please check at least one menu access.", {
                position: "top-right",
                autoClose: 6000,
            });
            return;
        }
        setSubmitting(true);
        try {
            const payload = {
                userId: formData?.userID,
                selections: selectedMenus
            };
            const resp = await apiRequest({ url: "/editUserAccess", method: "POST", data: payload });
            setSuccess(resp.message);
            toast.success(resp.message, { position: "top-right", autoClose: 6000 });
        }
        catch (err) {
            let apiError = "Something went wrong! Please try again.";
            if (err?.status === 422 && err?.data?.errors) {
                setErrors(err.data.errors);
                apiError = "Please correct the highlighted errors.";
            }
            else if (err?.data?.message) {
                apiError = err.data.message;
            }
            toast.error(apiError, { position: "top-right", autoClose: 3000 });
        }
        finally {
            setSubmitting(false);
            const timer = setTimeout(() => {
                setSuccess("");
            }, 6000);
            return () => clearTimeout(timer);
        }
    }, [formData, menuRows]);
    const handleSelectAll = (checked) => {
        setMenuRows((prev) => prev.map((row) => ({
            ...row,
            isChecked: checked,
            checked: checked ? 1 : 0,
        })));
    };
    const selectAllRef = useRef(null);
    useEffect(() => {
        if (!selectAllRef.current)
            return;
        const nonMenuRows = menuRows.filter(r => !r.isMenu);
        if (nonMenuRows.length === 0) {
            selectAllRef.current.indeterminate = false;
            return;
        }
        const allChecked = nonMenuRows.length > 0 && nonMenuRows.every(r => r.isChecked);
        const someChecked = nonMenuRows.some(r => r.isChecked);
        selectAllRef.current.indeterminate = someChecked && !allChecked;
    }, [menuRows]);
    const navigate = useNavigate();
    return (_jsxs("div", { className: "_rkContentBorder container-fluid py-3 ", style: { border: "1px solid black", marginTop: "7px", marginBottom: "70px" }, children: [_jsxs("div", { className: "d-flex justify-content-between align-items-center text-white px-3 py-1 mb-3 fw-bold", style: { backgroundColor: "#023e8a" }, children: [_jsx("span", { style: { fontSize: "12px" }, children: "\uD83D\uDC49 User Access >> Search" }), _jsx(Link, { to: "/addUserAccess", style: { fontSize: "11px" }, className: "text-white", children: "Click here to add new User Access In" })] }), _jsxs("form", { onSubmit: handleFormSubmit, children: [_jsx("div", { className: "row", children: _jsx(RowFormSelectField, { name: "username", label: "User Name", isLoading: userLoading, options: userList, value: formData.username, onChange: handleSelectChange, isEdit: true, error: errors.username, required: true, 
                            // isLoading={false}
                            formData: formData, row: "col-md-5", col1: "col-md-3", col2: "col-md-9" }) }), _jsx("div", { className: "row mt-3", children: _jsx("div", { className: "col-12", children: _jsxs("div", { style: { overflowX: "auto" }, children: [_jsxs("table", { className: "custom-table table-bordered table-sm", children: [_jsx("thead", { className: "text-white", children: _jsxs("tr", { children: [_jsx("th", { children: "Modules" }), _jsx("th", { children: "Menus" }), _jsxs("th", { style: { width: "15%" }, children: ["Allow Access", menuRows.length > 0 && _jsx("input", { ref: selectAllRef, type: "checkbox", className: "form-check-input pl-5", style: {
                                                                        marginLeft: "10px",
                                                                        borderRadius: "0px",
                                                                        transform: "scale(1.4)",
                                                                        cursor: "pointer",
                                                                        border: "1px solid #023e8a",
                                                                    }, checked: menuRows.length > 0 &&
                                                                        menuRows.filter(r => !r.isMenu).every(row => row.isChecked), onChange: (e) => handleSelectAll(e.target.checked) })] })] }) }), _jsxs("tbody", { children: [menuRows?.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 12, className: "text-center", children: "No menus" }) })), menuRows && menuRows?.map((row, index) => (_jsxs("tr", { children: [_jsxs("td", { children: [" ", _jsx("input", { readOnly: true, style: { height: "23px", fontSize: "10px", fontWeight: "bold" }, value: row.moduleName ?? "", className: `form-control custom-form-control` }), "  "] }), _jsxs("td", { children: [" ", _jsx("input", { readOnly: true, style: { height: "23px", fontSize: "10px", fontWeight: "bold" }, value: row.menuNameTree ?? "", className: `form-control custom-form-control` }), "  "] }), _jsx("td", { className: "text-center align-middle", children: row.leaf !== 0 && _jsx("input", { type: "checkbox", className: "form-check-input", style: {
                                                                        marginLeft: "37px",
                                                                        borderRadius: "0px",
                                                                        transform: "scale(1.4)",
                                                                        cursor: "pointer",
                                                                        border: "1px solid #023e8a",
                                                                    }, checked: row?.checked === 1 ? true : false, onChange: (e) => handleRowChange(index, "isChecked", row) }) })] }, row.menuId ?? index)))] })] }), loading && _jsx(LoadingFetchLoader, {})] }) }) }), _jsx("div", { className: "d-flex gap-3 justify-content-end", children: _jsxs("button", { type: "submit", className: `btn btn-success btn-sm px-4 custom-form-control position-relative ${submitting ? "loading" : ""}`, disabled: submitting, style: {
                                minWidth: "100px"
                            }, children: [submitting && _jsx("span", { className: "spinner-center" }), !submitting && _jsx("span", { className: "btn-text", children: "Update" })] }) })] })] }));
};
export default Add;
