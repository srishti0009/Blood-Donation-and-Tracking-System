"use client"

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import { useEffect, useState } from "react"

// 🔧 Fix Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

interface Props {
  onLocationSelect: (lat: number, lng: number) => void
}

// 🔹 Force map to recalc size once rendered
function FixMapResize() {
  const map = useMap()

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize()
    }, 200)
  }, [map])

  return null
}

export default function DemandMap({ onLocationSelect }: Props) {
  const [position, setPosition] = useState<[number, number]>([
    28.6139,
    77.209,
  ])

  // 🔹 Get user location ONCE
  useEffect(() => {
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setPosition([lat, lng])
        onLocationSelect(lat, lng)
      },
      () => {
        // fallback (Delhi)
        onLocationSelect(28.6139, 77.209)
      }
    )
  }, [])

  return (
    <div
      style={{
        height: "400px",
        width: "100%",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <MapContainer
        center={position}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom
      >
        <FixMapResize />

        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker
          position={position}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const latlng = e.target.getLatLng()
              setPosition([latlng.lat, latlng.lng])
              onLocationSelect(latlng.lat, latlng.lng)
            },
          }}
        >
          <Popup>
            📍 Selected Location <br />
            Lat: {position[0].toFixed(4)} <br />
            Lng: {position[1].toFixed(4)}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}
