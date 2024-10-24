localStorage.clear();
// const { backupData } = require('../backup.js');
// Import required modules

async function handleLogin(event) {
    event.preventDefault();

    // Nhận giá trị từ ô input
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // if (email === '' || password === '') {
    //     Toastify({
    //         text: "Please enter email and password",
    //         duration: 3000,
    //         gravity: "top",
    //         close: true
    //     }).showToast();
    //     return;
    // }

    try {
        let response = await fetch('https://izm.transtechvietnam.com/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        let result = await response.json();

        if (response.status === 200 && result.data && result.data.token) {
            localStorage.setItem('token', result.data.token);
            localStorage.setItem('account', result.data.user.id);

            const role = result.data.user.role.data[1]

            console.log('Role:', result.data.user.role.data[1]);

            if (role === 1) { // admin
                window.location.href = './admin/home.html';
            } else if (role === 0) { // user
                window.location.href = './user/home1.html';
            } else {
                console.error('Unknown role');
                Toastify({
                    text: "Unknown role",
                    duration: 3000,
                    gravity: "top",
                    close: true
                }).showToast();
            }

            // await backupData(result.data.user.id, result.data.token);
        } else {
            console.error('Login failed:', result.message);
            Toastify({
                text: result.message || "Login failed",
                duration: 3000,
                gravity: "top",
                close: true
            }).showToast();
        }

    } catch (error) {
        console.error('Error:', error);
        Toastify({
            text: "An error occurred. Please try again.",
            duration: 3000,
            gravity: "top",
            close: true
        }).showToast();
    }
}

async function handleShowPassword(event) {
    event.preventDefault();

    const password = document.getElementById('password');
    const passwordIcon = document.getElementById('password-icon');

    if (password.type === 'password') {
        password.type = 'text';
        passwordIcon.classList.remove('fa-eye');
        passwordIcon.classList.add('fa-eye-slash');
        passwordIcon.style.right = '14px';
    } else {
        passwordIcon.classList.remove('fa-eye-slash');
        passwordIcon.classList.add('fa-eye');
        passwordIcon.style.right = '15px';
        password.type = 'password';
    }
}

window.addEventListener('load', async function () {
    const rememberMe = localStorage.getItem('rememberMe');

    if (rememberMe) {
        const email = localStorage.getItem('email');
        const token = localStorage.getItem('token');

        if (email && token) {
            const response = await autoLogin(email, token);

            if (response.success) {
                // Redirect user if auto-login is successful
                window.location.href = 'dashboard.html';
            } else {
                // Clear localStorage if login fails
                localStorage.removeItem('rememberMe');
                localStorage.removeItem('email');
                localStorage.removeItem('token');
            }
        }
    }
});

async function autoLogin(email, token) {
    try {
        const response = await fetch('https://izm.transtechvietnam.com/auto-login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ email })
        });
        return response.json();
    } catch (error) {
        console.error('Auto-login failed:', error);
        return { success: false };
    }
}


function autoLogin(email, token) {
    // Make a request to the server to verify the token or re-authenticate the user
    return fetch('/auto-login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email })
    }).then(response => response.json());
}


const email = document.getElementById('email').value;
const password = document.getElementById('password').value;

async function handleSignup(event) {
    event.preventDefault();
    window.location.href = './user/signup/signup.html';
}

document.getElementById('login-form').addEventListener('submit', handleLogin);
