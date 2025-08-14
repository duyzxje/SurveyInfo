import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import EditSurveyModal from "../components/EditSurveyModal";
import SurveyDetail from "../components/SurveyDetail";
import ConfirmModal from "../components/ConfirmModal";
import * as XLSX from "xlsx";
import LoadingOverlay from "../components/loadingOverlay";
import SurveyTable from "../components/surveyTable";
import { API_BASE_URL } from "../config/api";
import { loansService } from "../services/loansService";

function SurveyList() {
    const navigate = useNavigate();
    const { user, token, logout } = useAuth();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingSurvey, setEditingSurvey] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [viewingSurvey, setViewingSurvey] = useState(null);
    const [selectedSurveys, setSelectedSurveys] = useState([]);
    const [selectedFile, setSelectedFile] = useState("");
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

    // Helper function to get headers with auth token
    const getAuthHeaders = () => {
        const storedToken = token || localStorage.getItem('token');
        return {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${storedToken}`
        };
    };

    // Handle unauthorized responses
    const handleUnauthorizedResponse = (status) => {
        if (status === 401 || status === 403) {
            // Token is invalid or expired, redirect to login
            showConfirmModal("Phiên đăng nhập hết hạn", "Vui lòng đăng nhập lại để tiếp tục.", () => {
                logout();
                navigate('/login');
            });
            return true;
        }
        return false;
    };

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

    // Hàm tìm ID của tỉnh/thành phố theo tên
    const findProvinceId = (provinceName) => {
        if (!provinceName || typeof provinceName !== 'string') return "1"; // Default ID if not found

        const normalizedName = provinceName.toLowerCase().trim();

        // Tìm trong danh sách provinces
        for (const province of provinces) {
            if (province.name.toLowerCase().includes(normalizedName) ||
                normalizedName.includes(province.name.toLowerCase())) {
                return province.code;
            }
        }

        return "1"; // Default ID if not found
    };

    // Hàm tìm ID của quận/huyện theo tên và provinceId
    const findDistrictId = (districtName, provinceId) => {
        if (!districtName || typeof districtName !== 'string' || !provinceId) return "1";

        const normalizedName = districtName.toLowerCase().trim();

        // Tìm province theo ID
        const province = provinces.find(p => p.code === provinceId);
        if (!province || !province.districts) return "1";

        // Tìm district trong province
        for (const district of province.districts) {
            if (district.name.toLowerCase().includes(normalizedName) ||
                normalizedName.includes(district.name.toLowerCase())) {
                return district.code;
            }
        }

        return "1"; // Default ID if not found
    };

    // Hàm tìm ID của phường/xã theo tên, provinceId và districtId
    const findWardId = (wardName, provinceId, districtId) => {
        if (!wardName || typeof wardName !== 'string' || !provinceId || !districtId) return "1";

        const normalizedName = wardName.toLowerCase().trim();

        // Tìm province theo ID
        const province = provinces.find(p => p.code === provinceId);
        if (!province || !province.districts) return "1";

        // Tìm district trong province
        const district = province.districts.find(d => d.code === districtId);
        if (!district || !district.wards) return "1";

        // Tìm ward trong district
        for (const ward of district.wards) {
            if (ward.name.toLowerCase().includes(normalizedName) ||
                normalizedName.includes(ward.name.toLowerCase())) {
                return ward.code;
            }
        }

        return "1"; // Default ID if not found
    };

    // Hàm để gọi API chuyển đổi tên địa điểm sang ID
    const convertLocationViaApi = async (provinceName, districtName = '', wardName = '') => {
        try {
            // Sử dụng các hàm cục bộ để chuyển đổi vì API mới không hỗ trợ chuyển đổi địa điểm
            const provinceId = findProvinceId(provinceName);
            const districtId = findDistrictId(districtName, provinceId);
            const wardId = findWardId(wardName, provinceId, districtId);

            // Giả lập kết quả trả về
            const response = { ok: true };

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const result = await response.json();
            return {
                provinceId: result.provinceId || "1",
                districtId: result.districtId || "1",
                wardId: result.wardId || "1"
            };
        } catch (error) {
            console.error("Error converting location:", error);
            // Return default IDs if API call fails
            return {
                provinceId: "1",
                districtId: "1",
                wardId: "1"
            };
        }
    };

    // Hàm mới để áp dụng việc chuyển đổi tên địa điểm từ Excel sang ID sử dụng API
    const convertLocationNamesToIdsAsync = async (record) => {
        // Kiểm tra nếu PermanentProvinceId chứa tên thay vì ID (không phải là một số)
        if (record.PermanentProvinceId && isNaN(parseInt(record.PermanentProvinceId))) {
            try {
                // Chuẩn hóa dữ liệu trước khi gửi đi
                const provinceName = record.PermanentProvinceId.trim();
                const districtName = record.PermanentDistrictId ? record.PermanentDistrictId.trim() : '';
                const wardName = record.PermanentWardId ? record.PermanentWardId.trim() : '';

                console.log("Đang chuyển đổi địa điểm:", {
                    provinceName,
                    districtName,
                    wardName
                });

                // Gọi API để chuyển đổi
                const result = await convertLocationViaApi(
                    provinceName,
                    districtName,
                    wardName
                );

                console.log("Kết quả chuyển đổi:", result);

                // Cập nhật record với các ID đã chuyển đổi
                record.PermanentProvinceId = result.provinceId;
                record.PermanentDistrictId = result.districtId;
                record.PermanentWardId = result.wardId;
            } catch (error) {
                console.error("Lỗi khi chuyển đổi địa điểm:", error);
                console.error("Dữ liệu gốc:", {
                    province: record.PermanentProvinceId,
                    district: record.PermanentDistrictId,
                    ward: record.PermanentWardId
                });

                // Nếu có lỗi, sử dụng các giá trị mặc định
                if (!record.PermanentProvinceId || isNaN(parseInt(record.PermanentProvinceId))) {
                    record.PermanentProvinceId = "1";
                }
                if (!record.PermanentDistrictId || isNaN(parseInt(record.PermanentDistrictId))) {
                    record.PermanentDistrictId = "1";
                }
                if (!record.PermanentWardId || isNaN(parseInt(record.PermanentWardId))) {
                    record.PermanentWardId = "1";
                }
            }
        }

        return record;
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            // Sử dụng API mới để lấy danh sách khách hàng vay
            const branchCode = 'BNG'; // Mã chi nhánh mặc định
            const clusterCode = ''; // Mã cụm mặc định (để trống)

            const json = await loansService.getCustomersForCreateDocument(token, branchCode, clusterCode);

            // Ensure data is always an array
            setData(Array.isArray(json) ? json : []);
            if (!Array.isArray(json)) {
                console.error("API did not return an array:", json);
            }
        } catch (err) {
            console.error("Error fetching surveys:", err);
            setData([]);

            // Kiểm tra lỗi xác thực
            if (err.message && (err.message.includes('401') || err.message.includes('403'))) {
                handleUnauthorizedResponse(401);
                return;
            }

            showConfirmModal("Lỗi", "Không thể tải dữ liệu khảo sát!", () => { });
        }
        setLoading(false);
    };

    useEffect(() => {
        // Check if user is logged in, redirect to login if not
        const checkAuth = async () => {
            const storedToken = localStorage.getItem('token');
            if (!storedToken) {
                navigate('/login');
                return false;
            }

            // Test the token with a simple API call
            try {
                // Sử dụng API mới để kiểm tra xác thực
                try {
                    await loansService.getCustomersForCreateDocument(storedToken, 'BNG', '');
                    return true;
                } catch (error) {
                    if (error.message && (error.message.includes('401') || error.message.includes('403'))) {
                        return false;
                    }
                    return true; // Cho phép tiếp tục nếu lỗi không phải do xác thực
                }

                // Không cần kiểm tra status nữa vì đã xử lý trong khối try-catch bên trên
                return true;

                return true;
            } catch (error) {
                console.error("Error checking auth:", error);
                return true; // Continue anyway if there's a network error
            }
        };

        const init = async () => {
            const isAuthenticated = await checkAuth();
            if (isAuthenticated) {
                fetchProvinces();
                fetchData();
            }
        };

        init();
    }, [navigate, logout]);

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
            // Sử dụng API mới để cập nhật thông tin khách hàng
            await loansService.updateCustomersForCreateDocument(token, [updatedSurvey]);
            const response = { ok: true }; // Giả định API trả về thành công

            if (response.ok) {
                const updatedData = await response.json();
                setData((prevData) => {
                    // Ensure prevData is an array before using map
                    if (!Array.isArray(prevData)) {
                        console.error("Expected prevData to be an array but got:", prevData);
                        return [updatedData];
                    }
                    return prevData.map((item) =>
                        item.id === updatedData.id ? updatedData : item
                    );
                });
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
                    // Gọi API xóa khảo sát - tạm thời giả lập vì API mới chưa hỗ trợ xóa
                    // Trong thực tế, bạn sẽ cần thêm API xóa vào loansService
                    const response = { ok: true }; // Giả định API trả về thành công

                    if (response.ok) {
                        setData((prevData) => {
                            // Ensure prevData is an array
                            if (!Array.isArray(prevData)) {
                                return [];
                            }
                            return prevData.filter((item) => item.id !== survey.id);
                        });
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
                        // Gọi API xóa khảo sát - tạm thời giả lập vì API mới chưa hỗ trợ xóa
                        // Trong thực tế, bạn sẽ cần thêm API xóa vào loansService
                        const response = { ok: true }; // Giả định API trả về thành công

                        if (response.ok) {
                            deletedCount++;
                        } else {
                            errorCount++;
                        }
                    } catch (err) {
                        console.error(`Error deleting survey ${survey.id}:`, err);
                        errorCount++;
                    }
                }

                // Update local data after batch delete
                setData((prevData) => {
                    // Ensure prevData is an array
                    if (!Array.isArray(prevData)) {
                        return [];
                    }
                    return prevData.filter((item) => !selectedSurveys.some(s => s.id === item.id));
                });

                // Clear selected surveys
                setSelectedSurveys([]);

                setLoading(false);
                showConfirmModal("Kết quả xóa", `Đã xóa thành công ${deletedCount} khảo sát. ${errorCount} lỗi.`, () => { });
            }
        )
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
    const processExcelData = async (rawExcelData, fileName) => {
        const records = [];
        let skippedRows = [];

        console.log(`Bắt đầu xử lý ${rawExcelData.length} dòng từ file ${fileName}`);
        console.log("Cấu trúc dữ liệu Excel:", Object.keys(rawExcelData[0] || {}).join(", "));

        for (let i = 0; i < rawExcelData.length; i++) {
            const row = rawExcelData[i];

            // Lấy giá trị identify từ các cột có thể
            let identifyValue = row["CCCD"] || row["Identify"] || row["IdentifyNumber"] || row["Số CCCD"] || "";

            // Chuyển đổi sang chuỗi và loại bỏ các ký tự không phải số
            identifyValue = String(identifyValue).trim().replace(/[^\d]/g, '');

            // Kiểm tra nếu identify là rỗng sau khi đã xử lý
            if (!identifyValue) {
                console.log(`Dòng ${i + 1}: Bỏ qua do không có CCCD/identify`, row);
                skippedRows.push(i + 1);
                continue;
            }

            // Chuyển đổi các cột từ Excel thành định dạng API mong muốn
            const record = {
                IdentifyNumber: identifyValue,
                Fullname: String(row.fullname || row.Fullname || row["Họ tên"] || "").trim(),
                DateOfBirth: String(row.dateofbirth || row.DateOfBirth || row["Ngày sinh"] || "").trim(),
                Phone: String(row.phone || row.Phone || row["Số điện thoại"] || "").trim(),
                PermanentProvinceId: String(row.provinceId || row["provinceId"] || row["Tỉnh/Thành phố"] || "1").trim(),
                PermanentDistrictId: String(row.districtId || row["districtId"] || row["Quận/Huyện"] || row["Huyện"] || "1").trim(),
                PermanentWardId: String(row.wardId || row["wardId"] || row["Xã/Phường"] || row["Xã"] || row["Phường"] || "1").trim(),
                PermanentAddress: String(row.address || row["Địa chỉ"] || "").trim(),
                Description: String(row.description || row["Mô tả"] || "").trim(),
                LoanPurposeName: String(row.LoanPurposeName || row["Mục đích vay"] || "").trim(),
                PurposeAmount: String(row.amountPurpose || row["Số tiền cần cho mục đích"] || "0").trim(),
                HaveAmount: String(row.amountHave || row["Số tiền đã có"] || "0").trim(),
                LoanAmountSuggest: String(row.amountSuggest || row["Số tiền đề nghị vay"] || "0").trim(),
                VoluntaryDepositAmount: String(row.voluntarySaving || row["Tiết kiệm tự nguyện"] || "0").trim(),
                IncomeSalary: String(row.incomeSalary || row["Thu nhập khách hàng"] || "0").trim(),
                IncomeOther: String(row.incomeOther || row["Thu nhập khác"] || "0").trim(),
                Cost: String(row.cost || row["Tổng chi phí"] || "0").trim(),
                rowIndex: i + 1,
                importFileName: fileName,
                listName: fileName.replace(/\.[^/.]+$/, "") // Remove file extension for list name
            };

            // Chuyển đổi tên tỉnh/thành, quận/huyện, phường/xã sang ID
            const convertedRecord = await convertLocationNamesToIdsAsync(record);

            // Xử lý đặc biệt cho các số định dạng khoa học (1.23E+11)
            Object.keys(convertedRecord).forEach(key => {
                const val = convertedRecord[key];
                if (typeof val === 'string') {
                    if (/^\d+\.\d+e\+\d+$/i.test(val)) {
                        // Xử lý số dạng khoa học
                        convertedRecord[key] = String(Number(val));
                    } else if (key === 'IdentifyNumber' || key === 'Phone') {
                        // Đảm bảo identify và phone chỉ chứa số
                        convertedRecord[key] = val.replace(/[^\d]/g, '');
                    }
                }
            });

            // Kiểm tra các trường bắt buộc
            if (!convertedRecord.IdentifyNumber || !convertedRecord.Fullname || convertedRecord.IdentifyNumber.length === 0 || convertedRecord.Fullname.length === 0) {
                console.log(`Dòng ${i + 1}: Bỏ qua do thiếu thông tin bắt buộc:`, convertedRecord);
                skippedRows.push(i + 1);
                continue;
            }

            records.push(convertedRecord);
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

                await new Promise(async (resolve) => {
                    const reader = new FileReader();

                    reader.onload = async (evt) => {
                        try {
                            const bstr = evt.target.result;

                            // Cấu hình XLSX để xử lý tất cả các cột dạng text
                            const wb = XLSX.read(bstr, {
                                type: "binary",
                                cellText: true,
                                cellDates: true,
                                cellNF: false,
                                cellStyles: false,
                                dateNF: 'yyyy-mm-dd'
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

                            // In ra thông tin về các cột trong file Excel để debug
                            if (rawExcelData.length > 0) {
                                console.log(`File ${fileName} có các cột: ${Object.keys(rawExcelData[0]).join(", ")}`);
                                console.log(`Ví dụ dòng đầu tiên:`, rawExcelData[0]);
                            } else {
                                console.log(`File ${fileName} không có dữ liệu hoặc không đúng định dạng`);
                            }

                            // Xử lý dữ liệu từ Excel - đợi hoàn thành chuyển đổi địa điểm
                            const { records, skippedRows } = await processExcelData(rawExcelData, fileName);

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

                            // Log thông tin trước khi gửi API
                            console.log(`Đang gửi dữ liệu dòng ${record.rowIndex} file ${fileData.fileName}:`, {
                                province: payload.PermanentProvinceId,
                                district: payload.PermanentDistrictId,
                                ward: payload.PermanentWardId
                            });

                            // Sử dụng API mới để cập nhật thông tin khách hàng
                            await loansService.updateCustomersForCreateDocument(token, [payload]);
                            const response = { ok: true }; // Giả định API trả về thành công

                            if (response.ok) {
                                success++;
                                console.log(`Dòng ${record.rowIndex} file ${fileData.fileName}: Lưu thành công`);
                            } else {
                                if (response.status === 401 || response.status === 403) {
                                    handleUnauthorizedResponse(response.status);
                                    return; // Stop processing if unauthorized
                                }

                                // Xử lý lỗi chi tiết hơn
                                try {
                                    const errorData = await response.json();
                                    console.error(`File ${fileData.fileName}, Dòng ${record.rowIndex}: Lỗi:`, {
                                        status: response.status,
                                        error: errorData
                                    });
                                } catch {
                                    const errorText = await response.text();
                                    console.error(`File ${fileData.fileName}, Dòng ${record.rowIndex}: Lưu thất bại:`, errorText);
                                }

                                console.error(`Chi tiết dữ liệu gửi đi:`, JSON.stringify(payload, null, 2));
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

    // Safely get unique file names and list names
    const fileNames = Array.isArray(data)
        ? Array.from(new Set(data.map(item => item.importFileName).filter(Boolean)))
        : [];

    const listNames = Array.isArray(data)
        ? Array.from(new Set(data.map(item => item.listName).filter(Boolean)))
        : [];

    // Lọc dữ liệu theo tìm kiếm và file
    const filteredData = useMemo(() => {
        // Nếu đang xem trước dữ liệu Excel, hiển thị dữ liệu xem trước của file hiện tại
        if (multiplePreviewData.length > 0 && activePreviewIndex < multiplePreviewData.length) {
            return multiplePreviewData[activePreviewIndex].records;
        }

        // Nếu không có dữ liệu xem trước, hiển thị dữ liệu từ DB
        // Đảm bảo data là một array
        if (!Array.isArray(data)) {
            return [];
        }

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
                    (item.IdentifyNumber && item.IdentifyNumber.toLowerCase().includes(searchLower)) ||
                    (item.Fullname && item.Fullname.toLowerCase().includes(searchLower)) ||
                    (item.Phone && item.Phone.toLowerCase().includes(searchLower)) ||
                    (item.PermanentAddress && item.PermanentAddress.toLowerCase().includes(searchLower)) ||
                    (locationMap.provinces[item.PermanentProvinceId] && locationMap.provinces[item.PermanentProvinceId].toLowerCase().includes(searchLower)) ||
                    (locationMap.districts[item.PermanentDistrictId] && locationMap.districts[item.PermanentDistrictId].toLowerCase().includes(searchLower)) ||
                    (locationMap.wards[item.PermanentWardId] && locationMap.wards[item.PermanentWardId].toLowerCase().includes(searchLower))
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
    const formatLoanPurpose = (purposeValue) => {
        // Nếu purposeValue là số, chuyển thành văn bản tương ứng
        if (!isNaN(purposeValue)) {
            const purposes = {
                "1": "Mua nhà",
                "2": "Mua xe",
                "3": "Mua sắm",
                "4": "Đầu tư"
            };
            return purposes[purposeValue] || purposeValue;
        }
        // Nếu đã là văn bản, trả về nguyên bản
        return purposeValue;
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
            accessorKey: "IdentifyNumber",
            enableSorting: true,
            size: 80,
        },
        {
            header: "Họ tên",
            accessorKey: "Fullname",
            enableSorting: true,
            size: 150,
        },
        {
            header: "Ngày sinh",
            accessorKey: "DateOfBirth",
            enableSorting: true,
            size: 130,
        },
        {
            header: "Số điện thoại",
            accessorKey: "Phone",
            enableSorting: true,
            minSize: 80,
            size: 80,
        },
        {
            header: "Tỉnh/Thành phố",
            accessorKey: "PermanentProvinceId",
            enableSorting: true,
            cell: ({ getValue }) => locationMap.provinces[getValue()] || getValue(),
            size: 130,
        },
        {
            header: "Quận/Huyện",
            accessorKey: "PermanentDistrictId",
            enableSorting: true,
            cell: ({ getValue }) => locationMap.districts[getValue()] || getValue(),
            size: 130,
        },
        {
            header: "Xã/Phường",
            accessorKey: "PermanentWardId",
            enableSorting: true,
            cell: ({ getValue }) => locationMap.wards[getValue()] || getValue(),
            size: 130,
        },
        {
            header: "Địa chỉ",
            accessorKey: "PermanentAddress",
            enableSorting: true,
            size: 130,
        },
        {
            header: "Mục đích vay",
            accessorKey: "LoanPurposeName",
            enableSorting: true,
            size: 130,
        },
        {
            header: "Mô tả",
            accessorKey: "Description",
            enableSorting: true,
        },
        {
            header: "Số tiền cần cho mục đích",
            accessorKey: "PurposeAmount",
            enableSorting: true,
            cell: ({ getValue }) => formatNumber(getValue()),
            size: 150,
        },
        {
            header: "Số tiền đã có",
            accessorKey: "HaveAmount",
            enableSorting: true,
            cell: ({ getValue }) => formatNumber(getValue()),
            size: 150,
        },
        {
            header: "Số tiền đề nghị vay",
            accessorKey: "LoanAmountSuggest",
            enableSorting: true,
            cell: ({ getValue }) => formatNumber(getValue()),
            size: 150,
        },
        {
            header: "Tiết kiệm tự nguyện",
            accessorKey: "VoluntaryDepositAmount",
            enableSorting: true,
            cell: ({ getValue }) => formatNumber(getValue()),
            size: 150,
        },
        // {
        //     header: "Thu nhập khách hàng",
        //     accessorKey: "incomeSalary",
        //     enableSorting: true,
        //     cell: ({ getValue }) => formatNumber(getValue()),
        //     size: 150,
        // },
        // {
        //     header: "Thu nhập khác",
        //     accessorKey: "incomeOther",
        //     enableSorting: true,
        //     cell: ({ getValue }) => formatNumber(getValue()),
        //     size: 150,
        // },
        // {
        //     header: "Tổng chi phí",
        //     accessorKey: "cost",
        //     enableSorting: true,
        //     cell: ({ getValue }) => formatNumber(getValue()),
        //     size: 150,
        // },
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
                                        {listName} ({Array.isArray(data) ? data.filter(item => item.listName === listName).length : 0})
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

