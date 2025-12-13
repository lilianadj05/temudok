const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const DB_FILE = "./reminders.json";

// Pastikan file DB ada
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, "[]");
}

// GET semua reminders
app.get("/reminders", (req, res) => {
    fs.readFile(DB_FILE, "utf8", (err, data) => {
        if (err) return res.status(500).json({ error: "Failed to read DB" });

        res.status(200).json(JSON.parse(data));
    });
});

// POST tambah reminder
app.post("/reminders", (req, res) => {
    const newReminder = req.body;

    fs.readFile(DB_FILE, "utf8", (err, data) => {
        if (err) return res.status(500).json({ error: "Failed to read DB" });

        const reminders = JSON.parse(data);

        // Tambahkan ID supaya bisa di-edit
        newReminder.id = Date.now().toString();

        reminders.push(newReminder);

        fs.writeFile(DB_FILE, JSON.stringify(reminders, null, 2), (err) => {
            if (err) return res.status(500).json({ error: "Failed to save DB" });

            res.status(201).json({
                message: "Reminder added successfully",
                reminder: newReminder
            });
        });
    });
});

// PUT update reminder
app.put("/reminders/:id", (req, res) => {
    const reminderId = req.params.id;
    const updatedData = req.body;

    fs.readFile(DB_FILE, "utf8", (err, data) => {
        if (err) return res.status(500).json({ error: "Failed to read DB" });

        let reminders = JSON.parse(data);
        let index = reminders.findIndex(r => r.id === reminderId);

        if (index === -1) {
            return res.status(404).json({ error: "Reminder not found" });
        }

        reminders[index] = { ...reminders[index], ...updatedData };

        fs.writeFile(DB_FILE, JSON.stringify(reminders, null, 2), (err) => {
            if (err) return res.status(500).json({ error: "Failed to update reminder" });

            res.status(200).json({
                message: "Reminder updated successfully",
                reminder: reminders[index]
            });
        });
    });
});

// Jalankan server
app.listen(3000, () => {
    console.log("Backend running on http://localhost:3000");
});
