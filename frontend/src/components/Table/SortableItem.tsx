import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ReactNode } from "react";

interface SortableItemProps {
    id: string;
    children: ReactNode;
}

const SortableItem: React.FC<SortableItemProps> = ({ id, children }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        padding: "5px",
        backgroundColor: "#f8f9fa",
        borderRadius: "5px",
        marginBottom: "5px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"  
    };

    return (
        <div ref={setNodeRef} style={style}>
            {children}
            <span {...attributes} {...listeners} style={{ cursor: "grab", padding: "5px" }}>☰</span> 
        </div>
    );
};

export default SortableItem;
