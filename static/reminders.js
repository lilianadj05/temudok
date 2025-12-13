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

// --- LOAD & FILTER DATA ---
function loadReminders() {
    const username = localStorage.getItem('currentUser') || '';

    fetch(`http://127.0.0.1:5000/get_reminders?patient=${username}`)
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
                // Tentukan Kategori: Jika 'Medicine', 'Habit', 'Other' masuk ke kanan. Sisanya (Dokter) ke kiri.
                const isManual = ['Medicine', 'Habit', 'Other'].includes(item.subtitle);
                
                const div = document.createElement("div");
                div.className = "reminder-item";
                
                // Format Tampilan
                let titleDisplay = `<strong>${item.title}</strong>`;
                if(!isManual) titleDisplay = `<strong>Consultation: ${item.title}</strong>`; // Tambah prefix kalau dokter

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
                        <label class="switch"><input type="checkbox" checked><span class="slider round"></span></label>
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

// --- FUNGSI ADD NEW (Manual) ---
function addNewReminder() {
    const title = document.getElementById('addTitle').value;
    const category = document.getElementById('addCategory').value; // Medicine/Habit
    const date = document.getElementById('addDate').value;
    const time = document.getElementById('addTime').value;
    const notes = document.getElementById('addNotes').value;
    const username = localStorage.getItem('currentUser') || 'Guest';

    // Format Jam AM/PM sederhana
    let [h, m] = time.split(':');
    let ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12; 
    h = h ? h : 12; 
    const formattedTime = `${h}:${m} ${ampm}`;

    // Kita "numpang" simpan di tabel appointments
    // patient_name = user, specialist = category, doctor_name = title
    const payload = {
        name: username,
        specialist: category, 
        doctor: title,
        date: date,
        time: formattedTime,
        notes: notes
    };

    fetch('http://127.0.0.1:5000/book_appointment', {
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
            loadReminders();
        } else {
            alert("Failed: " + data.message);
        }
    })
    .catch(err => alert("Error: " + err));
}

// --- FUNGSI DELETE ---
function deleteReminder(id) {
    if(!confirm("Delete this reminder?")) return;

    fetch(`http://127.0.0.1:5000/delete_appointment/${id}`, { method: 'DELETE' })
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

// --- FUNGSI EDIT ---
function openEditModal(id, title, fullTime, notes) {
    document.getElementById('editId').value = id;
    document.getElementById('editTitle').value = title;
    document.getElementById('editNotes').value = notes;
    
    // Parse Date Time "YYYY-MM-DD at HH:MM AM/PM"
    // Ini agak tricky karena format string, jadi kita coba ambil simple
    try {
        const parts = fullTime.split(' at ');
        if(parts.length === 2) {
            document.getElementById('editDate').value = parts[0];
            // Jam tidak kita parse balik ke input time karena format AM/PM ribet, user set ulang saja
        }
    } catch(e) {}

    document.getElementById('editModal').style.display = 'flex';
}

function saveEdit() {
    const id = document.getElementById('editId').value;
    const date = document.getElementById('editDate').value;
    const timeRaw = document.getElementById('editTime').value;
    const notes = document.getElementById('editNotes').value;

    // Format time again
    let formattedTime = timeRaw; 
    if(timeRaw) {
        let [h, m] = timeRaw.split(':');
        let ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12; h = h ? h : 12; 
        formattedTime = `${h}:${m} ${ampm}`;
    }

    fetch(`http://127.0.0.1:5000/update_appointment/${id}`, {
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