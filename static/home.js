document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Ambil nama user dari localStorage
    const username = localStorage.getItem('currentUser');
    const userDisplay = document.getElementById('userDisplay');

    // 2. Tampilkan Nama User
    if (username && userDisplay) {
        // Kita tambahkan tanda panah kecil (▼) agar terlihat seperti menu
        userDisplay.textContent = `Hi, ${username}!`; 
    } else {
        // Jika tidak ada user (akses paksa), lempar ke login
        // alert("Sesi habis, silakan login kembali.");
        window.location.href = 'login.html';
    }

    // 3. LOGIC SIGN OUT / LOGOUT
    const logoutBtn = document.getElementById('logoutBtn');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault(); // Mencegah link meloncat ke atas

            // Konfirmasi logout (Opsional, bisa dihapus kalau mau langsung keluar)
            const confirmLogout = confirm("Are you sure you want to sign out?");
            
            if (confirmLogout) {
                // Hapus data user dari memori browser
                localStorage.removeItem('currentUser');
                
                // Redirect ke halaman Login
                window.location.href = 'login.html';
            }
        });
    }
});