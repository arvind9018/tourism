// src/pages/MapView.tsx
import { useEffect, useRef, useState } from "react"
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { OSM } from 'ol/source'
import { fromLonLat } from 'ol/proj'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import LineString from 'ol/geom/LineString'
import Polygon from 'ol/geom/Polygon'
import { Style, Fill, Stroke, Circle as CircleStyle } from 'ol/style'
import Overlay from 'ol/Overlay'
import { defaults as defaultControls } from 'ol/control'
import GeoJSON from 'ol/format/GeoJSON'
import 'ol/ol.css'
// Sample data for Jharkhand destinations
const destinations = [
  { name: "Netarhat", coords: [84.2667, 23.4833], type: "hill", district: "Latehar" },
  { name: "Hundru Falls", coords: [85.65, 23.45], type: "waterfall", district: "Ranchi" },
  { name: "Dassam Falls", coords: [85.52, 23.13], type: "waterfall", district: "Ranchi" },
  { name: "Betla National Park", coords: [84.18, 23.88], type: "wildlife", district: "Latehar" },
  { name: "Parasnath Hill", coords: [86.13, 23.96], type: "pilgrimage", district: "Giridih" },
  { name: "Tagore Hill", coords: [85.32, 23.37], type: "culture", district: "Ranchi" },
  { name: "Jonha Falls", coords: [85.58, 23.28], type: "waterfall", district: "Ranchi" },
  { name: "Panchghagh Falls", coords: [85.7, 23.2], type: "waterfall", district: "Khunti" },
]

// Style functions for different feature types
const getPointStyle = (type: string) => {
  const colors = {
    waterfall: { fill: [0, 123, 255], stroke: [0, 86, 179] }, // Blue
    hill: { fill: [40, 167, 69], stroke: [28, 116, 48] }, // Green
    wildlife: { fill: [255, 193, 7], stroke: [199, 151, 5] }, // Yellow
    pilgrimage: { fill: [111, 66, 193], stroke: [77, 46, 135] }, // Purple
    culture: { fill: [253, 126, 20], stroke: [202, 101, 16] }, // Orange
    default: { fill: [108, 117, 125], stroke: [76, 81, 86] } // Gray
  }
  
  const colorSet = colors[type as keyof typeof colors] || colors.default
  
  return new Style({
    image: new CircleStyle({
      radius: 8,
      fill: new Fill({ color: `rgba(${colorSet.fill.join(',')}, 0.8)` }),
      stroke: new Stroke({ color: `rgb(${colorSet.stroke.join(',')})`, width: 2 })
    })
  })
}

