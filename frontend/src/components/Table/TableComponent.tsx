import { useState } from "react";
import { Column } from "@/utils/helper";
import "./TableComponent.css";

interface TableComponentProps<T = any> {
  data: Record<string, any>[];
  allColumns: Column[];
  isFetching: boolean;
  setFormData: React.Dispatch<React.SetStateAction<T>>;
  setOpenSliderForm: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedItems: React.Dispatch<React.SetStateAction<T>>;
  setSelectedIds: React.Dispatch<React.SetStateAction<T>>;
  selectedIds: string[];
}

import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { Dropdown } from "react-bootstrap";
import LoadingLoader from "../LoadingLoader";

const TableComponent: React.FC<TableComponentProps> = ({
  setFormData,
  data,
  allColumns,
  isFetching,
  setOpenSliderForm,
  setSelectedIds,
  selectedIds,
  setSelectedItems
}) => {
  const activeColumns = allColumns
    .filter((col) => col.isActive)
    .sort((a, b) => a.order - b.order);

  const [dropdownVisible, setDropdownVisible] = useState<string | null>(null);

  // Toggle the dropdown for an action column
  const toggleDropdown = (id: string) => {
    setDropdownVisible(dropdownVisible === id ? null : id);
  };

  // Handle the header checkbox to select/deselect all rows
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = data.map((item) => item.id.toString());
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  // Handle individual row checkbox selection
  const handleSelectRow = (
    e: React.ChangeEvent<HTMLInputElement>,
    item: Record<string, any>
  ) => {
    const id = item.id.toString();
    if (e.target.checked) {
      setSelectedIds((prev: string[]) => [...prev, id]);
      setSelectedItems((prev: Record<string, any>[]) => [...prev, item]);
    } else {
      setSelectedIds((prev: string[]) =>
        prev.filter((selectedId: string) => selectedId !== id)
      );
      setSelectedItems((prev: Record<string, any>[]) =>
        prev.filter((selectedItem: Record<string, any>) => selectedItem.id.toString() !== id)
      );
    }
  };

  const getBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success"; // Green
      case "inactive":
        return "bg-warning"; // Yellow
      case "terminated":
        return "bg-danger"; // Red
      default:
        return "bg-secondary"; // Gray (default if status is unknown)
    }
  };

  return (
    <div>
      <div className="table-container table-responsive tableReponsivecontainer">
        <table className="table table-bordered">
          <thead
            className="table-header-bg text-white"
            style={{ position: "sticky", top: 0, backgroundColor: "#32ab9b" }}
          >
            <tr>
              {/* Bulk select checkbox */}
              <th>
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={data.length > 0 && selectedIds.length === data.length}
                />
              </th>
              {activeColumns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isFetching ? (
              <tr>
                <td colSpan={activeColumns.length + 1} className="text-center">
                  <div
                    className="d-flex justify-content-center align-items-center"
                    style={{ height: "200px", width: "100%" }}
                  >
                    <LoadingLoader />
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={activeColumns.length + 1} className="text-center">
                  No records found.
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id}>
                  <td>
                    <input
                      type="checkbox"
                      onChange={(e) => handleSelectRow(e, item)}
                      checked={selectedIds.includes(item.id.toString())}
                    />
                  </td>
                  {activeColumns.map((col) => (
                    <td key={col.key} className="p-2">
                      {col.key === "action" ? (
                        <div className="custom-dropdown">
                          <span
                            className="cursor-pointer px-2 cursoredit"
                            onClick={() => {
                              setOpenSliderForm(true);
                              setFormData(item);
                            }}
                          >
                            <FontAwesomeIcon icon={faPenToSquare} />
                          </span>
                          <Dropdown align="end">
                            <Dropdown.Toggle
                              id="dropdown-profile"
                              className="profile-dropdown-toggle"
                            >
                              ⋮
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item>Delete</Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </div>
                      ) : col.key === "status" ? (
                        // Display badge for status with consistent styling
                        <span className={`badge ${getBadgeColor(item[col.key])} status-badge`}>
                          {item[col.key].charAt(0).toUpperCase() + item[col.key].slice(1)}
                        </span>
                      ) : (
                        item[col.key]
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableComponent;
