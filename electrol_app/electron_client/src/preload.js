const { contextBridge, ipcRenderer } = require('electron');

let currentInputField = null;

// Lắng nghe sự kiện focus trên tất cả các ô input để biết ô nào hiện đang được chọn
document.addEventListener('focusin', (event) => {
    if (event.target.tagName === 'INPUT' && event.target.type === 'text') {
        currentInputField = event.target;
    }
    if (event.target.readOnly) {
        currentInputField = null;
    }
});

ipcRenderer.on('display-copy-history', async (event) => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('account');

    console.log("Display copy history: ");

    try {
        const response = await fetch('https://izm.transtechvietnam.com/getContentById', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ accountid: userId })
        });
        if (response.ok) {
            const data = await response.json();
            console.log('API response data:', data);
            if (!data || !data.data || !Array.isArray(data.data)) {
                console.error('API response format is incorrect', data);
                return;
            }
            const historyData = data.data.map(item => ({ id: item.id, copycontent: item.copycontent, pin: item.pin }));

            const copyHistoryBox = document.getElementById('copyHistoryBox');
            copyHistoryBox.innerHTML = ''; // Xóa nội dung cũ (nếu có)

            // Tạo HTML để hiển thị dữ liệu lấy từ API
            const historyList = document.createElement('div');
            historyData.forEach(item => {
                const listItem = document.createElement('div');
                listItem.classList.add('list-item-history');

                // Nếu item.pin là true, thêm lớp 'pinned'
                console.log('Item:', item); // Thêm dòng này để kiểm tra dữ liệu
                if (item.pin.data[1] === 1) {
                    console.log('Adding pinned class to item:', item); // Kiểm tra điều kiện pin
                    listItem.classList.add('pinned');
                }

                // Create content paragraph
                const content = document.createElement('p');
                content.textContent = item.copycontent;
                content.onclick = () => {
                    navigator.clipboard.writeText(item.copycontent) // Sao chép nội dung vào clipboard
                        .then(() => {
                            if (currentInputField) {
                                currentInputField.value = item.copycontent; // Dán nội dung vào ô input hiện tại
                            }
                        });
                };

                const iconsDiv = document.createElement('div');
                iconsDiv.classList.add('icons-container');

                // Create delete icon
                const deleteIcon = document.createElement('img');
                deleteIcon.src = '../../access/delete.png';
                deleteIcon.className = 'delete-icon-history';
                deleteIcon.style.width = '20px';
                deleteIcon.style.height = '20px';
                deleteIcon.style.cursor = 'pointer';
                deleteIcon.onclick = (event) => {
                    event.stopPropagation(); // Prevent the list item click handler from firing
                    console.log(item.id); // Log the item ID
                    fetch(`https://izm.transtechvietnam.com/deleteContentcopy/${item.id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }).then(response => {
                        if (response.ok) {
                            console.log('Item deleted successfully');
                            listItem.remove(); // Optionally remove the item from the DOM
                        } else {
                            console.error('Failed to delete item');
                        }
                    }).catch(error => {
                        console.error('Error:', error);
                    });
                };

                const pinIcon = document.createElement('img');
                pinIcon.src = '../../access/pin.png';
                pinIcon.className = 'pin-history-icon';
                pinIcon.style.width = '20px';
                pinIcon.style.height = '20px';
                pinIcon.style.cursor = 'pointer';
                pinIcon.onclick = (event) => {
                    event.stopPropagation(); // Prevent the list item click handler from firing
                    if (item.pin.data[1]) {
                        fetch(`https://izm.transtechvietnam.com/unpin/${item.id}`, {
                            method: 'PUT',
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        }).then(response => {
                            if (response.ok) {
                                console.log('Item unpinned successfully');
                                listItem.classList.remove('pinned'); // Remove 'pinned' class
                                item.pin.data[1] = 0; // Update pin status locally
                            } else {
                                console.error('Failed to unpin item');
                            }
                        }).catch(error => {
                            console.error('Error:', error);
                        });
                    } else {
                        fetch(`https://izm.transtechvietnam.com/pin/${item.id}`, {
                            method: 'PUT',
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        }).then(response => {
                            if (response.ok) {
                                console.log('Item pinned successfully');
                                listItem.classList.add('pinned'); // Add 'pinned' class
                                item.pin.data[1] = 1; // Update pin status locally
                            } else {
                                console.error('Failed to pin item');
                            }
                        }).catch(error => {
                            console.error('Error:', error);
                        });
                    }
                };

                // Append icons to iconsDiv
                iconsDiv.appendChild(deleteIcon);
                iconsDiv.appendChild(pinIcon);

                // Append content and iconsDiv to listItem
                listItem.appendChild(content);
                listItem.appendChild(iconsDiv);

                // Append list item to history list
                historyList.appendChild(listItem);
            });

            const deleteAllButton = document.createElement('button');
            deleteAllButton.className = 'deletebtn';
            deleteAllButton.textContent = 'Xóa Tất Cả';
            deleteAllButton.onclick = async () => {
                try {
                    const response = await fetch('https://izm.transtechvietnam.com/deleteMutipleByAdmin', {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (response.ok) {
                        console.log('All history deleted successfully');
                        copyHistoryBox.style.display = 'none';
                    } else {
                        console.error('Failed to delete all history');
                    }
                } catch (error) {
                    console.error('Error:', error);
                }
            };

            // Thêm nút vào đầu popup
            copyHistoryBox.appendChild(deleteAllButton);

            // Thêm danh sách vào box
            copyHistoryBox.appendChild(historyList);

            // Hiển thị box
            copyHistoryBox.style.display = 'block';
        } else {
            console.error('Failed to fetch copy history:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching copy history:', error);
    }
});


// Bắt sự kiện click để ẩn box khi người dùng click bất kỳ nơi nào trên trang
document.addEventListener('click', (event) => {
    const copyHistoryBox = document.getElementById('copyHistoryBox');
    if (event.target !== copyHistoryBox && !copyHistoryBox.contains(event.target)) {
        copyHistoryBox.style.display = 'none';
    }
});

const token = localStorage.getItem('token');
const userId = localStorage.getItem('account');

// Define the saveToAPI function
function saveToAPI(copycontent) {
    console.log('Run save content copy:', copycontent);
    fetch('https://izm.transtechvietnam.com/createContentcopy', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ accountid: userId, copycontent: copycontent })
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

// Listen for copy event
document.addEventListener('copy', (event) => {
    const copiedText = document.getSelection().toString();
    console.log("Copied text:", copiedText); // Log the copied text
    if (copiedText) {
        saveToAPI(copiedText);
    } else {
        console.error("No text selected to copy.");
    }
});