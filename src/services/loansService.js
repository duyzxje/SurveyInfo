import { API_BASE_URL } from '../config/api';

export const loansService = {
    async getCustomersForCreateDocument(token, branchCode, clusterCode) {
        try {
            const response = await fetch(`${API_BASE_URL}/Loans/GetCustomerForCreateDocument`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ BranchCode: branchCode, ClusterCode: clusterCode })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Không thể lấy dữ liệu khách hàng');
            }

            return data;
        } catch (error) {
            throw error;
        }
    },

    async updateCustomersForCreateDocument(token, customers) {
        try {
            const response = await fetch(`${API_BASE_URL}/Loans/GetCustomerForCreateDocument`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(customers)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Cập nhật dữ liệu thất bại');
            }

            return data;
        } catch (error) {
            throw error;
        }
    }
};


