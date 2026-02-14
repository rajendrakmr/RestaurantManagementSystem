import { useState } from "react";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";
import ToggleSwitch from "@/components/pageSettings/ToggleSwitch";

interface Column {
    key: string;
    label: string;
}

interface ColumnSelectorProps {
    allColumns: Column[];  // All available columns
    selectedColumns: Column[];  // Only selected columns
    setSelectedColumns: (columns: Column[]) => void;
}

const ColumnSelector: React.FC<ColumnSelectorProps> = ({ allColumns, selectedColumns, setSelectedColumns }) => {
    const [tempColumns, setTempColumns] = useState<Column[]>(selectedColumns);

    // ✅ Toggle column selection (true/false)
    const handleCheckboxChange = (col: Column) => {
        setTempColumns((prev) =>
            prev.some((c) => c.key === col.key)
                ? prev.filter((c) => c.key !== col.key)  // Remove if exists
                : [...prev, col]  // Add if not exists
        );
    };

    // ✅ Drag & Drop Sorting
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = tempColumns.findIndex((col) => col.key === active.id);
        const newIndex = tempColumns.findIndex((col) => col.key === over.id);

        const sortedColumns = arrayMove(tempColumns, oldIndex, newIndex);
        setTempColumns(sortedColumns);
    };

    // ✅ Save Changes (Update Table Headers & Order)
    const saveChanges = () => {
        setSelectedColumns(tempColumns);
        localStorage.setItem("selectedColumns", JSON.stringify(tempColumns));
    };

    return (
        <div className="mb-2">
            <label><b>Select Columns:</b></label> 
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={tempColumns.map(({ key }) => key)} strategy={verticalListSortingStrategy}>
                    {tempColumns.map((col) => (
                        <SortableItem key={col.key} id={col.key}> 
                            <label key={col.key} style={{ display: "flex", alignItems: "center", marginBottom: "4px" }} >
                                <ToggleSwitch
                                    checked={true}
                                    onChange={(e) => {
                                        e.stopPropagation();
                                        handleCheckboxChange(col);
                                    }}
                                />
                                {col.label}
                            </label>
                        </SortableItem>
                    ))}
                </SortableContext>
            </DndContext>


            {/* ✅ Show all columns (Not Draggable, Only Checkbox) */}
            {allColumns.map((col) => (
                !tempColumns.some((c) => c.key === col.key) && (
                    <label key={col.key} className="d-flex align-items-center mx-2">
                        <ToggleSwitch
                                 
                                     checked={tempColumns.some((c) => c.key === col.key)}
                                     onChange={() => handleCheckboxChange(col)}
                                />
                        {/* <input
                            type="checkbox"
                            checked={tempColumns.some((c) => c.key === col.key)}
                            onChange={() => handleCheckboxChange(col)}
                        /> */}
                        {col.label}
                    </label>
                )
            ))}

            <button onClick={saveChanges} className="btn btn-primary mt-2">Save Changes</button>
        </div>
    );
};

export default ColumnSelector;
