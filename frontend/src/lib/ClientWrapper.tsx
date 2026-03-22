// "use client";

// import { ReactNode, useEffect } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { addMessage, updateMessage, removeMessage, markReadLocal } from "@/redux/slices/messageSlice";

// interface Props {
//     children: ReactNode;
// }

// export default function ClientWrapper({ children }: Props) {
//     const dispatch = useDispatch();
//     const userId = useSelector((state: any) => state.session.user?._id);

//     useEffect(() => {
//         if (!userId) return;

//         import("@/lib/socket").then(({ connectSocket, disconnectSocket }) => {
//             const socket = connectSocket(userId);

//             socket.on("newMessage", (msg: any) => dispatch(addMessage(msg)));
//             socket.on("editMessage", (msg: any) => dispatch(updateMessage(msg)));
//             socket.on("deleteMessage", ({ messageId }: any) => dispatch(removeMessage(messageId)));
//             socket.on("messagesRead", () => dispatch(markReadLocal()));

//             return () => {
//                 disconnectSocket();
//             };
//         });
//     }, [userId, dispatch]);

//     if (!userId) return <>{children}</>;

//     return <SocketProvider userId={userId}>{children}</SocketProvider>;
// }