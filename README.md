# 💬 ChatApp — Real-Time Messaging Application

ChatApp is a **full-stack real-time chat application** built to practice and demonstrate modern software development skills as a **Junior Software Developer**.  
It includes real-time communication, authentication, user profiles, and a modern responsive UI.

This project was designed to simulate a real-world messaging product with clean UI/UX and a reliable backend architecture.

---

## 🚀 Live Demo

📌 GitHub Repository: https://github.com/Ostap200488/ChatApp

---

## ✨ Key Features

✅ User Authentication (Register / Login)  
✅ Real-time messaging using **Socket.IO**  
✅ User profile system (name, bio, profile picture)  
✅ Database storage for users and chat history  
✅ Responsive UI for mobile & desktop  
✅ Clean navigation & smooth user experience  
✅ Secure backend routes & validation  
✅ Logout & session handling  

---

## 🛠 Tech Stack

### Frontend
- React  
- Vite  
- JavaScript (ES6+)  
- CSS Modules / Tailwind CSS  
- Axios  

### Backend
- Node.js  
- Express.js  
- Socket.IO  

### Database
- MongoDB  
- Mongoose  

### Tools / Other
- Git & GitHub  
- REST API  
- dotenv (Environment Variables)  
- Cloudinary *(optional — for image uploads)*  

---

## ⚙️ Installation & Setup

### 1) Clone the repository
```bash
git clone https://github.com/Ostap200488/ChatApp.git
cd ChatApp

2) Frontend Setup
cd client
npm install
npm run dev

Frontend usually runs at:
http://localhost:5173


3) Backend Setup
cd ../server
npm install
npm run dev


Backend usually runs at:
http://localhost:5001

Environment Variables
Create a .env file inside the server folder:
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173

If you use Cloudinary for profile images, also add:
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

Author
Ostap Demchuk
Junior Software Developer
 Newfoundland & Labrador, Canada
GitHub: https://github.com/Ostap200488
