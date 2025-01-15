import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Book, ChevronLeft, ChevronRight, Search } from 'lucide-react';

const SignListPage = ({ isDarkMode, toggleTheme, onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const signClasses = Object.entries({
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
  }).map(([id, data]) => ({
    id,
    ...data
  }));

  
  const filteredSigns = signClasses.filter(sign => 
    sign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sign.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSigns.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSigns = filteredSigns.slice(startIndex, startIndex + itemsPerPage);

  const bgColor = isDarkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-gray-100 to-white';
  const cardBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
  const subTextColor = isDarkMode ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className={`min-h-screen ${bgColor} fixed inset-0 overflow-auto p-8`}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
            <button 
  onClick={onBack}
  className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} ${textColor}`}
>
  <ChevronLeft size={24} />
</button>
              <h1 className={`text-3xl font-bold ${textColor}`}>List of Signs</h1>
            </div>
            <button 
              className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} ${textColor}`}
              onClick={toggleTheme}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>

        <Card className={cardBg}>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div className="relative w-full max-w-md">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${subTextColor}`} size={20} />
                <Input
                  type="text"
                  placeholder="Search signs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-10 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} ${textColor}`}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className={`py-3 px-4 text-left ${textColor}`}>Image</th>
                    <th className={`py-3 px-4 text-left ${textColor}`}>Name</th>
                    <th className={`py-3 px-4 text-left ${textColor}`}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSigns.map((sign) => (
                    <tr 
                      key={sign.id}
                      className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
                    >
                      <td className="py-4 px-4">
                        <img 
                          src={`/static/images/signs/${sign.id}.png`}
                          alt={sign.name}
                          className="w-16 h-16 object-contain"
                        />
                      </td>
                      <td className={`py-4 px-4 ${textColor}`}>{sign.name}</td>
                      <td className={`py-4 px-4 ${subTextColor}`}>{sign.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className={subTextColor}>
                Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredSigns.length)} of {filteredSigns.length} signs
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={isDarkMode ? 'border-gray-700' : 'border-gray-200'}
                >
                  <ChevronLeft size={20} />
                </Button>
                <span className={`flex items-center px-4 ${textColor}`}>
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={isDarkMode ? 'border-gray-700' : 'border-gray-200'}
                >
                  <ChevronRight size={20} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignListPage;