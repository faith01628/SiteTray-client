async function handleNext(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const email = document.getElementById('email').value;
    const comfirmPassword = document.getElementById('confirmPassword').value;
    const address = null;
    const phone = null;
    const checkbox = document.getElementById('I-accept-me');

    if (password !== comfirmPassword) {
        console.log('Passwords do not match');
        return;
    } else if (!checkbox.checked) {
        console.log('You must accept the terms and conditions');
        return;
    } else {
        // console.log('Passwords match');
        try {
            const response = await fetch('https://izm.transtechvietnam.com/createUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    password,
                    email,
                    address,
                    phone
                })
            });

            const result = await response.json();

            if (response.status === 201) {
                console.log('Signup successful', result);
                localStorage.setItem('userId', result.data.id);
                const userId = localStorage.getItem('userId');
                console.log('userId:', userId);
                window.location.href = '../login.html';
                // Redirect to check.html after successful signup
                // const email = localStorage.getItem('email');

            } else {
                console.error('Signup failed', result);
            }

        } catch (error) {
            console.error('Error:', error);
        }
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

async function handleShowPasswordConfirm(event) {
    event.preventDefault();

    const password = document.getElementById('confirmPassword');
    const passwordIcon = document.getElementById('password-confirm-icon');

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