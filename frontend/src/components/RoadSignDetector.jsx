import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Camera, Volume2, History, Sun, Moon, Database, AlertTriangle, Book } from 'lucide-react';
import SignListPage from './SignListPage';

const cn = (...classes) => classes.filter(Boolean).join(' ');

function RoadSignDetector() {
  const [detection, setDetection] = useState(null);
  const [isStreaming, setIsStreaming] = useState(true);
  const [streamError, setStreamError] = useState(false);
  const [detectionHistory, setDetectionHistory] = useState([]);
  const [retryCount, setRetryCount] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const nameAudioRef = useRef(null);
  const descAudioRef = useRef(null);
  const maxRetries = 3;
  const [showSignList, setShowSignList] = useState(false);
  const API_URL = 'http://localhost:5000';

  const fetchDetection = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/latest_detection`);
      const data = await response.json();
      
      if (!data.error) {
        if (data.audio_files) {
          nameAudioRef.current = new Audio(`${API_URL}${data.audio_files.name}`);
          descAudioRef.current = new Audio(`${API_URL}${data.audio_files.description}`);
        }
        setDetection(data);
        setDetectionHistory(prev => {
          const lastDetection = prev[prev.length - 1];
          if (!lastDetection || lastDetection.name !== data.name) {
            const newHistory = [...prev, { ...data, timestamp: new Date() }];
            return newHistory.slice(-5);
          }
          return prev;
        });
      }
    } catch (error) {
      console.error('Error fetching detection:', error);
      setDetection(null);
    }
  }, [API_URL]);

  useEffect(() => {
    const interval = setInterval(fetchDetection, 500);
    return () => clearInterval(interval);
  }, [fetchDetection]);

  const handleSpeak = async () => {
    if (!detection || isSpeaking || !nameAudioRef.current || !descAudioRef.current) return;
    
    try {
      setIsSpeaking(true);
      nameAudioRef.current.play();
      
      nameAudioRef.current.onended = () => {
        descAudioRef.current.play();
        descAudioRef.current.onended = () => {
          setIsSpeaking(false);
        };
      };
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsSpeaking(false);
    }
  };

  const handleStreamError = () => {
    setStreamError(true);
    if (retryCount < maxRetries) {
      setTimeout(() => {
        setStreamError(false);
        setRetryCount(prev => prev + 1);
      }, 2000);
    }
  };

  const toggleStream = () => {
    setIsStreaming(prev => !prev);
    if (streamError) {
      setStreamError(false);
      setRetryCount(0);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const bgColor = isDarkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-gray-100 to-white';
  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
  const subTextColor = isDarkMode ? 'text-gray-400' : 'text-gray-600';

  if (showSignList) {
    return (
      <SignListPage 
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        onBack={() => setShowSignList(false)}
      />
    );
  }

  return (
    <div className={`min-h-screen ${bgColor} fixed inset-0 overflow-auto p-8`}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className={`text-3xl font-bold ${textColor}`}>AQROAD</h1>
            <div className="flex gap-2">
              <button 
                className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} ${textColor}`}
                onClick={() => setShowSignList(true)}
              >
                <Book size={20} />
              </button>
              <button 
                className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} ${textColor}`}
                onClick={toggleTheme}
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>
          <div className="flex items-center"> 
            <p className={subTextColor}>Advanced Quick Road Sign Observation with Audio Dispatch</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <Card className={cardBg}>
              <CardHeader className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex justify-between items-center">
                  <CardTitle className={textColor}>Live Detection</CardTitle>
                  <div className="flex gap-2">
                    <button 
                      className="p-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={toggleStream}
                    >
                      <Camera size={20} />
                    </button>
                    <button 
                      className={cn(
                        "p-2 rounded text-white transition-colors",
                        detection 
                          ? isSpeaking
                            ? "bg-gray-600 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700 cursor-pointer"
                          : "bg-gray-600 cursor-not-allowed"
                      )}
                      onClick={handleSpeak}
                      disabled={!detection || isSpeaking}
                    >
                      <Volume2 size={20} />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="aspect-video bg-black relative">
                  {isStreaming && !streamError ? (
                    <img 
                      src={`${API_URL}/video_feed`}
                      alt="Video Feed" 
                      className="w-full h-full object-cover"
                      onError={handleStreamError}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <p className="text-white mb-2">Stream {streamError ? 'error' : 'paused'}</p>
                      {streamError && retryCount < maxRetries && (
                        <p className={subTextColor}>Retrying connection...</p>
                      )}
                    </div>
                  )}
                  
                  {detection && (
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-black/70 rounded-lg p-4 text-white">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="text-yellow-500" size={20} />
                          <span className="font-semibold">{detection.name}</span>
                        </div>
                        <p className="text-sm text-gray-300">{detection.description}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <Card className={cardBg}>
              <CardHeader>
                <CardTitle className={textColor}>Detection Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className={subTextColor}>Sign Type</label>
                    <p className={`font-semibold ${textColor}`}>
                      {detection ? detection.name : 'No sign detected'}
                    </p>
                  </div>
                  <div>
                    <label className={subTextColor}>Confidence</label>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                        style={{
                          width: detection ? `${detection.confidence * 100}%` : '0%'
                        }}
                      />
                    </div>
                    <p className={`text-right text-sm ${subTextColor} mt-1`}>
                      {detection ? `${(detection.confidence * 100).toFixed(1)}%` : 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={cardBg}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className={textColor}>Detection History</CardTitle>
                <History size={20} className={subTextColor} />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {detectionHistory.length > 0 ? (
                    detectionHistory.slice().reverse().map((det, i) => (
                      <div key={i} className={`flex items-center gap-4 p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                        <div className={`w-12 h-12 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded flex items-center justify-center`}>
                          <Database size={20} className={subTextColor} />
                        </div>
                        <div>
                          <p className={`font-medium ${textColor}`}>{det.name}</p>
                          <p className={`text-sm ${subTextColor}`}>
                            {new Date(det.timestamp).toLocaleTimeString()}
                          </p>
                          <p className={`text-sm ${subTextColor}`}>
                            Confidence: {(det.confidence * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className={`text-center py-4 ${subTextColor}`}>No detection history</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoadSignDetector;