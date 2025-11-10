import locationData from "../../../public/philippines-locations.json";

export interface Province {
  name: string;
  region: string;
  key: string;
}

export interface City {
  name: string;
  province: string;
  city?: boolean;
}

interface LocationData {
  provinces: Province[];
  cities: City[];
}

const data = locationData as LocationData;

/**
 * Get all provinces formatted for dropdown component
 */
export const getProvinces = (): { name: string }[] => {
  return data.provinces.map((province) => ({ name: province.name }));
};

/**
 * Get cities for a specific province formatted for dropdown component
 * @param provinceName - Name of the province to get cities for
 */
export const getCitiesByProvince = (provinceName: string): { name: string }[] => {
  // Find the province key
  const province = data.provinces.find((p) => p.name === provinceName);
  
  if (!province) {
    return [];
  }

  // Filter cities by province key
  return data.cities
    .filter((city) => city.province === province.key)
    .map((city) => ({ name: city.name }));
};

/**
 * Get province key by province name
 * @param provinceName - Name of the province
 */
export const getProvinceKey = (provinceName: string): string | undefined => {
  const province = data.provinces.find((p) => p.name === provinceName);
  return province?.key;
};

/**
 * Check if a location exists in the data
 */
export const isValidProvince = (provinceName: string): boolean => {
  return data.provinces.some((p) => p.name === provinceName);
};

export const isValidCity = (cityName: string, provinceName: string): boolean => {
  const province = data.provinces.find((p) => p.name === provinceName);
  if (!province) return false;

  return data.cities.some(
    (city) => city.name === cityName && city.province === province.key
  );
};

/**
 * Default country for the application
 */
export const DEFAULT_COUNTRY = "Philippines";

/**
 * Get all available countries (currently only Philippines)
 */
export const getCountries = (): { name: string }[] => {
  return [{ name: DEFAULT_COUNTRY }];
};
