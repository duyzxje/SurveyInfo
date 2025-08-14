import React, { useState, useEffect } from 'react';
import { loansService } from '../services/loansService';
import { useAuth } from '../contexts/AuthContext';
import LoadingOverlay from './loadingOverlay';

const CustomerLoans = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { token } = useAuth();

    // Mặc định branch code
    const branchCode = 'BNG';
    const clusterCode = '';

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        setLoading(true);
        setError('');

        try {
            const data = await loansService.getCustomersForCreateDocument(token, branchCode, clusterCode);
            setCustomers(data || []);
        } catch (err) {
            setError(err.message || 'Không thể tải dữ liệu khách hàng');
            console.error('Error fetching customers:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateCustomers = async (updatedCustomers) => {
        setLoading(true);
        setError('');

        try {
            await loansService.updateCustomersForCreateDocument(token, updatedCustomers);
            // Refresh data after update
            fetchCustomers();
        } catch (err) {
            setError(err.message || 'Không thể cập nhật dữ liệu khách hàng');
            console.error('Error updating customers:', err);
        } finally {
            setLoading(false);
        }
    };

    // Ví dụ cập nhật một khách hàng
    const handleUpdateCustomer = (customer) => {
        // Tạo bản sao và cập nhật
        const updatedCustomer = {
            ...customer,
            // Cập nhật các trường cần thiết
            phone: '0987654321',
            amountSuggest: 5000000,
        };

        // Gửi cập nhật lên server
        handleUpdateCustomers([updatedCustomer]);
    };

    return (
        <div className="container mt-4">
            {loading && <LoadingOverlay />}

            <h2 className="mb-4">Danh sách khách hàng vay</h2>

            {error && (
                <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                </div>
            )}

            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Chi nhánh: {branchCode}</h5>
                    <button
                        className="btn btn-primary"
                        onClick={fetchCustomers}
                    >
                        <i className="bi bi-arrow-clockwise me-1"></i> Làm mới
                    </button>
                </div>
                <div className="card-body">
                    {customers.length > 0 ? (
                        <div className="table-responsive">
                            <table className="table table-striped table-hover">
                                <thead>
                                    <tr>
                                        <th>Họ tên</th>
                                        <th>CMND/CCCD</th>
                                        <th>Số điện thoại</th>
                                        <th>Địa chỉ</th>
                                        <th>Số tiền đề xuất</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customers.map((customer, index) => (
                                        <tr key={index}>
                                            <td>{customer.fullname}</td>
                                            <td>{customer.identify}</td>
                                            <td>{customer.phone}</td>
                                            <td>{customer.address}</td>
                                            <td>{customer.amountSuggest?.toLocaleString()} VNĐ</td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-outline-primary me-2"
                                                    onClick={() => handleUpdateCustomer(customer)}
                                                >
                                                    <i className="bi bi-pencil-square"></i> Cập nhật
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-muted">Không có dữ liệu khách hàng</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomerLoans;
