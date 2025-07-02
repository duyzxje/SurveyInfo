import React, { useState, useEffect } from "react";
import LoadingOverlay from "../components/loadingOverlay";
import SurveyTable from "../components/surveyTable";
import EditSurveyModal from "../components/EditSurveyModal";
import * as XLSX from "xlsx";

function SurveyList() {
    const [showModal, setShowModal] = useState(false);
    const [editingSurvey, setEditingSurvey] = useState(null);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState("");

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch("http://localhost:3001/api/surveys");
            const json = await res.json();
            setData(json);
        } catch (err) {
            alert("Không thể tải dữ liệu khảo sát!");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleEdit = (survey) => {
        setEditingSurvey(survey);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingSurvey(null);
    };

    const handleSave = async (updatedSurvey) => {
        // Giả lập cập nhật local, thực tế sẽ gọi API
        setData((prevData) =>
            prevData.map((item) =>
                item.id === updatedSurvey.id ? { ...item, ...updatedSurvey } : item
            )
        );
        setShowModal(false);
        setEditingSurvey(null);
    };

    const handleDelete = (survey) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa khảo sát này?")) {
            setData((prevData) => prevData.filter((item) => item.id !== survey.id));
        }
    };

    const handleImportExcel = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const fileName = file.name;
        const reader = new FileReader();
        reader.onload = async (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: "binary" });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const excelData = XLSX.utils.sheet_to_json(ws, { defval: "" });
            let success = 0, fail = 0;
            for (const row of excelData) {
                if (!row.identify || !row.fullname || !row.provinceId || !row.districtId || !row.wardId) continue;
                const payload = {
                    ...row,
                    importFileName: fileName
                };
                try {
                    await fetch("http://localhost:3001/api/surveys", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                    });
                    success++;
                } catch (err) {
                    fail++;
                }
            }
            alert(`Import thành công: ${success} dòng. Thất bại: ${fail} dòng.`);
            fetchData();
        };
        reader.readAsBinaryString(file);
    };

    const fileNames = Array.from(new Set(data.map(item => item.importFileName).filter(Boolean)));
    const filteredData = selectedFile ? data.filter(item => item.importFileName === selectedFile) : data;

    const columns = [
        {
            header: "Thao tác",
            accessorKey: "actions",
            cell: ({ row }) => (
                <>
                    <button className="btn fs-4 btn-lg me-2 text-center" onClick={() => handleEdit(row.original)}>
                        <i class="bi bi-pencil text-primary"></i>
                    </button>
                    <button className="btn fs-4 btn-lg text-center" onClick={() => handleDelete(row.original)}>
                        <i class="bi bi-trash text-danger"></i>
                    </button>
                </>
            ),
            enableSorting: false,
        },
        {
            header: "CCCD",
            accessorKey: "identify",
            enableSorting: true,
            size: 120,
        },
        {
            header: "Họ tên",
            accessorKey: "fullname",
            enableSorting: true,
        },
        {
            header: "Số điện thoại",
            accessorKey: "phone",
            enableSorting: true,
            minSize: 120,
        },
        {
            header: "Tỉnh/TP",
            accessorKey: "provinceId",
            enableSorting: true,
        },
        {
            header: "Xã/Phường/Thị trấn",
            accessorKey: "WardId",
            enableSorting: true,
            size: 200,
        },
        {
            header: "Địa chỉ",
            accessorKey: "address",
            enableSorting: true,
        },
        {
            header: "Mục đích vay",
            accessorKey: "purposeLoan",
            enableSorting: true,
        },
        {
            header: "Mô tả",
            accessorKey: "description",
            enableSorting: true,
        },
        {
            header: "Số tiền cần cho mục đích",
            accessorKey: "amountPurpose",
            enableSorting: true,
        },
        {
            header: "Số tiền đã có",
            accessorKey: "amountHave",
            enableSorting: true,
        },
        {
            header: "Số tiền đề nghị vay",
            accessorKey: "amountSuggest",
            enableSorting: true,
        },
        {
            header: "Tiết kiệm tự nguyện",
            accessorKey: "voluntarySaving",
            enableSorting: true,
        },
        {
            header: "Thu nhập khách hàng",
            accessorKey: "incomeSalary",
            enableSorting: true,
        },
        {
            header: "Thu nhập khác",
            accessorKey: "incomeOther",
            enableSorting: true,
        },
        {
            header: "Tổng chi phí",
            accessorKey: "cost",
            enableSorting: true,
        },

    ];
    return (
        <>
            <div className="container mt-4">
                <div className="d-flex justify-content-between mb-4 header-color align-items-center">
                    <h1><strong>DANH SÁCH KHẢO SÁT</strong></h1>
                    <div className="d-flex gap-2 align-items-center">
                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={handleImportExcel}
                            className="form-control"
                            style={{ maxWidth: 300 }}
                        />
                        <select
                            className="form-select ms-2"
                            style={{ minWidth: 180 }}
                            value={selectedFile}
                            onChange={e => setSelectedFile(e.target.value)}
                        >
                            <option value="">-- Tất cả file --</option>
                            {fileNames.map(name => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                {loading ? <LoadingOverlay /> : <SurveyTable data={filteredData} columns={columns} />}
            </div>
            <EditSurveyModal
                show={showModal}
                survey={editingSurvey}
                onClose={handleCloseModal}
                onSave={handleSave}
            />
        </>
    );
}

export default SurveyList;
