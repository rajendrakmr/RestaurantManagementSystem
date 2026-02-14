import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Select from "react-select";
const DpeTableRow = ({ row, index, services, errors, handleRowChange, deleteRow, saveRow, inserting, checkRowForPayment, paymentRecord }) => {
    const isDisabled = row?.paymentNo || "";
    const inserted = row?.id || "";
    return (_jsxs("tr", { children: [_jsxs("td", { className: "d-flex gap-1", children: [_jsx("button", { style: { cursor: "pointer" }, disabled: row?.id || index === 0, onClick: () => deleteRow(index), className: "btn btn-sm btn-danger  custom-form-control pointer", children: "X" }), _jsx("button", { type: "button", className: `btn btn-success btn-sm px-4 custom-form-control position-relative ${inserting?.isInserting && inserting?.index === index ? "loading" : ""}`, disabled: isDisabled || (inserting?.isInserting && inserting?.index === index), onClick: () => saveRow(index), style: { minWidth: "80px" }, children: inserting?.isInserting && inserting?.index === index ? (_jsx("span", { className: "spinner-center" })) : (_jsx("span", { className: "btn-text", children: isDisabled ? "Paid" : "Insert" })) }), row?.id && (_jsx("input", { type: "checkbox", disabled: isDisabled, checked: paymentRecord?.some((item) => item?.id?.chitNo === row?.id?.chitNo &&
                            item?.id?.srlNo === row?.id?.srlNo), onChange: () => checkRowForPayment(row), className: "ml-3 custom-form-control", style: {
                            width: "20px",
                            height: "20px",
                            borderRadius: "0px",
                            cursor: "pointer",
                        } }))] }), _jsxs("td", { children: [" ", _jsx("input", { value: row?.cfsNo || "", disabled: true, className: "form-control custom-form-control" }), " "] }), _jsxs("td", { children: [" ", _jsx("input", { type: "date", value: row?.cfsDate || "", disabled: row?.id, onChange: (e) => handleRowChange(index, "cfsDate", e.target.value), className: `form-control custom-form-control ${errors?.[`row_${index}`]?.cfsDate ? "is-invalid" : ""}` }), "  ", errors?.[`row_${index}`]?.cfsDate && (_jsx("small", { className: "text-danger", children: errors[`row_${index}`].cfsDate }))] }), _jsxs("td", { children: [_jsx(Select, { options: services, isDisabled: isDisabled, classNamePrefix: "react-select", menuPortalTarget: document.body, styles: {
                            control: (base, state) => ({
                                ...base,
                                borderRadius: "0px",
                                minWidth: "103%",
                                boxSizing: "border-box",
                                fontSize: '11px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderColor: state.isDisabled
                                    ? "#4bce86ff"
                                    : errors?.[`row_${index}`]?.service
                                        ? "#dc3545"
                                        : state.isFocused
                                            ? "#86b7fe"
                                            : "#ced4da",
                                '&:hover': {
                                    borderColor: errors?.[`row_${index}`]?.service ? "#dc3545" : "#86b7fe",
                                    backgroundColor: state.isDisabled
                                        ? "#e9ecef"
                                        : base.backgroundColor
                                }
                            }),
                            menuPortal: base => ({ ...base, zIndex: 9999 })
                        }, value: services.find((opt) => opt.value === row?.service) || null, onChange: (selected) => handleRowChange(index, "service", selected?.value || "") }), errors?.[`row_${index}`]?.service && (_jsx("small", { className: "text-danger", children: errors[`row_${index}`].service }))] }), _jsxs("td", { children: [" ", _jsx("input", { type: "date", value: row?.from || "", disabled: isDisabled, max: row?.to || undefined, onChange: (e) => handleRowChange(index, "from", e.target.value), className: `form-control custom-form-control ${errors?.[`row_${index}`]?.from ? "is-invalid" : ""}` }), " ", errors?.[`row_${index}`]?.from && (_jsx("small", { className: "text-danger", children: errors[`row_${index}`].from })), " "] }), _jsxs("td", { children: [" ", _jsx("input", { type: "date", value: row?.to || "", disabled: isDisabled, min: row?.from || undefined, onChange: (e) => handleRowChange(index, "to", e.target.value), className: `form-control custom-form-control ${errors?.[`row_${index}`]?.to ? "is-invalid" : ""}` }), "  ", errors?.[`row_${index}`]?.to && (_jsx("small", { className: "text-danger", children: errors[`row_${index}`].to })), " "] }), _jsxs("td", { children: [" ", _jsx("input", { value: row?.rate || "", disabled: true, className: "form-control custom-form-control" })] }), _jsxs("td", { children: [" ", _jsx("input", { value: row?.amount || "", disabled: true, className: "form-control custom-form-control" }), " "] }), _jsxs("td", { children: [" ", _jsx("input", { value: row?.cgst || "", disabled: true, className: "form-control custom-form-control" }), " "] }), _jsxs("td", { children: [" ", _jsx("input", { value: row?.sgst || "", disabled: true, className: "form-control custom-form-control" }), " "] }), _jsxs("td", { children: [" ", _jsx("input", { value: row?.gst || "", disabled: true, className: "form-control custom-form-control" }), " "] }), _jsxs("td", { children: [" ", _jsx("input", { value: row?.totalVal || "", disabled: true, className: "form-control custom-form-control" }), " "] }), _jsxs("td", { children: [" ", _jsx("input", { value: row?.paymentNo || "", disabled: true, onChange: (e) => handleRowChange(index, "paymentNo", e.target.value), className: "form-control custom-form-control" }), " "] }), _jsxs("td", { children: [" ", _jsx("input", { value: row?.paymentDate || "", disabled: true, onChange: (e) => handleRowChange(index, "paymentDate", e.target.value), className: "form-control custom-form-control" }), " "] }), _jsxs("td", { children: [" ", _jsx("input", { value: row?.remarks || "", disabled: isDisabled, onChange: (e) => handleRowChange(index, "remarks", e.target.value), className: "form-control custom-form-control" }), " "] })] }));
};
export default DpeTableRow;
