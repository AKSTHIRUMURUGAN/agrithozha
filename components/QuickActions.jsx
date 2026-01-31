'use client';

export default function QuickActions({
  isDrawing,
  drawingPoints,
  selectedPolygon,
  polygons,
  onStartDrawing,
  onCancelDrawing,
  onSavePolygon,
  onPolygonSelect,
  onClearPoints,
}) {
  return (
    <div className="p-4 border-b border-gray-200 space-y-4">
      {/* Drawing Controls */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-800">Field Management</h3>
        
        {!isDrawing ? (
          <button
            onClick={onStartDrawing}
            className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <span>🗺️</span>
            <span>Draw New Field</span>
          </button>
        ) : (
          <div className="space-y-2">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-blue-800">Drawing in Progress</span>
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {drawingPoints.length} points
                </span>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={onSavePolygon}
                  disabled={drawingPoints.length < 3}
                  className="flex-1 py-2 bg-green-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-green-600 transition-colors text-sm font-medium"
                >
                  ✅ Save Field
                </button>
                <button
                  onClick={onCancelDrawing}
                  className="flex-1 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm font-medium"
                >
                  ❌ Cancel
                </button>
              </div>
              
              {drawingPoints.length > 0 && (
                <button
                  onClick={onClearPoints}
                  className="w-full mt-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-xs"
                >
                  Clear Points
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Fields List */}
      <div className="space-y-2">
        <h4 className="font-medium text-gray-700 text-sm">Your Fields</h4>
        <div className="max-h-40 overflow-y-auto space-y-2">
          {polygons.map((polygon) => (
            <div
              key={polygon.id}
              onClick={() => onPolygonSelect(polygon)}
              className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                selectedPolygon?.id === polygon.id
                  ? 'bg-green-50 border-green-200'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-sm">{polygon.name}</div>
                  <div className="text-xs text-gray-500">
                    {polygon.area} • {polygon.cropType}
                  </div>
                </div>
                {selectedPolygon?.id === polygon.id && (
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-1"></div>
                )}
              </div>
            </div>
          ))}
          
          {polygons.length === 0 && (
            <div className="text-center py-4 text-gray-500 text-sm">
              No fields created yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}