document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ JS Loaded: doctor_recommendation.js");

    // --- 1. SETUP USERNAME ---
    const username = localStorage.getItem('currentUser');
    const userDisplay = document.getElementById('userDisplay');
    if (username && userDisplay) {
        userDisplay.textContent = `Hi, ${username}!`;
    }

    // --- 2. LOGIC LOAD SYMPTOMS ---
    const symptomsContainer = document.getElementById('symptomsContainer');
    
    if (symptomsContainer) {
        fetch('http://127.0.0.1:5000/features')
            .then(response => {
                if (!response.ok) throw new Error("Failed to connect to Backend (Port 5000)");
                return response.json();
            })
            .then(data => {
                if (data.features) {
                    renderCategorizedSymptoms(data.features);
                } else {
                    symptomsContainer.innerHTML = '<p style="color:red;">No symptoms data found.</p>';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                symptomsContainer.innerHTML = '<p style="color:red;">⚠️ Failed to load data. Ensure "main.py" is running!</p>';
            });
    }

    function renderCategorizedSymptoms(features) {
        symptomsContainer.innerHTML = '';
        
        // --- MANUAL CATEGORIZATION (Fixed & English) ---
        
        const skinSymptoms = [
            'itching', 'skin_rash', 'nodal_skin_eruptions', 'dischromic _patches', 'yellowish_skin', 
            'internal_itching', 'red_spots_over_body', 'skin_peeling', 'silver_like_dusting', 
            'small_dents_in_nails', 'inflammatory_nails', 'blister', 'red_sore_around_nose', 'yellow_crust_ooze',
            'bruising', 'swollen_blood_vessels', 'prominent_veins_on_calf'
        ];

        const respiratorySymptoms = [
            'continuous_sneezing', 'cough', 'breathlessness', 'mucoid_sputum', 'phlegm', 
            'blood_in_sputum', 'throat_irritation', 'sinus_pressure', 'runny_nose', 'congestion', 
            'loss_of_smell', 'rusty_sputum'
        ];

        const digestiveSymptoms = [
            'stomach_pain', 'acidity', 'ulcers_on_tongue', 'vomiting', 'nausea', 'loss_of_appetite', 
            'abdominal_pain', 'passage_of_gases', 'indigestion', 'excessive_hunger', 'diarrhoea', 
            'constipation', 'belly_pain', 'stomach_bleeding', 'swelling_of_stomach', 'distention_of_abdomen', 
            'pain_during_bowel_movements', 'pain_in_anal_region', 'bloody_stool', 'irritation_in_anus',
            'acute_liver_failure' // Moved here (Liver/Digestive issue)
        ];

        const neuroPainSymptoms = [
            'headache', 'dizziness', 'loss_of_balance', 'lack_of_concentration', 'stiff_neck', 
            'depression', 'irritability', 'back_pain', 'weakness_in_limbs', 'neck_pain', 
            'weakness_of_one_body_side', 'altered_sensorium', 'muscle_pain', 'joint_pain', 'coma', 
            'muscle_wasting', 'cramps', 'movement_stiffness', 'spinning_movements', 'unsteadiness'
        ];

        const feverGeneralSymptoms = [
            'chills', 'high_fever', 'fatigue', 'weight_loss', 'lethargy', 'dehydration', 
            'sweating', 'mild_fever', 'swelled_lymph_nodes', 'malaise', 'toxic_look_(typhos)', 
            'fluid_overload', 'fast_heart_rate', 'obesity', 'puffy_face_and_eyes', 'enlarged_thyroid',
            'swollen_legs', 'swollen_extremeties', 'extra_marital_contacts', 'drying_and_tingling_lips',
            'slurred_speech', 'knee_pain', 'hip_joint_pain', 'movement_stiffness', 'spinning_movements', 
            'blackheads', 'scurring', 'palpitations'
        ];

        const eyeUrineSymptoms = [
            'yellowing_of_eyes', 'burning_micturition', 'blurred_and_distorted_vision', 'sunken_eyes', 
            'visual_disturbances', 'dark_urine', 'yellow_urine', 'redness_of_eyes', 'pain_behind_the_eyes',
            'bladder_discomfort', 'foul_smell_of urine', 'continuous_feel_of_urine', 'spotting_ urination', 
            'polyuria'
        ];

        const historySymptoms = [
            'family_history', 'history_of_alcohol_consumption', 'receiving_blood_transfusion', 
            'receiving_unsterile_injections'
        ];

        // Create Bucket Object
        let buckets = {
            "Skin & External": [],
            "Respiratory & ENT": [],
            "Digestive & Stomach": [],
            "Neurological & Pain": [],
            "Fever & General": [],
            "Eyes & Urinary": [],
            "History & Others": []
        };

        // Sort symptoms into buckets
        features.forEach(f => {
            if (skinSymptoms.includes(f)) buckets["Skin & External"].push(f);
            else if (respiratorySymptoms.includes(f)) buckets["Respiratory & ENT"].push(f);
            else if (digestiveSymptoms.includes(f)) buckets["Digestive & Stomach"].push(f);
            else if (neuroPainSymptoms.includes(f)) buckets["Neurological & Pain"].push(f);
            else if (eyeUrineSymptoms.includes(f)) buckets["Eyes & Urinary"].push(f);
            else if (historySymptoms.includes(f)) buckets["History & Others"].push(f);
            else buckets["Fever & General"].push(f); // Default fallback for unlisted
        });

        // Render HTML
        for (let cat in buckets) {
            if (buckets[cat].length > 0) {
                const section = document.createElement('div');
                section.className = 'category-section';
                section.innerHTML = `<div class="category-title">${cat}</div>`;
                
                const grid = document.createElement('div');
                grid.className = 'symptoms-grid';

                buckets[cat].forEach(f => {
                    const div = document.createElement('div');
                    div.className = 'symptom-item';
                    
                    // Format text: remove underscore
                    let labelText = f.replace(/_/g, ' '); 
                    
                    div.innerHTML = `<input type="checkbox" name="symptoms" value="${f}"><label>${labelText}</label>`;
                    grid.appendChild(div);
                });

                section.appendChild(grid);
                symptomsContainer.appendChild(section);
            }
        }
    }

    // --- 3. RESET BUTTON ---
    const clearBtn = document.getElementById('clearAll');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
        });
    }

    // --- 4. ANALYZE & REDIRECT ---
    const analyzeBtn = document.getElementById('analyzeBtn');
    
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', function(e) {
            e.preventDefault(); 
            
            const selected = Array.from(document.querySelectorAll('input[name="symptoms"]:checked')).map(cb => cb.value);

            if (selected.length === 0) {
                alert("Please select at least one symptom.");
                return;
            }

            const originalText = analyzeBtn.textContent;
            analyzeBtn.textContent = "Analyzing...";
            analyzeBtn.disabled = true;

            fetch('http://127.0.0.1:5000/predict_specialist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symptoms: selected })
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    const params = new URLSearchParams({
                        specialist: data.specialist,
                        doctorName: data.doctor_name,
                        doctorImage: data.doctor_image
                    });
                    window.location.href = `results.html?${params.toString()}`;
                } else {
                    alert("Prediction Failed: " + data.error);
                    analyzeBtn.textContent = originalText;
                    analyzeBtn.disabled = false;
                }
            })
            .catch(error => {
                console.error('Fetch Error:', error);
                alert("Connection Error. Please ensure the backend is running.");
                analyzeBtn.textContent = originalText;
                analyzeBtn.disabled = false;
            });
        });
    }
});