document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ Login Page Loaded");

    const loginForm = document.querySelector('.login-form');
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.querySelector('.eye-icon');

    // --- 1. Fitur Lihat Password ---
    if (eyeIcon && passwordInput) {
        eyeIcon.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.textContent = type === 'password' ? '👁️' : '🙈';
        });
    }

    // --- 2. Handle Login ---
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Stop reload

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const submitBtn = document.querySelector('.login-btn');
            const originalText = submitBtn.textContent;

            // Ubah tombol jadi loading
            submitBtn.textContent = "Logging in...";
            submitBtn.disabled = true;

            // Kirim ke Backend
            fetch('http://127.0.0.1:5000/login', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, password: password })
            })
            .then(response => {
                // Cek jika server error (500) atau 401
                return response.json().then(data => ({ status: response.status, body: data }));
            })
            .then(result => {
                const data = result.body;
                console.log("Respon Server:", data); // Cek Console F12

                if (data.status === 'success') {
                    // Simpan data user
                    localStorage.setItem('currentUser', data.username);
                    
                    alert("Login Successful! Welcome, " + data.username);
                    window.location.href = 'home.html';
                } else {
                    // Tampilkan pesan error yang jelas
                    alert("Login Failed: " + (data.message || "Email atau Password salah!"));
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }
            })
            .catch(error => {
                console.error('Fetch Error:', error);
                alert("⚠️ Error Koneksi: Pastikan server Python (main.py) menyala!");
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            });
        });
    }
});