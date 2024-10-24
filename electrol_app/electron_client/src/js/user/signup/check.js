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

        // Hiển thị thông tin user lên các input fields
        document.getElementById('username').value = userData.data[0].username;
        document.getElementById('phone').value = userData.data[0].phone;
        document.getElementById('email').value = userData.data[0].email;
        document.getElementById('address').value = userData.data[0].address;
        document.getElementById('code').value = userData.data[0].code;

        // Log dữ liệu user để kiểm tra
        console.log('User data:', userData);
    } catch (error) {
        console.error('Error fetching user data:', error);
        // Xử lý lỗi khi không thể lấy được thông tin user
        // Có thể thông báo lỗi cho người dùng hoặc thực hiện hành động phù hợp
    }
});



async function handleback(event) {
    const userId = localStorage.getItem('userId');
    event.preventDefault();
    try {
        const response = await fetch(`https://izm.transtechvietnam.com/deleteSignup/${userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete user');
        }

        console.log('User deleted successfully');
    } catch (error) {
        console.error('Error deleting user:', error);
        // Xử lý lỗi khi không thể xóa người dùng
        // Có thể thông báo lỗi cho người dùng hoặc thực hiện hành động phù hợp
    }
    window.location.href = 'signup.html';
}

async function handleNext(event) {
    event.preventDefault();

    try {
        const userId = localStorage.getItem('userId');

        // Log userId để kiểm tra
        console.log('userId:', userId);

        // Gọi API để cập nhật thông tin user thông qua userId
        const response = await fetch(`https://izm.transtechvietnam.com/updatesignup/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: document.getElementById('username').value,
                phone: document.getElementById('phone').value,
                email: document.getElementById('email').value,
                address: document.getElementById('address').value,
                code: document.getElementById('code').value
            })
        });

        if (!response.ok) {
            throw new Error('Failed to update user data');
        }

        // Chuyển hướng đến trang xác nhận
        window.location.href = 'confirm.html';
    } catch (error) {
        console.error('Error updating user data:', error);
        // Xử lý lỗi khi không thể cập nhật thông tin user
        // Có thể thông báo lỗi cho người dùng hoặc thực hiện hành động phù hợp
    }
}
