import RowFormInputField from "@/components/Form/RowFormInputField";
import React, { useEffect, useState } from "react";
import { validationRequest, ValidationRules } from "@/utils/validationRequest";
import { toast } from "react-toastify";
import RowFormSelectField from "@/components/Form/RowFormSelectField";
import { activeOption } from "@/pages/options";
import { setBreadcrumbs } from "@/store/slice/bredCrumbs";
import { useDispatch } from "react-redux";
import { apiRequest } from "@/store/services/api";
import { useNavigate } from "react-router-dom";




export interface Column {
    id: number;
    key: string;
    label: string;
}
const Add: React.FC = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(
            setBreadcrumbs([
                { label: "Table Management", path: "" },
                { label: "Add" }
            ])
        );
    }, [dispatch]);
    const initial = {
        tableNumber: "",
        tableName: "",
        capacity: "",
        section: "",
        status: "Y"
    }
    const [formData, setFormData] = useState(initial);

    const [errors, setErrors] = useState<Record<string, any>>({});
    const [submitting, setSubmitting] = useState<boolean>(false);



    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prevData) => ({
            ...prevData,
            [e.target.name]: e.target.value,
        }));
        setErrors({ ...errors, [e.target.name]: "" });
    };


    const validationRules: ValidationRules = {
        tableNumber: { required: true, minLength: 1, maxLength: 15 },
        tableName: { required: true, minLength: 2, maxLength: 20 },
        capacity: { required: true, minLength: 1, maxLength: 2 },
        section: { required: false, minLength: 1, maxLength: 50 },
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { isValid, errors } = validationRequest(formData, validationRules);
        setErrors(errors);

        if (!isValid) {
            toast.error("Please fill in all mandatory fields.", { position: "top-right", autoClose: 5000 });
            return;
        }
        setSubmitting(true)
        const payload = {
            tableNumber: formData?.tableNumber,
            tableName: formData?.tableName,
            capacity: formData?.capacity,
            section: formData?.section,
            status: formData?.status,
        };
        try {
            const resp = await apiRequest({ url: "/tables", method: "POST", data: payload })
            toast.success(resp.message, { position: "top-right", autoClose: 6000 });
            setFormData(initial)


        } catch (err: any) {
            let apiError = "Something went wrong! Please try again.";
            if (err?.status === 422 && err?.data?.errors) {
                setErrors(err.data.errors);
                apiError = "Please correct the highlighted errors.";
            } else if (err?.data?.message) {
                apiError = err.data.message;
            }
            toast.error(apiError, { position: "top-right", autoClose: 6000 });
        } finally {
            setSubmitting(false)
        }
    };

    const handleSelectChange = (selectedOption: any, name: string) => {
        setFormData((prev) => ({ ...prev, [name]: selectedOption?.value || "" }));
        setErrors({})
    };

    const navigate = useNavigate();
    return (

        <div className="_rkContentBorder container-fluid py-3" style={{ border: "1px solid black", marginTop: "7px", marginBottom: "70px" }}>
            <div
                className="d-flex justify-content-between align-items-center text-white px-3 py-1 mb-3 fw-bold"
                style={{ backgroundColor: "#023e8a" }}
            >
                <span style={{ fontSize: "12px" }}>
                    Add New Table
                </span>
            </div>

            <form onSubmit={handleFormSubmit}>
                <div className="row">
                    <RowFormInputField label="Table No" type="number" name="tableNumber" inputValue={formData.tableNumber} error={errors.tableNumber} required onChange={handleChange} />
                    <RowFormInputField label="Table Name" name="tableName" inputValue={formData.tableName} error={errors.tableName} required onChange={handleChange} />
                    <RowFormInputField label="Capacity" max={15} name="capacity" inputValue={formData.capacity} error={errors.capacity} required onChange={handleChange} />

                    <RowFormInputField label="Section" max={20} name="section" inputValue={formData.section} error={errors.section} onChange={handleChange} />
                    <RowFormSelectField name="status" label="Status" options={activeOption} value={formData.status} error={errors.status} onChange={handleSelectChange} isLoading={false} formData={formData} />

                </div>


                <div className="d-flex gap-3 justify-content-end">
                    <button
                        type="button"
                        disabled={submitting}
                        className="btn btn-sm btn-secondary custom-form-control"
                        onClick={() => navigate("/editGateIn")}
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
