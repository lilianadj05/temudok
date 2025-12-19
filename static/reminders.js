document.addEventListener("DOMContentLoaded", () => {
    loadReminders();

    // Setup Form Listeners
    document.getElementById('editForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveEdit();
    });

    document.getElementById('addForm').addEventListener('submit', (e) => {
        e.preventDefault();
        addNewReminder();
    });
});

// --- TOGGLE END DATE (SHOW/HIDE) ---
function toggleEndDate() {
    const freq = document.getElementById('addFrequency').value;
    const endDateGroup = document.getElementById('endDateGroup');
    if (freq === 'Once') {
        endDateGroup.style.display = 'none';
        document.getElementById('addEndDate').value = ''; 
    } else {
        endDateGroup.style.display = 'block';
    }
}

// --- LOAD DATA ---
function loadReminders() {
    const username = localStorage.getItem('currentUser') || '';

    // Mengambil semua data dari server
    fetch(`/get_reminders?patient=${username}`)
    .then(res => res.json())
    .then(data => {
        const appList = document.getElementById("appointment-list");
        const otherList = document.getElementById("other-list");
        
        appList.innerHTML = "";
        otherList.innerHTML = "";
        
        if (data.reminders && data.reminders.length > 0) {
            let hasApp = false;
            let hasOther = false;

            data.reminders.forEach(item => {
                // Filter: Jika kategori Medicine/Habit/Other masuk kolom Kanan. Sisanya Kiri.
                const isManual = ['Medicine', 'Habit', 'Other'].includes(item.subtitle);
                
                const div = document.createElement("div");
                div.className = "reminder-item";
                
                let titleDisplay = `<strong>${item.title}</strong>`;
                if(!isManual) titleDisplay = `<strong>Consultation: ${item.title}</strong>`; 

                div.innerHTML = `
                    <div class="reminder-text">
                        <p>${titleDisplay}<br>
                        <span style="color:#555; font-size:0.85rem;">${item.subtitle}</span>
                        <span style="color:#0056b3;">📅 ${item.time}</span>
                        <small style="color:#666; display:block; margin-top:2px;">📝 ${item.notes || '-'}</small>
                        </p>
                    </div>
                    <div class="reminder-actions">
                        <button class="icon-btn edit-btn" onclick="openEditModal(${item.id}, '${item.title}', '${item.time}', '${item.notes || ''}')">✏️</button>
                        <button class="icon-btn delete-btn" onclick="deleteReminder(${item.id})">🗑️</button>
                    </div>
                `;

                if (isManual) {
                    otherList.appendChild(div);
                    hasOther = true;
                } else {
                    appList.appendChild(div);
                    hasApp = true;
                }
            });

            if(!hasApp) appList.innerHTML = "<p style='color:#777; font-style:italic;'>No doctor appointments.</p>";
            if(!hasOther) otherList.innerHTML = "<p style='color:#777; font-style:italic;'>No medicine/habit reminders.</p>";

        } else {
            appList.innerHTML = "<p style='color:#777; font-style:italic;'>No appointments found.</p>";
            otherList.innerHTML = "<p style='color:#777; font-style:italic;'>No reminders found.</p>";
        }
    })
    .catch(err => console.error("Error loading reminders:", err));
}

// --- ADD NEW REMINDER (FUNCTION BARU) ---
function addNewReminder() {
    const title = document.getElementById('addTitle').value;
    const category = document.getElementById('addCategory').value;
    const frequency = document.getElementById('addFrequency').value; // Ambil Frekuensi
    const date = document.getElementById('addDate').value;
    const endDate = document.getElementById('addEndDate').value;     // Ambil Tgl Akhir
    const time = document.getElementById('addTime').value;
    const notes = document.getElementById('addNotes').value;
    const username = localStorage.getItem('currentUser') || 'Guest';

    // Validasi Tanggal Akhir untuk Recurring
    if (frequency !== 'Once' && !endDate) {
        alert("Please select an End Date for recurring reminders.");
        return;
    }
    if (frequency !== 'Once' && endDate < date) {
        alert("End Date cannot be before Start Date.");
        return;
    }

    // Format Jam
    let [h, m] = time.split(':');
    let ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12; 
    h = h ? h : 12; 
    const formattedTime = `${h}:${m} ${ampm}`;

    const payload = {
        name: username,
        specialist: category, 
        doctor: title,
        date: date,
        endDate: endDate,
        frequency: frequency,
        time: formattedTime,
        notes: notes
    };

    // KIRIM KE ENDPOINT /add_reminder (Bukan book_appointment)
    fetch('/add_reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        if(data.status === 'success') {
            alert("Reminder added!");
            closeAddModal();
            document.getElementById('addForm').reset();
            toggleEndDate(); // Reset UI
            loadReminders();
        } else {
            alert("Failed: " + data.message);
        }
    })
    .catch(err => alert("Error: " + err));
}

// --- DELETE FUNCTION ---
function deleteReminder(id) {
    if(!confirm("Delete this reminder?")) return;

    fetch(`/delete_appointment/${id}`, { method: 'DELETE' })
    .then(res => res.json())
    .then(data => {
        if(data.status === 'success') {
            loadReminders();
        } else {
            alert("Delete failed: " + data.message);
        }
    })
    .catch(err => alert("Error: " + err));
}

// --- EDIT FUNCTION (Simple Update) ---
function openEditModal(id, title, fullTime, notes) {
    document.getElementById('editId').value = id;
    document.getElementById('editTitle').value = title;
    document.getElementById('editNotes').value = notes;
    
    // Coba parse tanggal sederhana
    try {
        const parts = fullTime.split(' at ');
        if(parts.length === 2) {
            document.getElementById('editDate').value = parts[0];
        }
    } catch(e) {}

    document.getElementById('editModal').style.display = 'flex';
}

function saveEdit() {
    const id = document.getElementById('editId').value;
    const date = document.getElementById('editDate').value;
    const timeRaw = document.getElementById('editTime').value;
    const notes = document.getElementById('editNotes').value;

    let formattedTime = timeRaw; 
    if(timeRaw) {
        let [h, m] = timeRaw.split(':');
        let ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12; h = h ? h : 12; 
        formattedTime = `${h}:${m} ${ampm}`;
    }

    fetch(`/update_appointment/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: date, time: formattedTime, notes: notes })
    })
    .then(res => res.json())
    .then(data => {
        if(data.status === 'success') {
            alert("Updated!");
            closeEditModal();
            loadReminders();
        } else {
            alert("Update failed: " + data.message);
        }
    });
}

function closeEditModal() { document.getElementById('editModal').style.display = 'none'; }
function openAddModal() { document.getElementById('addModal').style.display = 'flex'; }
function closeAddModal() { document.getElementById('addModal').style.display = 'none'; }