import React, { useEffect, useState, useRef } from "react";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";
import ToggleSwitch from "@/components/pageSettings/ToggleSwitch";
import { Column } from "@/utils/helper";

interface ColumnSelectorProps {
    allColumns: Column[];
    setSelectedColumns: (columns: Column[]) => void;
}

const ColumnDefault: React.FC<ColumnSelectorProps> = ({ allColumns, setSelectedColumns }) => {
    const [tempColumns, setTempColumns] = useState<Column[]>(allColumns);
    const prevColumnsRef = useRef<Column[]>(allColumns);  
 
    useEffect(() => {
        if (JSON.stringify(allColumns) !== JSON.stringify(prevColumnsRef.current)) {
            setTempColumns([...allColumns]);
            prevColumnsRef.current = allColumns;
        }
    }, [allColumns]);

     
    useEffect(() => {
        console.log('tempColumnstempColumnstempColumnstempColumns',tempColumns)
        if (JSON.stringify(tempColumns) !== JSON.stringify(prevColumnsRef.current)) {
            setSelectedColumns(tempColumns);
            prevColumnsRef.current = tempColumns;
        }
    }, [tempColumns, setSelectedColumns]);
 
    const handleCheckboxChange = (colKey: string,isActive:boolean) => { 
        setTempColumns((prevColumns) =>
            prevColumns.map((col) =>
                col.key === colKey ? { ...col, isActive: !isActive } : col
            )
        );
    };

 
    // const handleDragEnd = (event: DragEndEvent) => {
    //     const { active, over } = event;
    //     console.log("active",active, 'over',over)
    //     if (!over || active.id === over.id) return; 
    //     setTempColumns((prevColumns) => {
    //         const oldIndex = prevColumns.findIndex((col) => col.key === active.id);
    //         const newIndex = prevColumns.findIndex((col) => col.key === over.id);
    //         return arrayMove(prevColumns, oldIndex, newIndex);
    //     });
    // };
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        console.log("active", active, "over", over);
        if (!over || active.id === over.id) return;
      
        setTempColumns((prevColumns) => {
          const oldIndex = prevColumns.findIndex((col) => col.key === active.id);
          const newIndex = prevColumns.findIndex((col) => col.key === over.id);
          const newColumns = arrayMove(prevColumns, oldIndex, newIndex);
      
          // Update the order property based on new array position
          return newColumns.map((col, index) => ({
            ...col,
            order: index + 1, // or simply index if you prefer starting at 0
          }));
        });
      };
      

    return (
        <div style={{ maxHeight: "300px", overflowY: "auto" }}> 
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={tempColumns.map(({ key }) => key)} strategy={verticalListSortingStrategy}>
                    {tempColumns.map((col) => (
                        <SortableItem key={col.key} id={col.key}>
                            <label style={{ display: "flex", alignItems: "center", marginBottom: "4px" }}>
                                <ToggleSwitch
                                    checked={col.isActive}
                                    onChange={(e) => {
                                        e.stopPropagation();
                                        handleCheckboxChange(col.key,col.isActive);
                                    }}
                                />
                                {col.label}
                            </label>
                        </SortableItem>
                    ))}
                </SortableContext>
            </DndContext>
        </div>
    );
};

export default React.memo(ColumnDefault);
