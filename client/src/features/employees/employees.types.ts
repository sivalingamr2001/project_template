export type EmployeeResponse = {
  employeeId: number;
  name: string;
  email: string;
  phone: number;
  departmentId: number;
  departmentName: string;
  role: string;
};

export type CreateEmployeeRequest = {
  employeeId: number;
  name: string;
  email: string;
  phone: number;
  departmentId: number;
  departmentName: string;
  role: string;
  password?: string;
};

export type UpdateEmployeeRequest = Omit<CreateEmployeeRequest, "employeeId">;
