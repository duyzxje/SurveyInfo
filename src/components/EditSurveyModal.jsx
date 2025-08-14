import React, { useState, useEffect } from "react";

const EditSurveyModal = ({ show, survey, onClose, onSave }) => {
    const [form, setForm] = useState({});
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    // Danh sách mục đích vay có sẵn
    const loanPurposes = [
        "Mua nhà",
        "Mua xe",
        "Mua sắm",
        "Đầu tư",
        "Sửa nhà",
        "Chi tiêu cá nhân",
        "Đóng học phí",
        "Khám chữa bệnh"
    ];

    // State để kiểm soát hiển thị danh sách gợi ý cho mục đích vay
    const [showPurposeSuggestions, setShowPurposeSuggestions] = useState(false);
    const [filteredPurposes, setFilteredPurposes] = useState([]);

    // Hàm xử lý khi người dùng nhập vào mục đích vay
    const handlePurposeInputChange = (e) => {
        const value = e.target.value;
        setForm({ ...form, LoanPurposeName: value });

        // Lọc danh sách gợi ý dựa trên giá trị đã nhập
        if (value.trim() === '') {
            setFilteredPurposes(loanPurposes);
        } else {
            const filtered = loanPurposes.filter(purpose =>
                purpose.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredPurposes(filtered);
        }

        // Hiển thị danh sách gợi ý
        setShowPurposeSuggestions(true);
    };

    // Hàm xử lý khi người dùng chọn một mục đích vay từ danh sách
    const selectPurpose = (purpose) => {
        setForm({ ...form, LoanPurposeName: purpose });
        setShowPurposeSuggestions(false);
    };

    useEffect(() => {
        // Khởi tạo danh sách gợi ý
        setFilteredPurposes(loanPurposes);

        // Chuyển đổi giá trị purposeLoan nếu là số sang văn bản
        if (survey && survey.LoanPurposeName) {
            let purposeValue = survey.LoanPurposeName;

            // Nếu purposeLoan là số, chuyển thành văn bản tương ứng
            if (!isNaN(purposeValue)) {
                const purposeMap = {
                    "1": "Mua nhà",
                    "2": "Mua xe",
                    "3": "Mua sắm",
                    "4": "Đầu tư"
                };
                purposeValue = purposeMap[purposeValue] || purposeValue;
            }

            const newForm = { ...survey, LoanPurposeName: purposeValue };
            setForm(newForm);
        } else {
            setForm(survey || {});
        }
    }, [survey]);

    // Load provinces khi mở popup
    useEffect(() => {
        if (show) {
            fetch("https://provinces.open-api.vn/api/?depth=3")
                .then(res => res.json())
                .then(data => setProvinces(data));
        }
    }, [show]);

    // Khi đã có provinces và form.provinceId, tự động set districts
    useEffect(() => {
        if (provinces.length && form.PermanentProvinceId) {
            const province = provinces.find((p) => p.code.toString() === form.PermanentProvinceId.toString());
            setDistricts(province ? province.districts : []);
        } else {
            setDistricts([]);
        }
    }, [provinces, form.PermanentProvinceId]);

    // Khi đã có districts và form.districtId, tự động set wards
    useEffect(() => {
        if (districts.length && form.PermanentDistrictId) {
            const district = districts.find((d) => d.code.toString() === form.PermanentDistrictId.toString());
            setWards(district ? district.wards : []);
        } else {
            setWards([]);
        }
    }, [districts, form.PermanentDistrictId]);

    // Format number with thousand separators
    const formatNumber = (value) => {
        if (!value) return '';
        return Number(value).toLocaleString('en-US');
    };

    // Khi chọn tỉnh
    const handleProvinceChange = (e) => {
        const code = e.target.value;
        const province = provinces.find((p) => p.code.toString() === code);
        setDistricts(province ? province.districts : []);
        setWards([]);
        setForm({ ...form, PermanentProvinceId: code, PermanentDistrictId: "", PermanentWardId: "" });
    };

    // Khi chọn huyện
    const handleDistrictChange = (e) => {
        const code = e.target.value;
        const district = districts.find((d) => d.code.toString() === code);
        setWards(district ? district.wards : []);
        setForm({ ...form, PermanentDistrictId: code, PermanentWardId: "" });
    };

    // Khi chọn xã
    const handleWardChange = (e) => {
        setForm({ ...form, PermanentWardId: e.target.value });
    };

    if (!show) return null;

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Handle money input fields
    const handleMoneyInput = (e) => {
        const raw = e.target.value.replace(/\D/g, '');
        setForm({ ...form, [e.target.name]: raw });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(form);
    };

    return (
        <div className="modal show" style={{ display: "block", background: "#00000080" }}>
            <div className="modal-dialog" style={{ top: "20px" }}>
                <form onSubmit={handleSubmit}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Chỉnh sửa khảo sát</h5>
                            <button type="button" className="btn-close" onClick={onClose}></button>
                        </div>
                        <div className="modal-body fs-5 text-secondary">
                            <div className="row">
                                <div className="col-md-6 mb-4">
                                    <span className="fw-bold mt-4">CCCD</span>
                                    <input
                                        className="form-control fs-4"
                                        name="IdentifyNumber"
                                        value={form.IdentifyNumber || ""}
                                        onChange={handleChange}
                                        placeholder="CCCD"
                                    />
                                </div>
                                <div className="col-md-6 mb-4">
                                    <span className="fw-bold mt-4 fs-5 text-secondary">Họ tên</span>
                                    <input
                                        className="form-control fs-4"
                                        name="Fullname"
                                        value={form.Fullname || ""}
                                        onChange={handleChange}
                                        placeholder="Họ tên"
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-4">
                                    <span className="fw-bold mt-4 fs-5 text-secondary">Ngày sinh</span>
                                    <input
                                        className="form-control fs-4"
                                        type="date"
                                        name="DateOfBirth"
                                        value={form.DateOfBirth || ""}
                                        onChange={handleChange}
                                        placeholder="Ngày sinh"
                                    />
                                </div>
                                <div className="col-md-6 mb-4">
                                    <span className="fw-bold mt-4 fs-5 text-secondary">Số điện thoại</span>
                                    <input
                                        className="form-control fs-4"
                                        type="number"
                                        name="Phone"
                                        value={form.Phone || ""}
                                        onChange={handleChange}
                                        placeholder="Số điện thoại"
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-4">
                                    <span className="fw-bold mt-4 fs-5 text-secondary">Tỉnh/Thành phố</span>
                                    <select
                                        className="form-select fs-4"
                                        name="PermanentProvinceId"
                                        value={form.PermanentProvinceId || ""}
                                        onChange={handleProvinceChange}
                                    >
                                        <option value="">-- Chọn Tỉnh/Thành phố --</option>
                                        {provinces.map((p) => (
                                            <option key={p.code} value={p.code}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-4">
                                    <span className="fw-bold mt-4 fs-5 text-secondary">Quận/Huyện</span>
                                    <select
                                        className="form-select fs-4"
                                        name="PermanentDistrictId"
                                        value={form.PermanentDistrictId || ""}
                                        onChange={handleDistrictChange}
                                        disabled={!districts.length}
                                    >
                                        <option value="">-- Chọn Quận/Huyện --</option>
                                        {districts.map((d) => (
                                            <option key={d.code} value={d.code}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-6 mb-4">
                                    <span className="fw-bold mt-4 fs-5 text-secondary">Phường/Xã</span>
                                    <select
                                        className="form-select fs-4"
                                        name="PermanentWardId"
                                        value={form.PermanentWardId || ""}
                                        onChange={handleWardChange}
                                        disabled={!wards.length}
                                    >
                                        <option value="">-- Chọn Xã/Phường/Thị trấn --</option>
                                        {wards.map((w) => (
                                            <option key={w.code} value={w.code}>{w.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-6 mb-4">
                                    <span className="fw-bold mt-4 fs-5 text-secondary">Địa chỉ</span>
                                    <input
                                        className="form-control fs-4"
                                        name="PermanentAddress"
                                        value={form.PermanentAddress || ""}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-4">
                                    <span className="fw-bold mt-4 fs-5 text-secondary">Mục đích vay</span>
                                    <div className="position-relative">
                                        <input
                                            className="form-control fs-4"
                                            name="LoanPurposeName"
                                            value={form.LoanPurposeName || ""}
                                            onChange={handlePurposeInputChange}
                                            onFocus={() => setShowPurposeSuggestions(true)}
                                            onBlur={() => {
                                                // Delay để cho phép click vào suggestion hoạt động
                                                setTimeout(() => setShowPurposeSuggestions(false), 200);
                                            }}
                                            placeholder="Nhập hoặc chọn mục đích vay"
                                        />
                                        {showPurposeSuggestions && filteredPurposes.length > 0 && (
                                            <div className="position-absolute w-100 bg-white border rounded shadow-sm mt-1 z-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                                {filteredPurposes.map((purpose, index) => (
                                                    <div
                                                        key={index}
                                                        className="p-2 fs-4 border-bottom cursor-pointer hover-bg-light"
                                                        style={{ cursor: 'pointer' }}
                                                        onMouseDown={() => selectPurpose(purpose)}
                                                    >
                                                        {purpose}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="col-md-6 mb-4">
                                    <span className="fw-bold mt-4 fs-5 text-secondary">Số tiền cần cho mục đích</span>
                                    <input
                                        className="form-control fs-4 text-end"
                                        name="PurposeAmount"
                                        value={formatNumber(form.PurposeAmount) || ""}
                                        onChange={handleMoneyInput}
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-4">
                                    <span className="fw-bold mt-4 fs-5 text-secondary">Mô tả</span>
                                    <input
                                        className="form-control fs-4"
                                        name="Description"
                                        value={form.Description || ""}
                                        onChange={handleChange}
                                    />
                                </div>

                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-4">
                                    <span className="fw-bold mt-4 fs-5 text-secondary">Số tiền cần cho mục đích</span>
                                    <input
                                        className="form-control fs-4 text-end"
                                        name="PurposeAmount"
                                        value={formatNumber(form.PurposeAmount) || ""}
                                        onChange={handleMoneyInput}
                                    />
                                </div>
                                <div className="col-md-6 mb-4">
                                    <span className="fw-bold mt-4 fs-5 text-secondary">Số tiền đã có</span>
                                    <input
                                        className="form-control fs-4 text-end"
                                        name="HaveAmount"
                                        value={formatNumber(form.HaveAmount) || ""}
                                        onChange={handleMoneyInput}
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-4">
                                    <span className="fw-bold mt-4 fs-5 text-secondary">Số tiền đề nghị vay</span>
                                    <input
                                        className="form-control fs-4 text-end"
                                        name="LoanAmountSuggest"
                                        value={formatNumber(form.LoanAmountSuggest) || ""}
                                        onChange={handleMoneyInput}
                                    />
                                </div>
                                <div className="col-md-6 mb-4">
                                    <span className="fw-bold mt-4 fs-5 text-secondary">Tiết kiệm tự nguyện</span>
                                    <input
                                        className="form-control fs-4 text-end"
                                        name="VoluntaryDepositAmount"
                                        value={formatNumber(form.VoluntaryDepositAmount) || ""}
                                        onChange={handleMoneyInput}
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-4">
                                    <span className="fw-bold mt-4 fs-5 text-secondary">Thu nhập khách hàng</span>
                                    <input
                                        className="form-control fs-4 text-end"
                                        name="IncomeSalary"
                                        value={formatNumber(form.IncomeSalary) || ""}
                                        onChange={handleMoneyInput}
                                    />
                                </div>
                                <div className="col-md-6 mb-4">
                                    <span className="fw-bold mt-4 fs-5 text-secondary">Thu nhập khác</span>
                                    <input
                                        className="form-control fs-4 text-end"
                                        name="IncomeOther"
                                        value={formatNumber(form.IncomeOther) || ""}
                                        onChange={handleMoneyInput}
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-4">
                                    <span className="fw-bold mt-4 fs-5 text-secondary">Tổng chi phí</span>
                                    <input
                                        className="form-control fs-4 text-end"
                                        name="Cost"
                                        value={formatNumber(form.Cost) || ""}
                                        onChange={handleMoneyInput}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary btn-lg fs-4" onClick={onClose}>Đóng</button>
                            <button type="submit" className="btn btn-primary btn-lg fs-4">Lưu</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditSurveyModal; 