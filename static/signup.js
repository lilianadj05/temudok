document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ Signup Page Loaded");

    const signupForm = document.getElementById('signupForm');
    
    if (signupForm) {
        console.log("✅ Form ditemukan");
        
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = document.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            const originalDisabled = submitBtn.disabled;
            
            submitBtn.textContent = "Creating Account...";
            submitBtn.disabled = true;
            
            // Ambil data
            const userData = {
                username: document.getElementById('username').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value
            };
            
            console.log("📤 Mengirim data:", userData);
            
            try {
                const response = await fetch('http://127.0.0.1:5000/signup', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });
                
                console.log("📥 Status response:", response.status);
                
                const data = await response.json();
                console.log("📊 Data response:", data);
                
                if (data.status === 'success') {
                    console.log("✅ Signup berhasil!");
                    
                    // OPTION 1: Langsung redirect tanpa alert
                    console.log("🔄 Redirect ke login.html...");
                    window.location.href = "login.html";
                    return; // Hentikan eksekusi selanjutnya
                    
                    // OPTION 2: Dengan alert tapi force redirect
                    // alert("✅ Akun berhasil dibuat! Silakan Login.");
                    // setTimeout(() => {
                    //     window.location.href = "login.html";
                    // }, 100);
                    
                } else {
                    alert("❌ " + data.message);
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }
                
            } catch (error) {
                console.error("❌ Error:", error);
                alert("⚠️ Error koneksi ke server!");
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    } else {
        console.error("❌ Form tidak ditemukan!");
    }
});