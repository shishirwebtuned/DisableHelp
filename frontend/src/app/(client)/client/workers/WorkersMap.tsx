// src/app/(client)/client/workers/WorkersMap.tsx
'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { useEffect, useMemo } from 'react';
import { WorkerPopup } from './WorkerPopup';
import { CircleWithPopup } from './CircleWithPopup';

function FitBounds({ markers }: { markers: [number, number][] }) {
    const map = useMap();
    useEffect(() => {
        if (!markers || markers.length === 0) return;
        const bounds = L.latLngBounds(markers);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
    }, [markers.length]);
    return null;
}

function ZoomLimiter({ active }: { active: boolean }) {
    const map = useMap();
    useEffect(() => {
        if (active) { map.setMinZoom(12); map.setMaxZoom(14); }
        else { map.setMinZoom(2); map.setMaxZoom(18); }
    }, [active, map]);
    return null;
}

function FocusWorker({ worker }: { worker: any }) {
    const map = useMap();
    useEffect(() => {
        if (worker?.coords) map.flyTo(worker.coords as [number, number], 14, { duration: 1.2 });
    }, [worker]);
    return null;
}

const createCustomClusterIcon = (cluster: any) => {
    const count = cluster.getChildCount();
    const size = count < 10 ? 'small' : count < 50 ? 'medium' : 'large';
    return L.divIcon({
        html: `<div class="custom-marker-cluster ${size}">${count}</div>`,
        className: '',
        iconSize: L.point(40, 40, true),
    });
};

const MapLegend = () => (
    <div className="absolute top-3 right-3 z-[1000] bg-white border rounded-lg shadow-md px-2 md:px-3 py-1.5 md:py-2 md:text-[11px] text-[10px] lg:text-xs">
        <div className="font-semibold mb-1">Worker Type</div>
        <div className="flex items-center gap-2 mb-0.5 md:mb-1">
            <img src="/marker-icon-2xa.png" className="h-5 md:h-6 lg:h-7 w-auto" />
            <span>Individual Worker</span>
        </div>
        <div className="flex items-center gap-2">
            <img src="/marker-icon-2xb.png" className="h-5 md:h-6 lg:h-7 w-auto" />
            <span>NDIS Provider</span>
        </div>
    </div>
);

interface WorkersMapProps {
    focusedWorker: any;
    filteredWorkersWithCoords: any[];
    clientCoords: [number, number] | null;
    isMobile: boolean;
}

export default function WorkersMap({
    focusedWorker,
    filteredWorkersWithCoords,
    clientCoords,
    isMobile,
}: WorkersMapProps) {
    const hasFocusedCoords = focusedWorker && Array.isArray(focusedWorker.coords) && focusedWorker.coords.length === 2;

    const workerIcon = useMemo(() => new L.Icon({
        iconUrl: '/marker-icon-2xa.png',
        iconRetinaUrl: '/marker-icon-2xa.png',
        shadowUrl: '/marker-shadow.png',
        iconSize: isMobile ? [22, 34] : [32, 48],
        iconAnchor: isMobile ? [11, 34] : [12, 41],
        popupAnchor: [1, -34],
        shadowSize: isMobile ? [30, 30] : [41, 41],
    }), [isMobile]);

    const ndisIcon = useMemo(() => new L.Icon({
        iconUrl: '/marker-icon-2xb.png',
        iconRetinaUrl: '/marker-icon-2xb.png',
        shadowUrl: '/marker-shadow.png',
        iconSize: isMobile ? [22, 34] : [31, 50],
        iconAnchor: isMobile ? [11, 34] : [12, 41],
        popupAnchor: [1, -34],
        shadowSize: isMobile ? [30, 30] : [41, 41],
    }), [isMobile]);

    return (
        <div className="w-full h-[300px] md:h-[350px] lg:h-[400px] relative">
            <MapLegend />
            <MapContainer center={[-25.2744, 133.7751]} zoom={4} className="w-full h-full">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <ZoomLimiter active={!!hasFocusedCoords} />
                {hasFocusedCoords ? (
                    <>
                        <CircleWithPopup worker={focusedWorker} clientCoords={clientCoords} />
                        <Marker
                            position={focusedWorker.coords as [number, number]}
                            icon={focusedWorker.isNdisProvider ? ndisIcon : workerIcon}
                            interactive={false}
                        />
                        <FocusWorker worker={focusedWorker} />
                    </>
                ) : (
                    <>
                        <MarkerClusterGroup iconCreateFunction={createCustomClusterIcon}>
                            {filteredWorkersWithCoords
                                .filter(w => Array.isArray(w.coords) && w.coords.length === 2)
                                .map(worker => (
                                    <Marker
                                        key={worker._id}
                                        position={worker.coords as [number, number]}
                                        icon={worker.isNdisProvider ? ndisIcon : workerIcon}
                                    >
                                        <Popup>
                                            <WorkerPopup worker={worker} clientCoords={clientCoords} />
                                        </Popup>
                                    </Marker>
                                ))}
                        </MarkerClusterGroup>
                        <FitBounds
                            markers={filteredWorkersWithCoords
                                .filter(w => w.coords)
                                .map(w => w.coords as [number, number])}
                        />
                    </>
                )}
            </MapContainer>
        </div>
    );
}