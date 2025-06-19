import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

function Success() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [provinces, setProvinces] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`http://localhost:3001/api/surveys/${id}`);
                setData(res.data);
            } catch (err) {
                console.error(err);
                alert('Không thể lấy dữ liệu khảo sát');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    useEffect(() => {
        // fetch provinces for name conversion
        axios.get('https://provinces.open-api.vn/api/?depth=3')
            .then(res => setProvinces(res.data))
            .catch(err => console.error('Cannot fetch provinces', err));
    }, []);

    const formatNumber = (value) => {
        if (!value) return '';
        return Number(value).toLocaleString('en-US');
    };

    if (loading) return <p>Đang tải dữ liệu...</p>;
    if (!data) return <p>Không có dữ liệu khảo sát</p>;

    const getProvinceName = (code) => {
        const p = provinces.find(pr => pr.code.toString() === code);
        return p ? p.name : code;
    };
    const getDistrictName = (provCode, distCode) => {
        const province = provinces.find(pr => pr.code.toString() === provCode);
        if (!province) return distCode;
        const district = province.districts.find(d => d.code.toString() === distCode);
        return district ? district.name : distCode;
    };
    const getWardName = (provCode, distCode, wardCode) => {
        const province = provinces.find(pr => pr.code.toString() === provCode);
        const district = province?.districts.find(d => d.code.toString() === distCode);
        const ward = district?.wards.find(w => w.code.toString() === wardCode);
        return ward ? ward.name : wardCode;
    };

    const getPurposeLoan = (value) => {
        switch (value) {
            case "1":
                return "Mua nhà";
            case "2":
                return "Mua xe";
            case "3":
                return "Mua sắm";
            case "4":
                return "Đầu tư";
            default:
                return "Không xác định";
        }
    }
    return (
        <div className="container mt-4">
            <h2>Gửi thành công!</h2>
            <p>Họ tên: {data.fullname}</p>
            <p>CCCD: {data.identify}</p>
            <p>Điện thoại: {data.phone}</p>
            <p>Tỉnh/TP: {getProvinceName(data.provinceId)}</p>
            <p>Quận/Huyện: {getDistrictName(data.provinceId, data.districtId)}</p>
            <p>Xã/Phường: {getWardName(data.provinceId, data.districtId, data.wardId)}</p>
            <p>Địa chỉ: {data.address}</p>
            <p>Mục đích vay: {getPurposeLoan(data.purposeLoan)}</p>
            <p>Mô tả: {data.description}</p>
            <p>Số tiền cần cho mục đích: {formatNumber(data.amountPurpose)} đ</p>
            <p>Số tiền cần vay: {formatNumber(data.amountSuggest)} đ</p>
            <p>Số tiền đã có: {formatNumber(data.amountHave)} đ</p>
            <p>Tiết kiệm tự nguyện: {formatNumber(data.voluntarySaving)} đ</p>
            <p>Thu nhập khách hàng: {formatNumber(data.incomeSalary)} đ</p>
            <p>Thu nhập khác: {formatNumber(data.incomeOther)} đ</p>
            <p>Tổng chi phí: {formatNumber(data.cost)} đ</p>
            <button className="btn btn-success" onClick={() => navigate('/survey')}>Gửi mới</button>
        </div>
    );
}

export default Success;
