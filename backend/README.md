# MediAid

**MediAid** is a comprehensive medical platform that helps users access medications and medical products by connecting them with nearby pharmacies. It also includes a humanitarian feature, "Kafu", which enables users to volunteer to help others access or deliver medicine for free.

---

## ⚙️ Features

### 🤓 Users & Authentication

- User registration & login
- Email verification
- Password reset
- Profile management
- Admin account creation & user management

### 💊 Pharmacies

- Register a new pharmacy
- Update pharmacy data
- View nearby pharmacies
- Manage pharmacy products
- Handle pharmacy orders

### 📅 Used Medicines

- Add/update/delete used medicine
- View list of available used medicines

### 🛋️ Products

- Admin adds new medical products
- View/search/filter products
- Add to favorites
- View suggested and favorite products

### 📦 Orders

- Create new orders
- View personal or pharmacy-specific orders
- Update order status
- Rate an order

### ⚠️ Emergency Orders

- Submit an emergency medicine request
- Pharmacies can view and respond to nearby emergency orders
- Cancel or complete emergency requests

### 🧱 Kafu (Humanitarian Service)

- Create volunteer requests or offers for help
- View nearby Kafu posts
- Accept or complete a Kafu request
- Delete Kafu post

### 📁 File Uploads

- Upload medical documents or product images

### 📚 Categories

- Add/update/delete categories
- View category-specific products
- Search by category

---

## 🚀 Tech Stack

- **Backend:** Node.js + Express
- **Database:** MongoDB
- **Authentication:** JWT / Sessions
- **Permissions:** Role-based access control middleware
- **Validation:** express-validator
- **File Uploads:** Multer
- **Geolocation:** Nearby searches for pharmacies and Kafu posts

---

## 📆 Project Structure

```
project/
├── controllers/        # Route handlers
├── middlewares/        # Auth, validation, roles
├── routes/             # Route definitions
├── models/             # Mongoose schemas (assumed)
├── uploads/            # File storage
├── utils/              # Helper functions
├── app.js / index.js   # Entry point
└── README.md           # Project documentation
```

---

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/username/MediAid.git

# Navigate to project directory
cd MediAid

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start development server
npm run dev
```

---

## ✅ Future Enhancements

- Integrate online payment system
- Real-time chat between user and pharmacy
- Push notifications for order status
- Mobile app support

---

Made with ❤️ for better medical access and humanitarian collaboration.

