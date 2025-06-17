import express from 'express';
import cors from 'cors';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import fs from 'fs';
const app = express();
const PORT = 5000;
// Middleware
app.use(cors());
app.use(express.json()); // Để parse JSON gửi từ React


// ✅ Khai báo dữ liệu mặc định
const defaultData = { forms: [] };

// ✅ Khởi tạo LowDB với defaultData
const adapter = new JSONFile('db.json');
const db = new Low(adapter, defaultData);

await db.read();
await db.write();

// Route nhận dữ liệu từ form
app.post('/submit', async (req, res) => {
    const formData = req.body;
    console.log("📥 Dữ liệu nhận được từ frontend:", formData);
    db.data.forms.push(formData);
    await db.write();
    // Xử lý logic lưu DB ở đây nếu cần
    res.status(200).json({ message: "Dữ liệu đã được nhận thành công!" });

});
app.get('/get/:id', (req, res) => {
    const { id } = req.params;
    const db = JSON.parse(fs.readFileSync('./db.json'));
    const found = db.forms.find(item => item.id === id);

    if (found) {
        res.json(found);
    } else {
        res.status(404).json({ error: 'Không tìm thấy dữ liệu' });
    }
});
// Run server
app.listen(PORT, () => {
    console.log(`✅ Server đang chạy tại http://localhost:${PORT}`);
});
