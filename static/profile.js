document.addEventListener('DOMContentLoaded', function() {

    // --- 1. INISIALISASI DATA CHART (KOSONG DULU) ---
    // Gunakan array kosong [] jika belum ada data di localStorage
    let healthData = JSON.parse(localStorage.getItem('healthData')) || {
        bmi: [], bp: [], sugar: [], sleep: []
    };

    let bmiChart, bpChart, sugarChart, sleepChart;

    // --- 2. LOAD PROFIL & FOTO ---
    loadProfileData();
    loadProfileImage(); // Load foto dari storage

    // --- 3. EVENT LISTENER: GANTI FOTO ---
    document.getElementById('fileInput').addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imgData = e.target.result; // Data gambar base64
                
                // 1. Tampilkan langsung
                document.getElementById('profilePic').src = imgData;
                
                // 2. Simpan ke Local Storage
                localStorage.setItem('userProfilePic', imgData);
            };
            reader.readAsDataURL(file);
        }
    });

    // --- 4. FORM EDIT PROFILE ---
    document.getElementById('profileForm').addEventListener('submit', function(e) {
        e.preventDefault();
        localStorage.setItem('currentUser', document.getElementById('inputName').value);
        localStorage.setItem('userDOB', document.getElementById('inputDOB').value);
        localStorage.setItem('userAge', document.getElementById('inputAge').value);
        loadProfileData();
        closeProfileModal();
        alert("Profile Updated!");
    });

    // --- 5. FORM LOG DATA ---
    document.getElementById('logForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const bmi = parseFloat(document.getElementById('logBMI').value);
        const bp = parseFloat(document.getElementById('logBP').value);
        const sugar = parseFloat(document.getElementById('logSugar').value);
        const sleep = parseFloat(document.getElementById('logSleep').value);

        // Hanya masukkan data yang diisi (tidak NaN)
        if (!isNaN(bmi)) healthData.bmi.push(bmi);
        if (!isNaN(bp)) healthData.bp.push(bp);
        if (!isNaN(sugar)) healthData.sugar.push(sugar);
        if (!isNaN(sleep)) healthData.sleep.push(sleep);

        // Simpan
        localStorage.setItem('healthData', JSON.stringify(healthData));
        updateCharts();
        closeLogModal();
        document.getElementById('logForm').reset();
    });

    // --- FUNGSI LOAD DATA ---
    function loadProfileData() {
        const username = localStorage.getItem('currentUser') || "Guest";
        const dob = localStorage.getItem('userDOB') || "-";
        const age = localStorage.getItem('userAge') || "-";
        
        document.getElementById('profileName').textContent = username;
        document.getElementById('profileEmail').textContent = username.toLowerCase().replace(/\s/g, '') + "@gmail.com";
        document.getElementById('displayDOB').textContent = dob;
        document.getElementById('displayAge').textContent = age + " Years";
    }

    function loadProfileImage() {
        // Ambil foto dari storage, kalau ga ada pakai default icon orang
        const savedImg = localStorage.getItem('userProfilePic');
        if (savedImg) {
            document.getElementById('profilePic').src = savedImg;
        }
    }

    // --- FUNGSI CHART ---
    function createChart(canvasId, label, dataValues, color) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, 'rgba(10, 118, 229, 0.4)'); 
        gradient.addColorStop(1, 'rgba(10, 118, 229, 0.0)'); 

        // Buat label dummy sejumlah data (agar sumbu X ada isinya)
        // Jika data kosong, label kosong
        const labels = dataValues.length > 0 ? Array(dataValues.length).fill('') : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']; 
        
        // Konfigurasi Scale Y agar grafik tidak error saat data kosong
        const yScales = dataValues.length > 0 ? {} : { min: 0, max: 100 };

        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: label,
                    data: dataValues, // Bisa array kosong []
                    borderColor: '#0A76E5',
                    backgroundColor: gradient,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { 
                    x: { display: false },
                    y: { 
                        display: true,
                        ...yScales // Spread operator untuk handle skala kosong
                    } 
                }
            }
        });
    }

    function updateCharts() {
        if(bmiChart) bmiChart.destroy();
        if(bpChart) bpChart.destroy();
        if(sugarChart) sugarChart.destroy();
        if(sleepChart) sleepChart.destroy();

        bmiChart = createChart('bmiChart', 'BMI', healthData.bmi);
        bpChart = createChart('bpChart', 'BP', healthData.bp);
        sugarChart = createChart('sugarChart', 'Sugar', healthData.sugar);
        sleepChart = createChart('sleepChart', 'Sleep', healthData.sleep);
    }

    // Render Awal
    updateCharts();
});

// Modal Global Functions
function openProfileModal() {
    document.getElementById('inputName').value = localStorage.getItem('currentUser') || "";
    document.getElementById('inputDOB').value = localStorage.getItem('userDOB') || "";
    document.getElementById('inputAge').value = localStorage.getItem('userAge') || "";
    document.getElementById('profileModal').style.display = 'flex';
}
function closeProfileModal() { document.getElementById('profileModal').style.display = 'none'; }
function openLogModal() { document.getElementById('logModal').style.display = 'flex'; }
function closeLogModal() { document.getElementById('logModal').style.display = 'none'; }