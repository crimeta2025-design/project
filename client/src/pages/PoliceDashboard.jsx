import React from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from "../components/Card";
import { Search, Bell, Settings, TrendingUp, TrendingDown } from "lucide-react";
import MapView from "./MapView";

const PoliceDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content - now full width */}
      <div className="min-w-0">
  {/* Header removed as requested */}
        {/* Dashboard Content */}
        <main className="p-4 lg:p-6">
          {/* Case Distribution */}
          <div className="mb-6 lg:mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-4 lg:p-6 text-white relative overflow-hidden">
              <h2 className="text-lg lg:text-xl font-semibold mb-2">Case Distribution</h2>
              <p className="text-blue-100 mb-4 lg:mb-6 text-sm lg:text-base">
                Overview of police case activity and status
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
                <Card className="bg-white/10 backdrop-blur border-white/20 lg:col-span-1 sm:col-span-2 lg:col-span-1">
                  <CardContent className="p-3 lg:p-4">
                    <div className="text-xl lg:text-2xl font-bold">120</div>
                    <div className="text-xs lg:text-sm text-blue-100">Active Cases</div>
                  </CardContent>
                </Card>
                <Card className="bg-white/10 backdrop-blur border-white/20">
                  <CardContent className="p-3 lg:p-4">
                    <div className="text-xl lg:text-2xl font-bold">45</div>
                    <div className="text-xs lg:text-sm text-blue-100 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      12% Today
                    </div>
                    <div className="text-xs text-blue-100">Resolved</div>
                  </CardContent>
                </Card>
                <Card className="bg-white/10 backdrop-blur border-white/20">
                  <CardContent className="p-3 lg:p-4">
                    <div className="text-xl lg:text-2xl font-bold">8</div>
                    <div className="text-xs lg:text-sm text-blue-100 flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" />
                      5% High Priority
                    </div>
                    <div className="text-xs text-blue-100">High Priority</div>
                  </CardContent>
                </Card>
                <Card className="bg-white/10 backdrop-blur border-white/20">
                  <CardContent className="p-3 lg:p-4">
                    <div className="text-xl lg:text-2xl font-bold">30 min</div>
                    <div className="text-xs lg:text-sm text-blue-100">Avg Response Time</div>
                  </CardContent>
                </Card>
                <Card className="bg-white/10 backdrop-blur border-white/20">
                  <CardContent className="p-3 lg:p-4">
                    <div className="text-xl lg:text-2xl font-bold">15</div>
                    <div className="text-xs lg:text-sm text-blue-100">Pending Review</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
            {/* Case Overview */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base lg:text-lg font-semibold">Case Overview</CardTitle>
                {/* ...icon... */}
              </CardHeader>
              <CardContent className="pt-2">
                <div className="flex items-center justify-center mb-4">
                  <div className="relative w-24 h-24 lg:w-32 lg:h-32">
                    <div className="absolute inset-0 rounded-full border-4 lg:border-8 border-gray-200"></div>
                    <div className="absolute inset-0 rounded-full border-4 lg:border-8 border-blue-500 border-t-transparent transform rotate-45"></div>
                    <div className="absolute inset-2 lg:inset-4 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-sm lg:text-lg font-bold">500</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Open</span>
                    </div>
                    <span className="text-sm font-medium">230</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Closed</span>
                    </div>
                    <span className="text-sm font-medium">270</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Response Updates */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base lg:text-lg font-semibold">Response Updates</CardTitle>
                {/* ...icon... */}
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-32 lg:h-40 flex items-end justify-between gap-1 lg:gap-2">
                  {[20, 35, 25, 45, 30, 55, 40, 60, 35, 50].map((height, index) => (
                    <div
                      key={index}
                      className={`w-4 lg:w-6 rounded-t ${index === 7 ? "bg-blue-500" : "bg-gray-200"}`}
                      style={{ height: `${height}%` }}
                    ></div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Yearly Cases */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base lg:text-lg font-semibold">Yearly Cases</CardTitle>
                {/* ...icon... */}
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-32 lg:h-40 flex items-center">
                  <svg className="w-full h-full" viewBox="0 0 300 100">
                    <polyline
                      fill="none"
                      stroke="#6366f1"
                      strokeWidth="2"
                      points="0,80 50,60 100,70 150,40 200,50 250,30 300,45"
                    />
                  </svg>
                </div>
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <span>Open: 363</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Closed: 366</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
            {/* Active Officers */}
            <Card className="xl:col-span-2">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base lg:text-lg font-semibold">Active Officers</CardTitle>
                  <p className="text-sm text-gray-500">8.04% Previous Month</p>
                </div>
                {/* ...button... */}
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-start gap-2 mb-4">
                  <div className="mb-2 text-gray-700 text-sm font-medium">This map shows the current location of active police officers and headquarters. Use it to monitor field activity and deployment in real time.</div>
                  <div className="h-[300px] w-[80%] ml-auto bg-gray-50 rounded-lg flex items-center justify-center p-4 shadow">
                    <MapContainer
                      center={[21.1458, 79.0882]}
                      zoom={13}
                      scrollWheelZoom={true}
                      style={{ width: '100%', height: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap contributors"
                      />
                      <Marker position={[21.1458, 79.0882]}>
                        <Popup>
                          Police HQ
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 lg:gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 font-medium">A</span>
                    </div>
                    <span>Admin</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>Patrol</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <span>Detective</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resource Gateways */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base lg:text-lg font-semibold">Resource Gateways</CardTitle>
                {/* ...icon... */}
              </CardHeader>
              <CardContent className="space-y-3 lg:space-y-4 pt-2">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">V</span>
                    </div>
                    <div>
                      <div className="font-medium">Vehicles</div>
                      <div className="text-sm text-gray-500">Patrol units</div>
                    </div>
                  </div>
                  <div className="font-semibold">54</div>
                </div>

                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">E</span>
                    </div>
                    <div>
                      <div className="font-medium">Equipment</div>
                      <div className="text-sm text-gray-500">Body cams</div>
                    </div>
                  </div>
                  <div className="font-semibold">120</div>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">C</span>
                    </div>
                    <div>
                      <div className="font-medium">Communications</div>
                      <div className="text-sm text-gray-500">Dispatch</div>
                    </div>
                  </div>
                  <div className="font-semibold">32</div>
                </div>

                {/* ...button... */}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PoliceDashboard;
