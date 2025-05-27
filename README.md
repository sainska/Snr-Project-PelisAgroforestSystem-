# 🌿 Pelis Agroforestry System (SRN Project)

An integrated web-based management system for the **Nandi North Escarpment Community Forest Association (NNECFA)** to digitize and enhance the Participatory Environmental Land Use Management (PELIS) model. The system provides an efficient platform for plot management, crop reporting, monitoring, and short-term youth (STY) engagement.

🔗 **Website Prototype:** [nandinorthescarpmentcfa.lovable.app](https://nandinorthescarpmentcfa.lovable.app)

---

## 📌 Key Features

### 🔐 Role-Based User Management
- **Community Members:** Register, apply for plots, and report crops  
- **Forest Officers:** Monitor assigned plots and submit field records  
- **NNECFA Officials:** Approve/reject plot applications, review reports  
- **Admins:** Manage users, access logs, and oversee the system

### 🧾 Plot Application & Approval Workflow
- Plot application submission by users  
- Review and approval by authorized officials  
- Notification of application status

### 🌱 Crop Reporting & Monitoring
- Monthly/seasonal crop input by members  
- GPS-tagged reports  
- Forest officer verification and compliance logs

### 📍 GIS Integration
- Interactive map using **Leaflet.js** for viewing and managing plot locations

### 📊 Dashboards & Reports
- Real-time data visualization (e.g., active plots, reported crops, monitoring stats)  
- Filterable, exportable reports for stakeholders

### 👷‍♂️ STY (Short-Term Youth) Engagement Module
- Youth volunteers assigned to assist with plot verification, awareness, data gathering  
- Activity tracking and digital recognition (badges/certificates)

### 📁 System Logs & Audit Trails
- Every action is logged for transparency and traceability

---

## 🛠️ Tech Stack

| Layer         | Technology                        |
|---------------|-----------------------------------|
| Frontend      | Vue.js + Tailwind CSS             |
| Backend       | Laravel (PHP) / Django (Python)   |
| Database      | MySQL / PostgreSQL                |
| Mapping       | Leaflet.js + OpenStreetMap        |
| Hosting       | cPanel (initial) → AWS/Heroku     |
| Authentication| JWT-based with Role Access Control|

---

## 🧱 Database Schema (Core Tables)

- `users` – Stores user data with roles  
- `plots` – Plot details, coordinates, size, and status  
- `applications` – Records of plot applications  
- `crop_reports` – Crop submissions by members  
- `monitoring_records` – Officer field notes and compliance status  
- `system_logs` – Logs of user/system actions

---

## 🔄 System Workflow Overview

1. **User Registration** → Role assignment  
2. **Plot Application** → Approval/Rejection → Mapping  
3. **Crop Reporting** → Monitoring by Officers  
4. **Dashboards & Reports** → Export & Print  
5. **Logs & Audit** → Admin View  
6. **STY Module** → Youth Tasks & Impact Tracking  

---

## 🚀 Getting Started (Developer Guide)

### 1. Clone the repository
```bash
git clone https://github.com/your-org/pelis-agroforestry-system.git
cd pelis-agroforestry-system
2. Install dependencies
Backend (Laravel):


composer install
Frontend:


npm install && npm run dev
3. Set up environment variables
Copy .env.example to .env and configure database, API keys, etc.

4. Run migrations

php artisan migrate
5. Start the development server

php artisan serve
✅ Roadmap
 Plot Application Workflow

 Crop Reporting Module

 Role-Based Authentication

 Leaflet Map Integration

 Monitoring & Audit Trails

 SMS Notification Integration

 Mobile App Extension (future)

 Machine Learning Crop Prediction (future)

🤝 Contributing
We welcome contributions from developers, STY members, and NNECFA partners.

Fork this repository

Create a feature branch


git checkout -b feature/new-feature
Commit your changes


git commit -m 'Add new feature'
Push to the branch


git push origin feature/new-feature
Create a pull request

📄 License
MIT License © 2025 [Your ALLAN KOGO / UEAB]

📬 Contact
Email: [kogoallan593@gmail.com]

Phone/WhatsApp: +25475987277

Website: https://nandinorthescarpmentcfa.lovable.app

Empowering communities and conserving forests through technology.



Let me know if you’d also like:
- A downloadable PDF version
- A `CONTRIBUTING.md` file
- A setup video or diagram for onboarding developers