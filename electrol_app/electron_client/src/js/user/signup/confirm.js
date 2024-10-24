document.addEventListener('DOMContentLoaded', async () => {
    try {
        const userId = localStorage.getItem('userId');

        // Log userId để kiểm tra
        console.log('userId:', userId);

        // Gọi API để lấy thông tin user dựa trên userId
        const response = await fetch(`https://izm.transtechvietnam.com/getByUserId/${userId}`);

        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }

        const userData = await response.json();

        // Log dữ liệu user để kiểm tra
        console.log('User data:', userData);

        // Lấy email và phone từ dữ liệu user
        const email = userData.data[0].email;
        const phone = userData.data[0].phone;

        document.getElementById('userCode').innerText = userData.data[0].code;

        // Thực hiện đăng nhập tự động
        await autoLogin(email, phone);
    } catch (error) {
        console.error('Error fetching user data:', error);
        // Xử lý lỗi khi không thể lấy được thông tin user
        // Có thể thông báo lỗi cho người dùng hoặc thực hiện hành động phù hợp
    }
});

async function autoLogin(email, phone) {
    try {
        let response = await fetch('https://izm.transtechvietnam.com/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                phone
            })
        });

        let result = await response.json();
        console.log(result);
        console.log(result.data?.token);
        console.log(response.status);
        console.log(result.data?.user?.role);

        if (response.status === 200 && result.data && result.data.token) {
            localStorage.setItem('token', result.data.token);
            localStorage.setItem('account', result.data.user.id);

            if (result.data.user.role === true) {
                window.location.href = './admin/home1.html';
            } else {
                console.error('Login failed');
            }
        } else {
            console.error('Login failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
}
function handleBack(event) {
    event.preventDefault();
    window.location.href = 'check.html';
}

function Handleconfirm(event) {
    event.preventDefault();
    localStorage.removeItem('userId');
    window.location.href = '../home.html';
}