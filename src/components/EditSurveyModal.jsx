import React, { useState, useEffect } from "react";

const EditSurveyModal = ({ show, survey, onClose, onSave }) => {
    const [form, setForm] = useState({});
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    useEffect(() => {
        setForm(survey || {});
    }, [survey]);

    // Load provinces khi mở popup
    useEffect(() => {
        if (show) {
            fetch("https://provinces.open-api.vn/api/?depth=3")
                .then(res => res.json())
                .then(data => setProvinces(data));
        }
    }, [show]);

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
        setForm({ ...form, provinceId: code, districtId: "", wardId: "" });
    };

    // Khi chọn huyện
    const handleDistrictChange = (e) => {
        const code = e.target.value;
        const district = districts.find((d) => d.code.toString() === code);
        setWards(district ? district.wards : []);
        setForm({ ...form, districtId: code, wardId: "" });
    };

    // Khi chọn xã
    const handleWardChange = (e) => {
        setForm({ ...form, wardId: e.target.value });
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
                                        name="identify"
                                        value={form.identify || ""}
                                        onChange={handleChange}
                                        placeholder="CCCD"
                                    />
                                </div>
                                <div className="col-md-6 mb-4">
                                    <span className="fw-bold mt-4 fs-5 text-secondary">Họ tên</span>
                                    <input
                                        className="form-control fs-4"
                                        name="fullname"
                                        value={form.fullname || ""}
                                        onChange={handleChange}
                                        placeholder="Họ tên"
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-4">
                                    <span className="fw-bold mt-4 fs-5 text-secondary">Số điện thoại</span>
                                    <input
                                        className="form-control fs-4"
                                        type="number"
                                        name="phone"
                                        value={form.phone || ""}
                                        onChange={handleChange}
                                        placeholder="Số điện thoại"
                                    />
                                </div>
                                <div className="col-md-6 mb-4">
                                    <span className="fw-bold mt-4 fs-5 text-secondary">Tỉnh/Thành phố</span>
                                    <select
                                        className="form-select fs-4"
                                        name="provinceId"
                                        value={form.provinceId || ""}
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
                                    <span className="fw-bold mt-4 fs-5 text-secondary">Phường/Xã</span>
                                    <select
                                        className="form-select fs-4"
                                        name="wardId"
                                        value={form.wardId || ""}
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
                                        name="address"
                                        value={form.address || ""}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="row">

                                <div className="col-md-6 mb-4">
                                    <span className="fw-bold mt-4 fs-5 text-secondary">Mục đích vay</span>
                                    <select
                                        className="form-select fs-4"
                                        name="purposeLoan"
                                        value={form.purposeLoan || ""}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-md-6 mb-4">
                                    <span className="fw-bold mt-4 fs-5 text-secondary">Số tiền cần cho mục đích</span>
                                    <input
                                        className="form-control fs-4 text-end"
                                        name="amountPurpose"
                                        value={formatNumber(form.amountPurpose) || ""}
                                        onChange={handleMoneyInput}
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="mb-4">
                                    <span className="fw-bold mt-4 fs-5 text-secondary">Mô tả</span>
                                    <input
                                        className="form-control fs-4"
                                        name="description"
                                        value={form.description || ""}
                                        onChange={handleChange}
                                    />
                                </div>

                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-4">
                                    <span className="fw-bold mt-4 fs-5 text-secondary">Số tiền đã có</span>
                                    <input
                                        className="form-control fs-4 text-end"
                                        name="amountHave"
                                        value={formatNumber(form.amountHave) || ""}
                                        onChange={handleMoneyInput}
                                    />
                                </div>
                                <div className="col-md-6 mb-4">
                                    <span className="fw-bold mt-4 fs-5 text-secondary">Số tiền đề nghị vay</span>
                                    <input
                                        className="form-control fs-4 text-end"
                                        name="amountSuggest"
                                        value={formatNumber(form.amountSuggest) || ""}
                                        onChange={handleMoneyInput}
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-4">
                                    <span className="fw-bold mt-4 fs-5 text-secondary">Tiết kiệm tự nguyện</span>
                                    <input
                                        className="form-control fs-4 text-end"
                                        name="voluntarySaving"
                                        value={formatNumber(form.voluntarySaving) || ""}
                                        onChange={handleMoneyInput}
                                    />
                                </div>
                                <div className="col-md-6 mb-4">
                                    <span className="fw-bold mt-4 fs-5 text-secondary">Thu nhập khách hàng</span>
                                    <input
                                        className="form-control fs-4 text-end"
                                        name="incomeSalary"
                                        value={formatNumber(form.incomeSalary) || ""}
                                        onChange={handleMoneyInput}
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-4">
                                    <span className="fw-bold mt-4 fs-5 text-secondary">Thu nhập khác</span>
                                    <input
                                        className="form-control fs-4 text-end"
                                        name="incomeOther"
                                        value={formatNumber(form.incomeOther) || ""}
                                        onChange={handleMoneyInput}
                                    />
                                </div>
                                <div className="col-md-6 mb-4">
                                    <span className="fw-bold mt-4 fs-5 text-secondary">Tổng chi phí</span>
                                    <input
                                        className="form-control fs-4 text-end"
                                        name="cost"
                                        value={formatNumber(form.cost) || ""}
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