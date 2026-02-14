import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "./settingsModal.css";
import { Column } from "@/utils/helper";
import ColumnDefault from "./ColumnDefault";
import PageSizeSelector from "./PageSizeSelector";

interface SettingsModalProps {
    isOpen?: boolean;
    onClose?: () => void;
    itemsPerPage?: number;
    setItemsPerPage?: (value: number) => void;
    allColumns: Column[];
}

const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen,
    onClose,
    itemsPerPage = 10,
    setItemsPerPage,
    allColumns
}) => {
    const [tempItemsPerPage, setTempItemsPerPage] = useState(itemsPerPage);
    const [selectedColumns, setSelectedColumns] = useState<Column[]>(allColumns);
    const [searchTerm, setSearchTerm] = useState(""); 
    useEffect(() => {
        const savedColumns = localStorage.getItem("selectedColumns");
        if (savedColumns) {
            setSelectedColumns(JSON.parse(savedColumns));
        } else {
            setSelectedColumns(allColumns);
        }
    }, [allColumns]); 
    useEffect(() => {
        localStorage.setItem("selectedColumns", JSON.stringify(selectedColumns));
    }, [selectedColumns]);

    const filteredColumns = selectedColumns.filter((col) =>
        col.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSave = () => {
        if (setItemsPerPage) {
            setItemsPerPage(tempItemsPerPage);
        }
        console.log('setItemsPerPagesetItemsPerPage',tempItemsPerPage,selectedColumns)
        localStorage.setItem("selectedColumns", JSON.stringify(selectedColumns));
        onClose && onClose();
    };

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
                    <div className="modal-buttons" style={{ marginTop: "16px" }}>
                        <button onClick={onClose} className="btn btn-secondary">Cancel</button>
                        <button onClick={handleSave} className="btn btn-sm btn-primary">Save Changes</button>
                    </div>
                    <h5>Preferences</h5>
                    <div className="modal-body" style={{ display: "flex", flexDirection: "row", gap: "16px", marginTop: "16px" }}>
                        <div className="left-part" style={{ flex: 1, borderRight: "1px solid #ccc", paddingRight: "8px" }}>
                            <h6>Page size</h6>
                            <PageSizeSelector pageSize={tempItemsPerPage} setPageSize={setTempItemsPerPage} />
                        </div>
                        <div className="right-part" style={{ flex: 2, paddingLeft: "1px" }}>
                            <h6>Attribute columns</h6>
                            <p>Select visible attribute columns</p>
                            <input
                                type="text"
                                placeholder="Search columns..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ padding: "4px 8px", marginBottom: "8px", width: "100%", boxSizing: "border-box" }}
                            />
                            <ColumnDefault
                                allColumns={filteredColumns}
                                setSelectedColumns={setSelectedColumns}
                            />
                        </div>
                    </div>
                  
                </div>
            </motion.div>
        </>
    );
};

export default SettingsModal;
