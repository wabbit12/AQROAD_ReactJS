# AQROAD - Advanced Quick Road Sign Observation with Audio Dispatch

AQROAD is a real-time road sign detection system that uses computer vision to identify traffic signs and provide audio feedback. The system supports 43 different types of road signs and includes features like dark/light theme, audio descriptions, and a comprehensive sign catalog.

## Features

- Real-time road sign detection using YOLO
- Audio feedback for detected signs
- Dark/Light theme support
- Comprehensive sign catalog with search and pagination
- Detection history tracking
- Confidence level indication

## Prerequisites

- Python 3.8+
- Node.js 14+
- YOLO model file (place in `backend/models/best.pt`)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/wabbit12/AQROAD-ReactJS
cd AQROAD-ReactJS
```
2. Setup the backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```
3. Setup the Frontend:
```bash
cd frontend
npm install
```

## Running the Application

1. Start the backend server:
```bash
cd backend
python app.py
```
2. Start the frontend development server in a new terminal:
```bash
cd frontend
npm run dev
```
3. Open your browser and navigate to http://localhost:5173

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
