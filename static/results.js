document.addEventListener('DOMContentLoaded', function() {
    
    const urlParams = new URLSearchParams(window.location.search);
    
    // Ambil data, jika kosong isi default
    const specialist = urlParams.get('specialist') || "General Practitioner";
    const doctorName = urlParams.get('doctorName') || "dr. Karlina Septianti";
    let doctorImage = urlParams.get('doctorImage') || "assets/doctors_page/Karlina_Septianti.jpg";

    // Bersihkan path gambar jika ada dobel slash
    if (!doctorImage.startsWith('/') && !doctorImage.startsWith('http')) {
        doctorImage = '/' + doctorImage;
    }

    // Tampilkan di HTML
    document.getElementById('specialistResult').textContent = specialist;
    document.getElementById('doctorName').textContent = doctorName;
    document.getElementById('doctorImage').src = doctorImage;

    // Update Link Tombol
    const bookBtn = document.getElementById('bookBtn');
    bookBtn.href = `appointment.html?specialist=${encodeURIComponent(specialist)}&doctor=${encodeURIComponent(doctorName)}&doctorImage=${encodeURIComponent(doctorImage)}`;
});