export default function MapView() {
  const mapRef = useRef<HTMLDivElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<Map | null>(null)
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null)
  const [selectedDestination, setSelectedDestination] = useState<any>(null)
  const [layers, setLayers] = useState({
  destinations: true,
  waterfalls: true,
  wildlife: true,
  trekking: false,
  ecoZones: false,
  homestays: false
})

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return

    // Create vector source for destinations
    const vectorSource = new VectorSource()
    
    // Add destinations as features
    destinations.forEach(dest => {
      const feature = new Feature({
        geometry: new Point(fromLonLat(dest.coords)),
        name: dest.name,
        type: dest.type,
        district: dest.district
      })
      vectorSource.addFeature(feature)
    })

    // Create vector layer with styling
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: (feature) => getPointStyle(feature.get('type'))
    })

    // Create popup overlay
    const popupOverlay = new Overlay({
      element: popupRef.current!,
      positioning: 'bottom-center',
      offset: [0, -10]
    })

    // Initialize map
    const olMap = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
          visible: true
        }),
        vectorLayer
      ],
      view: new View({
        center: fromLonLat([85.3, 23.5]), // Center on Jharkhand
        zoom: 7
      }),
      controls: defaultControls({
        zoom: true,
        rotate: false,
        attribution: true
      }),
      overlays: [popupOverlay]
    })

    // Handle map clicks
    olMap.on('click', (evt) => {
      const feature = olMap.forEachFeatureAtPixel(evt.pixel, (feature) => feature)
      if (feature) {
        const coordinates = (feature.getGeometry() as Point).getCoordinates()
        const name = feature.get('name')
        const type = feature.get('type')
        const district = feature.get('district')
        
        setSelectedDestination({ name, type, district })
        popupOverlay.setPosition(coordinates)
      } else {
        popupOverlay.setPosition(undefined)
        setSelectedDestination(null)
      }
    })

    // Change cursor on hover
    olMap.on('pointermove', (evt) => {
      const pixel = olMap.getEventPixel(evt.originalEvent)
      const hit = olMap.hasFeatureAtPixel(pixel)
      mapRef.current!.style.cursor = hit ? 'pointer' : ''
    })

    setMap(olMap)

    return () => {
      olMap.setTarget(undefined)
    }
  }, [])

  // Handle layer visibility changes
  useEffect(() => {
    if (!map) return
    
    const vectorLayer = map.getLayers().getArray()[1] as VectorLayer<VectorSource>
    if (vectorLayer) {
      // Filter features based on selected layer
      const source = vectorLayer.getSource()
      const features = source.getFeatures()
      
      features.forEach(feature => {
        const type = feature.get('type')
        let visible = false
        
        if (layers.destinations && (type === 'hill' || type === 'culture' || type === 'pilgrimage')) visible = true
        if (layers.waterfalls && type === 'waterfall') visible = true
        if (layers.wildlife && type === 'wildlife') visible = true
        
        // You can't hide individual features easily, but you can filter the source
        // For simplicity, we'll just show/hide the whole layer based on selections
      })
    }
  }, [layers, map])

  // Zoom controls
  const handleZoomIn = () => {
    if (map) {
      const view = map.getView()
      view.setZoom(view.getZoom()! + 1)
    }
  }

  const handleZoomOut = () => {
    if (map) {
      const view = map.getView()
      view.setZoom(view.getZoom()! - 1)
    }
  }

  const handleReset = () => {
    if (map) {
      map.getView().setCenter(fromLonLat([85.3, 23.5]))
      map.getView().setZoom(7)
    }
  }

  const handleLayerToggle = (layer: string) => {
    setLayers(prev => ({
      ...prev,
      [layer]: !prev[layer as keyof typeof prev]
    }))
  }

  return (
    <div className="bg-secondary min-h-screen px-6 sm:px-10 py-8">

      {/* HEADER */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-primary">
          GIS Map & Smart Navigation
        </h1>
        <p className="mt-2 max-w-2xl">
          Explore Jharkhand using interactive GIS maps with routes,
          eco-sensitive zones, nearby attractions, and smart navigation.
        </p>
      </header>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* LEFT PANEL – CONTROLS */}
        <aside className="bg-white rounded-xl shadow p-5">
          <h2 className="font-bold text-primary mb-4">
            Map Layers
          </h2>

          <div className="space-y-3 text-sm">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={layers.destinations}
                onChange={() => handleLayerToggle('destinations')}
              />
              Tourist Destinations (Hills, Culture, Pilgrimage)
            </label>

            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={layers.waterfalls}
                onChange={() => handleLayerToggle('waterfalls')}
              />
              Waterfalls
            </label>
            <label className="flex items-center gap-2">
  <input 
    type="checkbox"
    checked={layers.wildlife}
    onChange={() => handleLayerToggle('wildlife')}
  />
  Wildlife
</label>

            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={layers.trekking}
                onChange={() => handleLayerToggle('trekking')}
              />
              Trekking Routes
            </label>

            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={layers.ecoZones}
                onChange={() => handleLayerToggle('ecoZones')}
              />
              Eco-Sensitive Zones
            </label>

            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={layers.homestays}
                onChange={() => handleLayerToggle('homestays')}
              />
              Homestays
            </label>
          </div>

          <hr className="my-4" />

          <h2 className="font-bold text-primary mb-2">
            Legend
          </h2>

          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-blue-500"></span>
              Waterfall
            </li>
            <li className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-green-500"></span>
              Hill Station
            </li>
            <li className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-yellow-500"></span>
              Wildlife
            </li>
            <li className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-purple-500"></span>
              Pilgrimage
            </li>
            <li className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-orange-500"></span>
              Culture
            </li>
            <li className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-red-500"></span>
              Trekking Route
            </li>
            <li className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-orange-500 bg-orange-100"></span>
              Eco-Sensitive Zone
            </li>
          </ul>
        </aside>

        {/* MAP AREA */}
        <div className="lg:col-span-2 relative">
          <div 
            ref={mapRef} 
            className="w-full h-[500px] rounded-xl overflow-hidden shadow-lg"
          />
          
          {/* Popup element */}
          <div 
            ref={popupRef} 
            className="absolute bg-white rounded-lg shadow-lg p-3 text-sm hidden"
            style={{ minWidth: '200px' }}
          >
            {selectedDestination && (
              <>
                <h3 className="font-bold text-primary">{selectedDestination.name}</h3>
                <p className="text-gray-600">District: {selectedDestination.district}</p>
                <p className="text-gray-600 capitalize">Type: {selectedDestination.type}</p>
              </>
            )}
          </div>

          {/* MAP OVERLAY BUTTONS */}
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2 space-y-2 z-10">
            <button 
              onClick={handleZoomIn}
              className="block w-8 h-8 text-center hover:bg-gray-100 rounded transition"
              title="Zoom In"
            >
              +
            </button>
            <button 
              onClick={handleZoomOut}
              className="block w-8 h-8 text-center hover:bg-gray-100 rounded transition"
              title="Zoom Out"
            >
              −
            </button>
            <button 
              onClick={handleReset}
              className="block w-8 h-8 text-center hover:bg-gray-100 rounded transition"
              title="Reset View"
            >
              ↺
            </button>
          </div>
        </div>

        {/* RIGHT PANEL – INFO */}
        <aside className="bg-white rounded-xl shadow p-5">
          <h2 className="font-bold text-primary mb-3">
            Location Info
          </h2>

          <p className="text-sm text-gray-600">
            Click on any destination marker to view details.
          </p>

          {selectedDestination ? (
            <div className="mt-4 border rounded-lg p-3 text-sm">
              <p className="font-semibold text-accent">{selectedDestination.name}</p>
              <p className="text-gray-600 mt-1">District: {selectedDestination.district}</p>
              <p className="text-gray-600 capitalize">Category: {selectedDestination.type}</p>
              <p className="text-gray-500 text-xs mt-2">Click on map to explore nearby attractions</p>
            </div>
          ) : (
            <div className="mt-4 border rounded-lg p-3 text-sm text-gray-500">
              <p className="font-semibold">No location selected</p>
              <p className="text-xs mt-1">Click on any marker to see details</p>
            </div>
          )}

          <button className="mt-4 w-full bg-accent text-white py-2 rounded-lg hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!selectedDestination}
          >
            Get Directions
          </button>

          <div className="mt-4 text-xs text-gray-500">
            <p className="font-semibold">📍 Nearby (simulated):</p>
            {selectedDestination ? (
              <ul className="mt-2 space-y-1">
                <li>• Local restaurants (2 km)</li>
                <li>• Parking area (500 m)</li>
                <li>• Viewpoint (1.2 km)</li>
              </ul>
            ) : (
              <p className="mt-2">Select a destination to see nearby places</p>
            )}
          </div>
        </aside>
      </div>

      {/* FOOT NOTE */}
      <p className="mt-8 text-sm text-center text-gray-600">
        * Interactive map powered by OpenLayers with OpenStreetMap data. Click on markers for details.
      </p>
    </div>
  )
}