import React from 'react';

import { useNavigate, useLocation } from 'react-router-dom';
function Success() {
    const navigate = useNavigate();
    const location = useLocation();
    const data = location.state;

    if (!data) return <p>Đang tải dữ liệu...</p>;

    return (
        <div className="container mt-4">
            <h2>Gửi thành công!</h2>
            <p>Họ tên: {data.fullname}</p>
            <p>CCCD: {data.identify}</p>
            <p>Điện thoại: {data.phone}</p>
            <p>Tỉnh/TP: {data.provinceId}</p>
            <p>Xã/Phường: {data.wardId}</p>
            <p>Địa chỉ: {data.address}</p>
            <p>Mục đích vay: {data.purposeLoan}</p>
            <p>Mô tả: {data.description}</p>
            <p>Số tiền cần cho mục đích: {data.amountPurpose}</p>
            <p>Số tiền cần vay: {data.amountSuggest}</p>
            <p>Số tiền đã có: {data.amountHave}</p>
            <p>Tiết kiệm tự nguyện: {data.voluntarySaving}</p>
            <p>Thu nhập khách hàng: {data.incomeSalary}</p>
            <p>Thu nhập khác: {data.incomeOther}</p>
            <p>Tổng chi phí: {data.cost}</p>
            <button className="btn btn-success" onClick={() => navigate('/survey')}>Gửi mới</button>
        </div>
    );
}

export default Success;
