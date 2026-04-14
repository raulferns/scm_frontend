import { useState, useEffect } from "react";
import { getShipments } from "../api/shipments";

export function useShipments() {
  const [shipments, setShipments] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadShipments = async () => {
      try {
        setLoading(true);

        const data = await getShipments();

        if (isMounted) {
          setShipments(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setShipments([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadShipments();

    const intervalId = setInterval(loadShipments, 5000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  return {
    shipments,
    loading,
    error
  };
}