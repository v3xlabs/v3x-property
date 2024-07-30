import 'leaflet/dist/leaflet.css';

import { FC } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';

export const LeafletPreview: FC<{ latitude: number; longitude: number }> = ({
    latitude,
    longitude,
}) => {
    console.log({ latitude, longitude });

    if (latitude === 0 && longitude === 0) {
        return;
    }

    return (
        <MapContainer
            center={{
                lat: latitude,
                lng: longitude,
            }}
            zoom={8}
            scrollWheelZoom={false}
            className="w-full h-full"
            dragging={false}
            touchZoom={false}
            doubleClickZoom={false}
            boxZoom={false}
            attributionControl={false}
            zoomControl={false}
            // style={{ height: 80, width: 80 }}
        >
            <TileLayer
                // attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
            />
        </MapContainer>
    );
};
