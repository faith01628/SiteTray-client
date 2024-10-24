let userData = []; // Biến để lưu trữ dữ liệu người dùng
const token = localStorage.getItem('token');


document.addEventListener('DOMContentLoaded', async function () {
    await fetchDataAndDisplay();
    document.getElementById('searchInput').addEventListener('input', handleSearch);
});

async function fetchDataAndDisplay() {
    userData = await fetchData(); // Lấy dữ liệu từ API endpoint
    displayData(userData); // Hiển thị dữ liệu lên trang web
}

async function handleSearch() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase(); // Lấy giá trị nhập vào ô tìm kiếm
    const filteredData = userData.filter(user =>
        (user.username && user.username.toLowerCase().includes(searchInput)) ||
        (user.code && user.code.toLowerCase().includes(searchInput))
    );
    displayData(filteredData); // Hiển thị dữ liệu đã lọc ra từ tìm kiếm
}

async function fetchData() {
    try {
        // Lấy token từ local storage
        const response = await fetch('https://izm.transtechvietnam.com/getUser', {
            headers: {
                'Authorization': `Bearer ${token}` // Thêm token vào headers
            }
        });
        const result = await response.json(); // Chuyển đổi phản hồi từ server thành JSON
        return result.data; // Trả về mảng dữ liệu người dùng từ đối tượng JSON
    } catch (error) {
        console.error('Error fetching data:', error);
        return []; // Trả về mảng rỗng trong trường hợp có lỗi
    }
}

function displayData(data) {
    const tbody = document.querySelector('.user-table tbody'); // Chọn phần tbody của bảng

    tbody.innerHTML = ''; // Xóa nội dung cũ trong tbody để cập nhật dữ liệu mới

    if (!Array.isArray(data)) {
        console.error('Expected an array but received:', data);
        return;
    }

    const nonAdminUsers = data.filter(user => user.role !== true);

    nonAdminUsers.forEach(user => {
        const tr = document.createElement('tr'); // Tạo thẻ tr mới 
        tr.dataset.id = user.id; // Gán giá trị ID của người dùng cho thuộc tính data-id của hàng

        const tdId = document.createElement('td');
        tdId.textContent = user.id;
        const tdName = document.createElement('td');
        tdName.textContent = user.username;
        const tdEmail = document.createElement('td');
        tdEmail.textContent = user.email;

        const tdActions = document.createElement('td');
        tdActions.classList.add('action-buttons');

        const actionButtonsHTML = `
            <img src="../../access/card-list.png" alt="icon-show" class="icon-action" onclick="showPopup(event)">
            <div class="popup-box">
                <button class="edit" onclick="handleEdit(event)">Edit</button>
                <button class="delete" onclick="handleDelete(event)">Delete</button>
                <button class="detail" onclick="handleDetail(event)">Detail</button>
            </div>
        `;

        tdActions.innerHTML = actionButtonsHTML;

        tr.appendChild(tdId);
        tr.appendChild(tdName);
        tr.appendChild(tdEmail);
        tr.appendChild(tdActions);

        tbody.appendChild(tr);
    });
}

function handleLogout(event) {
    event.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('account');
    window.location.href = '../../view/login.html';
}

function handleGacha(event) {
    event.preventDefault();
    window.location.href = 'gacha.html';
}

async function handleEdit(event) {
    event.preventDefault();
    const tr = event.target.closest('tr');
    if (tr) {
        const userId = tr.dataset.id;
        try {
            const user = await fetchUserById(userId); // Lấy thông tin người dùng theo ID
            if (user) {
                showEditPopup(user);
            } else {
                console.error('User not found with ID:', userId);
            }
        } catch (error) {
            console.error('Error fetching user information:', error);
        }
    }
}

