import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "./settingsModal.css";
import ColumnSelector from "./ColumnSelector";
import { Column } from "@/utils/helper";
import ColumnDefault from "./ColumnDefault";
import PageSizeSelector from "./PageSizeSelector";

interface SettingsModalProps {
    isOpen?: boolean;
    onClose?: () => void;
    itemsPerPage?: number;
    setItemsPerPage?: (value: number) => void;
    availableColumns?: Column[];
    selectedColumns?: Column[];
    setSelectedColumns?: (columns: Column[]) => void;
    allColumns: Column[];
}

interface ColumnSelectorProps {
    allColumns: Column[];
    selectedColumns: Column[];  
    setSelectedColumns: (columns: Column[]) => void;
    saveColumnsToBackend: (selectedColumns: Column[]) => Promise<void>;
}


const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen,
    onClose,
    itemsPerPage,
    setItemsPerPage,
    availableColumns,
    allColumns
}) => {
    const [tempItemsPerPage, setTempItemsPerPage] = useState(itemsPerPage);
    const [selectedColumns, setSelectedColumns] = useState<Column[]>([]);

    useEffect(() => {
        const savedColumns = localStorage.getItem("selectedColumns");
        if (savedColumns) {
            setSelectedColumns(JSON.parse(savedColumns));
        } else {
            setSelectedColumns(allColumns);
        }
    }, [allColumns]);

    const handleSave = () => { 
    };
    const [pageSize, setPageSize] = useState<number>(10);
    const [searchTerm, setSearchTerm] = useState("");
    const filteredColumns = allColumns.filter((col) =>
        col.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            {isOpen && <div className="modal-overlay" onClick={onClose}></div>}
            <motion.div
                initial={{ x: 500 }}
                animate={{ x: isOpen ? 0 : 500 }}
                exit={{ x: 500 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="modal-right"
            >
                <div className="modal-content pt-5">
                    <h5>
                        Preferences
                    </h5> 
                    <div
                        className="modal-body"
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            gap: "16px",
                            marginTop: "16px",
                        }}
                    >
                        <div
                            className="left-part"
                            style={{
                                flex: 1,
                                borderRight: "1px solid #ccc",
                                paddingRight: "8px",
                            }}
                        >
                            <h6>Page size</h6>
                            <PageSizeSelector pageSize={pageSize} setPageSize={setPageSize} />
                        </div>
                        <div
                            className="right-part"
                            style={{
                                flex: 2,
                                paddingLeft: "1px",
                            }}
                        >
                            <h6>Attribute columns </h6>
                            <p>  Select visible attribute columns</p>
                            <input
                                type="text"
                                placeholder="Search columns..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    padding: "4px 8px",
                                    marginBottom: "8px",
                                    width: "100%",
                                    boxSizing: "border-box",
                                }}
                            />
                            <ColumnDefault allColumns={filteredColumns} />
                        </div>
                    </div>
                    <div className="modal-buttons" style={{ marginTop: "16px" }}>
                        <button onClick={handleSave} className="btn btn-primary">
                            Save Changes
                        </button>
                        <button onClick={onClose} className="btn btn-secondary">
                            Cancel
                        </button>
                    </div>
                </div>
            </motion.div>
        </>
    );
};

export default SettingsModal;
