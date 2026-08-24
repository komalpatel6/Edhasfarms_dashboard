import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api-client";

export interface Polyhouse {
  id: string;
  name: string;
  location?: string;
  total_area_sqm?: number;
  crop_type?: string;
  crop_stage?: string;
  grid_rows: number;
  grid_bays: number;
  length_m?: number;
  width_m?: number;
  row_spacing_m?: number;
  plant_spacing_m?: number;
  created_at: string;
}

export interface LiveMetrics {
  polyhouse_id: string;
  temperature: number;
  humidity: number;
  co2_ppm: number;
  light_intensity_lux: number;
  vpd_kpa: number;
  recorded_at: string;
}

export interface Rover {
  id: string;
  name: string;
  polyhouse_id?: string;
  status: "Idle" | "Scanning" | "Charging" | "Offline" | "Maintenance";
  battery_level: number;
  inspection_interval_hours: number;
  inspection_duration_mins: number;
  scan_speed_m_s: number;
  last_ping: string;
  created_at: string;
}

export interface AnomalyIncident {
  id: string;
  polyhouse_id: string;
  rover_id?: string;
  title: string;
  issue_type: string;
  severity: "Critical" | "Warning" | "Info";
  ai_confidence: number;
  image_url?: string;
  grid_x?: number;
  grid_y?: number;
  status: "Open" | "InReview" | "Resolved";
  detected_at: string;
}

export interface Alert {
  id: string;
  polyhouse_id: string;
  title: string;
  description?: string;
  severity: "Critical" | "Warning" | "Info";
  category: "Environment" | "Rover" | "PlantHealth";
  is_acknowledged: boolean;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: "Admin" | "Agronomist" | "Operator";
  is_active: boolean;
  created_at: string;
}

export function usePolyhouses() {
  const [data, setData] = useState<Polyhouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPolyhouses = () => {
    setLoading(true);
    apiRequest<Polyhouse[]>("/polyhouses/")
      .then((res) => {
        setData(Array.isArray(res) ? res : []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPolyhouses();
  }, []);

  return { data, loading, error, refetch: fetchPolyhouses };
}

export function useRovers() {
  const [data, setData] = useState<Rover[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRovers = () => {
    setLoading(true);
    apiRequest<Rover[]>("/rovers/")
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRovers();
  }, []);

  return { data, loading, error, refetch: fetchRovers };
}

export function useAlerts() {
  const [data, setData] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<Alert[]>("/alerts/")
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { data, loading };
}

export function useAnomalies() {
  const [data, setData] = useState<AnomalyIncident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<AnomalyIncident[]>("/crop-intelligence/incidents")
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { data, loading };
}

export function usePolyhouseLiveMetrics(polyhouseId: string) {
  const [data, setData] = useState<LiveMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!polyhouseId) return;
    apiRequest<LiveMetrics>(`/polyhouses/${polyhouseId}/live-metrics`)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [polyhouseId]);

  return { data, loading };
}
