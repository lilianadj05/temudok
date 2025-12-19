from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import pickle
import numpy as np
import os
from datetime import datetime, timedelta

app = FastAPI()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "temudok.db")
MODEL_PATH = os.path.join(BASE_DIR, "model.pkl")

# 1. SETUP CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. MOUNT STATIC FILES
app.mount("/static", StaticFiles(directory=os.path.join(BASE_DIR, "static")), name="static")
app.mount("/assets", StaticFiles(directory=os.path.join(BASE_DIR, "assets")), name="assets")
app.mount("/templates", StaticFiles(directory=os.path.join(BASE_DIR, "templates")), name="templates")

# 3. LOAD MODEL
try:
    model = pickle.load(open(MODEL_PATH, "rb"))
    print("✅ Model AI berhasil dimuat.")
except Exception as e:
    model = None
    print(f"⚠️ Warning: Model tidak ditemukan di {MODEL_PATH}. Error: {e}")

# 4. LIST GEJALA (Disesuaikan dengan Training Data - 92 Gejala)
# PENTING: Urutan ini harus SAMA PERSIS dengan df.columns di Notebook (Cell 33)
SYMPTOMS_LIST = [
    'itching', 'skin_rash', 'nodal_skin_eruptions', 'dischromic _patches',
    'continuous_sneezing', 'chills', 'stomach_pain', 'acidity',
    'ulcers_on_tongue', 'vomiting', 'cough', 'chest_pain', 'yellowish_skin',
    'nausea', 'loss_of_appetite', 'abdominal_pain', 'yellowing_of_eyes',
    'burning_micturition', 'passage_of_gases', 'internal_itching',
    'indigestion', 'high_fever', 'fatigue', 'weight_loss', 'lethargy',
    'blurred_and_distorted_vision', 'excessive_hunger', 'sunken_eyes',
    'dehydration', 'diarrhoea', 'breathlessness', 'family_history',
    'mucoid_sputum', 'headache', 'dizziness', 'loss_of_balance',
    'lack_of_concentration', 'stiff_neck', 'depression', 'irritability',
    'visual_disturbances', 'back_pain', 'weakness_in_limbs', 'neck_pain',
    'weakness_of_one_body_side', 'altered_sensorium', 'dark_urine',
    'sweating', 'muscle_pain', 'mild_fever', 'swelled_lymph_nodes',
    'malaise', 'red_spots_over_body', 'joint_pain', 'pain_behind_the_eyes',
    'constipation', 'toxic_look_(typhos)', 'belly_pain', 'yellow_urine',
    'receiving_blood_transfusion', 'receiving_unsterile_injections', 'coma',
    'stomach_bleeding', 'acute_liver_failure', 'swelling_of_stomach',
    'distention_of_abdomen', 'history_of_alcohol_consumption',
    'fluid_overload', 'phlegm', 'blood_in_sputum', 'throat_irritation',
    'redness_of_eyes', 'sinus_pressure', 'runny_nose', 'congestion',
    'loss_of_smell', 'fast_heart_rate', 'rusty_sputum',
    'pain_during_bowel_movements', 'pain_in_anal_region', 'bloody_stool',
    'irritation_in_anus', 'bladder_discomfort', 'foul_smell_of urine',
    'continuous_feel_of_urine', 'skin_peeling', 'silver_like_dusting',
    'small_dents_in_nails', 'inflammatory_nails', 'blister',
    'red_sore_around_nose', 'yellow_crust_ooze'
]

# 5. DATA DOKTER
DOCTORS_DATA = {
    "Hepatologist": {"name": "dr. Susilo, Sp.PD-KH", "image": "/assets/doctors_page/Susilo.jpg"},
    "Gastroenterologist": {"name": "dr. Roberto, Sp.PD-KGEH", "image": "/assets/doctors_page/Roberto.jpg"},
    "Dermatologist": {"name": "dr. Karlina Septianti", "image": "/assets/doctors_page/Karlina_Septianti.jpg"},
    "Neurologist": {"name": "dr. Alexander, Sp. S", "image": "/assets/doctors_page/Alexander.jpg"},
    "Internist": {"name": "dr. Peter, Sp. PD", "image": "/assets/doctors_page/Peter.jpg"},
    "Pulmonologist": {"name": "dr. Carlo, Sp. P", "image": "/assets/doctors_page/Carlo.jpg"},
    "Cardiologist": {"name": "dr. Rahayu, Sp. JP", "image": "/assets/doctors_page/Rahayu.jpg"},
    "Pediatrician": {"name": "dr. Sekar, Sp. A", "image": "/assets/doctors_page/Sekar.jpg"},
    "Gynecologist": {"name": "dr. Karina, Sp.OG", "image": "/assets/doctors_page/Karina.jpg"},
    "General Practitioner": {"name": "dr. Vira Amanda", "image": "/assets/doctors_page/Vira Amanda.jpg"}
}

