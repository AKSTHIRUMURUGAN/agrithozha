'use client';

import { useState, useCallback } from 'react';

export default function PolygonManager({
  polygons,
  selectedPolygon,
  isDrawingMode,
  drawingPoints,
  onPolygonSelect,
  onPolygonDelete,
  onStartDrawing,
  onCancelDrawing,
  onSavePolygon,
  onClearPoints,
  onRemovePoint,
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [editingPolygon, setEditingPolygon] = useState(null);

  const handleDeleteClick = (polygonId, e) => {
    e.stopPropagation();
    setShowDeleteConfirm(polygonId);
  };

  const confirmDelete = (polygonId) => {
    onPolygonDelete(polygonId);
    setShowDeleteConfirm(null);
  };

  const handleEditPolygon = (polygon, e) => {
    e.stopPropagation();
    setEditingPolygon(polygon);
    onStartDrawing(polygon.coordinates);
  };

  const handleSaveEdit = () => {
    onSavePolygon(editingPolygon.id);
    setEditingPolygon(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Your Fields</h3>
        <button 
          onClick={() => isDrawingMode ? onCancelDrawing() : onStartDrawing()}
          className={`px-3 py-1.5 text-sm rounded-md ${
            isDrawingMode 
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isDrawingMode ? 'Cancel' : 'Create New Field'}
        </button>
      </div>
      
      {isDrawingMode && (
        <div className="bg-blue-50 p-3 rounded-lg mb-4">
          <h4 className="font-medium text-sm mb-2">
            {editingPolygon ? 'Edit Field' : 'Drawing Mode'}
          </h4>
          <p className="text-xs text-gray-600 mb-3">
            Click on the map to add points. Minimum 3 points required.
          </p>
          <div className="flex space-x-2">
            <button
              onClick={editingPolygon ? handleSaveEdit : onSavePolygon}
              disabled={drawingPoints.length < 3}
              className={`px-3 py-1 text-xs rounded ${
                drawingPoints.length >= 3 
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              {editingPolygon ? 'Update Field' : 'Save Field'}
            </button>
            <button
              onClick={onClearPoints}
              className="px-3 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
            >
              Clear Points
            </button>
            {editingPolygon && (
              <button
                onClick={() => {
                  setEditingPolygon(null);
                  onCancelDrawing();
                }}
                className="px-3 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
              >
                Cancel Edit
              </button>
            )}
          </div>
          {drawingPoints.length > 0 && (
            <p className="text-xs mt-2">
              Points: {drawingPoints.length}
            </p>
          )}
        </div>
      )}
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {polygons.map((polygon) => (
          <div 
            key={polygon.id}
            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
              selectedPolygon?.id === polygon.id 
                ? 'border-blue-500 bg-blue-50' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => onPolygonSelect(polygon)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center">
                  <h4 className="font-medium">{polygon.name}</h4>
                  {polygon.cropType && (
                    <span className="ml-2 px-1.5 py-0.5 text-xs bg-green-100 text-green-800 rounded">
                      {polygon.cropType}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600">
                  Area: {polygon.area} • {polygon.coordinates.length - 1} points
                </p>
                {polygon.lastUpdated && (
                  <p className="text-xs text-gray-500 mt-1">
                    Updated: {new Date(polygon.lastUpdated).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={(e) => handleEditPolygon(polygon, e)}
                  className="p-1 text-gray-500 hover:text-blue-600"
                  title="Edit field"
                >
                  ✏️
                </button>
                <button
                  onClick={(e) => handleDeleteClick(polygon.id, e)}
                  className="p-1 text-gray-500 hover:text-red-600"
                  title="Delete field"
                >
                  🗑️
                </button>
              </div>
            </div>
            
            {showDeleteConfirm === polygon.id && (
              <div className="mt-2 p-2 bg-red-50 rounded text-sm">
                <p className="text-red-700">Delete this field?</p>
                <div className="flex justify-end space-x-2 mt-2">
                  <button 
                    onClick={() => setShowDeleteConfirm(null)}
                    className="px-2 py-0.5 text-xs bg-gray-200 rounded"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => confirmDelete(polygon.id)}
                    className="px-2 py-0.5 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {polygons.length === 0 && !isDrawingMode && (
          <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
            <p className="mb-2">No fields found</p>
            <button 
              onClick={() => onStartDrawing()}
              className="text-sm text-blue-500 hover:underline"
            >
              Create your first field
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
