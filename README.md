# 📊 CSV Analytics Dashboard

A modern full-stack web application to upload, visualize, and share CSV data using interactive charts. Built with React, Node.js, MongoDB, and Chart.js — complete with authentication, public sharing, team collaboration, and role-based access control.

---

## 🚀 Features

- ✅ Drag-and-drop CSV upload with smart parsing
- ✅ Interactive chart rendering (Bar, Line, Pie, Scatter)
- ✅ Multi-series chart support
- ✅ Authenticated chart saving and loading
- ✅ Public link sharing (read-only)
- ✅ Invite-based collaboration (viewer/editor roles)
- ✅ Role-based access control (RBAC)
- ✅ Clean and responsive UI with Tailwind CSS

---

## 🧱 Tech Stack

| Frontend        | Backend           | Database | Charts      | Auth         | Real-Time     |
|----------------|-------------------|----------|-------------|--------------|---------------|
| React + Vite   | Node.js + Express | MongoDB  | Chart.js    | JWT + bcrypt | Socket.IO 🔜   |
| Tailwind CSS   | RESTful APIs      | Mongoose | react-chartjs-2 |             | Zustand for state |

---

## 📁 Folder Structure


---

## 🔐 Role-Based Collaboration

- **Owner**: Full permissions (edit, delete, invite)
- **Editor**: Can modify chart config
- **Viewer**: View-only access
- Invitations can be sent by email and accepted via dashboard

---

## 🛠️ Getting Started (Local Setup)

### 📦 Prerequisites

- Node.js + npm
- MongoDB (local or cloud)
- Git

### ⚙️ Clone the repo

```bash
git clone https://github.com/AashayPatel/csv-analytics-dashboard.git
cd csv-analytics-dashboard
