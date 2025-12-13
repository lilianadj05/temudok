// UPDATE reminder by id
app.put("/reminders/:id", (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;

    fs.readFile("reminders.json", "utf8", (err, data) => {
        if (err) return res.status(500).json({ message: "Error reading file" });

        let reminders = JSON.parse(data);

        const index = reminders.findIndex(r => r.id == id);
        if (index === -1) {
            return res.status(404).json({ message: "Reminder not found" });
        }

        // Update data
        reminders[index] = { ...reminders[index], ...updatedData };

        fs.writeFile("reminders.json", JSON.stringify(reminders, null, 2), (err) => {
            if (err) return res.status(500).json({ message: "Error saving file" });

            res.json({ message: "Updated successfully", reminder: reminders[index] });
        });
    });
});
