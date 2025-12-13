from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import os
from dotenv import load_dotenv

app = FastAPI()

load_dotenv()

# --- 1. SETUP BASE DIRECTORY ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Mengambil PORT dari Render (Default ke 10000 jika lokal)
PORT = int(os.getenv("PORT", 10000))
DATABASE_NAME = os.getenv("DATABASE_URL", "temudok.db")

# --- 2. SETUP CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 3. MOUNT STATIC FILES (Gunakan path absolut agar terbaca di server) ---
app.mount("/static", StaticFiles(directory=os.path.join(BASE_DIR, "static")), name="static")
app.mount("/assets", StaticFiles(directory=os.path.join(BASE_DIR, "assets")), name="assets")
app.mount("/templates", StaticFiles(directory=os.path.join(BASE_DIR, "templates")), name="templates")

# --- 4. DATABASE HELPER ---
def get_db_connection():
    db_path = os.path.join(BASE_DIR, "temudok.db")
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

# Inisialisasi DB saat start-up
def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, email TEXT UNIQUE, password TEXT)')
    cursor.execute('CREATE TABLE IF NOT EXISTS appointments (id INTEGER PRIMARY KEY AUTOINCREMENT, patient_name TEXT, specialist TEXT, doctor_name TEXT, date TEXT, time TEXT, notes TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)')
    conn.commit()
    conn.close()

init_db()

# --- 5. DATA DOKTER & GEJALA ---
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

# --- 6. ROUTES ---

@app.get("/")
def home():
    return {"message": "Server TemuDok Berjalan!"}

@app.get("/features")
def get_features():
    return {"features": SYMPTOMS_LIST}

@app.post("/signup")
async def signup(request: Request):
    try:
        data = await request.json()
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = ?", (data['email'],))
        if cursor.fetchone():
            conn.close()
            return JSONResponse({"status": "error", "message": "Email sudah terdaftar!"})
        cursor.execute("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", (data['username'], data['email'], data['password']))
        conn.commit()
        conn.close()
        return JSONResponse({"status": "success", "message": "Akun berhasil dibuat!"})
    except Exception as e:
        return JSONResponse({"status": "error", "message": str(e)}, status_code=500)

@app.post("/login")
async def login(request: Request):
    try:
        data = await request.json()
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = ? AND password = ?", (data['email'], data['password']))
        user = cursor.fetchone()
        conn.close()
        if user:
            return JSONResponse({"status": "success", "username": user['username']})
        return JSONResponse({"status": "error", "message": "Email atau Password salah!"}, status_code=401)
    except Exception as e:
        return JSONResponse({"status": "error", "message": str(e)}, status_code=500)

@app.post("/predict_specialist")
async def predict_specialist(request: Request):
    # LAZY IMPORT & LOAD (PENTING UNTUK RENDER)
    import pickle
    import numpy as np
    
    data = await request.json()
    selected_symptoms = data.get("symptoms", [])
    
    try:
        model_path = os.path.join(BASE_DIR, "model.pkl")
        model = pickle.load(open(model_path, "rb"))
        
        input_vector = [0] * len(SYMPTOMS_LIST)
        for s in selected_symptoms:
            if s in SYMPTOMS_LIST:
                idx = SYMPTOMS_LIST.index(s)
                input_vector[idx] = 1
        
        prediction = model.predict(np.array([input_vector]))[0]
        predicted_specialist = str(prediction).strip()
        doctor_info = DOCTORS_DATA.get(predicted_specialist, DOCTORS_DATA["General Practitioner"])
        
        return {
            "status": "success",
            "specialist": predicted_specialist,
            "doctor_name": doctor_info["name"],
            "doctor_image": doctor_info["image"]
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/book_appointment")
async def book_appointment(request: Request):
    try:
        data = await request.json()
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO appointments (patient_name, specialist, doctor_name, date, time, notes) VALUES (?, ?, ?, ?, ?, ?)",
                       (data['name'], data['specialist'], data['doctor'], data['date'], data['time'], data['notes']))
        conn.commit()
        conn.close()
        return JSONResponse({"status": "success"})
    except Exception as e:
        return JSONResponse({"status": "error", "message": str(e)}, status_code=500)

@app.get("/get_reminders")
async def get_reminders(request: Request):
    try:
        patient_name = request.query_params.get('patient', '')
        conn = get_db_connection()
        cursor = conn.cursor()
        if patient_name:
            cursor.execute("SELECT * FROM appointments WHERE patient_name LIKE ? ORDER BY date DESC", (f"%{patient_name}%",))
        else:
            cursor.execute("SELECT * FROM appointments ORDER BY date DESC")
        rows = cursor.fetchall()
        data_list = [{"id": r["id"], "title": r['doctor_name'], "subtitle": r['specialist'], "time": f"{r['date']} at {r['time']}", "notes": r['notes']} for r in rows]
        conn.close()
        return JSONResponse({"status": "success", "reminders": data_list})
    except Exception as e:
        return JSONResponse({"status": "error", "message": str(e)}, status_code=500)

@app.delete("/delete_appointment/{item_id}")
async def delete_appointment(item_id: int):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM appointments WHERE id = ?", (item_id,))
        conn.commit()
        conn.close()
        return JSONResponse({"status": "success"})
    except Exception as e:
        return JSONResponse({"status": "error", "message": str(e)}, status_code=500)

if __name__ == '__main__':
    import uvicorn
    # Gunakan host 0.0.0.0 agar bisa diakses secara publik lewat Render
    uvicorn.run(app, host="0.0.0.0", port=PORT)

