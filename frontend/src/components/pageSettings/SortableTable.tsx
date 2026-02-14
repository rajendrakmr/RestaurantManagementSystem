import React from "react";
import { Column } from "./ColumnSelector";

interface SortableTableProps {
  data: Record<string, any>[];
  allColumns: Column[];
  selectedColumnKeys: string[];
}

const SortableTable: React.FC<SortableTableProps> = ({ data, allColumns, selectedColumnKeys }) => {
  // Build the list of columns to display based on selected keys.
  const displayedColumns = selectedColumnKeys
    .map((key) => allColumns.find((col) => col.key === key))
    .filter((col): col is Column => Boolean(col));

  return (
    <div className="table-container table-responsive">
      <table className="table table-bordered">
        <thead>
          <tr>
            {displayedColumns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              {displayedColumns.map((col) => (
                <td key={col.key}>{item[col.key] ?? "N/A"}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SortableTable;
