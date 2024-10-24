const token = localStorage.getItem('token');
const userId = localStorage.getItem('account');
let editingServiceId = null;
const { backupData, getUuidList } = require('../../backup.js');


const fs = require('fs');
const path = require('path');

async function checkFolderExists(folderPath) {
    try {
        await fs.promises.access(folderPath, fs.constants.F_OK);
        return true;
    } catch {
        return false;
    }
}

// document.addEventListener("DOMContentLoaded", async function () {
//     const syncPopup = document.getElementById("syncPopup");
//     const loadingScreen = document.getElementById("loadingScreen");

//     const accountId = localStorage.getItem('account');
//     const token = localStorage.getItem('token');
//     const partitionsDir = path.join(process.env.APPDATA, 'electron-app', 'Partitions');

//     try {
//         const uuidList = await getUuidList(accountId, token);

//         let allFoldersExist = true;
//         for (const uuid of uuidList) {
//             const folderPath = path.join(partitionsDir, uuid);
//             const folderExists = await checkFolderExists(folderPath);
//             if (!folderExists) {
//                 allFoldersExist = false;
//                 break;
//             }
//         }

//         if (!allFoldersExist) {
//             // Show the popup if any folder doesn't exist
//             syncPopup.style.display = "block";
//         } else {
//             // Hide the popup if all folders exist
//             syncPopup.style.display = "none";
//         }

//         // Handle the "Yes" button click
//         document.getElementById("syncYes").addEventListener("click", async function () {
//             syncPopup.style.display = "none";
//             loadingScreen.style.display = "flex"; // Show loading screen

//             try {
//                 await backupData(accountId, token);

//                 // Hide loading screen when done
//                 loadingScreen.style.display = "none";

//                 alert("Data synced successfully!");
//             } catch (error) {
//                 console.error("Error syncing data:", error);

//                 // Hide loading screen in case of error
//                 loadingScreen.style.display = "none";

//                 alert("Data sync failed!");
//             }
//         });

//         // Handle the "No" button click
//         document.getElementById("syncNo").addEventListener("click", function () {
//             syncPopup.style.display = "none";
//         });
//     } catch (error) {
//         console.error("Error fetching UUID list:", error);
//     }
// });

document.addEventListener("DOMContentLoaded", async function () {
    const syncPopup = document.getElementById("syncPopup");
    const loadingScreen = document.getElementById("loadingScreen");
    const overlay = document.createElement("div");
    overlay.classList.add("overlay");
    document.body.appendChild(overlay);

    const accountId = localStorage.getItem('account');
    const token = localStorage.getItem('token');
    const partitionsDir = path.join(process.env.APPDATA, 'electron-app', 'Partitions');

    async function checkFolderExists(folderPath) {
        try {
            await fs.promises.access(folderPath, fs.constants.F_OK);
            return true;
        } catch {
            return false;
        }
    }

    try {
        const uuidList = await getUuidList(accountId, token);

        let allFoldersExist = true;
        for (const uuid of uuidList) {
            const folderPath = path.join(partitionsDir, uuid);
            const folderExists = await checkFolderExists(folderPath);
            if (!folderExists) {
                allFoldersExist = false;
                break;
            }
        }

        if (!allFoldersExist) {
            // Show the popup and overlay if any folder doesn't exist
            syncPopup.style.display = "block";
            overlay.style.display = "block";
        } else {
            // Hide the popup and overlay if all folders exist
            syncPopup.style.display = "none";
            overlay.style.display = "none";
        }

        // Handle the "Yes" button click
        document.getElementById("syncYes").addEventListener("click", async function () {
            syncPopup.style.display = "none";
            overlay.style.display = "none";
            loadingScreen.style.display = "flex"; // Show loading screen

            try {
                await backupData(accountId, token);

                // Hide loading screen when done
                loadingScreen.style.display = "none";
            } catch (error) {
                console.error("Error syncing data:", error);

                // Hide loading screen in case of error
                loadingScreen.style.display = "none";
            }
        });

        // Handle the "No" button click
        document.getElementById("syncNo").addEventListener("click", function () {
            syncPopup.style.display = "none";
            overlay.style.display = "none";
        });
    } catch (error) {
        console.error("Error fetching UUID list:", error);
    }
});

