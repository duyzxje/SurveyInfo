import React, { useState, useEffect, useMemo, useRef } from "react";
import LoadingOverlay from "../components/loadingOverlay";
import SurveyTable from "../components/surveyTable";
import EditSurveyModal from "../components/EditSurveyModal";
import ConfirmModal from "../components/ConfirmModal";
import SurveyDetail from "../components/SurveyDetail";
import * as XLSX from "xlsx";

function SurveyList() {
    const [showModal, setShowModal] = useState(false);
    const [editingSurvey, setEditingSurvey] = useState(null);
    const [viewingSurvey, setViewingSurvey] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState("");
    const [selectedSurveys, setSelectedSurveys] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [locationMap, setLocationMap] = useState({
        provinces: {},
        districts: {},
        wards: {}
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [confirmModal, setConfirmModal] = useState({
        show: false,
        title: "",
        message: "",
        onConfirm: () => { },
        data: null
    });

    // Thay thế state previewData bằng multiplePreviewData để xử lý nhiều file
    const [multiplePreviewData, setMultiplePreviewData] = useState([]);
    // State để theo dõi file đang được hiển thị
    const [activePreviewIndex, setActivePreviewIndex] = useState(0);

    // State để theo dõi danh sách đang được hiển thị từ DB
    const [activeDbListName, setActiveDbListName] = useState("");

    // Thêm ref cho input file
    const fileInputRef = useRef(null);

    // Fetch provinces data from API
    const fetchProvinces = async () => {
        try {
            const response = await fetch("https://provinces.open-api.vn/api/?depth=3");
            const data = await response.json();
            setProvinces(data);

            // Build maps for provinces, districts and wards
            const provinceMap = {};
            const districtMap = {};
            const wardMap = {};

            data.forEach(province => {
                provinceMap[province.code] = province.name;

                if (province.districts) {
                    province.districts.forEach(district => {
                        districtMap[district.code] = district.name;

                        if (district.wards) {
                            district.wards.forEach(ward => {
                                wardMap[ward.code] = ward.name;
                            });
                        }
                    });
                }
            });

            setLocationMap({
                provinces: provinceMap,
                districts: districtMap,
                wards: wardMap
            });

        } catch (err) {
            console.error("Error fetching provinces:", err);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch("http://localhost:3001/api/surveys");
            const json = await res.json();
            setData(json);
        } catch (err) {
            showConfirmModal("Lỗi", "Không thể tải dữ liệu khảo sát!", () => { });
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchProvinces();
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

    const handleViewDetail = (survey) => {
        setViewingSurvey(survey);
        setShowDetailModal(true);
    };

    const handleCloseDetailModal = () => {
        setShowDetailModal(false);
        setViewingSurvey(null);
    };

    const handleSave = async (updatedSurvey) => {
        try {
            const response = await fetch(`http://localhost:3001/api/surveys/${updatedSurvey.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedSurvey),
            });

            if (response.ok) {
                const updatedData = await response.json();
                setData((prevData) =>
                    prevData.map((item) =>
                        item.id === updatedData.id ? updatedData : item
                    )
                );
                showConfirmModal("Thông báo", "Cập nhật thành công!", () => { });
            } else {
                showConfirmModal("Lỗi", "Cập nhật thất bại!", () => { });
            }
        } catch (err) {
            console.error("Error updating survey:", err);
            showConfirmModal("Lỗi", "Cập nhật thất bại!", () => { });
        }
        setShowModal(false);
        setEditingSurvey(null);
    };

    const showConfirmModal = (title, message, onConfirm, data = null) => {
        setConfirmModal({
            show: true,
            title,
            message,
            onConfirm,
            data
        });
    };

    const handleCloseConfirmModal = () => {
        setConfirmModal({
            show: false,
            title: "",
            message: "",
            onConfirm: () => { },
            data: null
        });
    };

    const handleDelete = async (survey) => {
        showConfirmModal(
            "Xác nhận xóa",
            "Bạn có chắc chắn muốn xóa khảo sát này?",
            async () => {
                try {
                    setLoading(true);
                    const response = await fetch(`http://localhost:3001/api/surveys/${survey.id}`, {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                    });

                    if (response.ok) {
                        setData((prevData) => prevData.filter((item) => item.id !== survey.id));
                        showConfirmModal("Thông báo", "Đã xóa khảo sát thành công!", () => { });
                    } else {
                        console.error("Error deleting survey:", await response.text());
                        showConfirmModal("Lỗi", "Xóa khảo sát thất bại!", () => { });
                    }
                } catch (err) {
                    console.error("Error deleting survey:", err);
                    showConfirmModal("Lỗi", "Xóa khảo sát thất bại! Lỗi kết nối đến server.", () => { });
                } finally {
                    setLoading(false);
                }
            }
        );
    };

    // Function to handle multiple survey deletion
    const handleDeleteSelected = async () => {
        if (selectedSurveys.length === 0) {
            showConfirmModal("Thông báo", "Vui lòng chọn ít nhất một khảo sát để xóa!", () => { });
            return;
        }

        showConfirmModal(
            "Xác nhận xóa hàng loạt",
            `Bạn có chắc chắn muốn xóa ${selectedSurveys.length} khảo sát đã chọn?`,
            async () => {
                setLoading(true);
                let deletedCount = 0;
                let errorCount = 0;

                for (const survey of selectedSurveys) {
                    try {
                        const response = await fetch(`http://localhost:3001/api/surveys/${survey.id}`, {
                            method: "DELETE",
                            headers: { "Content-Type": "application/json" },
                        });

                        if (response.ok) {
                            deletedCount++;
                        } else {
                            errorCount++;
                            console.error(`Error deleting survey ${survey.id}:`, await response.text());
                        }
                    } catch (err) {
                        errorCount++;
                        console.error(`Error deleting survey ${survey.id}:`, err);
                    }
                }

                setData((prevData) =>
                    prevData.filter((item) => !selectedSurveys.some(s => s.id === item.id))
                );
                setSelectedSurveys([]);
                setLoading(false);

                if (errorCount > 0) {
                    showConfirmModal("Kết quả xóa", `Đã xóa thành công ${deletedCount} khảo sát và thất bại ${errorCount} khảo sát.`, () => { });
                } else {
                    showConfirmModal("Kết quả xóa", `Đã xóa thành công ${deletedCount} khảo sát!`, () => { });
                }
            }
        );
    };

    const handleSelectSurvey = (survey, isSelected) => {
        if (isSelected) {
            setSelectedSurveys(prev => [...prev, survey]);
        } else {
            setSelectedSurveys(prev => prev.filter(s => s.id !== survey.id));
        }
    };

    const handleSelectAll = (isSelected) => {
        if (isSelected) {
            setSelectedSurveys(filteredData);
        } else {
            setSelectedSurveys([]);
        }
    };

    // Tạo danh sách các record từ dữ liệu Excel
    const processExcelData = (rawExcelData, fileName) => {
        const records = [];
        let skippedRows = [];

        for (let i = 0; i < rawExcelData.length; i++) {
            const row = rawExcelData[i];

            // Lấy giá trị identify từ các cột có thể
            let identifyValue = row.identify || row.CCCD || "";

            // Chuyển đổi sang chuỗi và loại bỏ các ký tự không phải số
            identifyValue = String(identifyValue).trim().replace(/[^\d]/g, '');

            // Kiểm tra nếu identify là rỗng sau khi đã xử lý
            if (!identifyValue) {
                console.log(`Dòng ${i + 1}: Bỏ qua do không có CCCD/identify`);
                skippedRows.push(i + 1);
                continue;
            }

            // Chuyển đổi các cột từ Excel thành định dạng API mong muốn
            const record = {
                identify: identifyValue,
                fullname: String(row.fullname || row.Fullname || row["Họ tên"] || "").trim(),
                phone: String(row.phone || row.Phone || row["Số điện thoại"] || "").trim(),
                provinceId: String(row.provinceId || row["provinceId"] || row["Tỉnh/Thành phố"] || "1").trim(),
                districtId: String(row.districtId || row["districtId"] || row["Quận/Huyện"] || "1").trim(),
                wardId: String(row.wardId || row["wardId"] || row["Xã/Phường"] || "12").trim(),
                address: String(row.address || row["Địa chỉ"] || "").trim(),
                purposeLoan: String(row.purposeLoan || row["Mục đích vay"] || "1").trim(),
                description: String(row.description || row["Mô tả"] || "").trim(),
                amountPurpose: String(row.amountPurpose || row["Số tiền cần cho mục đích"] || "0").trim(),
                amountHave: String(row.amountHave || row["Số tiền đã có"] || "0").trim(),
                amountSuggest: String(row.amountSuggest || row["Số tiền đề nghị vay"] || "0").trim(),
                voluntarySaving: String(row.voluntarySaving || row["Tiết kiệm tự nguyện"] || "0").trim(),
                incomeSalary: String(row.incomeSalary || row["Thu nhập khách hàng"] || "0").trim(),
                incomeOther: String(row.incomeOther || row["Thu nhập khác"] || "0").trim(),
                cost: String(row.cost || row["Tổng chi phí"] || "0").trim(),
                rowIndex: i + 1,
                importFileName: fileName,
                listName: fileName.replace(/\.[^/.]+$/, "") // Remove file extension for list name
            };

            // Xử lý đặc biệt cho các số định dạng khoa học (1.23E+11)
            Object.keys(record).forEach(key => {
                const val = record[key];
                if (typeof val === 'string') {
                    if (/^\d+\.\d+e\+\d+$/i.test(val)) {
                        // Xử lý số dạng khoa học
                        record[key] = String(Number(val));
                    } else if (key === 'identify' || key === 'phone') {
                        // Đảm bảo identify và phone chỉ chứa số
                        record[key] = val.replace(/[^\d]/g, '');
                    }
                }
            });

            // Kiểm tra các trường bắt buộc
            if (!record.identify || !record.fullname || record.identify.length === 0 || record.fullname.length === 0) {
                console.log(`Dòng ${i + 1}: Bỏ qua do thiếu thông tin bắt buộc:`, record);
                skippedRows.push(i + 1);
                continue;
            }

            records.push(record);
        }

        return { records, skippedRows };
    };

    const handleFileSelect = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setLoading(true);

        // Reset multiplePreviewData khi chọn file mới
        const newPreviewData = [];

        try {
            // Xử lý từng file một
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const fileName = file.name;

                await new Promise((resolve) => {
                    const reader = new FileReader();

                    reader.onload = (evt) => {
                        try {
                            const bstr = evt.target.result;

                            // Cấu hình XLSX để xử lý tất cả các cột dạng text
                            const wb = XLSX.read(bstr, {
                                type: "binary",
                                cellText: true,
                                cellDates: true
                            });

                            const wsname = wb.SheetNames[0];
                            const ws = wb.Sheets[wsname];

                            // Cấu hình sheet_to_json để xử lý tất cả giá trị dưới dạng text
                            const rawExcelData = XLSX.utils.sheet_to_json(ws, {
                                defval: "",
                                raw: false,
                                blankrows: false,
                                rawNumbers: false
                            });

                            // Xử lý dữ liệu từ Excel
                            const { records, skippedRows } = processExcelData(rawExcelData, fileName);

                            // Thêm vào mảng dữ liệu xem trước
                            newPreviewData.push({
                                fileName,
                                records,
                                rawExcelData,
                                skippedRows
                            });

                            resolve();
                        } catch (error) {
                            console.error(`Error processing Excel file ${fileName}:`, error);
                            resolve();
                        }
                    };

                    reader.readAsBinaryString(file);
                });
            }

            // Cập nhật state với tất cả dữ liệu xem trước
            setMultiplePreviewData(newPreviewData);
            setActivePreviewIndex(0);

            // Hiển thị thông báo xem trước
            const totalRecords = newPreviewData.reduce((sum, data) => sum + data.records.length, 0);
            showConfirmModal(
                "Xem trước dữ liệu",
                `Đã tải lên thành công ${newPreviewData.length} file với tổng cộng ${totalRecords} bản ghi hợp lệ.`,
                () => { }
            );
        } catch (error) {
            console.error("Error reading files:", error);
            showConfirmModal("Lỗi", "Lỗi khi xử lý file Excel. Vui lòng kiểm tra định dạng file.", () => { });
            // Reset input file
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } finally {
            setLoading(false);
        }
    };

    // Xử lý chỉnh sửa một dòng trong dữ liệu xem trước
    const handleEditRow = (rowIndex, updatedData) => {
        if (multiplePreviewData.length === 0 || activePreviewIndex >= multiplePreviewData.length) return;

        setMultiplePreviewData(prevData => {
            const newData = [...prevData];
            const fileData = { ...newData[activePreviewIndex] };

            // Cập nhật record cụ thể
            const recordIndex = fileData.records.findIndex(r => r.rowIndex === rowIndex);
            if (recordIndex !== -1) {
                fileData.records[recordIndex] = { ...fileData.records[recordIndex], ...updatedData };
            }

            newData[activePreviewIndex] = fileData;
            return newData;
        });
    };

    // Xử lý import dữ liệu đã xem trước vào DB
    const handleImportPreviewData = async () => {
        if (multiplePreviewData.length === 0) {
            showConfirmModal("Thông báo", "Không có dữ liệu để import!", () => { });
            return;
        }

        // Tính tổng số bản ghi sẽ được import
        const totalRecords = multiplePreviewData.reduce((sum, data) => sum + data.records.length, 0);

        showConfirmModal(
            "Xác nhận import",
            `Bạn có chắc chắn muốn import ${totalRecords} bản ghi từ ${multiplePreviewData.length} danh sách vào cơ sở dữ liệu?`,
            async () => {
                setLoading(true);
                let success = 0, fail = 0;

                for (const fileData of multiplePreviewData) {
                    for (const record of fileData.records) {
                        try {
                            const payload = {
                                ...record,
                                importFileName: fileData.fileName,
                                listName: fileData.fileName.replace(/\.[^/.]+$/, "") // Tên danh sách là tên file không có phần mở rộng
                            };
                            delete payload.rowIndex; // Xóa trường không cần thiết

                            const response = await fetch("http://localhost:3001/api/surveys", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(payload),
                            });

                            if (response.ok) {
                                success++;
                            } else {
                                console.error(`File ${fileData.fileName}, Dòng ${record.rowIndex}: Lưu thất bại:`, await response.text());
                                fail++;
                            }
                        } catch (err) {
                            console.error(`File ${fileData.fileName}, Dòng ${record.rowIndex}: Lỗi khi lưu:`, err);
                            fail++;
                        }
                    }
                }

                // Reset preview data sau khi import
                setMultiplePreviewData([]);
                setActivePreviewIndex(0);

                // Reset input file
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }

                let message = `Import thành công: ${success} dòng. Thất bại: ${fail} dòng.`;
                showConfirmModal("Kết quả import", message, () => {
                    fetchData(); // Tải lại dữ liệu sau khi import
                });
                setLoading(false);
            }
        );
    };

    // Hủy xem trước và làm sạch dữ liệu
    const handleCancelPreview = () => {
        setMultiplePreviewData([]);
        setActivePreviewIndex(0);

        // Reset input file
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Chuyển đổi giữa các file xem trước
    const handleChangePreviewFile = (index) => {
        if (index >= 0 && index < multiplePreviewData.length) {
            setActivePreviewIndex(index);
        }
    };

    // Chuyển đổi giữa các danh sách trong DB
    const handleChangeDbList = (listName) => {
        setActiveDbListName(listName);
        setSelectedFile(listName);
    };

    const fileNames = Array.from(new Set(data.map(item => item.importFileName).filter(Boolean)));
    const listNames = Array.from(new Set(data.map(item => item.listName).filter(Boolean)));

    // Lọc dữ liệu theo tìm kiếm và file
    const filteredData = useMemo(() => {
        // Nếu đang xem trước dữ liệu Excel, hiển thị dữ liệu xem trước của file hiện tại
        if (multiplePreviewData.length > 0 && activePreviewIndex < multiplePreviewData.length) {
            return multiplePreviewData[activePreviewIndex].records;
        }

        // Nếu không có dữ liệu xem trước, hiển thị dữ liệu từ DB
        let result = data;

        // Lọc theo danh sách/file đã chọn
        if (activeDbListName) {
            result = result.filter(item => item.listName === activeDbListName);
        } else if (selectedFile) {
            result = result.filter(item => item.importFileName === selectedFile || item.listName === selectedFile);
        }

        // Lọc theo ngày tạo
        if (startDate) {
            const startDateTime = new Date(startDate);
            startDateTime.setHours(0, 0, 0, 0); // Đặt thời gian về đầu ngày
            result = result.filter(item => {
                if (!item.createdAt) return false;
                const itemDate = new Date(item.createdAt);
                return itemDate >= startDateTime;
            });
        }

        if (endDate) {
            const endDateTime = new Date(endDate);
            endDateTime.setHours(23, 59, 59, 999); // Đặt thời gian về cuối ngày
            result = result.filter(item => {
                if (!item.createdAt) return false;
                const itemDate = new Date(item.createdAt);
                return itemDate <= endDateTime;
            });
        }

        // Lọc theo từ khóa tìm kiếm
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter(item => {
                return (
                    (item.identify && item.identify.toLowerCase().includes(searchLower)) ||
                    (item.fullname && item.fullname.toLowerCase().includes(searchLower)) ||
                    (item.phone && item.phone.toLowerCase().includes(searchLower)) ||
                    (item.address && item.address.toLowerCase().includes(searchLower)) ||
                    (locationMap.provinces[item.provinceId] && locationMap.provinces[item.provinceId].toLowerCase().includes(searchLower)) ||
                    (locationMap.districts[item.districtId] && locationMap.districts[item.districtId].toLowerCase().includes(searchLower)) ||
                    (locationMap.wards[item.wardId] && locationMap.wards[item.wardId].toLowerCase().includes(searchLower))
                );
            });
        }

        return result;
    }, [data, searchTerm, selectedFile, activeDbListName, locationMap, multiplePreviewData, activePreviewIndex, startDate, endDate]);

    // Format date function
    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN');
    };

    // Format loan purpose
    const formatLoanPurpose = (purposeId) => {
        const purposes = {
            "1": "Mua nhà",
            "2": "Mua xe",
            "3": "Mua sắm",
            "4": "Đầu tư"
        };
        return purposes[purposeId] || purposeId;
    };

    // Format number with thousand separators
    const formatNumber = (value) => {
        if (!value) return '0';
        return Number(value).toLocaleString('en-US');
    };

    const columns = useMemo(() => [
        {
            header: "Thao tác",
            accessorKey: "actions",
            size: 150,
            cell: ({ row }) => {
                // Kiểm tra xem có đang ở chế độ xem trước
                const isPreview = multiplePreviewData.length > 0;

                if (isPreview) {
                    return <span className="text-muted">Xem trước</span>;
                }

                return (
                    <div className="d-flex justify-content-center">
                        <button
                            className="btn fs-4 btn-lg me-2 text-center"
                            onClick={() => handleViewDetail(row.original)}
                            title="Xem chi tiết"
                        >
                            <i className="bi bi-eye text-info"></i>
                        </button>
                        <button
                            className="btn fs-4 btn-lg me-2 text-center"
                            onClick={() => handleEdit(row.original)}
                            title="Chỉnh sửa"
                        >
                            <i className="bi bi-pencil text-primary"></i>
                        </button>
                        <button
                            className="btn fs-4 btn-lg text-center"
                            onClick={() => handleDelete(row.original)}
                            title="Xóa"
                        >
                            <i className="bi bi-trash text-danger"></i>
                        </button>
                    </div>
                );
            },
            enableSorting: false,
        },
        {
            header: "CCCD",
            accessorKey: "identify",
            enableSorting: true,
            size: 80,
        },
        {
            header: "Họ tên",
            accessorKey: "fullname",
            enableSorting: true,
            size: 150,
        },
        {
            header: "Số điện thoại",
            accessorKey: "phone",
            enableSorting: true,
            minSize: 80,
            size: 80,
        },
        {
            header: "Tỉnh/Thành phố",
            accessorKey: "provinceId",
            enableSorting: true,
            cell: ({ getValue }) => locationMap.provinces[getValue()] || getValue(),
            size: 130,
        },
        {
            header: "Xã/Phường",
            accessorKey: "wardId",
            enableSorting: true,
            cell: ({ getValue }) => locationMap.wards[getValue()] || getValue(),
            size: 130,
        },
        {
            header: "Địa chỉ",
            accessorKey: "address",
            enableSorting: true,
            size: 130,
        },
        {
            header: "Mục đích vay",
            accessorKey: "purposeLoan",
            enableSorting: true,
            cell: ({ getValue }) => formatLoanPurpose(getValue()),
            size: 130,
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
            cell: ({ getValue }) => formatNumber(getValue()),
            size: 150,
        },
        {
            header: "Số tiền đã có",
            accessorKey: "amountHave",
            enableSorting: true,
            cell: ({ getValue }) => formatNumber(getValue()),
            size: 150,
        },
        {
            header: "Số tiền đề nghị vay",
            accessorKey: "amountSuggest",
            enableSorting: true,
            cell: ({ getValue }) => formatNumber(getValue()),
            size: 150,
        },
        {
            header: "Tiết kiệm tự nguyện",
            accessorKey: "voluntarySaving",
            enableSorting: true,
            cell: ({ getValue }) => formatNumber(getValue()),
            size: 150,
        },
        {
            header: "Thu nhập khách hàng",
            accessorKey: "incomeSalary",
            enableSorting: true,
            cell: ({ getValue }) => formatNumber(getValue()),
            size: 150,
        },
        {
            header: "Thu nhập khác",
            accessorKey: "incomeOther",
            enableSorting: true,
            cell: ({ getValue }) => formatNumber(getValue()),
            size: 150,
        },
        {
            header: "Tổng chi phí",
            accessorKey: "cost",
            enableSorting: true,
            cell: ({ getValue }) => formatNumber(getValue()),
            size: 150,
        },
        // Chỉ hiển thị ngày tạo/cập nhật nếu không phải dữ liệu xem trước
        ...(multiplePreviewData.length > 0 ? [] : [
            {
                header: "Ngày tạo",
                accessorKey: "createdAt",
                enableSorting: true,
                cell: ({ getValue }) => formatDate(getValue()),
            },
            {
                header: "Cập nhật lần cuối",
                accessorKey: "updatedAt",
                enableSorting: true,
                cell: ({ getValue }) => formatDate(getValue()),
            }
        ])
    ], [multiplePreviewData, activePreviewIndex, locationMap]);

    return (
        <>
            <div className="container mt-4">
                <div className="d-flex justify-content-between mb-4 header-color align-items-center">
                    <h1><strong>DANH SÁCH KHẢO SÁT</strong></h1>
                </div>

                <div className="mb-4">
                    <div className="d-flex gap-2 align-items-center">

                        <div className="input-group" style={{ maxWidth: 500 }}>
                            <label className="input-group-text btn btn-success btn-lg border rounded" htmlFor="fileInput">
                                <i className="bi bi-file-earmark-text me-2"></i>
                                Chọn file Excel
                            </label>
                            {multiplePreviewData.length > 0 ? (
                                <div className="d-flex ms-2 gap-2">
                                    <button
                                        className="btn btn-success"
                                        onClick={handleImportPreviewData}
                                    >
                                        <i className="bi bi-cloud-upload fs-5 me-1"></i> Import vào DB
                                    </button>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={handleCancelPreview}
                                    >
                                        <i className="bi bi-x-circle fs-5 me-1"></i> Hủy
                                    </button>
                                </div>
                            ) : null}
                            <input
                                id="fileInput"
                                type="file"
                                accept=".xlsx, .xls"
                                multiple
                                onChange={handleFileSelect}
                                className="form-control"
                                ref={fileInputRef}
                                hidden
                            />
                        </div>

                    </div>
                </div>

                {/* Tabs cho nhiều file xem trước hoặc danh sách DB */}
                {multiplePreviewData.length > 0 && (
                    <div className="mb-3">
                        <ul className="nav nav-tabs">
                            {multiplePreviewData.map((fileData, index) => (
                                <li className="nav-item" key={index}>
                                    <button
                                        className={`nav-link ${activePreviewIndex === index ? 'active' : ''}`}
                                        onClick={() => handleChangePreviewFile(index)}
                                    >
                                        {fileData.fileName} ({fileData.records.length})
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Tabs cho các danh sách trong DB */}
                {multiplePreviewData.length === 0 && listNames.length > 0 && (
                    <div className="mb-3">
                        <ul className="nav nav-tabs">
                            <li className="nav-item fs-4">
                                <button
                                    className={`nav-link ${activeDbListName === '' ? 'active' : ''}`}
                                    onClick={() => handleChangeDbList('')}
                                >
                                    Tất cả
                                </button>
                            </li>
                            {listNames.map((listName) => (
                                <li className="nav-item fs-4" key={listName}>
                                    <button
                                        className={`nav-link ${activeDbListName === listName ? 'active' : ''}`}
                                        onClick={() => handleChangeDbList(listName)}
                                    >
                                        {listName} ({data.filter(item => item.listName === listName).length})
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Thông báo chế độ xem trước */}

                {/* Thông báo danh sách DB đang xem */}


                {/* Thanh tìm kiếm - vô hiệu hóa khi đang xem trước */}
                <div className="mb-4">
                    <div className="input-group">
                        <input
                            type="text"
                            className="form-control form-control-lg"
                            placeholder="Tìm kiếm theo CCCD, tên, SĐT, địa chỉ..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            disabled={multiplePreviewData.length > 0}
                        />
                        <button
                            className="btn btn-primary"
                            type="button"
                            disabled={multiplePreviewData.length > 0}
                        >
                            <i className="bi bi-search fs-5"></i> Tìm kiếm
                        </button>
                    </div>

                    {/* Bộ lọc theo ngày */}
                    {multiplePreviewData.length === 0 && (
                        <div className="mt-3 row align-items-center">
                            <div className="col-md-5">
                                <div className="input-group">
                                    <span className="input-group-text bg-primary text-white">
                                        <i className="bi bi-calendar-event me-1"></i>
                                        Từ ngày
                                    </span>
                                    <input
                                        type="date"
                                        className="form-control form-control-lg"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="col-md-5">
                                <div className="input-group">
                                    <span className="input-group-text bg-primary text-white">
                                        <i className="bi bi-calendar-event me-1"></i>
                                        Đến ngày
                                    </span>
                                    <input
                                        type="date"
                                        className="form-control form-control-lg"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="col-md-2">
                                <button
                                    className="btn btn-outline-secondary btn-lg w-100"
                                    onClick={() => {
                                        setStartDate("");
                                        setEndDate("");
                                    }}
                                    disabled={!startDate && !endDate}
                                >
                                    <i className="bi bi-x-circle me-1"></i>
                                    Xóa bộ lọc
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="mt-2 text-muted">
                        Tìm thấy {filteredData.length} khảo sát
                        {(startDate || endDate) && (
                            <span>
                                {startDate && !endDate && ` từ ngày ${new Date(startDate).toLocaleDateString('vi-VN')}`}
                                {!startDate && endDate && ` đến ngày ${new Date(endDate).toLocaleDateString('vi-VN')}`}
                                {startDate && endDate && ` từ ngày ${new Date(startDate).toLocaleDateString('vi-VN')} đến ngày ${new Date(endDate).toLocaleDateString('vi-VN')}`}
                            </span>
                        )}
                    </div>
                </div>

                {/* Bulk actions section - chỉ hiển thị khi không ở chế độ xem trước */}
                {selectedSurveys.length > 0 && multiplePreviewData.length === 0 && (
                    <div className="d-flex justify-content-between mb-3 align-items-center bg-light p-2 rounded">
                        <div className="fs-5">
                            <strong>Đã chọn {selectedSurveys.length} khảo sát</strong>
                        </div>
                        <button
                            className="btn btn-danger btn-lg fs-5"
                            onClick={handleDeleteSelected}
                        >
                            <i className="bi bi-trash me-2"></i>
                            Xóa các mục đã chọn
                        </button>
                    </div>
                )}

                {loading ? <LoadingOverlay /> : (
                    <SurveyTable
                        data={filteredData}
                        columns={columns}
                        selectedSurveys={selectedSurveys}
                        onSelectSurvey={handleSelectSurvey}
                        onSelectAll={handleSelectAll}
                        isEditing={false}
                        onEditRow={handleEditRow}
                    />
                )}
            </div>
            <EditSurveyModal
                show={showModal}
                survey={editingSurvey}
                onClose={handleCloseModal}
                onSave={handleSave}
            />
            <ConfirmModal
                show={confirmModal.show}
                title={confirmModal.title}
                message={confirmModal.message}
                onConfirm={() => {
                    confirmModal.onConfirm(confirmModal.data);
                    handleCloseConfirmModal();
                }}
                onCancel={handleCloseConfirmModal}
            />
            <SurveyDetail
                survey={viewingSurvey}
                onClose={handleCloseDetailModal}
                locationMap={locationMap}
            />
        </>
    );
}

export default SurveyList;
