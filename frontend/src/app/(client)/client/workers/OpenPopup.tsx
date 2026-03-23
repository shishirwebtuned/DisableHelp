// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { formatDistance, getDistanceKm } from "@/lib/distance";
// import { useEffect, useRef } from "react";
// import { Marker, Popup, useMap } from "react-leaflet";

// export function OpenPopup({ worker }: { worker: any }) {
//     const map = useMap();
//     const markerRef = useRef<L.Marker | null>(null);

//     useEffect(() => {
//         if (worker?.coords) {
//             map.flyTo(worker.coords as [number, number], 14, { duration: 1.2 });
//             // Open popup after fly animation completes
//             map.once('moveend', () => {
//                 markerRef.current?.openPopup();
//             });
//         }
//     }, [worker]);

//     if (!worker?.coords) return null;

//     return (
//         <Marker
//             position={worker.coords as [number, number]}
//             ref={markerRef}
//         >
//             <Popup>
//                 <div className='flex flex-row items-center gap-3'>
//                     <Avatar className="h-10 w-10">
//                         <AvatarImage src={worker.avatar} />
//                         <AvatarFallback>{worker.firstName?.[0]}{worker.lastName?.[0]}</AvatarFallback>
//                     </Avatar>
//                     <div>
//                         <strong>{worker.firstName} {worker.lastName}</strong>
//                         <br />
//                         <span className="text-xs text-gray-500">
//                             {worker.address?.line1}, {worker.address?.state}, {worker.address?.postalCode}
//                         </span>
//                         {clientCoords && worker.coords && (
//                             <div className="text-xs text-blue-500 mt-0.5">
//                                 {formatDistance(getDistanceKm(
//                                     clientCoords[0], clientCoords[1],
//                                     worker.coords[0], worker.coords[1]
//                                 ))}
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </Popup>
//         </Marker>
//     );
// }