const token = localStorage.getItem('token');
const userId = localStorage.getItem('account');

async function displayUserData() {
    try {
        const response = await fetch(`https://izm.transtechvietnam.com/getByUserId/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }

        const userData = await response.json();
        console.log('API get userData:', userData);

        // Populate the fields with the fetched data
        document.querySelector('.name input').value = userData.data[0].username;
        document.querySelector('.email input').value = userData.data[0].email;
        document.querySelector('.code input').value = userData.data[0].code;
        document.querySelector('.phone input').value = userData.data[0].phone;
        document.querySelector('.address input').value = userData.data[0].address;

    } catch (error) {
        console.error('Error fetching user data:', error);
    }
}

function handleCancel(event) {
    event.preventDefault();
    window.location.href = 'home.html';
}

async function handleSave(event) {
    event.preventDefault();
    const userData = {
        username: document.querySelector('.name input').value,
        email: document.querySelector('.email input').value,
        code: document.querySelector('.code input').value,
        phone: document.querySelector('.phone input').value,
        address: document.querySelector('.address input').value
    };

    try {
        const response = await fetch(`https://izm.transtechvietnam.com/updateUser/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            throw new Error('Failed to update user');
        }

        // Sau khi cập nhật thành công, chuyển hướng về trang home
        window.location.href = 'home.html';
    } catch (error) {
        console.error('Error updating user:', error);
    }
}


function handleRefresh(event) {
    event.preventDefault();
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
    for (let i = 0; i < 8; i++) {
        randomString += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    document.querySelector('.code input').value = randomString;
}


// Call the function to display user data when the page loads
document.addEventListener('DOMContentLoaded', displayUserData);