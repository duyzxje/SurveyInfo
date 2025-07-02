import React from 'react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
function SurveyDetail() {
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
            const res = await axios.post("https://api_dev12.cep.org.vn:8456/api/Loans/SurveyInfo", formData);
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

        <form action="" className="container form-control border border-primary">
            <div className="container">
                <input type="text" />
                <input type="text" />
                <input type="text" />
                <input type="text" />

            </div>
        </form>

    )
}
export default SurveyDetail;