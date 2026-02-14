// ColumnSelector.tsx
import React, { useState, useEffect } from "react";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";

export interface Column {
  key: string;
  label: string;
}

interface ColumnSelectorProps {
  allColumns: Column[];
  selectedColumnKeys: string[]; // Order & selection: array of keys that are currently selected
  setSelectedColumnKeys: (keys: string[]) => void;
  saveColumnsToBackend: (selectedKeys: string[]) => Promise<void>;
}

const ColumnSelector: React.FC<ColumnSelectorProps> = ({
  allColumns,
  selectedColumnKeys,
  setSelectedColumnKeys,
  saveColumnsToBackend,
}) => {
  // Local state for working on selection & ordering.
  const [tempSelectedKeys, setTempSelectedKeys] = useState<string[]>(selectedColumnKeys);

  // Update local state when parent's selection changes.
  useEffect(() => {
    setTempSelectedKeys(selectedColumnKeys);
  }, [selectedColumnKeys]);

  // Handle vertical drag-and-drop ordering.
  const handleDragEnd = (event: DragEndEvent) => {
    console.log("handleDragEnd triggered:", event);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = tempSelectedKeys.findIndex((key) => key === active.id);
    const newIndex = tempSelectedKeys.findIndex((key) => key === over.id);
    const newOrder = arrayMove(tempSelectedKeys, oldIndex, newIndex);
    console.log("Old Order:", tempSelectedKeys);
    console.log("New Order:", newOrder);
    setTempSelectedKeys(newOrder);
  };

  // Toggle a column's selection.
  const handleCheckboxChange = (col: Column) => {
    setTempSelectedKeys((prev) =>
      prev.includes(col.key) ? prev.filter((key) => key !== col.key) : [...prev, col.key]
    );
  };

  // Save changes to parent state and backend.
  const handleSaveChanges = async () => {
    setSelectedColumnKeys(tempSelectedKeys);
    await saveColumnsToBackend(tempSelectedKeys);
  };

  return (
    <div className="mb-3">
      <label><b>Select & Arrange Columns:</b></label>
      {/* Draggable list for selected columns (vertical layout) */}
      <div
        className="sortable-container"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          padding: "10px",
          border: "1px solid #ccc",
        }}
      >
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={tempSelectedKeys} strategy={verticalListSortingStrategy}>
            {allColumns
              .filter((col) => tempSelectedKeys.includes(col.key))
              .map((col) => (
                <SortableItem key={col.key} id={col.key}>
                  <label className="d-flex align-items-center mx-2">
                    <input
                      type="checkbox"
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
      </div>

      {/* Static list for unselected columns */}
      <div>
        {allColumns
          .filter((col) => !tempSelectedKeys.includes(col.key))
          .map((col) => (
            <label key={col.key} className="d-flex align-items-center mx-2">
              <input
                type="checkbox"
                checked={false}
                onChange={() => handleCheckboxChange(col)}
              />
              {col.label}
            </label>
          ))}
      </div>

      <button onClick={handleSaveChanges} className="btn btn-primary mt-2">
        Save Changes
      </button>
    </div>
  );
};

export default ColumnSelector;
