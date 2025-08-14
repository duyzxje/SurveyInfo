import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    flexRender,
    getPaginationRowModel,
} from "@tanstack/react-table";
import { useState } from "react";

function SurveyTable({ data, columns, selectedSurveys, onSelectSurvey, onSelectAll, isEditing, onEditRow }) {
    const [sorting, setSorting] = useState([]);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    // State for tracking which row is being edited
    const [editingRow, setEditingRow] = useState(null);
    // State for storing edited values temporarily
    const [editValues, setEditValues] = useState({});

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            pagination,
        },
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    const allSelected = data.length > 0 && selectedSurveys.length === data.length;

    const handleSelectAll = (e) => {
        if (onSelectAll) {
            onSelectAll(e.target.checked);
        }
    };

    // Format number with thousand separators
    const formatNumber = (value) => {
        if (!value) return '0';
        return Number(value).toLocaleString('en-US');
    };

    // Start editing a row
    const startEditing = (rowIndex, rowData) => {
        setEditingRow(rowIndex);
        setEditValues(rowData);
    };

    // Cancel editing
    const cancelEditing = () => {
        setEditingRow(null);
        setEditValues({});
    };

    // Save edited row
    const saveEditing = () => {
        if (onEditRow && editingRow !== null) {
            onEditRow(editingRow, editValues);
        }
        setEditingRow(null);
        setEditValues({});
    };

    // Handle input change when editing
    const handleInputChange = (e, key) => {
        const moneyFields = ['PurposeAmount', 'HaveAmount', 'LoanAmountSuggest', 'VoluntaryDepositAmount'];

        if (moneyFields.includes(key)) {
            // For money fields, remove non-numeric characters
            const rawValue = e.target.value.replace(/[^\d]/g, '');
            setEditValues({
                ...editValues,
                [key]: rawValue
            });
        } else {
            setEditValues({
                ...editValues,
                [key]: e.target.value
            });
        }
    };

    // Render editable cell
    const renderEditableCell = (cell, rowIndex) => {
        const columnId = cell.column.id;

        // Don't make certain columns editable
        if (columnId === 'actions') {
            return flexRender(cell.column.columnDef.cell, cell.getContext());
        }

        // If this row is being edited
        if (isEditing && editingRow === rowIndex) {
            // Special handling for select inputs (purposeLoan)
            if (columnId === 'LoanPurposeName') {
                return (
                    <select
                        className="form-control"
                        value={editValues[columnId] || ''}
                        onChange={(e) => handleInputChange(e, columnId)}
                    >
                        <option value="1">Mua nhà</option>
                        <option value="2">Mua xe</option>
                        <option value="3">Mua sắm</option>
                        <option value="4">Đầu tư</option>
                    </select>
                );
            }

            // Special handling for monetary values
            const moneyFields = ['PurposeAmount', 'HaveAmount', 'LoanAmountSuggest', 'VoluntaryDepositAmount'];
            if (moneyFields.includes(columnId)) {
                return (
                    <input
                        type="text"
                        className="form-control text-end"
                        value={formatNumber(editValues[columnId]) || ''}
                        onChange={(e) => handleInputChange(e, columnId)}
                    />
                );
            }

            // Default input for other fields
            return (
                <input
                    type="text"
                    className="form-control"
                    value={editValues[columnId] || ''}
                    onChange={(e) => handleInputChange(e, columnId)}
                />
            );
        }

        // Regular cell rendering
        return flexRender(cell.column.columnDef.cell, cell.getContext());
    };

    return (
        <>
            <div style={{ overflowX: 'auto', width: '100%' }}>
                <table className="table table-bordered fs-5" style={{ minWidth: 1200 }}>
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                <th className="text-center" style={{ width: '40px' }}>
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        checked={allSelected}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        onClick={header.column.getToggleSortingHandler()}
                                        style={{ cursor: "pointer", width: header.getSize(), minWidth: header.getSize() }}
                                        className="text-center"
                                    >
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                        {header.column.getIsSorted() === "asc" && <i className="bi bi-caret-up-fill fs-4 ms-2"></i>}
                                        {header.column.getIsSorted() === "desc" && <i className="bi bi-caret-down-fill fs-4 ms-2"></i>}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map((row) => (
                            <tr key={row.id} className={editingRow === row.original.rowIndex ? 'table-warning' : ''}>
                                <td className="text-center">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        checked={selectedSurveys.some(survey => survey.id === row.original.id)}
                                        onChange={(e) => onSelectSurvey(row.original, e.target.checked)}
                                    />
                                </td>
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id}
                                        style={{ width: cell.column.getSize() }}
                                        className="text-center"
                                    >
                                        {renderEditableCell(cell, row.original.rowIndex)}
                                    </td>
                                ))}
                                {isEditing && editingRow === row.original.rowIndex && (
                                    <td className="text-center">
                                        <div className="btn-group">
                                            <button className="btn btn-sm btn-success" onClick={saveEditing}>
                                                <i className="bi bi-check"></i> Lưu
                                            </button>
                                            <button className="btn btn-sm btn-secondary" onClick={cancelEditing}>
                                                <i className="bi bi-x"></i> Hủy
                                            </button>
                                        </div>
                                    </td>
                                )}
                                {isEditing && editingRow !== row.original.rowIndex && (
                                    <td className="text-center">
                                        <button
                                            className="btn btn-sm btn-primary"
                                            onClick={() => startEditing(row.original.rowIndex, row.original)}
                                        >
                                            <i className="bi bi-pencil"></i> Sửa
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Phân trang */}
            <div className="d-flex justify-content-between align-items-center mt-3">
                <div className="fs-5">
                    Hiển thị {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} đến{" "}
                    {Math.min(
                        (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                        data.length
                    )}{" "}
                    trong tổng số {data.length} bản ghi
                </div>
                <div className="d-flex gap-2 justify-content-center align-items-center">
                    <select
                        className="form-select text-center"
                        value={table.getState().pagination.pageSize}
                        onChange={e => {
                            table.setPageSize(Number(e.target.value));
                        }}
                    >
                        {[10, 20, 30, 50].map(pageSize => (
                            <option key={pageSize} value={pageSize}>
                                Hiển thị {pageSize} dòng
                            </option>
                        ))}
                    </select>
                    <ul className="pagination">
                        <li className={`page-item ${!table.getCanPreviousPage() ? 'disabled' : ''}`}>
                            <button
                                className="page-link fs-5"
                                onClick={() => table.setPageIndex(0)}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <i className="bi bi-chevron-double-left"></i>
                            </button>
                        </li>
                        <li className={`page-item ${!table.getCanPreviousPage() ? 'disabled' : ''}`}>
                            <button
                                className="page-link fs-5"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <i className="bi bi-chevron-left"></i>
                            </button>
                        </li>
                        {Array.from(
                            { length: Math.min(5, table.getPageCount()) },
                            (_, i) => {
                                const pageIndex = table.getState().pagination.pageIndex;
                                let start = Math.max(0, pageIndex - 2);
                                if (pageIndex >= table.getPageCount() - 2) {
                                    start = Math.max(0, table.getPageCount() - 5);
                                }
                                return start + i;
                            }
                        ).map(pageIndex => (
                            pageIndex < table.getPageCount() && (
                                <li key={pageIndex} className={`page-item ${table.getState().pagination.pageIndex === pageIndex ? 'active' : ''}`}>
                                    <button
                                        className="page-link fs-5"
                                        onClick={() => table.setPageIndex(pageIndex)}
                                    >
                                        {pageIndex + 1}
                                    </button>
                                </li>
                            )
                        ))}
                        <li className={`page-item ${!table.getCanNextPage() ? 'disabled' : ''}`}>
                            <button
                                className="page-link fs-5"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                <i className="bi bi-chevron-right"></i>
                            </button>
                        </li>
                        <li className={`page-item ${!table.getCanNextPage() ? 'disabled' : ''}`}>
                            <button
                                className="page-link fs-5"
                                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                disabled={!table.getCanNextPage()}
                            >
                                <i className="bi bi-chevron-double-right"></i>
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </>
    );
}

export default SurveyTable;