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
  causes?: string;
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

  const fetchRovers = (isInitial = false) => {
    if (isInitial) setLoading(true);
    apiRequest<Rover[]>("/rovers/")
      .then((res) => {
        setData(Array.isArray(res) ? res : []);
        if (isInitial) setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        if (isInitial) setLoading(false);
      });
  };

  useEffect(() => {
    fetchRovers(true);
    const interval = setInterval(() => fetchRovers(false), 4000);
    return () => clearInterval(interval);
  }, []);

  return { data, loading, error, refetch: () => fetchRovers(false) };
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

export interface DiscoveredRover {
  id: string;
  name: string;
  polyhouse_id?: string;
  status: string;
  battery_level: number;
  scan_speed_m_s: number;
  inspection_interval_hours: number;
  inspection_duration_mins: number;
  cockpit_url?: string;
  is_live: boolean;
}

export function useDiscoveredRovers() {
  const [data, setData] = useState<DiscoveredRover[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDiscovered = () => {
    setLoading(true);
    apiRequest<DiscoveredRover[]>("/rovers/discovered")
      .then((res) => {
        setData(Array.isArray(res) ? res : []);
        setLoading(false);
      })
      .catch(() => {
        setData([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDiscovered();
    const interval = setInterval(fetchDiscovered, 5000);
    return () => clearInterval(interval);
  }, []);

  return { data, loading, refetch: fetchDiscovered };
}

export interface RoverLiveTelemetry {
  rover_id: string;
  rover_name: string;
  is_online: boolean;
  state: string;
  battery?: {
    percentage: number;
    voltage_v: number;
    current_draw_a: number;
    is_low: boolean;
    is_critical: boolean;
  };
  pose?: {
    x: number;
    y: number;
    theta_rad?: number;
    theta_deg?: number;
    linear_velocity_m_s?: number;
    angular_velocity_rad_s?: number;
    total_odometry_m?: number;
  };
  environment?: {
    temperature_c: number;
    humidity_pct: number;
    co2_ppm: number;
    light_intensity_lux?: number;
    lux?: number;
    vpd_kpa: number;
  };
  soil?: {
    moisture_pct: number;
    temperature_c: number;
    ec_ds_m: number;
    ph: number;
    nitrogen_ppm: number;
    phosphorus_ppm: number;
    potassium_ppm: number;
  };
  lidar?: {
    min_distance_m: number;
    obstacles_count: number;
    beam_count: number;
  };
  camera_frame?: string | null;
  discovered_anomalies_count?: number;
  logs?: Array<{
    timestamp: string;
    level: string;
    message: string;
  }>;
}

export function useRoverLiveTelemetry(roverId: string | null) {
  const [data, setData] = useState<RoverLiveTelemetry | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchTelemetry = () => {
    if (!roverId) return;
    apiRequest<RoverLiveTelemetry>(`/rovers/${roverId}/live-telemetry`)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!roverId) return;
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 2000);
    return () => clearInterval(interval);
  }, [roverId]);

  return { data, loading, refetch: fetchTelemetry };
}

// AI Vision / Crop Disease Detection Interfaces & Helpers
export interface ClassInformation {
  type?: string;
  category?: string;
  common_name?: string;
  scientific_cause?: string;
  causal_agent?: string;
  affected_parts?: string[];
  symptoms?: string[];
  favorable_conditions?: string[];
  cause_and_biology?: string[];
  agricultural_impact?: string[];
  diagnostic_notes?: string[];
  management?: string[];
  ipm?: string[];
  precautions?: string[];
}

export interface TopPrediction {
  rank: number;
  class_name: string;
  class_index: number;
  confidence_percent: number;
  class_information?: ClassInformation;
}

export interface CropAnalysisResult {
  success: boolean;
  predicted_class: string;
  formatted_title: string;
  issue_type: string;
  severity: "Critical" | "Warning" | "Info";
  confidence_percent: number;
  confidence_level: string;
  is_healthy: boolean;
  summary_causes: string;
  management_recommendations: string[];
  symptoms: string[];
  class_information?: ClassInformation;
  top_5_predictions: TopPrediction[];
  incident_id?: string;
  image_url?: string;
  polyhouse_id?: string;
  rover_id?: string;
  grid_x?: number;
  grid_y?: number;
  detected_at: string;
}

export interface CropModelInfo {
  status: string;
  architecture: string;
  classifier_architecture?: string;
  framework: string;
  num_classes: number;
  classes: string[];
  input_size?: string;
  device?: string;
  api_endpoint: string;
}

export async function analyzeCropImageFile(
  file: File,
  params: {
    polyhouse_id?: string;
    rover_id?: string;
    grid_x?: number;
    grid_y?: number;
    auto_save_incident?: boolean;
  } = {}
): Promise<CropAnalysisResult> {
  const formData = new FormData();
  formData.append("file", file);
  if (params.polyhouse_id) formData.append("polyhouse_id", params.polyhouse_id);
  if (params.rover_id) formData.append("rover_id", params.rover_id);
  if (params.grid_x !== undefined) formData.append("grid_x", String(params.grid_x));
  if (params.grid_y !== undefined) formData.append("grid_y", String(params.grid_y));
  formData.append("auto_save_incident", String(params.auto_save_incident ?? true));

  return await apiRequest<CropAnalysisResult>("/crop-intelligence/analyze-image", {
    method: "POST",
    body: formData,
  });
}

export async function analyzeCropImageJson(payload: {
  image_b64?: string;
  image_url?: string;
  polyhouse_id?: string;
  rover_id?: string;
  grid_x?: number;
  grid_y?: number;
  auto_save_incident?: boolean;
}): Promise<CropAnalysisResult> {
  return await apiRequest<CropAnalysisResult>("/crop-intelligence/analyze-json", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function useCropModelInfo() {
  const [data, setData] = useState<CropModelInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<CropModelInfo>("/crop-intelligence/model-info")
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { data, loading };
}



