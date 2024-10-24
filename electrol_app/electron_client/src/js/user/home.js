const token = localStorage.getItem('token');
const userId = localStorage.getItem('account');

// function showWinnerPopup() {
//     // Create overlay HTML content
//     const overlayContent = `<div class="popup-overlay"></div>`;

//     // Create popup HTML content
//     const popupContent = `
//         <div class="winner-popup">
//             <p>Congratulations! You have won a prize!</p>
//             <button onclick="closeWinnerPopup()">Close</button>
//         </div>
//     `;

//     // Insert overlay and popup into the page
//     document.body.insertAdjacentHTML('beforeend', overlayContent);
//     document.body.insertAdjacentHTML('beforeend', popupContent);

//     // Function to close the popup
//     window.closeWinnerPopup = function () {
//         document.querySelector('.winner-popup').remove();
//         document.querySelector('.popup-overlay').remove();
//         // Clean up the close function
//         delete window.closeWinnerPopup;
//     };
// }

async function handleHome(event) {
    event.preventDefault();

    if (!token || !userId) {
        console.error('No token or userId found');
        return;
    }

    try {
        const response = await fetch(`https://izm.transtechvietnam.com/getByUserId/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        const userData = data.data[0];
        const idUser = userData._id;

        updateUserInfo(userData);
        generateBarcode(userData.code);

        console.log('getByUserId:', data);

        const getwinner = await fetch(`https://izm.transtechvietnam.com/getWinPrize`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const datawinner = await getwinner.json();
        const winners = datawinner.data; // Assuming this is an array of winner objects

        const getticker = await fetch(`https://izm.transtechvietnam.com/ticker`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const dataticker = await getticker.json();
        const ticker = dataticker.data[0];
        showticker(ticker);
        console.log(ticker);

        const userIsWinner = winners.some(winner => winner.accountid === idUser && winner.winprize === true);

        console.log(winners);
        console.log(userIsWinner);

        if (!userIsWinner) {
            // Show congratulatory popup
            showWinnerPopup();
        }
    } catch (error) {
        console.error('Error fetching home data:', error);
    }
}

function showticker(ticker) {
    const titletickerElement = document.getElementById('titleticker');
    const daytickerElement = document.getElementById('dayticker');
    const title1Element = document.getElementById('title1');
    const title2Element = document.getElementById('title2');
    const title3Element = document.getElementById('title3');
    const title4Element = document.getElementById('title4');
    const content1Element = document.getElementById('content1');
    const content2Element = document.getElementById('content2');
    const content3Element = document.getElementById('content3');
    const content4Element = document.getElementById('content4');
    // const imagetickerElement = document.getElementById('imageticker');


    if (titletickerElement) titletickerElement.innerText = ticker.titleticker;
    if (daytickerElement) daytickerElement.innerText = ticker.dayticker;
    if (title1Element) title1Element.innerText = ticker.title1;
    if (title2Element) title2Element.innerText = ticker.title2;
    if (title3Element) title3Element.innerText = ticker.title3;
    if (title4Element) title4Element.innerText = ticker.title4;
    if (content1Element) content1Element.innerText = ticker.content1;
    if (content2Element) content2Element.innerText = ticker.content2;
    if (content3Element) content3Element.innerText = ticker.content3;
    if (content4Element) content4Element.innerText = ticker.content4;
    // if (imagetickerElement) imagetickerElement.innerText = ticker.imageticker;
}

function updateUserInfo(userData) {
    const usernameElement = document.getElementById('username');
    const phoneElement = document.getElementById('phone');
    const emailElement = document.getElementById('email');
    const codeElement = document.getElementById('code');
    const addressElement = document.getElementById('address');
    const ticketUsernameElement = document.getElementById('ticket-username');
    const ticketCodeElement = document.getElementById('ticket-code');

    if (usernameElement) usernameElement.innerText = userData.username;
    if (phoneElement) phoneElement.innerText = userData.phone;
    if (emailElement) emailElement.innerText = userData.email;
    if (codeElement) codeElement.innerText = userData.code;
    if (addressElement) addressElement.innerText = userData.address;
    if (ticketUsernameElement) ticketUsernameElement.innerText = userData.username;
    if (ticketCodeElement) ticketCodeElement.innerText = userData.code;
}

function generateBarcode(code) {
    if (code) {
        JsBarcode("#barcode", code, {
            format: "CODE128",
            lineColor: "#333",
            width: 2,
            height: 60,
            displayValue: false
        });
    }
}

async function handleEdit(event) {
    event.preventDefault();
    const response = await fetch(`https://izm.transtechvietnam.com/getByUserId/${userId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const data = await response.json();
    const userData = data.data[0];
    if (userData.edit == true) {
        console.log('edit', userData.edit);
        window.location.href = '../../view/user/edit.html';
    } else {
        Toastify({
            text: "You can't edit now",
            duration: 3000,
            gravity: "top",
            close: true
        }).showToast();
    }
}

function handleLogout(event) {
    event.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('account');
    window.location.href = '../../view/login.html';
}

function handleRefresh(event) {
    event.preventDefault();
    // Implement refresh functionality here
}

function handleSave(event) {
    event.preventDefault();
    // Implement save functionality here
    console.log('Save button clicked');
}

function handleGacha(event) {
    event.preventDefault();
    window.location.href = 'gacha.html';
}

window.addEventListener('load', handleHome);
