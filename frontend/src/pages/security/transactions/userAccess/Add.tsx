import RowFormInputField from "@/components/Form/RowFormInputField";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { validationRequest, ValidationRules } from "@/utils/validationRequest";
import { toast } from "react-toastify";
import RowFormSelectField from "@/components/Form/RowFormSelectField";
import { setBreadcrumbs } from "@/store/slice/bredCrumbs";
import { useDispatch } from "react-redux";
import { apiRequest } from "@/store/services/api";
import LoadingFetchLoader from "@/components/LoadingFetchLoader";
import { useNavigate } from "react-router-dom";
import { checkParentMenuCheck } from "@/utils/commonHelper";
export interface Column {
    id: number;
    key: string;
    label: string;
}

export interface User {
    id: number;
    name: string;
    value?: string;
    label?: string

}

interface TableRow {
    moduleId: string;
    moduleName: string;
    menuId: string;
    menuName: string;
    rootId: string;
    leaf: number;
    isChecked: number;
}


const Add: React.FC = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(
            setBreadcrumbs([
                { label: "Security", path: "" },
                { label: "Transaction", path: "" },
                { label: "User Access", path: "" },
                { label: "Add" }
            ])
        );
    }, [dispatch]);
    const [formData, setFormData] = useState({
        username: "",
        userID: "",
    });
    const [userLoading, setUserLoading] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [success, setSuccess] = useState<string>("");
    const [errors, setErrors] = useState<Record<string, any>>({});
    const [menulist, setMenuList] = useState<any[]>([]);
    const auth = JSON.parse(localStorage.getItem("auth_data") || "null");
    type UserOption = {
        value: string;
        label: string;
    };
    const [userList, setUserList] = useState<UserOption[]>([]);
    const validationRules: ValidationRules = {
        username: { required: true, minLength: 2, maxLength: 20 },
    };

    const fetchUserData = async () => {
        try {
            setUserLoading(true)
            const url = "/getAllUser";
            const response = await apiRequest({ url: url, method: "GET" });
            if (response.users.length > 0) {
                const users = response.users.map(
                    (user: { id: string; label: string, name?: string }) => ({
                        value: user.id,
                        label: `${user.name} (${user.id})`,
                        item: user
                    })
                );
                setUserList(users)
            }
        } catch (error) {
            console.error(error);
        } finally {
            setUserLoading(false)
        }
    };


    useEffect(() => {
        fetchUserData();
    }, []);


    const [menuRows, setMenuRows] = useState<TableRow[]>([]);



    const handleRowChange = useCallback(async (index: number, field: keyof TableRow, row: any) => {
        const isPreCheck = await checkParentMenuCheck(menuRows, row.menuId);
        setMenuRows((prev) => {
            const isChecking = row.isChecked ? 0 : 1;
            return prev.map((item: any) => {
                if (item.rootId !== row.rootId) return item;
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



    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    const updateMenus = async () => {
        await sleep(1000);
        setMenuRows(menulist);
    };

    const handleSelectChange = useCallback(async (selectedOption: any, name: string) => {
        try {
            setLoading(true);
            const { item } = selectedOption;
            await updateMenus();
            const url = `/add-edit/menu?userId=${item?.id}&isAdd=false`;
            const response = await apiRequest({ url, method: "GET" });
            if (Array.isArray(response.success) && response.success.length > 0) {
                setMenuRows(response.success);
            }
            setFormData((prev) => ({
                ...prev,
                [name]: item?.name || "",
                userID: item?.id,
            }));
            setErrors({});
        } catch (error) {
            console.error("Error fetching menus:", error);
        } finally {
            setLoading(false);
        }
    }, [menulist]);


    const handleFormSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        const { isValid, errors } = validationRequest(formData, validationRules);
        setErrors(errors);

        if (!isValid) {
            toast.error("Please fill in all mandatory fields.", { position: "top-right", autoClose: 6000 });
            console.log("Validation Errors:", errors);
            return;
        }
        const selectedMenus = menuRows.filter(menu => menu.isChecked)

        if (selectedMenus.length === 0) {
            toast.error("Please check at least one menu access.", {
                position: "top-right",
                autoClose: 6000,
            });
            return;
        }
        setSubmitting(true)
        try {
            const payload = {
                userId: formData?.userID,
                selections: selectedMenus
            } 
            const resp = await apiRequest({ url: "/saveUserAccess", method: "POST", data: payload })
            setSuccess(resp.message)
            toast.success(resp.message, { position: "top-right", autoClose: 6000 });
            setFormData({ username: "", userID: "", })
            setMenuRows([])
            fetchUserData();
        } catch (err: any) {
            let apiError = "Something went wrong! Please try again.";
            if (err?.status === 422 && err?.data?.errors) {
                setErrors(err.data.errors);
                apiError = "Please correct the highlighted errors.";
            } else if (err?.data?.message) {
                apiError = err.data.message;
            }
            toast.error(apiError, { position: "top-right", autoClose: 3000 });
        } finally {
            setSubmitting(false)
            const timer = setTimeout(() => {
                setSuccess("");
            }, 6000);
            return () => clearTimeout(timer);

        }
    }, [formData, menuRows]);

    const handleSelectAll = (checked: boolean) => {
        setMenuRows((prev: any) =>
            prev.map((row: any) => ({
                ...row,
                isChecked: checked,
                checked: checked ? 1 : 0,
            }))
        );
    };
    const selectAllRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!selectAllRef.current) return;
        const allChecked = menuRows.length > 0 && menuRows.every(r => r.isChecked);
        const someChecked = menuRows.some(r => r.isChecked);
        selectAllRef.current.indeterminate = someChecked && !allChecked;
    }, [menuRows]);

    const navigate = useNavigate();


    return (

        <div className="_rkContentBorder container-fluid py-3 " style={{ border: "1px solid black", marginTop: "7px", marginBottom: "70px" }}>
            <div className="d-flex justify-content-between align-items-center text-white px-3 py-1 mb-3 fw-bold" style={{ backgroundColor: "#023e8a" }} >
                <span style={{ fontSize: "12px" }}>
                    👉 User Access &gt;&gt; Add
                </span>
            </div>

            <form onSubmit={handleFormSubmit}>
                <div className="row">
                    <RowFormSelectField
                        name="username"
                        label="User Name"
                        isLoading={userLoading}
                        options={userList}
                        value={formData.username}
                        onChange={handleSelectChange}
                        isEdit={true}
                        error={errors.username}
                        required={true}
                        // isLoading={false}
                        formData={formData}
                        row="col-md-5"
                        col1="col-md-3"
                        col2="col-md-9"
                    />
                </div>


                <div className="row mt-3">
                    <div className="col-12">
                        <div style={{ overflowX: "auto" }}>
                            <table className="custom-table table-bordered table-sm">
                                <thead className="text-white">
                                    <tr>
                                        <th>Modules</th>
                                        <th>Menus</th>
                                        <th style={{ width: "15%" }}>
                                            Allow Access
                                            {menuRows.length > 0 && <input
                                                ref={selectAllRef}
                                                type="checkbox"
                                                className="form-check-input pl-5"
                                                style={{
                                                    marginLeft: "10px",
                                                    borderRadius: "0px",
                                                    transform: "scale(1.4)",
                                                    cursor: "pointer",
                                                    border: "1px solid #023e8a",
                                                }}
                                                checked={
                                                    menuRows.length > 0 &&
                                                    menuRows.every(row => row.isChecked)
                                                }
                                                onChange={(e) => handleSelectAll(e.target.checked)}
                                            />}
                                        </th>

                                    </tr>
                                </thead>


                                <tbody>
                                    {menuRows?.length === 0 && (
                                        <tr>
                                            <td colSpan={12} className="text-center">
                                                No menus
                                            </td>
                                        </tr>
                                    )}
                                    {
                                        menuRows && menuRows?.map((row: any, index) => (
                                            <tr key={row.menuId}>
                                                <td> <input readOnly style={{ height: "23px", fontSize: "10px", fontWeight: "bold" }} value={row.moduleName ?? ""} className={`form-control custom-form-control`} />  </td>
                                                <td> <input readOnly style={{ height: "23px", fontSize: "10px", fontWeight: "bold" }} value={row.menuNameTree ?? ""} className={`form-control custom-form-control`} />  </td>

                                                <td className="text-center align-middle">
                                                    {row?.leaf == 1 && <input
                                                        type="checkbox"
                                                        className="form-check-input"
                                                        disabled={!row?.leaf}
                                                        style={{
                                                            marginLeft: "37px",
                                                            borderRadius: "0px",
                                                            transform: "scale(1.4)",
                                                            cursor: "pointer",
                                                            border: "1px solid #023e8a",
                                                        }}
                                                        checked={!!row.isChecked}
                                                        onChange={(e) => handleRowChange(index, "isChecked", row)}
                                                    />}
                                                </td>


                                            </tr>
                                        ))

                                    }
                                </tbody>
                            </table>
                            {loading && <LoadingFetchLoader />}
                        </div>
                    </div>
                </div>
               
                <div className="d-flex gap-3 justify-content-end">
                    <button
                        type="button"
                        disabled={submitting}
                        className="btn btn-sm btn-secondary custom-form-control"
                        onClick={() => navigate("/editUserAccess")}
                    >
                        Back to Search Page
                    </button>

                    <button
                        type="submit"
                        className={`btn btn-success btn-sm px-4 custom-form-control position-relative ${submitting ? "loading" : ""}`}
                        disabled={submitting}
                        style={{
                            minWidth: "100px"
                        }}
                    >
                        {submitting && <span className="spinner-center"></span>}
                        {!submitting && <span className="btn-text">Submit</span>}
                    </button>

                </div>
            </form>
        </div>
    );
};

export default Add;
