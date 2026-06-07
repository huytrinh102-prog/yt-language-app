export type ApiResponse<T = unknown> = {
  EC: number;
  EM: string;
  DT: T;
};
