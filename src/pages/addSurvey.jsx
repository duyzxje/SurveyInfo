import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import LoadingOverlay from "../components/loadingOverlay";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "../contexts/AuthContext";
function AddSurvey() {
    const navigate = useNavigate();
    const { token } = useAuth();

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

    const [formData, setFormData] = useState({
        identify: '',
        fullname: '',
        dateOfBirth: '',
        phone: '',
        provinceId: '',
        districtId: '',
        wardId: '',
        address: '',
        purposeLoan: '',
        description: '',
        amountPurpose: '',
        amountHave: '',
        amountSuggest: '',
        voluntarySaving: '',
        incomeSalary: '',
        incomeOther: '',
        cost: '',
    });

    // State để kiểm soát hiển thị danh sách gợi ý cho mục đích vay
    const [showPurposeSuggestions, setShowPurposeSuggestions] = useState(false);
    const [filteredPurposes, setFilteredPurposes] = useState([]);

    // Hàm xử lý khi người dùng nhập vào mục đích vay
    const handlePurposeInputChange = (e) => {
        const value = e.target.value;
        setFormData({ ...formData, LoanPurposeName: value });

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
        setFormData({ ...formData, LoanPurposeName: purpose });
        setShowPurposeSuggestions(false);
    };

    // Khởi tạo danh sách gợi ý khi component được tạo
    useEffect(() => {
        setFilteredPurposes(loanPurposes);
    }, []);

    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    // Fetch provinces list once
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const response = await fetch("https://provinces.open-api.vn/api/?depth=3");
                const data = await response.json();
                setProvinces(data);
            } catch (err) {
                console.error("Cannot fetch VN provinces", err);
            }
        };
        fetchProvinces();
    }, []);

    const handleProvinceChange = (e) => {
        const code = e.target.value;
        const province = provinces.find((p) => p.code.toString() === code);
        setDistricts(province ? province.districts : []);
        setWards([]);
        setFormData({ ...formData, PermanentProvinceId: code, PermanentDistrictId: "", PermanentWardId: "" });
    };

    const handleDistrictChange = (e) => {
        const code = e.target.value;
        const district = districts.find((d) => d.code.toString() === code);
        setWards(district ? district.wards : []);
        setFormData({ ...formData, PermanentDistrictId: code, PermanentWardId: "" });
    };

    const handleWardChange = (e) => {
        const code = e.target.value;
        setFormData({ ...formData, PermanentWardId: code });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (identifyError || phoneError) {
            alert("Submission failed! CCCD hoặc số điện thoại chưa đúng!")
            return;
        }

        setIsSubmitting(true);

        try {
            // Chuẩn bị dữ liệu cho API
            const preparedData = {
                IdentifyNumber: formData.identify,
                Fullname: formData.fullname,
                DateOfBirth: formData.dateOfBirth,
                Phone: formData.phone,
                PermanentProvinceId: formData.provinceId,
                PermanentDistrictId: formData.districtId,
                PermanentWardId: formData.wardId,
                PermanentAddress: formData.address,
                LoanPurposeName: formData.purposeLoan,
                Description: formData.description,
                PurposeAmount: formData.amountPurpose.replace(/,/g, ''),
                HaveAmount: formData.amountHave.replace(/,/g, ''),
                LoanAmountSuggest: formData.amountSuggest.replace(/,/g, ''),
                VoluntaryDepositAmount: formData.voluntarySaving.replace(/,/g, ''),
                IncomeSalary: formData.incomeSalary.replace(/,/g, ''),
                IncomeOther: formData.incomeOther.replace(/,/g, ''),
                Cost: formData.cost.replace(/,/g, '')
            };
            const response = await fetch(`${API_BASE_URL}/Loans/GetCustomerForCreateDocument`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(preparedData)
            });

            if (!response.ok) {
                throw new Error('Không thể gửi khảo sát');
            }

            const res = await response.json();
            alert("Form submitted successfully!");
            navigate(`/success/${res.data.id}`);
            console.log(res.data);
        } catch (err) {
            console.error(err);
            alert("Submission failed!");
        } finally {
            setIsSubmitting(false);
        }
    };

    const [identifyError, setIdentifyError] = useState('');
    const handleIdentifyChange = (e) => {
        handleChange(e);
        const identify = e.target.value;
        // Validate realtime
        if (identify.length > 0 && identify[0] != 0) {
            setIdentifyError('Số đầu phải là số 0')
        } else if (identify.length > 0 && identify.length > 12) {
            setIdentifyError('Lớn hơn 12 số,CCCD chỉ được phép 12 số');
        } else if (identify.length > 0 && identify.length < 12) {
            setIdentifyError('CCCD là 12 số');
        } else {
            setIdentifyError('');
        }
    };

    const [phoneError, setPhoneError] = useState();
    const handlePhoneChange = (e) => {
        handleChange(e);
        const phone = e.target.value;
        if (phone.length > 0 && phone[0] != 0) {
            setPhoneError('Số đầu phải là số 0')
        } else if (phone.length > 0 && phone.length < 10) {
            setPhoneError('Số điện thoại là 10 chữ số')
        } else if (phone.length > 10) {
            setPhoneError('Quá 10 chữ số, Số điện thoại là 10 chữ số')
        } else {
            setPhoneError('')
        }
    }
    const formatNumber = (value) => {
        const numeric = value;
        if (!numeric) return '';
        return Number(numeric).toLocaleString('en-US');
    };
    const handleMoneyInput = (e) => {
        const raw = e.target.value.replace(/\D/g, '');
        setFormData({ ...formData, [e.target.id]: raw });
    };

    const [AmountSuggestError, setAmountSuggestError] = useState();
    const [VoluntarySavingError, setVoluntarySavingError] = useState();
    const [IncomeError, setIncomeError] = useState();

    useEffect(() => {
        const suggest = parseFloat(formData.amountSuggest) || 0;
        const have = parseFloat(formData.amountHave) || 0;
        const purpose = parseFloat(formData.amountPurpose) || 0;
        const saving = parseFloat(formData.voluntarySaving) || 0;
        const income = (parseFloat(formData.incomeSalary) || 0) + (parseFloat(formData.incomeOther) || 0);
        const cost = parseFloat(formData.cost) || 0;
        const monthlyDebt = suggest / 12;

        if (suggest.length == 0 && suggest > purpose - have) {
            setAmountSuggestError("Số tiền đề nghị vay vượt quá phần còn thiếu.");
        } else if (have + suggest < purpose) {
            setAmountSuggestError("Tổng tiền không đủ cho mục đích vay.");
        } else {
            setAmountSuggestError("");
        }

        if (saving < 0.1 * suggest) {
            setVoluntarySavingError("Tiết kiệm tự nguyện nên ≥ 10% số tiền vay.");
        } else {
            setVoluntarySavingError("");
        }

        if (income < cost + monthlyDebt) {
            setIncomeError("Thu nhập không đủ để chi trả và trả nợ.");
        } else {
            setIncomeError("");
        }
    }, [formData.amountSuggest, formData.amountHave, formData.amountPurpose, formData.voluntarySaving, formData.incomeSalary, formData.incomeOther, formData.cost]);


    const [isSubmitting, setIsSubmitting] = useState(false);

    return (
        <>
            {isSubmitting && <LoadingOverlay />}
            <div className="container mt-4">
                <div className="d-flex justify-content-center mb-4 header-color">
                    <h1><strong>THÔNG TIN KHẢO SÁT</strong></h1>
                </div>
                <form onSubmit={handleSubmit} className="border rounded mb-4 shadow">
                    <div className="form-group p-4 mb-4 rounded border-primary shadow">
                        <h2 className="mb-4 text-primary">Thông tin cá nhân</h2>
                        <div className="row">
                            <div className="col-12 col-md-6 col-lg-4 mb-3">
                                <label className="fs-4 text-muted" htmlFor="identify">CCCD:</label>

                                <input type="number" min={0} className={`form-control fs-4 mb-2 border rounded ${identifyError ? 'border-danger' : 'border-success'}`} id="identify" value={formData.identify}
                                    onChange={handleIdentifyChange} required />
                                {identifyError && <small className="text-danger fs-5">{identifyError}</small>}
                            </div>
                            <div className="col-12 col-md-6 col-lg-4 mb-3">
                                <label className="fs-4 text-muted" htmlFor="fullname">Họ và tên:</label>
                                <input type="text" className="form-control fs-4 mb-2border rounded border-success" id="fullname" value={formData.fullname} onChange={handleChange} required />
                            </div>
                            <div className="col-12 col-md-6 col-lg-4 mb-3">
                                <label className="fs-4 text-muted" htmlFor="dateOfBirth">Ngày sinh:</label>
                                <input type="date" className="form-control fs-4 mb-2border rounded border-success" id="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required />
                            </div>
                            <div className="col-12 col-md-6 col-lg-4 mb-3">
                                <label className="fs-4 text-muted" htmlFor="phone">Số điện thoại:</label>
                                <input type="number" min={0} className={`form-control fs-4 mb-2border rounded ${phoneError ? 'border-danger' : 'border-success'}`} id="phone" value={formData.phone}
                                    onChange={handlePhoneChange} required />
                                {phoneError && <small className="text-danger fs-5">{phoneError}</small>}
                            </div>
                            <div className="col-12 col-md-6 col-lg-4 mb-3">
                                <label className="fs-4 text-muted" htmlFor="provinceId">Tỉnh/Thành Phố:</label>
                                <select id="provinceId" className="form-control fs-4 border rounded border-success" value={formData.provinceId} onChange={handleProvinceChange} required>
                                    <option value="" className="">-- Chọn Tỉnh/Thành phố --</option>
                                    {provinces.map((p) => (
                                        <option key={p.code} value={p.code}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-12 col-md-6 col-lg-4 mb-3">
                                <label className="fs-4 text-muted" htmlFor="districtId">Quận/Huyện:</label>
                                <select id="districtId" className="form-control fs-4 border rounded border-success" value={formData.districtId} onChange={handleDistrictChange} required disabled={!districts.length} >
                                    <option value="">-- Chọn Quận/Huyện --</option>
                                    {districts.map((d) => (
                                        <option key={d.code} value={d.code}>{d.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-12 col-md-6 col-lg-4 mb-3">
                                <label className="fs-4 text-muted" htmlFor="wardId">Xã/Phường/Thị trấn:</label>
                                <select id="wardId" className="form-control fs-4 border rounded border-success" value={formData.wardId} onChange={handleWardChange} required disabled={!wards.length}>
                                    <option value="">-- Chọn Xã/Phường/Thị trấn --</option>
                                    {wards.map((w) => (
                                        <option key={w.code} value={w.code}>{w.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-12 col-md-6 col-lg-4 mb-3">
                                <label className="fs-4 text-muted" htmlFor="address">Địa chỉ:</label>
                                <input type="text" className="form-control fs-4 mb-2border rounded border-success" id="address" value={formData.address} onChange={handleChange} required />
                            </div>
                        </div>
                    </div>
                    <div className="form-group p-4 mb-4 rounded border-primary">
                        <h2 className="mb-4 text-primary">Thông tin khảo sát</h2>
                        <div className="row">
                            <div className="col-12 col-md-6 col-lg-4 mb-3">
                                <label className="fs-4 text-muted" htmlFor="purposeLoan">Mục đích vay:</label>
                                <div className="position-relative">
                                    <input
                                        type="text"
                                        className="form-control fs-4 border rounded border-success"
                                        id="purposeLoan"
                                        value={formData.purposeLoan}
                                        onChange={handlePurposeInputChange}
                                        onFocus={() => setShowPurposeSuggestions(true)}
                                        onBlur={() => {
                                            // Delay để cho phép click vào suggestion hoạt động
                                            setTimeout(() => setShowPurposeSuggestions(false), 200);
                                        }}
                                        placeholder="Nhập hoặc chọn mục đích vay"
                                        required
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
                            <div className="col-12 col-md-6 col-lg-4 mb-3">
                                <label className="fs-4 text-muted" htmlFor="description">Mô tả:</label>
                                <input type="text" className="form-control fs-4 mb-2border rounded border-success" id="description" value={formData.description} onChange={handleChange} required />
                            </div>
                            <div className="col-12 col-md-6 col-lg-4 mb-3">
                                <label className="fs-4 text-muted" htmlFor="amountPurpose">Số tiền cần cho mục đích:</label>
                                <div className={`input-group fs-4 text-end border rounded ${AmountSuggestError ? 'border-danger' : 'border-success'}`}>
                                    <input type="text" min="0" className="form-control fs-4 text-end" id="amountPurpose" value={formatNumber(formData.amountPurpose)} onChange={handleMoneyInput} required />
                                    <span className="input-group-text bg-white">₫</span>
                                </div>
                                {AmountSuggestError && <small className="text-danger fs-5">{AmountSuggestError}</small>}
                            </div>
                            <div className="col-12 col-md-6 col-lg-4 mb-3">
                                <label className="fs-4 text-muted" htmlFor="amountHave">Số tiền đã có:</label>
                                <div className={`input-group fs-4 text-end border rounded ${AmountSuggestError ? 'border-danger' : 'border-success'}`}>
                                    <input type="text" min="0" className="form-control fs-4 text-end" id="amountHave" value={formatNumber(formData.amountHave)} onChange={handleMoneyInput} required />
                                    <span className="input-group-text bg-white">₫</span>
                                </div>
                                {AmountSuggestError && <small className="text-danger fs-5">{AmountSuggestError}</small>}
                            </div>
                            <div className="col-12 col-md-6 col-lg-4 mb-3">
                                <label className="fs-4 text-muted" htmlFor="amountSuggest">Số tiền đề nghị vay:</label>
                                <div className={`input-group fs-4 text-end border rounded ${AmountSuggestError ? 'border-danger' : 'border-success'}`}>
                                    <input type="text" min="0" className="form-control fs-4 text-end" id="amountSuggest" value={formatNumber(formData.amountSuggest)} onChange={handleMoneyInput} required />
                                    <span className="input-group-text bg-white">₫</span>
                                </div>
                                {AmountSuggestError && <small className="text-danger fs-5">{AmountSuggestError}</small>}
                            </div>
                            <div className="col-12 col-md-6 col-lg-4 mb-3">
                                <label className="fs-4 text-muted" htmlFor="voluntarySaving">Tiết kiệm tự nguyện:</label>
                                <div className={`input-group fs-4 text-end border rounded ${VoluntarySavingError ? 'border-danger' : 'border-success'}`}>
                                    <input type="text" min="0" className="form-control fs-4 text-end" id="voluntarySaving" value={formatNumber(formData.voluntarySaving)} onChange={handleMoneyInput} required />
                                    <span className="input-group-text bg-white">₫</span>
                                </div>
                                {VoluntarySavingError && <small className="text-danger fs-5">{VoluntarySavingError}</small>}
                            </div>
                            <div className="col-12 col-md-6 col-lg-4 mb-3">
                                <label className="fs-4 text-muted" htmlFor="incomeSalary">Thu nhập khách hàng:</label>
                                <div className={`input-group fs-4 text-end border rounded ${IncomeError ? 'border-danger' : 'border-success'}`}>
                                    <input type="text" min="0" className="form-control fs-4 text-end" id="incomeSalary" value={formatNumber(formData.incomeSalary)} onChange={handleMoneyInput} required />
                                    <span className="input-group-text bg-white">₫</span>
                                </div>
                                {IncomeError && <small className="text-danger fs-5">{IncomeError}</small>}
                            </div>
                            <div className="col-12 col-md-6 col-lg-4 mb-3">
                                <label className="fs-4 text-muted" htmlFor="incomeOther">Thu nhập khác:</label>
                                <div className={`input-group fs-4 text-end border rounded ${IncomeError ? 'border-danger' : 'border-success'}`}>
                                    <input type="text" min="0" className="form-control fs-4 text-end" id="incomeOther" value={formatNumber(formData.incomeOther)} onChange={handleMoneyInput} required />
                                    <span className="input-group-text bg-white">₫</span>
                                </div>
                                {IncomeError && <small className="text-danger fs-5">{IncomeError}</small>}
                            </div>
                            <div className="col-12 col-md-6 col-lg-4 mb-3">
                                <label className="fs-4 text-muted" htmlFor="cost">Tổng chi phí:</label>
                                <div className={`input-group fs-4 text-end border rounded ${IncomeError ? 'border-danger' : 'border-success'}`}>
                                    <input type="text" min="0" className="form-control fs-4 text-end" id="cost" value={formatNumber(formData.cost)} onChange={handleMoneyInput} required />
                                    <span className="input-group-text bg-white">₫</span>
                                </div>
                                {IncomeError && <small className="text-danger fs-5">{IncomeError}</small>}
                            </div>
                        </div>
                    </div>
                    <div className="d-flex justify-content-center">
                        <button type="submit" className="btn btn-primary btn-lg mb-4" disabled={isSubmitting}>
                            {isSubmitting && (
                                <span
                                    className="spinner-border spinner-border-sm me-2"
                                    role="status"
                                    aria-hidden="true"
                                ></span>
                            )}
                            {isSubmitting ? 'Đang gửi...' : 'Gửi khảo sát'}</button>
                    </div>
                </form>
            </div>
        </>
    );
}

export default AddSurvey;
