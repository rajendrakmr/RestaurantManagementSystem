// SortableItem.tsx
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
    cursor: "grab",
    padding: "8px",
    backgroundColor: "#f8f9fa",
    border: "1px solid #ccc",
    borderRadius: "4px",
    marginBottom: "4px",
    touchAction: "manipulation",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onPointerDown={(e) => {
        // Only stop propagation if the target is an input (to allow checkbox clicks)
        if ((e.target as HTMLElement).tagName.toLowerCase() === "input") {
          e.stopPropagation();
        }
      }}
    >
      {children}
    </div>
  );
};

export default SortableItem;
