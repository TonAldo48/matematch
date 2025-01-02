"use client"

import { useCallback, useState } from "react"
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api"

const containerStyle = {
  width: '100%',
  height: '400px'
}

const defaultCenter = {
  lat: 37.7749, // San Francisco coordinates as default
  lng: -122.4194
}

interface MapProps {
  center?: google.maps.LatLngLiteral
  markers?: Array<{
    position: google.maps.LatLngLiteral
    title: string
  }>
}

export function GoogleMapsView({ center = defaultCenter, markers = [] }: MapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null)

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
  }, [])

  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={13}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {markers.map((marker, index) => (
          <Marker
            key={index}
            position={marker.position}
            title={marker.title}
          />
        ))}
      </GoogleMap>
    </LoadScript>
  )
} 