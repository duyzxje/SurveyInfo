
import { useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

function Survey() {
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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post("https://api_dev12.cep.org.vn:8456/api/Loans/SurveyInfo", formData);
            alert("Form submitted successfully!");
            navigate(`/success`, { state: formData });
            console.log(res.data);
        } catch (err) {
            console.error(err);
            alert("Submission failed!");
        }
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-center"><img src="/assets/img/logo.png" alt="Logo" /></div>
            <div className="d-flex justify-content-center">
                <h1><strong>THÔNG TIN KHẢO SÁT</strong></h1>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="form-group border border-dark rounded p-4 mb-4">
                    <h2>Thông tin cá nhân</h2>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label htmlFor="identify">CCCD:</label>
                            <input type="text" className="form-control mb-2" id="identify" value={formData.identify} onChange={handleChange} required />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label htmlFor="fullname">Họ và tên:</label>
                            <input type="text" className="form-control mb-2" id="fullname" value={formData.fullname} onChange={handleChange} required />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label htmlFor="phone">Số điện thoại:</label>
                            <input type="number" min="0" className="form-control mb-2" id="phone" value={formData.phone} onChange={handleChange} required />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label htmlFor="city">Tỉnh/Thành Phố</label>
                            <select id="provinceId" className="form-control" value={formData.provinceId} onChange={handleChange} required>
                                <option value="">-- Chọn Tỉnh/Thành phố --</option>
                                <option value="HCM">HCM</option>
                            </select>
                        </div>
                        <div className="col-md-6 mb-3">
                            <label htmlFor="subDistrict">Xã/phường/thị trấn</label>
                            <select id="wardId" className="form-control" value={formData.wardId} onChange={handleChange} required>
                                <option value="">-- Chọn xã/phường/thị trấn --</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                            </select>
                        </div>
                        <div className="col-md-6 mb-3">
                            <label htmlFor="address">Địa chỉ:</label>
                            <input type="text" className="form-control mb-2" id="address" value={formData.address} onChange={handleChange} required />
                        </div>
                    </div>
                </div>
                <div className="form-group border border-dark rounded p-4 mb-4">
                    <h2>Thông tin khảo sát</h2>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label htmlFor="purposeLoan">Mục đích vay:</label>
                            <select id="purposeLoan" className="form-control" value={formData.purposeLoan} onChange={handleChange} required>
                                <option value="">-- Chọn mục đích vay --</option>
                                <option value="1">Mua nhà</option>
                                <option value="2">Mua xe</option>
                            </select>
                        </div>
                        <div className="col-md-6 mb-3">
                            <label htmlFor="description">Mô tả:</label>
                            <input type="text" className="form-control mb-2" id="description" value={formData.description} onChange={handleChange} required />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label htmlFor="amountPurpose">Số tiền cần cho mục đích:</label>
                            <input type="number" min="0" className="form-control mb-2" id="amountPurpose" value={formData.amountPurpose} onChange={handleChange} required />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label htmlFor="amountHave">Số tiền đã có:</label>
                            <input type="number" min="0" className="form-control mb-2" id="amountHave" value={formData.amountHave} onChange={handleChange} required />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label htmlFor="amountSuggest">Số tiền đề nghị vay:</label>
                            <input type="number" min="0" className="form-control mb-2" id="amountSuggest" value={formData.amountSuggest} onChange={handleChange} required />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label htmlFor="voluntarySaving">Tiết kiệm tự nguyện:</label>
                            <input type="number" min="0" className="form-control mb-2" id="voluntarySaving" value={formData.voluntarySaving} onChange={handleChange} required />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label htmlFor="incomeSalary">Thu nhập khách hàng:</label>
                            <input type="number" min="0" className="form-control mb-2" id="incomeSalary" value={formData.incomeSalary} onChange={handleChange} required />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label htmlFor="incomeOther">Thu nhập khác:</label>
                            <input type="number" min="0" className="form-control mb-2" id="incomeOther" value={formData.incomeOther} onChange={handleChange} required />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label htmlFor="cost">Tổng chi phí:</label>
                            <input type="number" min="0" className="form-control mb-2" id="cost" value={formData.cost} onChange={handleChange} required />
                        </div>
                    </div>
                </div>
                <div className="d-flex justify-content-center">
                    <button type="submit" className="btn btn-primary btn-lg">Gửi thông tin</button>
                </div>
            </form>
        </div>
    );
}

export default Survey;