# 6. DATABASE SETUP
def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = sqlite3.connect('temudok.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            username TEXT, 
            email TEXT UNIQUE, 
            password TEXT
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            patient_name TEXT, 
            specialist TEXT, 
            doctor_name TEXT, 
            date TEXT, 
            time TEXT, 
            notes TEXT, 
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

init_db()

# ================= ROUTES =================

@app.get("/")
def home():
    # Mengarahkan root ke signup (sesuai request kamu)
    return FileResponse(os.path.join(BASE_DIR, "templates/signup.html"))

@app.get("/login.html")
def login_page():
    return FileResponse(os.path.join(BASE_DIR, "templates/login.html"))

@app.get("/signup.html")
def signup_page():
    return FileResponse(os.path.join(BASE_DIR, "templates/signup.html"))

@app.get("/reminders.html")
def reminders_page():
    return FileResponse(os.path.join(BASE_DIR, "templates/reminders.html"))

@app.get("/home.html")
def home_html():
    return FileResponse(os.path.join(BASE_DIR, "templates/home.html"))

@app.get("/results.html")
def results_page():
    return FileResponse(os.path.join(BASE_DIR, "templates/results.html"))

@app.get("/doctor_recommendation.html")
def doctor_recommendation_page():  # Ganti nama fungsi
    return FileResponse(os.path.join(BASE_DIR, "templates/doctor_recommendation.html"))

@app.get("/appointment.html")
def appointment_page():  # Ganti nama fungsi
    return FileResponse(os.path.join(BASE_DIR, "templates/appointment.html"))

@app.get("/article_checkups.html")
def article_checkups_page():  # Ganti nama fungsi
    return FileResponse(os.path.join(BASE_DIR, "templates/article_checkups.html"))

@app.get("/article_diabetes.html")
def article_diabetes_page():  # Ganti nama fungsi
    return FileResponse(os.path.join(BASE_DIR, "templates/article_diabetes.html"))

@app.get("/article_diet.html")
def article_diet_page():  # Ganti nama fungsi
    return FileResponse(os.path.join(BASE_DIR, "templates/article_diet.html"))

@app.get("/article_menopause.html")
def article_menopause_page():  # Ganti nama fungsi
    return FileResponse(os.path.join(BASE_DIR, "templates/article_menopause.html"))

@app.get("/article_sleep.html")
def article_sleep_page():  # Ganti nama fungsi
    return FileResponse(os.path.join(BASE_DIR, "templates/article_sleep.html"))

@app.get("/article_stress.html")
def article_stress_page():  # Ganti nama fungsi
    return FileResponse(os.path.join(BASE_DIR, "templates/article_stress.html"))

@app.get("/articles.html")
def articles_page():  # Ganti nama fungsi
    return FileResponse(os.path.join(BASE_DIR, "templates/articles.html"))

@app.get("/doctors.html")
def doctors_page():  # Ganti nama fungsi
    return FileResponse(os.path.join(BASE_DIR, "templates/doctors.html"))

@app.get("/profile.html")
def profile_page():  # Ganti nama fungsi
    return FileResponse(os.path.join(BASE_DIR, "templates/profile.html"))

@app.get("/features")
def get_features():
    # Kirim daftar gejala yang SUDAH SINKRON dengan model
    return {"features": SYMPTOMS_LIST}

@app.post("/signup")
async def signup(request: Request):
    try:
        data = await request.json()
        print(f"📝 Signup Attempt: {data.get('email')}")
        
        conn = sqlite3.connect('temudok.db')
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM users WHERE email = ?", (data['email'],))
        if cursor.fetchone():
            conn.close()
            return JSONResponse({"status": "error", "message": "Email sudah terdaftar!"})
            
        cursor.execute("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", 
                       (data['username'], data['email'], data['password']))
        conn.commit()
        conn.close()
        return JSONResponse({"status": "success", "message": "Akun berhasil dibuat!"})
    except Exception as e:
        print(f"❌ Error Signup: {e}")
        return JSONResponse({"status": "error", "message": str(e)}, status_code=500)

@app.post("/login")
async def login(request: Request):
    try:
        data = await request.json()
        conn = sqlite3.connect('temudok.db')
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = ? AND password = ?", (data['email'], data['password']))
        user = cursor.fetchone()
        conn.close()
        
        if user:
            return JSONResponse({"status": "success", "username": user[1]})
        return JSONResponse({"status": "error", "message": "Email atau Password salah!"}, status_code=401)
    except Exception as e:
        return JSONResponse({"status": "error", "message": str(e)}, status_code=500)

@app.post("/predict_specialist")
async def predict_specialist(request: Request):
    data = await request.json()
    selected_symptoms = data.get("symptoms", [])
    
    predicted_specialist = "General Practitioner"
    
    if model:
        try:
            # Buat vektor input dengan panjang 92 (sesuai training)
            input_vector = [0] * len(SYMPTOMS_LIST)
            
            for s in selected_symptoms:
                if s in SYMPTOMS_LIST:
                    # Cari index gejala tersebut di list yang benar
                    idx = SYMPTOMS_LIST.index(s)
                    input_vector[idx] = 1
            
            # Debug: Cek vektor sebelum prediksi
            # print(f"Input Vector: {input_vector}")
            
            prediction = model.predict(np.array([input_vector]))[0]
            predicted_specialist = str(prediction).strip()
            print(f"✅ Predicted: {predicted_specialist}")
            
        except Exception as e:
            print(f"⚠️ Prediksi Error: {e}")
            # Jika error (misal jumlah kolom beda), tetap lanjut dengan default
            pass

    doctor_info = DOCTORS_DATA.get(predicted_specialist, DOCTORS_DATA["General Practitioner"])

    return JSONResponse({
        "status": "success",
        "specialist": predicted_specialist,
        "doctor_name": doctor_info["name"],
        "doctor_image": doctor_info["image"]
    })

@app.post("/book_appointment")
async def book_appointment(request: Request):
    try:
        data = await request.json()
        conn = sqlite3.connect('temudok.db')
        cursor = conn.cursor()
        cursor.execute("INSERT INTO appointments (patient_name, specialist, doctor_name, date, time, notes) VALUES (?, ?, ?, ?, ?, ?)",
                       (data['name'], data['specialist'], data['doctor'], data['date'], data['time'], data['notes']))
        conn.commit()
        conn.close()
        return JSONResponse({"status": "success", "message": "Berhasil booking!"})
    except Exception as e:
        return JSONResponse({"status": "error", "message": str(e)}, status_code=500)


@app.post("/add_reminder")
async def add_reminder(request: Request):
    try:
        data = await request.json()
        
        frequency = data.get('frequency', 'Once')
        end_date_str = data.get('endDate', '')
        start_date_str = data['date']
        
        conn = get_db_connection()
        cursor = conn.cursor()

        # Logika Tanggal
        current_date = datetime.strptime(start_date_str, "%Y-%m-%d")
        
        if end_date_str and frequency != 'Once':
            end_date = datetime.strptime(end_date_str, "%Y-%m-%d")
        else:
            end_date = current_date # Kalau Once, selesai hari itu juga

        # Looping Insert
        while current_date <= end_date:
            date_to_insert = current_date.strftime("%Y-%m-%d")
            
            cursor.execute("INSERT INTO appointments (patient_name, specialist, doctor_name, date, time, notes) VALUES (?, ?, ?, ?, ?, ?)",
                           (data['name'], data['specialist'], data['doctor'], date_to_insert, data['time'], data['notes']))
            
            if frequency == 'Daily':
                current_date += timedelta(days=1)
            elif frequency == 'Weekly':
                current_date += timedelta(weeks=1)
            else:
                break 

        conn.commit()
        conn.close()
        return JSONResponse({"status": "success", "message": "Reminder berhasil dibuat!"})
    except Exception as e:
        return JSONResponse({"status": "error", "message": str(e)}, status_code=500)
    

@app.get("/get_reminders")
async def get_reminders(request: Request):
    try:
        patient_name = request.query_params.get('patient', '')
        conn = sqlite3.connect('temudok.db')
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        if patient_name:
            cursor.execute("SELECT * FROM appointments WHERE patient_name LIKE ? ORDER BY date DESC, time DESC", (f"%{patient_name}%",))
        else:
            cursor.execute("SELECT * FROM appointments ORDER BY date DESC, time DESC")
            
        rows = cursor.fetchall()
        data_list = []
        for row in rows:
            data_list.append({
                "id": row["id"],
                "title": row['doctor_name'],
                "subtitle": row['specialist'],
                "time": f"{row['date']} at {row['time']}",
                "category": "checkup",
                "notes": row['notes']
            })
        conn.close()
        return JSONResponse({"status": "success", "reminders": data_list})
    except Exception as e:
        return JSONResponse({"status": "error", "message": str(e)}, status_code=500)

@app.delete("/delete_appointment/{item_id}")
async def delete_appointment(item_id: int):
    try:
        conn = sqlite3.connect('temudok.db')
        cursor = conn.cursor()
        cursor.execute("DELETE FROM appointments WHERE id = ?", (item_id,))
        conn.commit()
        conn.close()
        return JSONResponse({"status": "success", "message": "Berhasil dihapus!"})
    except Exception as e:
        return JSONResponse({"status": "error", "message": str(e)}, status_code=500)

@app.put("/update_appointment/{item_id}")
async def update_appointment(item_id: int, request: Request):
    try:
        data = await request.json()
        conn = sqlite3.connect('temudok.db')
        cursor = conn.cursor()
        cursor.execute("UPDATE appointments SET date = ?, time = ?, notes = ? WHERE id = ?", 
                       (data['date'], data['time'], data['notes'], item_id))
        conn.commit()
        conn.close()
        return JSONResponse({"status": "success", "message": "Berhasil diupdate!"})
    except Exception as e:
        return JSONResponse({"status": "error", "message": str(e)}, status_code=500)

if __name__ == '__main__':
    import uvicorn
    # Ambil PORT dari environment variable (Hugging Face menggunakan 7860)
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run(app, host="0.0.0.0", port=port)