const webviewMap = {};

window.addEventListener('resize', updateWebviewWidth);

// Theo dõi các thay đổi trong danh sách dịch vụ để cập nhật kích thước của webview
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
            updateWebviewWidth(); // Cập nhật kích thước của webview hiện tại
        }
    });
});

observer.observe(document.querySelector('.chat-messages'), { childList: true, subtree: true });

function updateWebviewWidth() {
    for (const id in webviewMap) {
        const webview = webviewMap[id];
        if (webview) {
            webview.style.width = '100%';
            webview.style.height = '100%';
        }
    }
}

// Add this at the appropriate place in your JavaScript file
window.addEventListener('resize', updateWebviewWidth);

// Initial call to set sizes correctly on load
updateWebviewWidth();


// Get data from service
async function handleHome(event) {
    if (event) {
        event.preventDefault();
    }

    if (!token || !userId) {
        console.error('No token or userId found');
        return;
    }

    try {
        const chatUserResponse = await fetch(`https://izm.transtechvietnam.com/getChatUserById`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                accountid: userId
            })
        });

        if (!chatUserResponse.ok) {
            throw new Error('Network response was not ok');
        }

        const chatUserData = await chatUserResponse.json();

        updateServiceList(chatUserData.data);

    } catch (error) {
        console.error('Error fetching home data:', error);
    }
}

// Handle edit mode toggle
function handleEdit(event) {
    event.preventDefault();

    const editModeActive = document.body.classList.toggle('edit-mode');
    if (!editModeActive) {
        editingServiceId = null;
        removeDeleteIcons();
    } else {
        addDeleteIcons();
    }
}
function handleBack(event) {
    event.preventDefault();

    // Lấy webview hiện tại
    const currentWebview = document.querySelector(`.service-webview:not([style*="display: none"])`);

    // Kiểm tra nếu webview tồn tại và có thể quay lại
    if (currentWebview && currentWebview.canGoBack()) {
        currentWebview.goBack();
    } else {
        console.warn('Không có webview nào hoặc webview không thể quay lại.');
    }
}

function addDeleteIcons() {
    const serviceItems = document.querySelectorAll('.service');
    serviceItems.forEach(serviceItem => {
        let deleteIcon = serviceItem.querySelector('.delete-icon-sidebar');
        if (!deleteIcon) {
            deleteIcon = document.createElement('i');
            deleteIcon.className = 'fa-solid fa-trash-can fa-xs delete-icon-sidebar';
            deleteIcon.style.color = '#ff3838';
            deleteIcon.addEventListener('click', handleDelete);
            serviceItem.appendChild(deleteIcon);
        }

        // Thay vì gọi handleServiceClick, gọi editService khi trong chế độ chỉnh sửa
        serviceItem.removeEventListener('click', handleServiceClick); // Remove the old event
        serviceItem.addEventListener('click', () => {
            if (document.body.classList.contains('edit-mode')) {
                editService(serviceItem);
            } else {
                handleServiceClick(serviceItem);
            }
        });
    });
}

// Remove delete icons from services
function removeDeleteIcons() {
    document.querySelectorAll('.service .delete-icon-sidebar').forEach(icon => {
        icon.remove();
    });
    const serviceItems = document.querySelectorAll('.service');
    serviceItems.forEach(serviceItem => {
        serviceItem.removeEventListener('click', editService);
        serviceItem.addEventListener('click', handleServiceClick); // Restore the original event
    });
}

