/*
|-----------------------------------------
| setting up data.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 1 November, 2026
|-----------------------------------------
*/

export const COUNTRY_DIRECTORY_REGIONS = [
  "Asia",
  "Africa",
  "Europe",
  "North America",
  "South America",
  "Oceania",
] as const;

export type Region = (typeof COUNTRY_DIRECTORY_REGIONS)[number];

export interface CountryItem {
  id: string;
  name: string;
  flag: string;
  flagImage: string;
  region: Region;
  description: string;
}

export interface ICountryDirectoryData {
  pageUid: string;
  pageName: string;
  searchPlaceholder: string;
  viewAllLabel: string;
  sectionTitlePrefix: string;
  emptyMessage: string;
  countries: CountryItem[];
}

export interface CountryDirectoryPayload extends ICountryDirectoryData {
  paddingX: number;
  paddingY: number;
}

export interface CountryDirectoryProps {
  data?: ICountryDirectoryData | CountryDirectoryPayload | string;
}

export const defaultLayout = {
  paddingX: 0,
  paddingY: 0,
};

export const getFlagImageFromEmoji = (flag: string) => {
  const code = Array.from(flag)
    .map((character) => character.codePointAt(0))
    .filter((value): value is number => typeof value === "number" && value >= 0x1f1e6 && value <= 0x1f1ff)
    .map((value) => String.fromCharCode(value - 0x1f1e6 + 97))
    .join("");

  return code.length === 2 ? `https://flagcdn.com/w160/${code}.png` : "";
};

export const getDefaultCountryDescription = (_name: string, _region: Region) => {
  void _name;
  void _region;
  return "";
};

export const defaultDataCountryDirectory: ICountryDirectoryData = {
  pageUid: "country-directory-uid",
  pageName: "Products",
  searchPlaceholder: "Search products",
  viewAllLabel: "Browse products",
  sectionTitlePrefix: "Available products",
  emptyMessage: "Browse products on NexaMart",
  countries: [],
};