async function fetchUserById(userId) {
    try {
        const response = await fetch(`https://izm.transtechvietnam.com/getByUserId/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error('Error fetching user by ID:', error);
        return null;
    }
}

function showEditPopup(user) {
    if (!user) {
        console.error('User information is undefined');
        return;
    }

    const popupBox = document.createElement('div');
    popupBox.classList.add('edit-popup');

    const popupContent = `
        <label for="editUserId">UserID:</label>
        <input type="text" id="editUserId" value="${user[0].id || ''}" readonly>
        <label for="editUsername">Username:</label>
        <input type="text" id="editUsername" value="${user[0].username || ''}">
        <label for="editPhone">Phone:</label>
        <input type="text" id="editPhone" value="${user[0].phone || ''}">
        <label for="editCode">Code:</label>
        <div class='code-container'>
            <input type="text" id="editCode" value="${user[0].code || ''}">
            <div class='refresh' onclick="generateNewCode()"><img src='../../access/refresh.png' /></div>
        </div>
        <label for="editEmail">Email:</label>
        <input type="text" id="editEmail" value="${user[0].email || ''}">
        <label for="editAddress">Address:</label>
        <input type="text" id="editAddress" value="${user[0].address || ''}">
        <label for="edit">Edit:</label>
        <input type="text" id="edit" value="${user[0].edit || ''}">
        <button onclick="saveChanges()">Save Changes</button>
    `;

    popupBox.innerHTML = popupContent;
    document.body.appendChild(popupBox);

    document.addEventListener('click', (event) => {
        if (!popupBox.contains(event.target)) {
            popupBox.remove();
        }
    }, { once: true });

    popupBox.addEventListener('click', (event) => {
        event.stopPropagation();
    });
}

function generateNewCode() {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
    for (let i = 0; i < 8; i++) {
        randomString += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    document.getElementById('editCode').value = randomString;
}


async function saveChanges() {
    const userId = document.getElementById('editUserId').value;
    const editUsername = document.getElementById('editUsername').value;
    const editPhone = document.getElementById('editPhone').value;
    const editCode = document.getElementById('editCode').value;
    const editEmail = document.getElementById('editEmail').value;
    const editAddress = document.getElementById('editAddress').value;
    const edit = document.getElementById('edit').value;

    if (!userId) {
        console.error('User ID is undefined or empty');
        return;
    }

    const payload = {
        username: editUsername,
        phone: editPhone,
        code: editCode,
        email: editEmail,
        address: editAddress,
        edit: edit,
    };

    try {
        const response = await fetch(`https://izm.transtechvietnam.com/updateAdmin/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            const editPopup = document.querySelector('.edit-popup');
            editPopup.remove();
            await fetchDataAndDisplay(); // Làm mới lại dữ liệu sau khi lưu thành công
        } else {
            const errorText = await response.text();
            console.error('Failed to save changes:', response.status, errorText);
        }
    } catch (error) {
        console.error('Error saving changes:', error);
    }
}

async function handleDelete(event) {
    event.preventDefault();
    const tr = event.target.closest('tr');
    if (tr) {
        const userId = tr.dataset.id;
        try {
            const response = await fetch(`https://izm.transtechvietnam.com/deleteUser/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                tr.remove();
                userData = userData.filter(user => user.id !== userId);
            } else {
                console.error('Delete request failed with status:', response.status);
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    }
}

async function handleDetail(event) {
    event.preventDefault();
    const tr = event.target.closest('tr');
    if (tr) {
        const userId = tr.dataset.id;
        try {
            const user = await fetchUserById(userId); // Lấy thông tin người dùng theo ID
            if (user) {
                showDetailPopup(user);
            } else {
                console.error('User not found with ID:', userId);
            }
        } catch (error) {
            console.error('Error fetching user information:', error);
        }
    }
}

function showDetailPopup(user) {
    if (!user) {
        console.error('User information is undefined');
        return;
    }

    const popupBox = document.createElement('div');
    popupBox.classList.add('detail-popup');

    const popupContent = `
        <p><strong>Id:</strong> ${user[0].id || ''}</p>
        <p><strong>Username:</strong> ${user[0].username || ''}</p>
        <p><strong>Phone:</strong> ${user[0].phone || ''}</p>
        <p><strong>Code:</strong> ${user[0].code || ''}</p>
        <p><strong>Email:</strong> ${user[0].email || ''}</p>
        <p><strong>Address:</strong> ${user[0].address || ''}</p>
        <p><strong>Edit:</strong> ${user[0].edit || ''}</p>
        <button onclick="closeDetailPopup()">Close</button>
    `;

    popupBox.innerHTML = popupContent;
    document.body.appendChild(popupBox);

    document.addEventListener('click', (event) => {
        if (!popupBox.contains(event.target)) {
            popupBox.remove();
        }
    }, { once: true });
}

function closeDetailPopup() {
    const detailPopup = document.querySelector('.detail-popup');
    if (detailPopup) {
        detailPopup.remove();
    }
}

function showPopup(event) {
    const activePopups = document.querySelectorAll('.popup-box.active');
    activePopups.forEach(popup => popup.classList.remove('active'));

    const popupBox = event.target.nextElementSibling;
    const rect = event.target.getBoundingClientRect();
    popupBox.style.top = `${rect.bottom + window.scrollY}px`;
    popupBox.style.left = `${rect.left + window.scrollX}px`;
    popupBox.classList.toggle('active');

    event.stopPropagation();
}

document.addEventListener('click', function (event) {
    const activePopup = document.querySelector('.popup-box.active');
    if (activePopup) {
        const button = activePopup.previousElementSibling;
        if (!button.contains(event.target) && !activePopup.contains(event.target)) {
            activePopup.classList.remove('active');
        }
    }
});
