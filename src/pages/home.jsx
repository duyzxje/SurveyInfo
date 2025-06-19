import { useNavigate } from 'react-router-dom';

function Home() {
    const navigate = useNavigate();
    return (
        <div className="container mt-4">
            <button className="btn btn-success btn-lg" onClick={() => navigate('/survey')}>Gửi thông tin khảo sát</button>
        </div>
    )
}
export default Home;