import axios from "./axiosCustomize";
import type { ApiResponse } from "./types/api";

export const apiGet = <TResponse = unknown>(url: string) => {
  return axios.get<ApiResponse<TResponse>, ApiResponse<TResponse>>(url);
};

export const apiPost = <TResponse = unknown, TBody = unknown>(
  url: string,
  data?: TBody,
) => {
  return axios.post<ApiResponse<TResponse>, ApiResponse<TResponse>, TBody>(
    url,
    data,
  );
};

export const apiPut = <TResponse = unknown, TBody = unknown>(
  url: string,
  data?: TBody,
) => {
  return axios.put<ApiResponse<TResponse>, ApiResponse<TResponse>, TBody>(
    url,
    data,
  );
};

export const apiDelete = <TResponse = unknown>(url: string) => {
  return axios.delete<ApiResponse<TResponse>, ApiResponse<TResponse>>(url);
};
