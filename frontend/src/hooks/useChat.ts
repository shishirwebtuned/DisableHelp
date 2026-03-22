// import { useEffect, useState } from "react";
// import { socket } from "@/lib/socket";

// export const useChat = (chatId: string) => {
//   const [messages, setMessages] = useState<any[]>([]);

//   useEffect(() => {
//     if (!chatId) return;

//     socket.connect();

//     socket.emit("joinChat", chatId);

//     socket.on("receiveMessage", (message) => {
//       setMessages((prev) => [message, ...prev]);
//     });

//     socket.on("messageEdited", (updated) => {
//       setMessages((prev) =>
//         prev.map((m) => (m._id === updated._id ? updated : m)),
//       );
//     });

//     socket.on("messageDeleted", ({ messageId }) => {
//       setMessages((prev) => prev.filter((m) => m._id !== messageId));
//     });

//     socket.on("messagesRead", ({ chatId }) => {
//       setMessages((prev) =>
//         prev.map((m) => ({
//           ...m,
//           read: true,
//         })),
//       );
//     });

//     return () => {
//       socket.emit("leaveChat", chatId);

//       socket.off("receiveMessage");
//       socket.off("messageEdited");
//       socket.off("messageDeleted");
//       socket.off("messagesRead");
//     };
//   }, [chatId]);

//   return { messages, setMessages };
// };