// Show edit popup
function editService(serviceItem) {
    const serviceId = serviceItem.id.replace('service-', '');
    const serviceName = serviceItem.querySelector('.service-img').alt;
    const serviceLinkElement = serviceItem.querySelector('.service-link');
    const serviceLink = serviceLinkElement ? serviceLinkElement.href : '';
    const serviceImg = serviceItem.querySelector('.service-img').src;

    Swal.fire({
        title: 'Edit Service',
        html: `
            <input id="edit-swal-input-1" class="swal2-input" type="hidden" value="${userId}">
            <input id="edit-swal-input1" class="swal2-input" placeholder="Name web" value="${serviceName}">
            <input id="edit-swal-input2" class="swal2-input" placeholder="URL web" value="${serviceLink}">
            <div class="swal2-file">
                <button id="edit-swal-input3-button" class="swal2-file-button">Choose an image</button>
                <span id="edit-swal-input3-filename" class="swal2-file-name">${serviceImg ? 'Selected file' : 'No file chosen'}</span>
                <input type="file" id="edit-swal-input3" class="swal2-file-input">
            </div>
        `,
        showCancelButton: true,
        focusConfirm: false,
        preConfirm: () => {
            return {
                accountid: document.getElementById('edit-swal-input-1').value,
                name: document.getElementById('edit-swal-input1').value,
                link: document.getElementById('edit-swal-input2').value,
                img: document.getElementById('edit-swal-input3').files[0]
            };
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            const formData = new FormData();
            formData.append('accountid', result.value.accountid);
            formData.append('name', result.value.name);
            formData.append('link', result.value.link);
            if (result.value.img) {
                formData.append('img', result.value.img);
            }

            try {
                const response = await fetch(`https://izm.transtechvietnam.com/updateChatUser/${serviceId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                console.log('Updated service:', data);
                Swal.fire('Success', 'Service updated successfully', 'success');

                // Reload updated data
                handleHome();
            } catch (error) {
                console.error('Error:', error);
                Swal.fire('Error', 'Failed to update service', 'error');
            }
        }

        // Reset edit mode
        document.body.classList.remove('edit-mode');
        editingServiceId = null;
        removeDeleteIcons();
    });

    // Enable file selection
    document.addEventListener('click', (event) => {
        if (event.target && event.target.id === 'edit-swal-input3-button') {
            event.preventDefault();
            document.getElementById('edit-swal-input3').click();
        }
    });

    // Update file name on selection
    document.addEventListener('change', (event) => {
        if (event.target && event.target.id === 'edit-swal-input3') {
            const fileName = event.target.files[0] ? event.target.files[0].name : 'No file chosen';
            document.getElementById('edit-swal-input3-filename').textContent = fileName;
        }
    });
}

// Handle delete service
function handleDelete(event) {
    event.stopPropagation();
    const serviceItem = event.currentTarget.parentNode;
    const serviceId = serviceItem.id.replace('service-', '');

    // Send delete request to server
    deleteService(serviceId);
}

document.querySelectorAll('.edit-icon').forEach(icon => {
    icon.addEventListener('click', (event) => {
        const serviceId = event.target.dataset.serviceId;
        handleEditClick(serviceId);
    });
});

async function handleAddChat() {
    const { value: formValues } = await Swal.fire({
        title: 'Add New Chat',
        html: `
            <input id="swal-input1" class="swal2-input" placeholder="Name web">
            <input id="swal-input2" class="swal2-input" placeholder="Url web">
            <div class="swal2-file">
                <button id="swal-input3-button" class="swal2-file-button">Choose an image</button>
                <span id="swal-input3-filename" class="swal2-file-name">No file chosen</span>
                <input type="file" id="swal-input3" class="swal2-file-input">
            </div>
        `,
        showCancelButton: true,
        focusConfirm: false,
        preConfirm: () => {
            const fileInput = document.getElementById('swal-input3');
            return {
                name: document.getElementById('swal-input1').value,
                link: document.getElementById('swal-input2').value,
                img: fileInput.files[0]
            }
        }
    });

    if (formValues) {
        console.log('Form values:', formValues);

        const formData = new FormData();
        formData.append('accountid', userId);
        formData.append('name', formValues.name);
        formData.append('link', formValues.link);
        formData.append('img', formValues.img);

        console.log(formData);

        try {
            const response = await fetch('https://izm.transtechvietnam.com/createChatUser', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log('Success:', data);
            Swal.fire('Success', 'Chat added successfully', 'success');

            // Gọi lại hàm handleHome để tải lại dữ liệu mới
            handleHome();
        } catch (error) {
            console.error('Error:', error);
            Swal.fire('Error', 'Failed to add chat chat', 'error');
        }
    }
}

document.addEventListener('click', (event) => {
    if (event.target && event.target.id === 'swal-input3-button') {
        event.preventDefault();
        document.getElementById('swal-input3').click();
    }
});

document.addEventListener('change', (event) => {
    if (event.target && event.target.id === 'swal-input3') {
        const fileName = event.target.files[0] ? event.target.files[0].name : 'No file chosen';
        document.getElementById('swal-input3-filename').textContent = fileName;
    }
});


// Send delete request to server
async function deleteService(serviceId) {
    try {
        const response = await fetch(`https://izm.transtechvietnam.com/deleteChatUser/${serviceId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        // Remove service item from UI after successful deletion
        const serviceItem = document.getElementById(`service-${serviceId}`);
        if (serviceItem) {
            serviceItem.remove();
        }

        console.log('Deleted service:', serviceId);
    } catch (error) {
        console.error('Error deleting service:', error);
    }
}

function handleServiceClick(serviceItem) {
    const serviceId = serviceItem.id.replace('service-', '');
    const serviceLink = serviceItem.querySelector('.service-link').href;
    const serviceUuid = serviceItem.uuid;
    const chatMessages = document.querySelector('.chat-messages');

    // Remove the selected class from all services
    document.querySelectorAll('.service').forEach(svc => {
        svc.classList.remove('selected-service');
    });

    // Add the selected class to the clicked service
    serviceItem.classList.add('selected-service');

    // Hide all webviews
    Object.values(webviewMap).forEach(webview => {
        webview.style.display = 'none';
    });

    // Check if the webview for this service already exists
    if (webviewMap[serviceId]) {
        // Show the existing webview
        webviewMap[serviceId].style.display = '';
        updateWebviewWidth(); // Update size for the current webview
    } else {
        // Create a new webview for this service
        const webview = document.createElement('webview');
        webview.className = `service-webview service-webview-${serviceId}`;
        webview.src = serviceLink;
        webview.partition = `persist:${serviceUuid}`;
        webview.frameBorder = '0';
        chatMessages.appendChild(webview);

        // Store the webview in the map
        webviewMap[serviceId] = webview;

        updateWebviewWidth(); // Update size for the new webview
    }
}

// Cập nhật danh sách các servicefunction updateServiceList(services) {
function updateServiceList(services) {
    const serviceList = document.querySelector('.service-list');
    serviceList.innerHTML = ''; // Xóa nội dung hiện tại

    services.forEach(service => {
        const serviceItem = document.createElement('div');
        serviceItem.className = 'service';
        serviceItem.id = `service-${service.id}`;
        serviceItem.uuid = service.uuid; // Đảm bảo uuid được gán chính xác

        const img = document.createElement('img');
        img.className = 'service-img';
        img.src = service.img ? `https://izm.transtechvietnam.com/${service.img.replace(/\\/g, '/')}` : 'https://izm.transtechvietnam.com/access/Icon_Internet.png';
        img.alt = service.name;

        const link = document.createElement('a');
        link.className = 'service-link';
        link.href = service.link;
        link.style.display = 'none';

        serviceItem.appendChild(img);
        serviceItem.appendChild(link);
        serviceList.appendChild(serviceItem);

        serviceItem.addEventListener('click', () => {
            if (!document.body.classList.contains('edit-mode')) {
                handleServiceClick(serviceItem);
            }
        });
    });
}

function handleEditClick(serviceId) {
    // Assuming you have an edit modal and delete button
    const editModal = document.getElementById('editModal');
    const deleteButton = document.getElementById('deleteButton');

    // Show the modal
    editModal.style.display = 'block';

    // Show the delete button
    deleteButton.style.display = 'block';

    // Load service data into the modal
    loadServiceData(serviceId);
}

// Example function to load service data into the modal
function loadServiceData(serviceId) {
    // Fetch the service data and populate the modal fields
    const service = getServiceById(serviceId); // You need to implement this function
    document.getElementById('serviceNameInput').value = service.name;
    document.getElementById('serviceLinkInput').value = service.link;
}

// Example click event handler for edit icons
document.querySelectorAll('.edit-icon').forEach(icon => {
    icon.addEventListener('click', (event) => {
        const serviceId = event.target.dataset.serviceId;
        handleEditClick(serviceId);
    });
});

// Handle logout
async function handleLogout(event) {
    event.preventDefault();

    const token = localStorage.getItem('token');
    const accountId = localStorage.getItem('account');

    try {
        // Chạy backup và đợi nó hoàn tất
        await backupData(accountId, token);
        console.log('Backup completed successfully');

        // Sau khi backup hoàn tất, thực hiện logout
        localStorage.removeItem('token');
        localStorage.removeItem('account');
        window.location.href = '../../view/login.html';
    } catch (error) {
        console.error('Backup failed:', error);
        // Xử lý lỗi hoặc thông báo cho người dùng nếu cần
    }
}

// Initialize event listeners
function disableWebviewPointerEvents() {
    const currentWebview = document.querySelector('.service-webview:not([style*="display: none"])'); // Ensure correct element
    if (currentWebview) {
        currentWebview.style.pointerEvents = 'none';
    }
}

// Cập nhật hàm enableWebviewPointerEvents
function enableWebviewPointerEvents() {
    const currentWebview = document.querySelector('.service-webview:not([style*="display: none"])'); // Ensure correct element
    if (currentWebview) {
        currentWebview.style.pointerEvents = 'auto';
    }
}

//load event
// document.addEventListener("DOMContentLoaded", function () {
//     const syncPopup = document.getElementById("syncPopup");
//     const loadingScreen = document.getElementById("loadingScreen");

//     // Show the popup after login
//     syncPopup.style.display = "block";

//     // Handle the "Yes" button click
//     document.getElementById("syncYes").addEventListener("click", async function () {
//         syncPopup.style.display = "none";
//         loadingScreen.style.display = "flex"; // Show loading screen

//         try {
//             const accountId = localStorage.getItem('account');
//             const token = localStorage.getItem('token');

//             await backupData(accountId, token);

//             // Hide loading screen when done
//             loadingScreen.style.display = "none";

//             alert("Data synced successfully!");
//         } catch (error) {
//             console.error("Error syncing data:", error);

//             // Hide loading screen in case of error
//             loadingScreen.style.display = "none";

//             alert("Data sync failed!");
//         }
//     });

//     // Handle the "No" button click
//     document.getElementById("syncNo").addEventListener("click", function () {
//         syncPopup.style.display = "none";
//     });
// });



// Function to start the download and extraction process
async function downloadAndExtractData() {
    // Replace with your actual function call
    await backupData(accountId, token);
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    const homeButton = document.querySelector('.home');
    if (homeButton) {
        homeButton.addEventListener('click', handleHome);
    }

    const editButton = document.querySelector('.edit-button');
    if (editButton) {
        editButton.addEventListener('click', handleEdit);
    }

    const backwebButton = document.querySelector('.back-web-button');
    if (backwebButton) {
        backwebButton.addEventListener('click', handleBack);
    }

    const logoutButton = document.querySelector('.logout');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }

    handleHome();
});
