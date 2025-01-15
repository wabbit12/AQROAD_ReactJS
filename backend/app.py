from flask import Flask, jsonify, Response, request, send_from_directory
from flask_cors import CORS
import cv2
import numpy as np
from utils.detector import RoadSignDetector
import threading
import queue
import os
from pathlib import Path

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5173"],
        "methods": ["GET", "POST"],
        "allow_headers": ["Content-Type"]
    }
})

detector = RoadSignDetector()
cap = cv2.VideoCapture(0)
frame_queue = queue.Queue(maxsize=10)
detection_queue = queue.Queue(maxsize=10)


project_root = Path(__file__).parent.parent
AUDIO_FOLDER = project_root / "static" / "audio"

def generate_frames():
    while True:
        try:
            success, frame = cap.read()
            if not success:
                print("Failed to read from camera")
                continue

            detections = detector.detect_signs(frame)
            processed_frame = detector.draw_detections(frame, detections)
            
            ret, buffer = cv2.imencode('.jpg', processed_frame)
            frame = buffer.tobytes()

            if detections:
                try:

                    while not detection_queue.empty():
                        detection_queue.get_nowait()
                    detection_queue.put_nowait(detections[0])
                except queue.Full:
                    pass

            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
                   
        except Exception as e:
            print(f"Error in generate_frames: {e}")
            continue

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/audio/<path:filename>')
def serve_audio(filename):
    return send_from_directory(AUDIO_FOLDER, filename)

@app.route('/latest_detection')
def latest_detection():
    try:
        detection = detection_queue.get_nowait()

        class_id = next((str(k) for k, v in detector.sign_classes.items() 
                        if v["name"] == detection["name"]), "0")
        
        name_audio = f"/audio/sign_{class_id.zfill(3)}_name.mp3"
        desc_audio = f"/audio/sign_{class_id.zfill(3)}_desc.mp3"
        
        return jsonify({
            'name': detection['name'],
            'description': detection['description'],
            'confidence': float(detection['confidence']),
            'box': list(detection['box']),
            'class_id': class_id,
            'audio_files': {
                'name': name_audio,
                'description': desc_audio
            }
        })
    except queue.Empty:
        return jsonify({"error": "No detection available"})

@app.route('/status')
def status():
    return jsonify({
        "camera_connected": cap.isOpened(),
        "detector_initialized": detector is not None
    })

@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

if __name__ == '__main__':
    if not cap.isOpened():
        print("Error: Could not open video capture device")
    app.run(debug=True, port=5000)