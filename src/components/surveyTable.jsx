import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    flexRender,
} from "@tanstack/react-table";
import { useState } from "react";
function SurveyTable({ data, columns }) {
    const [sorting, setSorting] = useState([]);

    const table = useReactTable({
        data,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <div style={{ overflowX: 'auto', width: '100%' }}>
            <table className="table table-bordered fs-4" style={{ minWidth: 1200 }}>
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
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
                        <tr key={row.id}>
                            {row.getVisibleCells().map((cell) => (
                                <td key={cell.id}
                                    style={{ width: cell.column.getSize() }}
                                    className="text-center"
                                >
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table >
        </div>
    );
}
export default SurveyTable;