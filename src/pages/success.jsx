import { useNavigate, useLocation } from 'react-router-dom';
function Success() {
    const navigate = useNavigate();
    const location = useLocation();
    const data = location.state;

    if (!data) return <p>Đang tải dữ liệu...</p>;

    return (
        <div className="container mt-4">
            <h2>Gửi thành công!</h2>
            <p>Họ tên: {data.fullName}</p>
            <p>CCCD: {data.cccd}</p>
            <p>Điện thoại: {data.phone}</p>
            <p>Tỉnh/TP: {data.city}</p>
            <p>Số tiền cần vay: {data.loanAmount}</p>
            <button className="btn btn-success" onClick={() => navigate('/survey')}>Gửi mới</button>
        </div>
    );
}

export default Success;
