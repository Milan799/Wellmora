import { useEffect } from 'react';
import { useProducts } from '../context/ProductContext.jsx';

export const useSocket = (eventName, callback) => {
  const { socket } = useProducts();

  useEffect(() => {
    if (!socket) return;

    socket.on(eventName, callback);

    return () => {
      socket.off(eventName, callback);
    };
  }, [socket, eventName, callback]);
};
