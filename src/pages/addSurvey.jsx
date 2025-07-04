import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import LoadingOverlay from "../components/loadingOverlay";
function AddSurvey() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        identify: "",
        fullname: "",
        phone: "",
        provinceId: "",
        wardId: "",
        address: "",
        purposeLoan: "",
        description: "",
        amountPurpose: "",
        amountHave: "",
        amountSuggest: "",
        voluntarySaving: "",
        incomeSalary: "",
        incomeOther: "",
        cost: "",
        districtId: ""

    });

    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    // Fetch provinces list once
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const res = await axios.get("https://provinces.open-api.vn/api/?depth=3");
                setProvinces(res.data);
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
        setFormData({ ...formData, provinceId: code, districtId: "", wardId: "" });
    };

    const handleDistrictChange = (e) => {
        const code = e.target.value;
        const district = districts.find((d) => d.code.toString() === code);
        setWards(district ? district.wards : []);
        setFormData({ ...formData, districtId: code, wardId: "" });
    };

    const handleWardChange = (e) => {
        const code = e.target.value;
        setFormData({ ...formData, wardId: code });
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
            const res = await axios.post("http://localhost:3001/api/surveys", formData);
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
                <form onSubmit={handleSubmit}>
                    <div className="form-group p-4 mb-4 rounded border-primary shadow">
                        <h2 className="mb-4 text-primary">Thông tin cá nhân</h2>
                        <div className="row">
                            <div className="col-12 col-md-6 col-lg-4 mb-3">
                                <label className="fs-4 text-muted" htmlFor="identify">CCCD:</label>
                                <input type="number" min={0} className="form-control fs-4 mb-2 border rounded border-primary " id="identify" value={formData.identify}
                                    onChange={handleIdentifyChange} required />
                                {identifyError && <small className="text-danger fs-5">{identifyError}</small>}
                            </div>
                            <div className="col-12 col-md-6 col-lg-4 mb-3">
                                <label className="fs-4 text-muted" htmlFor="fullname">Họ và tên:</label>
                                <input type="text" className="form-control fs-4 mb-2border rounded border-primary" id="fullname" value={formData.fullname} onChange={handleChange} required />
                            </div>
                            <div className="col-12 col-md-6 col-lg-4 mb-3">
                                <label className="fs-4 text-muted" htmlFor="phone">Số điện thoại:</label>
                                <input type="number" min={0} className="form-control fs-4 mb-2border rounded border-primary" id="phone" value={formData.phone}
                                    onChange={handlePhoneChange} required />
                                {phoneError && <small className="text-danger fs-5">{phoneError}</small>}
                            </div>
                            <div className="col-12 col-md-6 col-lg-4 mb-3">
                                <label className="fs-4 text-muted" htmlFor="provinceId">Tỉnh/Thành Phố:</label>
                                <select id="provinceId" className="form-control fs-4 border rounded border-primary" value={formData.provinceId} onChange={handleProvinceChange} required>
                                    <option value="">-- Chọn Tỉnh/Thành phố --</option>
                                    {provinces.map((p) => (
                                        <option key={p.code} value={p.code}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-12 col-md-6 col-lg-4 mb-3">
                                <label className="fs-4 text-muted" htmlFor="districtId">Quận/Huyện:</label>
                                <select id="districtId" className="form-control fs-4 border rounded border-primary" value={formData.districtId} onChange={handleDistrictChange} required disabled={!districts.length} >
                                    <option value="">-- Chọn Quận/Huyện --</option>
                                    {districts.map((d) => (
                                        <option key={d.code} value={d.code}>{d.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-12 col-md-6 col-lg-4 mb-3">
                                <label className="fs-4 text-muted" htmlFor="wardId">Xã/Phường/Thị trấn:</label>
                                <select id="wardId" className="form-control fs-4 border rounded border-primary" value={formData.wardId} onChange={handleWardChange} required disabled={!wards.length}>
                                    <option value="">-- Chọn Xã/Phường/Thị trấn --</option>
                                    {wards.map((w) => (
                                        <option key={w.code} value={w.code}>{w.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-12 col-md-6 col-lg-4 mb-3">
                                <label className="fs-4 text-muted" htmlFor="address">Địa chỉ:</label>
                                <input type="text" className="form-control fs-4 mb-2border rounded border-primary" id="address" value={formData.address} onChange={handleChange} required />
                            </div>
                        </div>
                    </div>
                    <div className="form-group p-4 mb-4 rounded border-primary shadow">
                        <h2 className="mb-4 text-primary">Thông tin khảo sát</h2>
                        <div className="row">
                            <div className="col-12 col-md-6 col-lg-4 mb-3">
                                <label className="fs-4 text-muted" htmlFor="purposeLoan">Mục đích vay:</label>
                                <select id="purposeLoan" className="form-control fs-4 border rounded border-primary" value={formData.purposeLoan} onChange={handleChange} required>
                                    <option value="">-- Chọn mục đích vay --</option>
                                    <option value={1}>Mua nhà</option>
                                    <option value={2}>Mua xe</option>
                                    <option value={3}>Mua sắm</option>
                                    <option value={4}>Đầu tư</option>
                                </select>
                            </div>
                            <div className="col-12 col-md-6 col-lg-4 mb-3">
                                <label className="fs-4 text-muted" htmlFor="description">Mô tả:</label>
                                <input type="text" className="form-control fs-4 mb-2border rounded border-primary" id="description" value={formData.description} onChange={handleChange} required />
                            </div>
                            <div className="col-12 col-md-6 col-lg-4 mb-3">
                                <label className="fs-4 text-muted" htmlFor="amountPurpose">Số tiền cần cho mục đích:</label>
                                <div className="input-group">
                                    <input type="text" min="0" className="form-control fs-4 text-end border rounded border-primary" id="amountPurpose" value={formatNumber(formData.amountPurpose)} onChange={handleMoneyInput} required />
                                    <span className="input-group-text">₫</span>
                                </div>
                                {AmountSuggestError && <small className="text-danger fs-5">{AmountSuggestError}</small>}
                            </div>
                            <div className="col-12 col-md-6 col-lg-4 mb-3">
                                <label className="fs-4 text-muted" htmlFor="amountHave">Số tiền đã có:</label>
                                <div className="input-group">
                                    <input type="text" min="0" className="form-control fs-4 text-end border rounded border-primary" id="amountHave" value={formatNumber(formData.amountHave)} onChange={handleMoneyInput} required />
                                    <span className="input-group-text">₫</span>
                                </div>
                                {AmountSuggestError && <small className="text-danger fs-5">{AmountSuggestError}</small>}
                            </div>
                            <div className="col-12 col-md-6 col-lg-4 mb-3">
                                <label className="fs-4 text-muted" htmlFor="amountSuggest">Số tiền đề nghị vay:</label>
                                <div className="input-group">
                                    <input type="text" min="0" className="form-control fs-4 text-end border rounded border-primary" id="amountSuggest" value={formatNumber(formData.amountSuggest)} onChange={handleMoneyInput} required />
                                    <span className="input-group-text">₫</span>
                                </div>
                                {AmountSuggestError && <small className="text-danger fs-5">{AmountSuggestError}</small>}
                            </div>
                            <div className="col-12 col-md-6 col-lg-4 mb-3">
                                <label className="fs-4 text-muted" htmlFor="voluntarySaving">Tiết kiệm tự nguyện:</label>
                                <div className="input-group">
                                    <input type="text" min="0" className="form-control fs-4 text-end border rounded border-primary" id="voluntarySaving" value={formatNumber(formData.voluntarySaving)} onChange={handleMoneyInput} required />
                                    <span className="input-group-text">₫</span>
                                </div>
                                {VoluntarySavingError && <small className="text-danger fs-5">{VoluntarySavingError}</small>}
                            </div>
                            <div className="col-12 col-md-6 col-lg-4 mb-3">
                                <label className="fs-4 text-muted" htmlFor="incomeSalary">Thu nhập khách hàng:</label>
                                <div className="input-group">
                                    <input type="text" min="0" className="form-control fs-4 text-end border rounded border-primary" id="incomeSalary" value={formatNumber(formData.incomeSalary)} onChange={handleMoneyInput} required />
                                    <span className="input-group-text">₫</span>
                                </div>
                                {IncomeError && <small className="text-danger fs-5">{IncomeError}</small>}
                            </div>
                            <div className="col-12 col-md-6 col-lg-4 mb-3">
                                <label className="fs-4 text-muted" htmlFor="incomeOther">Thu nhập khác:</label>
                                <div className="input-group">
                                    <input type="text" min="0" className="form-control fs-4 text-end border rounded border-primary" id="incomeOther" value={formatNumber(formData.incomeOther)} onChange={handleMoneyInput} required />
                                    <span className="input-group-text">₫</span>
                                </div>
                                {IncomeError && <small className="text-danger fs-5">{IncomeError}</small>}
                            </div>
                            <div className="col-12 col-md-6 col-lg-4 mb-3">
                                <label className="fs-4 text-muted" htmlFor="cost">Tổng chi phí:</label>
                                <div className="input-group">
                                    <input type="text" min="0" className="form-control fs-4 text-end border rounded border-primary" id="cost" value={formatNumber(formData.cost)} onChange={handleMoneyInput} required />
                                    <span className="input-group-text">₫</span>
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
