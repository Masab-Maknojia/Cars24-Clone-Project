const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5203/api";

export const createCar = async (carData: any) => {
  const response = await fetch(`${API_BASE_URL}/Cars`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(carData),
  });

  if (!response.ok) {
    throw new Error("Failed to create car");
  }

  return await response.json();
};

export const getcarByid = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/Cars/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch car");
  }

  return await response.json();
};

export const getAllCars = async () => {
  const response = await fetch(`${API_BASE_URL}/Cars`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch cars");
  }

  return await response.json();
};

export const searchCars = async (params: any) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v != null && v !== "")
  );
  
  const query = new URLSearchParams(cleanParams as any).toString();
  
  const response = await fetch(`${API_BASE_URL}/Cars/search?${query}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to search cars");
  }

  return await response.json();
};

export const getSuggestions = async (query: string) => {
  const response = await fetch(`${API_BASE_URL}/Cars/suggestions?q=${query}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch suggestions");
  }

  return await response.json();
};

export const getServiceCenters = async (city: string) => {
  const response = await fetch(`${API_BASE_URL}/Cars/service-centers?city=${city}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch service centers");
  }

  return await response.json();
};