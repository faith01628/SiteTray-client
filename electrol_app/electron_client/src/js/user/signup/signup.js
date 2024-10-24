function handleLogin(event) {
    event.preventDefault();
    window.location.href = '../../login.html';
}

async function handleNext(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const address = document.getElementById('address').value;

    try {
        const response = await fetch('https://izm.transtechvietnam.com/createUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                phone,
                email,
                address
            })
        });

        const result = await response.json();

        if (response.status === 201) {
            console.log('Signup successful', result);
            localStorage.setItem('userId', result.data.id);
            const userId = localStorage.getItem('userId');
            console.log('userId:', userId);

            // Redirect to check.html after successful signup
            window.location.href = 'check.html';
        } else {
            console.error('Signup failed', result);
        }

    } catch (error) {
        console.error('Error:', error);
    }
}