import cv2
import numpy as np
from ultralytics import YOLO
import threading
import queue
from functools import lru_cache
import time
import pygame
import os
from pathlib import Path


class RoadSignDetector:
    def __init__(self):

        pygame.mixer.init()

        self.project_root = Path(__file__).parent.parent.parent
        self.audio_dir = self.project_root / "static" / "audio"
        
        print(f"Audio directory path: {self.audio_dir}")
        
        self.currently_playing = False
        self.last_played_time = 0
        self.play_cooldown = 0.5

        try:
            self.model = YOLO('models/best.pt')
            self.model.to('cpu')
        except Exception as e:
            print(f"Error loading YOLO model: {e}")
            raise

        self.conf_threshold = 0.5
        self.process_width = 640
        self.process_height = 480
        

        self.sign_classes = {
                0: {
                    "name": "Speed limit (20km/h)",
                    "description": "Maximum speed limit of 20 kilometers per hour. Typically found in highly pedestrianized areas or zones requiring extra caution."
                },
                1: {
                    "name": "Speed limit (30km/h)",
                    "description": "Maximum speed limit of 30 kilometers per hour. Common in residential areas and school zones."
                },
                2: {
                    "name": "Speed limit (50km/h)",
                    "description": "Maximum speed limit of 50 kilometers per hour. Standard speed limit in urban areas."
                },
                3: {
                    "name": "Speed limit (60km/h)",
                    "description": "Maximum speed limit of 60 kilometers per hour. Often found on major urban roads."
                },
                4: {
                    "name": "Speed limit (70km/h)",
                    "description": "Maximum speed limit of 70 kilometers per hour. Typical for roads transitioning between urban and rural areas."
                },
                5: {
                    "name": "Speed limit (80km/h)",
                    "description": "Maximum speed limit of 80 kilometers per hour. Common on rural roads and highways."
                },
                6: {
                    "name": "End of speed limit (80km/h)",
                    "description": "Indicates the end of the 80km/h speed limit zone. Return to standard speed limits."
                },
                7: {
                    "name": "Speed limit (100km/h)",
                    "description": "Maximum speed limit of 100 kilometers per hour. Typically found on highways and motorways."
                },
                8: {
                    "name": "Speed limit (120km/h)",
                    "description": "Maximum speed limit of 120 kilometers per hour. Common on major highways and motorways."
                },
                9: {
                    "name": "No passing",
                    "description": "Overtaking or passing other vehicles is prohibited. Stay in your lane."
                },
                10: {
                    "name": "No passing for vehicles over 3.5 metric tons",
                    "description": "Heavy vehicles weighing more than 3.5 metric tons are not allowed to overtake other vehicles."
                },
                11: {
                    "name": "Right-of-way at the next intersection",
                    "description": "You have priority at the upcoming intersection. Other vehicles must yield to you."
                },
                12: {
                    "name": "Priority road",
                    "description": "You are on a priority road. You have right of way at intersections."
                },
                13: {
                    "name": "Yield",
                    "description": "You must give way to other traffic. Stop if necessary and proceed only when safe."
                },
                14: {
                    "name": "Stop",
                    "description": "Come to a complete stop. Proceed only when safe and after yielding to other traffic."
                },
                15: {
                    "name": "No vehicles",
                    "description": "No vehicles of any kind are permitted beyond this point."
                },
                16: {
                    "name": "Vehicles over 3.5 metric tons prohibited",
                    "description": "Heavy vehicles exceeding 3.5 metric tons are not allowed on this road."
                },
                17: {
                    "name": "No entry",
                    "description": "Entry forbidden for all vehicles. Do not enter."
                },
                18: {
                    "name": "General caution",
                    "description": "Warning for a general hazard ahead. Proceed with increased attention."
                },
                19: {
                    "name": "Dangerous curve to the left",
                    "description": "Sharp bend ahead to the left. Reduce speed and prepare to turn."
                },
                20: {
                    "name": "Dangerous curve to the right",
                    "description": "Sharp bend ahead to the right. Reduce speed and prepare to turn."
                },
                21: {
                    "name": "Double curve",
                    "description": "Series of bends ahead. First curve could be either left or right. Reduce speed."
                },
                22: {
                    "name": "Bumpy road",
                    "description": "Road surface is uneven ahead. Reduce speed and prepare for bumps."
                },
                23: {
                    "name": "Slippery road",
                    "description": "Road surface may be slippery. Reduce speed and increase following distance."
                },
                24: {
                    "name": "Road narrows on the right",
                    "description": "The road becomes narrower on the right side ahead. Adjust position accordingly."
                },
                25: {
                    "name": "Road work",
                    "description": "Construction or maintenance work ahead. Reduce speed and watch for workers."
                },
                26: {
                    "name": "Traffic signals",
                    "description": "Traffic light ahead. Prepare to stop if the signal is red."
                },
                27: {
                    "name": "Pedestrians",
                    "description": "Pedestrian crossing ahead. Watch for people crossing the road."
                },
                28: {
                    "name": "Children crossing",
                    "description": "School zone or playground area. Watch for children crossing the road."
                },
                29: {
                    "name": "Bicycles crossing",
                    "description": "Bicycle crossing ahead. Watch for cyclists crossing or joining the road."
                },
                30: {
                    "name": "Beware of ice/snow",
                    "description": "Risk of ice or snow on the road. Adjust driving style for winter conditions."
                },
                31: {
                    "name": "Wild animals crossing",
                    "description": "Wildlife crossing area ahead. Watch for animals on the road."
                },
                32: {
                    "name": "End of all speed and passing limits",
                    "description": "Previous speed and passing restrictions end. Standard traffic rules apply."
                },
                33: {
                    "name": "Turn right ahead",
                    "description": "Mandatory right turn ahead. Prepare to turn right at the intersection."
                },
                34: {
                    "name": "Turn left ahead",
                    "description": "Mandatory left turn ahead. Prepare to turn left at the intersection."
                },
                35: {
                    "name": "Ahead only",
                    "description": "Must proceed straight ahead. No turning allowed."
                },
                36: {
                    "name": "Go straight or right",
                    "description": "Must either continue straight or turn right. No left turn allowed."
                },
                37: {
                    "name": "Go straight or left",
                    "description": "Must either continue straight or turn left. No right turn allowed."
                },
                38: {
                    "name": "Keep right",
                    "description": "Stay on the right side of the road or obstacle ahead."
                },
                39: {
                    "name": "Keep left",
                    "description": "Stay on the left side of the road or obstacle ahead."
                },
                40: {
                    "name": "Roundabout mandatory",
                    "description": "Must enter and follow the roundabout in the indicated direction."
                },
                41: {
                    "name": "End of no passing",
                    "description": "End of no-overtaking zone. Passing other vehicles is now allowed."
                },
                42: {
                    "name": "End of no passing by vehicles over 3.5 metric tons",
                    "description": "End of no-overtaking zone for heavy vehicles. Trucks may now pass other vehicles."
                }
            }
        
        
    def speak_description(self, sign_id):
        """Play pre-recorded audio files for the sign"""
        try:
            current_time = time.time()
            if current_time - self.last_played_time < self.play_cooldown:
                print("Audio cooldown in effect")
                return False

            if self.currently_playing:
                pygame.mixer.stop()

            name_file = self.audio_dir / f"sign_{sign_id:03d}_name.mp3"
            desc_file = self.audio_dir / f"sign_{sign_id:03d}_desc.mp3"

            print(f"Looking for audio files: {name_file}, {desc_file}")

            if not name_file.exists() or not desc_file.exists():
                print(f"Audio files not found for sign {sign_id}")
                return False

            self.currently_playing = True
            
            pygame.mixer.music.load(str(name_file))
            pygame.mixer.music.play()
            
            while pygame.mixer.music.get_busy():
                pygame.time.Clock().tick(10)
            
            pygame.mixer.music.load(str(desc_file))
            pygame.mixer.music.play()

            while pygame.mixer.music.get_busy():
                pygame.time.Clock().tick(10)

            self.currently_playing = False
            self.last_played_time = current_time
            return True

        except Exception as e:
            print(f"Error playing audio: {e}")
            self.currently_playing = False
            return False

    
    @lru_cache(maxsize=32)
    def get_sign_info(self, class_id):
        """Get sign information from class ID with caching"""
        return self.sign_classes.get(class_id, {
            "name": "Unknown Sign",
            "description": "Sign not recognized"
    })


    def detect_signs(self, frame):
        """Detect signs in frame"""
        try:
            if frame is None:
                return []

            frame_resized = cv2.resize(frame, (self.process_width, self.process_height))
            results = self.model(frame_resized, verbose=False)
            
            if not results or len(results) == 0:
                return []

            result = results[0]
            scale_x = frame.shape[1] / self.process_width
            scale_y = frame.shape[0] / self.process_height
            
            detections = []
            for box in result.boxes:
                try:
                    confidence = float(box.conf[0].cpu().numpy())
                    if confidence > self.conf_threshold:
                        x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                        class_id = int(box.cls[0].cpu().numpy())
                        
                        x1, x2 = x1 * scale_x, x2 * scale_x
                        y1, y2 = y1 * scale_y, y2 * scale_y
                        
                        sign_info = self.get_sign_info(class_id)
                        detections.append({
                            'box': (int(x1), int(y1), int(x2), int(y2)),
                            'name': sign_info["name"],
                            'description': sign_info["description"],
                            'confidence': confidence
                        })
                except Exception as e:
                    print(f"Error processing detection: {e}")
                    continue
                    
            return detections
        except Exception as e:
            print(f"Error in detect_signs: {e}")
            return []

    def draw_detections(self, frame, detections):
        """Draw detections on frame"""
        try:
            if frame is None or not detections:
                return frame
            
            frame_copy = frame.copy()
            for det in detections:
                try:
                    x1, y1, x2, y2 = det['box']
                    cv2.rectangle(frame_copy, (x1, y1), (x2, y2), (0, 255, 0), 2)
                    
                    label = f"{det['name'][:20]}..." if len(det['name']) > 20 else det['name']
                    label = f"{label} ({det['confidence']:.2f})"
                    
                    cv2.putText(frame_copy, label, (x1, y1-10),
                               cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
                except Exception as e:
                    print(f"Error drawing detection: {e}")
                    continue
            
            return frame_copy
        except Exception as e:
            print(f"Error in draw_detections: {e}")
            return frame

    def cleanup(self):
        """Cleanup resources"""
        try:
            pygame.mixer.quit()
        except Exception as e:
            print(f"Cleanup error: {e}")

    def __del__(self):
        self.cleanup()