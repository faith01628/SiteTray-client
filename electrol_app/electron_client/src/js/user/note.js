document.addEventListener('DOMContentLoaded', () => {
    const noteButton = document.querySelector('.fa-note-sticky');
    let serviceWebview = document.querySelector('.service-webview');
    let sidebar = null;
    let isSidebarVisible = false;
    let isResizing = false;
    let currentSelectedNote = { title: 'note 1', id: null };
    let completedNotes = []; // Danh sách các ghi chú đã hoàn thành
    let currentTitle = '';

    noteButton.addEventListener('click', toggleSidebarVisibility);

    function createSidebar() {
        // Tạo phần tử sidebar
        const sidebarElement = document.createElement('div');
        sidebarElement.classList.add('sidebar');

        const titleContainer = document.createElement('div');
        titleContainer.classList.add('title-container');

        const sidebarTitle = document.createElement('div');
        sidebarTitle.classList.add('sidebar-title');
        sidebarTitle.innerText = currentSelectedNote.title;

        const toggleButton = document.createElement('i');
        toggleButton.classList.add('fa', 'fa-bars', 'note-toggle');
        toggleButton.addEventListener('click', openPopup);

        const resizeHandle = document.createElement('div');
        resizeHandle.classList.add('resize-handle');

        const noteContentContainer = document.createElement('div');
        noteContentContainer.classList.add('note-content');

        const createContentDiv = document.createElement('div');
        createContentDiv.classList.add('create-content');

        const createContentDivchild = document.createElement('div');
        createContentDivchild.classList.add('create-content-chill');

        const addContentDiv = document.createElement('div');
        addContentDiv.classList.add('add-content');
        addContentDiv.innerHTML = '<i class="fas fa-plus icon-add"></i>';
        addContentDiv.addEventListener('click', () => handleAddContentClick(currentSelectedNote.id));

        const popupnoteDiv = document.createElement('div');
        popupnoteDiv.classList.add('popupnote');
        popupnoteDiv.id = 'notePopup';

        const popupnoteOverlay = document.createElement('div');
        popupnoteOverlay.classList.add('overlay-note-popup');

        const popupnoteContentDiv = document.createElement('div');
        popupnoteContentDiv.classList.add('popupnote-content');

        const popupnoteBodyDiv = document.createElement('div');
        popupnoteBodyDiv.classList.add('popupnote-body');
        popupnoteBodyDiv.id = 'noteDetail';

        popupnoteContentDiv.appendChild(popupnoteBodyDiv);
        popupnoteDiv.appendChild(popupnoteOverlay);
        popupnoteOverlay.appendChild(popupnoteContentDiv);
        sidebarElement.appendChild(popupnoteDiv);

        titleContainer.appendChild(sidebarTitle);
        titleContainer.appendChild(toggleButton);
        sidebarElement.appendChild(titleContainer);
        sidebarElement.appendChild(resizeHandle);
        noteContentContainer.appendChild(createContentDiv);
        noteContentContainer.appendChild(createContentDivchild);
        createContentDiv.appendChild(createContentDivchild);
        createContentDivchild.appendChild(addContentDiv);
        sidebarElement.appendChild(createContentDiv);
        sidebarElement.appendChild(noteContentContainer);

        // Thêm Completed Notes vào sidebar
        const completedNotesContainer = document.createElement('div');
        completedNotesContainer.classList.add('completed-notes-container');
        completedNotesContainer.innerHTML = '<p class="completed-notes-title">Completed Notes</p>'; // Tiêu đề "Completed Notes"
        sidebarElement.appendChild(completedNotesContainer);

        // Thêm sidebar vào phần tử chat-messages thay vì document.body
        const chatMessagesElement = document.getElementById('chat-container');
        chatMessagesElement.appendChild(sidebarElement);

        resizeHandle.addEventListener('mousedown', startResizing);
        return sidebarElement;

    }


    sidebar = createSidebar();

    // Hàm để cập nhật `currentTitle`
    function updateSidebarTitle(newTitle) {
        currentTitle = newTitle;
        const sidebarTitleElement = document.querySelector('.sidebar-title');
        sidebarTitleElement.textContent = newTitle;
    }

    function renderCompletedNotes(notes) {
        const completedNotesContainer = sidebar.querySelector('.completed-notes-container');
        completedNotesContainer.innerHTML = '<div class="success-container"><p class="completed-notes-text">Marked as resolved</p></div>'; // Tiêu đề "Completed Notes"
        notes.forEach(item => {
            const contentContainer = document.createElement('div');
            contentContainer.classList.add('content-item-success');
            contentContainer.style.position = 'relative';

            const successIcon = document.createElement('img');
            successIcon.classList.add('success-icon');
            successIcon.src = item.checksuccess.data[1] ? '../../access/icon-success.png' : '../../access/icon-unsuccess.png';
            successIcon.style.cursor = 'pointer';

            const pinIcon = document.createElement('img');
            pinIcon.classList.add('pin-icon');
            pinIcon.src = item.important.data[1] ? '../../access/star_pin-success.png' : '../../access/star-unpin-success.png';
            pinIcon.style.cursor = 'pointer';

            const contentElement = document.createElement('input');
            contentElement.classList.add('content-item-input-success');
            contentElement.value = item.contentnote;
            contentElement.setAttribute('readonly', true);
            contentElement.dataset.id = item.id;
            contentElement.dataset.clickCount = 0;

            const deleteIcon = document.createElement('i');
            deleteIcon.classList.add('fas', 'fa-trash', 'fa-sm', 'delete-content-icon-success');
            deleteIcon.style.cursor = 'pointer';

            contentElement.addEventListener('click', () => {
                let clickCount = parseInt(contentElement.dataset.clickCount) || 0;
                clickCount += 1;
                contentElement.dataset.clickCount = clickCount;

                if (clickCount === 2) {
                    contentElement.removeAttribute('readonly');
                    contentElement.focus();
                }
            });

            contentElement.addEventListener('keydown', async (event) => {
                if (event.key === 'Enter') {
                    await updateContent(contentElement);
                    contentElement.dataset.clickCount = 0;
                }
            });

            contentElement.addEventListener('blur', async () => {
                if (!contentElement.hasAttribute('readonly')) {
                    await updateContent(contentElement);
                    contentElement.dataset.clickCount = 0;
                }
            });

            deleteIcon.addEventListener('click', async () => {
                const contentId = contentElement.dataset.id;
                const token = localStorage.getItem('token');

                try {
                    const response = await fetch(`https://izm.transtechvietnam.com/deleteContentNote/${contentId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (!response.ok) {
                        throw new Error('Failed to delete content');
                    }

                    contentContainer.remove();
                } catch (error) {
                    console.error('Error deleting content:', error);
                }
            });

            pinIcon.addEventListener('click', async () => {
                const token = localStorage.getItem('token');
                item.important.data[1] = !item.important.data[1];
                pinIcon.src = item.important.data[1] ? '../../access/star_pin-success.png' : '../../access/star-unpin-success.png';

                const apiUrl = item.important.data[1] ? `https://izm.transtechvietnam.com/pinContentNote/${item.id}` : `https://izm.transtechvietnam.com/unpinContentNote/${item.id}`;
                try {
                    const response = await fetch(apiUrl, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({ important: item.important })
                    });

                    if (!response.ok) {
                        throw new Error('Failed to update pin state');
                    }

                    // Lấy lại dữ liệu để làm mới giao diện
                    // const updatedContent = await getContentNoteById(item.noteid, token);
                    // if (updatedContent && updatedContent.data) {
                    //     renderNoteContent(updatedContent.data);
                    // } else {
                    //     console.error('No data returned for note:', item.noteid);
                    // }
                } catch (error) {
                    console.error('Error updating pin state:', error);
                }
            });

            successIcon.addEventListener('click', async () => {
                const token = localStorage.getItem('token');
                item.checksuccess.data[1] = !item.checksuccess.data[1];
                successIcon.src = item.checksuccess.data[1] ? '../../access/icon-success.png' : '../../access/icon-unsuccess.png';

                const apiUrl = item.checksuccess.data[1] ? `https://izm.transtechvietnam.com/pinCheckSuccess/${item.id}` : `https://izm.transtechvietnam.com/unCheckSuccess/${item.id}`;
                try {
                    const response = await fetch(apiUrl, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({ checksuccess: item.checksuccess })
                    });

                    if (!response.ok) {
                        throw new Error('Failed to update success state');
                    }
                    // await refreshData();

                    if (currentTitle === 'important') {
                        // Render dữ liệu của "Important"
                        await renderImportantNotes(accountId, token);
                    } else {

                        console.log('Current Title:', currentTitle);
                        // Render dữ liệu của ghi chú hiện tại
                        const updatedContent = await getContentNoteById(item.noteid, token);
                        if (updatedContent && updatedContent.data) {
                            renderNoteContent(updatedContent.data);
                        } else {
                            console.error('No data returned for note:', item.noteid);
                        }
                    }

                    // // Lấy lại dữ liệu để làm mới giao diện
                    // const updatedContent = await getContentNoteById(item.noteid, token);
                    // if (updatedContent && updatedContent.data) {
                    //     renderNoteContent(updatedContent.data);
                    // } else {
                    //     console.error('No data returned for note:', item.noteid);
                    // }
                } catch (error) {
                    console.error('Error updating success state:', error);
                }
            });

            contentContainer.appendChild(successIcon);
            contentContainer.appendChild(pinIcon);
            contentContainer.appendChild(contentElement);
            contentContainer.appendChild(deleteIcon);

            completedNotesContainer.appendChild(contentContainer);
        });
    }

    async function renderNotes(accountid, token) {
        try {
            const notesResponse = await getNotesByAccountId(accountid, token);
            const notes = notesResponse.data;

            if (notes.length > 0) {
                currentSelectedNote = notes[0];
                updateSidebarTitle(currentSelectedNote.title);

                const contentNote = await getContentNoteById(currentSelectedNote.id, token);
                renderNoteContent(contentNote.data);
            }
        } catch (error) {
            console.error('Lỗi khi hiển thị ghi chú:', error);
        }
    }

    function handleAddContentClick(noteid) {
        const token = localStorage.getItem('token');
        const addContentDiv = document.querySelector('.add-content');
        const inputElement = document.createElement('input');
        inputElement.type = 'text';
        inputElement.placeholder = 'Enter content...';
        inputElement.classList.add('add-content-input');

        addContentDiv.innerHTML = '';
        addContentDiv.appendChild(inputElement);

        inputElement.addEventListener('blur', async () => {
            if (addContentDiv.contains(inputElement)) {
                const content = inputElement.value;
                if (content.trim() !== '') {
                    try {
                        const response = await fetch('https://izm.transtechvietnam.com/createContentNote', {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ noteid, contentnote: content }),
                        });

                        if (!response.ok) {
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        }

                        const data = await response.json();
                        console.log('Content added:', data);

                        // Reload the note content
                        const contentNote = await getContentNoteById(noteid, token);
                        renderNoteContent(contentNote.data);
                    } catch (error) {
                        console.error('Error:', error);
                    }
                }
                addContentDiv.innerHTML = '<i class="fas fa-plus icon-add"></i>';
            }
        });

        inputElement.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                inputElement.blur(); // Trigger blur event
            }
        });

        inputElement.focus();
    }

    function toggleSidebarVisibility() {
        const width = isSidebarVisible ? '0' : '250px';
        sidebar.style.width = width;
        updateWebviewWidth();
        isSidebarVisible = !isSidebarVisible;

        if (isSidebarVisible) {
            const userId = localStorage.getItem('account');
            const token = localStorage.getItem('token');
            renderNotes(userId, token);
        }
    }

    function startResizing(e) {
        e.preventDefault();
        isResizing = true;
        disableWebviewPointerEvents();
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', stopResizing);
    }

    function stopResizing() {
        isResizing = false;
        enableWebviewPointerEvents();
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', stopResizing);
    }

    // function handleMouseMove(e) {
    //     if (!isResizing) return;

    //     requestAnimationFrame(() => {
    //         const newWidth = Math.min(Math.max(window.innerWidth - e.clientX, 100), window.innerWidth / 2);
    //         sidebar.style.width = `${newWidth}px`;
    //         updateWebviewWidth();
    //     });
    // }


    function handleMouseMove(e) {
        if (!isResizing) return;

        requestAnimationFrame(() => {
            const newWidth = Math.min(Math.max(window.innerWidth - e.clientX, 100), window.innerWidth / 2);
            sidebar.style.width = `${newWidth}px`;

            // Update the width of the currently visible webview
            const currentWebview = document.querySelector('.service-webview[style*="visibility: visible"]');
            if (currentWebview) {
                updateWebviewWidth(currentWebview);
            } else {
                console.warn('Không tìm thấy service-webview nào đang hiển thị.');
            }
        });
    }
    // thay đổi chiều rộng của webview
    // function updateWebviewWidth() {
    //     const sidebarWidth = isSidebarVisible ? parseFloat(sidebar.style.width) : 0;
    //     const serviceWidth = 80; // Width of the service container
    //     const serviceWebview = document.querySelector('.service-webview'); // Select the element here

    //     if (serviceWebview) { // Check if the element exists
    //         const newWidth = window.innerWidth - sidebarWidth - serviceWidth;
    //         serviceWebview.style.width = `${newWidth}px`;
    //     } else {
    //         console.warn('Không tìm thấy phần tử service-webview.');
    //     }
    // }

    // thay đổi chiều rộng của webview
    // Function to update the width of a specific webview
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

    //thu mở rộng popup
    function disableWebviewPointerEvents() {
        serviceWebview = document.querySelector('.service-webview'); // Ensure correct element
        if (serviceWebview) {
            serviceWebview.style.pointerEvents = 'none';
        }
    }

    function enableWebviewPointerEvents() {
        serviceWebview = document.querySelector('.service-webview'); // Ensure correct element
        if (serviceWebview) {
            serviceWebview.style.pointerEvents = 'auto';
        }
    }

    // Set initial webview width
    updateWebviewWidth();

    // Add resize event listener to update webview width on window resize
    window.addEventListener('resize', updateWebviewWidth);

    async function getNotesByAccountId(accountid, token) {
        try {
            const response = await fetch(`https://izm.transtechvietnam.com/getNoteById`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ accountid })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch notes');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching notes:', error);
            return [];
        }
    }

    async function getContentNoteById(noteid, token) {
        try {
            const response = await fetch(`https://izm.transtechvietnam.com/getContentNoteById`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ noteid })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch note content');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching note content:', error);
            return [];
        }
    }



    async function renderImportantNotes(accountid, token) {
        try {
            const response = await fetch('https://izm.transtechvietnam.com/getContentImportant', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ accountid })
            });

            if (!response.ok) {
                throw new Error('Không thể lấy ghi chú');
            }

            const importantContentNotes = await response.json();
            console.log('Ghi chú quan trọng:', importantContentNotes);

            updateSidebarTitle('important'); // Cập nhật tiêu đề sidebar thành "important"

            // Hiển thị ghi chú quan trọng trong sidebar
            renderNoteContent(importantContentNotes.data);
        } catch (error) {
            console.error('Lỗi khi lấy ghi chú:', error);
        }
    }


    function openPopup() {
        const popup = document.getElementById('notePopup');
        const dimOverlay = document.querySelector('.dim-overlay');
        const accountid = localStorage.getItem('account');
        const token = localStorage.getItem('token');

        if (popup) {
            getNotesByAccountId(accountid, token).then(notesResponse => {
                const notes = notesResponse.data;

                if (notes.length > 0) {
                    const noteDetail = document.getElementById('noteDetail');
                    noteDetail.innerHTML = ''; // Xóa nội dung cũ

                    // Tạo phần tử input để thêm ghi chú mới
                    const noteinputElement = document.createElement('input');
                    noteinputElement.classList.add('note-input');
                    noteinputElement.type = 'text';
                    noteinputElement.placeholder = 'add new note';
                    noteDetail.appendChild(noteinputElement);

                    // Tạo phần tử để đánh dấu ghi chú quan trọng
                    const importantItem = document.createElement('div');
                    importantItem.classList.add('note-item');
                    importantItem.innerText = 'important';
                    importantItem.addEventListener('click', async () => {
                        await renderImportantNotes(accountid, token);
                        closePopup(); // Đóng popup sau khi hiển thị ghi chú quan trọng
                    });
                    noteDetail.appendChild(importantItem);
                    // Hàm xử lý thêm ghi chú mới
                    async function handleNoteInput() {
                        const title = noteinputElement.value;
                        if (title.trim() !== '') {
                            try {
                                const response = await fetch('https://izm.transtechvietnam.com/createNote', {
                                    method: 'POST',
                                    headers: {
                                        'Authorization': `Bearer ${token}`,
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({ accountid, title }),
                                });

                                if (!response.ok) {
                                    throw new Error(`HTTP error! Status: ${response.status}`);
                                }

                                const data = await response.json();
                                console.log('Note created:', data);

                                // Đóng popup
                                closePopup();

                                // Cập nhật note hiện tại thành note mới vừa tạo
                                // currentSelectedNote = data.note; // Cập nhật note hiện tại
                                updateSidebarTitle(currentSelectedNote.title);

                                // Tải lại nội dung note
                                // const contentNote = await getContentNoteById(currentSelectedNote.id, token);
                                // renderNoteContent(contentNote.data);
                            } catch (error) {
                                console.error('Error:', error);
                            }
                        }
                    }

                    noteinputElement.addEventListener('blur', handleNoteInput);
                    noteinputElement.addEventListener('keydown', (event) => {
                        if (event.key === 'Enter') {
                            noteinputElement.blur(); // Kích hoạt sự kiện blur
                        }
                    });

                    // Hiển thị ghi chú trong popup
                    notes.forEach(note => {
                        const noteElement = document.createElement('div');
                        noteElement.classList.add('note-item');
                        noteElement.innerText = note.title;
                        noteElement.addEventListener('click', async () => {
                            currentSelectedNote = note;
                            updateSidebarTitle(note.title);
                            const contentNote = await getContentNoteById(note.id, token);
                            renderNoteContent(contentNote.data);
                            closePopup(); // Đóng popup khi chọn ghi chú
                        });

                        const deleteIcon = document.createElement('i');
                        deleteIcon.classList.add('fas', 'fa-trash', 'fa-sm', 'delete-note-icon');
                        deleteIcon.style.cursor = 'pointer'; // Đổi con trỏ chuột thành hình bàn tay khi rê chuột vào
                        deleteIcon.addEventListener('click', async (event) => {
                            event.stopPropagation(); // Ngăn sự kiện click lan tới ghi chú cha
                            const noteid = note.id;
                            console.log('Đã nhấn xóa:', noteid);

                            try {
                                const response = await fetch(`https://izm.transtechvietnam.com/deleteNote/${noteid}`, {
                                    method: 'DELETE',
                                    headers: {
                                        'Authorization': `Bearer ${token}`
                                    }
                                });

                                if (!response.ok) {
                                    throw new Error('Không thể xóa ghi chú');
                                }

                                // Xóa ghi chú khỏi giao diện
                                noteElement.remove();
                            } catch (error) {
                                console.error('Lỗi khi xóa ghi chú:', error);
                            }
                        });

                        noteElement.appendChild(deleteIcon);
                        noteDetail.appendChild(noteElement);
                    });

                    popup.style.display = 'block';
                    if (dimOverlay) {
                        dimOverlay.style.display = 'block'; // Hiển thị overlay khi mở popup
                    }
                }
            });
        }
    }



    document.addEventListener('DOMContentLoaded', () => {
        const popup = document.getElementById('notePopup');
        const overlayPopup = document.querySelector('.overlay-note-popup');

        // Thêm sự kiện click cho phần tử .popupnote
        if (popup) {
            popup.addEventListener('click', (event) => {
                closePopup();
            });
        }

        // Ngăn sự kiện click lan đến .popupnote từ bên trong .overlay-note-popup
        if (overlayPopup) {
            overlayPopup.addEventListener('click', (event) => {
                event.stopPropagation();
            });
        }
    });

    function closePopup() {
        const popup = document.getElementById('notePopup');
        const dimOverlay = document.querySelector('.dim-overlay');

        if (popup) {
            popup.style.display = 'none';
            if (dimOverlay) {
                dimOverlay.style.display = 'none';
            }
        }
    }


    function updateSidebarTitle(title) {
        const sidebarTitle = document.querySelector('.sidebar-title');
        if (sidebarTitle) {
            sidebarTitle.innerText = title;
        }
    }

    function renderNoteContent(content) {
        const noteContentContainer = document.querySelector('.note-content');
        if (noteContentContainer) {
            noteContentContainer.innerHTML = ''; // Xóa nội dung cũ

            completedNotes = []; // Xóa danh sách ghi chú đã hoàn thành

            content.forEach(item => {
                const contentContainer = document.createElement('div');
                contentContainer.classList.add('content-item');
                contentContainer.style.position = 'relative';

                if (item.checksuccess.data[1] === 1) {
                    completedNotes.push(item); // Thêm vào danh sách ghi chú đã hoàn thành
                } else {
                    const successIcon = document.createElement('img');
                    successIcon.classList.add('success-icon');
                    successIcon.src = '../../access/icon-unsucc.png';
                    successIcon.style.cursor = 'pointer';

                    const pinIcon = document.createElement('img');
                    pinIcon.classList.add('pin-icon');
                    pinIcon.src = item.important.data[1] ? '../../access/star_pin.png' : '../../access/star-unpin.png';
                    pinIcon.style.cursor = 'pointer';

                    const contentElement = document.createElement('input');
                    contentElement.classList.add('content-item-input');
                    contentElement.value = item.contentnote;
                    contentElement.setAttribute('readonly', true);
                    contentElement.dataset.id = item.id;
                    contentElement.dataset.clickCount = 0;

                    const deleteIcon = document.createElement('i');
                    deleteIcon.classList.add('fas', 'fa-trash', 'fa-sm', 'delete-content-icon');
                    deleteIcon.style.cursor = 'pointer';

                    contentElement.addEventListener('click', () => {
                        let clickCount = parseInt(contentElement.dataset.clickCount) || 0;
                        clickCount += 1;
                        contentElement.dataset.clickCount = clickCount;

                        if (clickCount === 2) {
                            contentElement.removeAttribute('readonly');
                            contentElement.focus();
                        }
                    });

                    contentElement.addEventListener('keydown', async (event) => {
                        if (event.key === 'Enter') {
                            await updateContent(contentElement);
                            contentElement.dataset.clickCount = 0;
                        }
                    });

                    contentElement.addEventListener('blur', async () => {
                        if (!contentElement.hasAttribute('readonly')) {
                            await updateContent(contentElement);
                            contentElement.dataset.clickCount = 0;
                        }
                    });

                    deleteIcon.addEventListener('click', async () => {
                        const contentId = contentElement.dataset.id;
                        const token = localStorage.getItem('token');

                        try {
                            const response = await fetch(`https://izm.transtechvietnam.com/deleteContentNote/${contentId}`, {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': `Bearer ${token}`
                                }
                            });

                            if (!response.ok) {
                                throw new Error('Failed to delete content');
                            }


                            contentContainer.remove();
                        } catch (error) {
                            console.error('Error deleting content:', error);
                        }
                    });

                    pinIcon.addEventListener('click', async () => {
                        const token = localStorage.getItem('token');
                        item.important.data[1] = !item.important.data[1];
                        pinIcon.src = item.important.data[1] ? '../../access/star_pin.png' : '../../access/star-unpin.png';

                        const apiUrl = item.important.data[1] ? `https://izm.transtechvietnam.com/pinContentNote/${item.id}` : `https://izm.transtechvietnam.com/unpinContentNote/${item.id}`;
                        try {
                            const response = await fetch(apiUrl, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${token}`
                                },
                                body: JSON.stringify({ important: item.important })
                            });

                            if (!response.ok) {
                                throw new Error('Failed to update pin state');
                            }

                        } catch (error) {
                            console.error('Error updating pin state:', error);
                        }
                    });

                    successIcon.addEventListener('click', async () => {
                        const token = localStorage.getItem('token');
                        item.checksuccess.data[1] = !item.checksuccess.data[1];
                        successIcon.src = item.checksuccess.data[1] ? '../../access/icon-succ.png' : '../../access/icon-unsucc.png';

                        console.log(item.checksuccess.data[1]);


                        const apiUrl = item.checksuccess.data[1] ? `https://izm.transtechvietnam.com/pinCheckSuccess/${item.id}` : `https://izm.transtechvietnam.com/unCheckSuccess/${item.id}`;
                        try {
                            const response = await fetch(apiUrl, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${token}`
                                },
                                body: JSON.stringify({ checksuccess: item.checksuccess })
                            });

                            if (!response.ok) {
                                throw new Error('Failed to update success state');
                            }
                            // await refreshData();


                            if (currentTitle === 'important') {
                                // Render dữ liệu của "Important"
                                await renderImportantNotes(accountId, token);
                            } else {
                                // Render dữ liệu của ghi chú hiện tại
                                const updatedContent = await getContentNoteById(item.noteid, token);
                                if (updatedContent && updatedContent.data) {
                                    renderNoteContent(updatedContent.data);
                                } else {
                                    console.error('No data returned for note:', item.noteid);
                                }
                            }

                        } catch (error) {
                            console.error('Error updating success state:', error);
                        }
                    });

                    contentContainer.appendChild(successIcon);
                    contentContainer.appendChild(pinIcon);
                    contentContainer.appendChild(contentElement);
                    contentContainer.appendChild(deleteIcon);

                    noteContentContainer.appendChild(contentContainer);
                }
            });

            // Render các ghi chú đã hoàn thành trong sidebar
            renderCompletedNotes(completedNotes);
        }
    }


    async function updateContent(contentElement) {
        const newContent = contentElement.value;
        if (newContent.trim() !== '') {
            const token = localStorage.getItem('token');
            const contentId = contentElement.dataset.id;

            try {
                const response = await fetch(`https://izm.transtechvietnam.com/updateContentNote/${contentId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ contentnote: newContent })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                // Successfully updated, set readonly back to true
                contentElement.setAttribute('readonly', true);

                // Optionally, update the content in the UI if necessary
                console.log('Content updated:', newContent);
            } catch (error) {
                console.error('Error updating content:', error);
            }
        } else {
            contentElement.setAttribute('readonly', true);
        }
    }

});