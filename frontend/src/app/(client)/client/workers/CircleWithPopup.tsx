import { useState } from 'react';
import { Circle, Popup } from 'react-leaflet';
import { WorkerPopup } from './page';

export function CircleWithPopup({
    worker,
    clientCoords,
}: {
    worker: any;
    clientCoords: [number, number] | null;
}) {
    const [open, setOpen] = useState(false);
    if (!worker?.coords || !Array.isArray(worker.coords) || worker.coords.length !== 2) {
        return null;
    }

    const coords = worker.coords as [number, number];
    return (
        <>
            <Circle
                center={coords}
                radius={1000}
                pathOptions={{ color: '#2563eb', fillColor: '#60a5fa', fillOpacity: 0.25 }}
                eventHandlers={{ click: () => setOpen(true) }}
            />
            {open && (
                <Popup
                    position={coords}
                    eventHandlers={{ remove: () => setOpen(false) }}
                >
                    <WorkerPopup worker={worker} clientCoords={clientCoords} />
                </Popup>
            )}
        </>
    );
}