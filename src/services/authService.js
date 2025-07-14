const API_BASE_URL = 'http://localhost:3001/api';

export const authService = {
    // Login user
    async login(username, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Đăng nhập thất bại');
            }

            return data;
        } catch (error) {
            throw error;
        }
    },

    // Register user
    async register(userData) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Đăng ký thất bại');
            }

            return data;
        } catch (error) {
            throw error;
        }
    },

    // Get user profile
    async getProfile(token) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Không thể lấy thông tin người dùng');
            }

            return data;
        } catch (error) {
            throw error;
        }
    },

    // Update user profile
    async updateProfile(token, profileData) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profileData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Cập nhật thông tin thất bại');
            }

            return data;
        } catch (error) {
            throw error;
        }
    },

    // Change password
    async changePassword(token, currentPassword, newPassword) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/change-password`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Đổi mật khẩu thất bại');
            }

            return data;
        } catch (error) {
            throw error;
        }
    }
}; 