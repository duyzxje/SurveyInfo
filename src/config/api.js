// Đặt URL cố định nếu biến môi trường không hoạt động
const API_URL = 'https://api-dev12.cep.org.vn:8456/api';

// Thử đọc từ biến môi trường, nếu không được thì dùng URL cố định
export const API_BASE_URL = (process.env.REACT_APP_API_BASE_URL || API_URL).replace(/\/+$/, '');

// Log để debug
console.log('API URL:', API_BASE_URL);
console.log('Env variable:', process.env.REACT_APP_API_BASE_URL);


