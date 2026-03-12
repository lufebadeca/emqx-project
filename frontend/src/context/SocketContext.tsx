import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

interface DeviceData {
  baseTopic: string;
  topicId: string;
  value: string;
}

interface SocketContextValue {
  connected: boolean;
  lastMessages: Map<string, string>; // key = `${baseTopic}/${topicId}`
  sendCommand: (deviceId: string, topicId: string, value: string) => void;
}

const SocketContext = createContext<SocketContextValue>({
  connected: false,
  lastMessages: new Map(),
  sendCommand: () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastMessages, setLastMessages] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const socket = io("http://localhost:3001");
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("device:data", (data: DeviceData) => {
      const key = `${data.baseTopic}/${data.topicId}`;
      setLastMessages((prev) => {
        const next = new Map(prev);
        next.set(key, data.value);
        return next;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendCommand = useCallback((deviceId: string, topicId: string, value: string) => {
    socketRef.current?.emit("command", { deviceId, topicId, value });
  }, []);

  return (
    <SocketContext.Provider value={{ connected, lastMessages, sendCommand }}>
      {children}
    </SocketContext.Provider>
  );
};
