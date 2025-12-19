document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ Appointment Page Loaded");

    const confirmBtn = document.getElementById('confirmBtn');
    
    if (confirmBtn) {
        console.log("✅ Confirm button found");
        
        confirmBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            
            // Simpan state tombol
            const originalText = confirmBtn.textContent;
            const originalDisabled = confirmBtn.disabled;
            
            // Ubah tombol jadi loading
            confirmBtn.textContent = "Processing...";
            confirmBtn.disabled = true;
            
            // --- VALIDASI ---
            const nameVal = document.getElementById('name').value;
            const dateVal = document.getElementById('date').value;

            if(!nameVal || !dateVal) {
                alert("Mohon isi Nama dan Tanggal!");
                confirmBtn.textContent = originalText;
                confirmBtn.disabled = originalDisabled;
                return;
            }

            // Validasi tanggal tidak boleh lebih awal dari hari ini
            const today = new Date().toISOString().split('T')[0];
            if (dateVal < today) {
                alert("❌ Tanggal tidak boleh lebih awal dari hari ini!");
                confirmBtn.textContent = originalText;
                confirmBtn.disabled = originalDisabled;
                return;
            }
            
            // --- AMBIL DATA DARI URL ---
            const urlParams = new URLSearchParams(window.location.search);
            const specialist = urlParams.get('specialist') || "General Practitioner";
            const doctorName = urlParams.get('doctor') || "General Doctor";
            
            // --- DATA PAYLOAD ---
            const appointmentData = {
                name: nameVal,
                date: dateVal,
                time: document.getElementById('time').value,
                notes: document.getElementById('notes').value,
                specialist: specialist,
                doctor: doctorName
            };
            
            console.log("📤 Sending appointment data:", appointmentData);
            
            try {
                // --- KIRIM KE BACKEND ---
                const response = await fetch('/book_appointment', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(appointmentData)
                });
                
                console.log("📥 Status response:", response.status);
                
                const data = await response.json();
                console.log("📊 Data response:", data);
                
                if (data.status === 'success') {
                    console.log("✅ Appointment berhasil!");
                    
                    // --- REDIRECT KE REMINDERS ---
                    console.log("🔄 Redirect ke reminders.html...");
                    window.location.href = "reminders.html";
                    return; // Hentikan eksekusi selanjutnya
                    
                } else {
                    alert("❌ Gagal: " + data.message);
                    confirmBtn.textContent = originalText;
                    confirmBtn.disabled = originalDisabled;
                }
                
            } catch (error) {
                console.error("❌ Error:", error);
                alert("⚠️ Error koneksi ke server!");
                confirmBtn.textContent = originalText;
                confirmBtn.disabled = originalDisabled;
            }
        });
    } else {
        console.error("❌ Confirm button tidak ditemukan!");
    }

    // --- Load Data User (tambahan dari kode lama) ---
    const username = localStorage.getItem('currentUser');
    if (username) {
        const userDisplay = document.getElementById('userDisplay');
        if (userDisplay) userDisplay.textContent = `Hi, ${username}!`;
        const nameInput = document.getElementById('name');
        if (nameInput) nameInput.value = username;
    }

    // --- Load Data Dokter dari URL (tambahan dari kode lama) ---
    const urlParams = new URLSearchParams(window.location.search);
    const specialist = urlParams.get('specialist');
    const doctorName = urlParams.get('doctor');
    const doctorImage = urlParams.get('doctorImage');

    if (specialist) {
        if(document.getElementById('targetSpecialist')) 
            document.getElementById('targetSpecialist').textContent = specialist;
        
        if(document.getElementById('doctorNameDisplay') && doctorName) 
            document.getElementById('doctorNameDisplay').textContent = doctorName;

        const imgEl = document.getElementById('doctorImage');
        if (imgEl && doctorImage) {
            imgEl.src = doctorImage.startsWith('/') ? doctorImage : '/' + doctorImage;
        }

        const notes = document.getElementById('notes');
        if (notes) notes.value = `Consultation with ${doctorName || 'Doctor'} (${specialist})`;
    }
});