/*
|-----------------------------------------
| setting up Data for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface LocationContact {
  email: string;
  phone: string;
  manager: string;
}

export interface OfficeLocation {
  id: string;
  sectionUid: string;
  name: string;
  type: "Headquarters" | "Research Lab" | "Data Center";
  address: string;
  city: string;
  country: string;
  coordinates: GeoPoint;
  contact: LocationContact;
  image: string;
  description: string;
  features: string[];
  schedule: string;
}

export interface Section15Payload {
  locations: OfficeLocation[];
  paddingX: number;
  paddingY: number;
}

export const defaultLayout = { paddingX: 0, paddingY: 0 };

export const defaultDataSection15: OfficeLocation[] = [];
