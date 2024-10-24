
document.addEventListener('DOMContentLoaded', async () => {
    const initialPrizeData = await fetchUserData('https://izm.transtechvietnam.com/getWinPrize');
    updateWinnersUI(initialPrizeData.data); // Initialize with API data
});

const socket = io('https://izm.transtechvietnam.com');

socket.on('connect', () => {
    console.log('Connected to server');
    socket.emit('getInitialWinners'); // Request initial winner data when connected
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});

socket.on('gachaResult', (data) => {
    updateGachaCode(data.code);
    updateWinner(data); // Update with new gacha result
});

socket.on('initialWinners', (data) => {
    // Fetch additional data from API and merge it with socket data
    fetchUserData('https://izm.transtechvietnam.com/getWinPrize').then(apiData => {
        const mergedData = [...data, ...apiData.data];
        updateWinnersUI(mergedData); // Update UI with merged data
    }).catch(error => {
        console.error('Error fetching API data:', error);
        updateWinnersUI(data); // Fallback to socket data if API call fails
    });
});

function updateWinnersUI(winnerData) {
    const winnerElement = document.getElementById('winner');
    winnerElement.innerHTML = ''; // Clear previous content

    if (winnerData && winnerData.length > 0) {
        winnerData.forEach(winner => {
            const maskedPhone = winner.phone.slice(0, -3) + '***';
            const winnerInfo = document.createElement('div');
            winnerInfo.classList.add('winner-info');
            winnerInfo.textContent = `${truncateUserName(winner.username)} - ${maskedPhone} - ${winner.code}`;
            winnerElement.appendChild(winnerInfo);
        });
    } else {
        winnerElement.textContent = 'No users have won the prize yet';
    }
}

function handleGacha(event) {
    socket.emit('gacha');
}

function updateWinner(data) {
    const winnerElement = document.getElementById('winner');
    const maskedPhone = data.phone.slice(0, -3) + '***';
    const winnerInfo = document.createElement('div');
    winnerInfo.classList.add('winner-info');
    winnerInfo.textContent = `${truncateUserName(data.username)} - ${maskedPhone} - ${data.code}`;
    winnerElement.appendChild(winnerInfo);
}

function updateGachaCode(code) {
    const codeElements = document.querySelectorAll('.gacha-item');
    code.split('').forEach((char, index) => {
        codeElements[index].textContent = char;
    });
}

function truncateUserName(userName) {
    if (userName.length > 20) {
        return userName.slice(0, 18) + '...';
    }
    return userName;
}

async function fetchUserData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching user data:', error);
        return { data: [] }; // Return empty data on error
    }
}

