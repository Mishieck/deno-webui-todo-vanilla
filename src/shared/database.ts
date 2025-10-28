import { Result } from "./result.ts";
import { TodoData } from "./todo.ts";

export type AddResult = Result<TodoData, "OPERATION_FAILED">;
export type GetOneResult = Result<TodoData, "OPERATION_FAILED">;
export type GetAllResult = Result<Array<TodoData>, "OPERATION_FAILED">;
export type UpdateResult = Result<TodoData, "NOT_FOUND" | "OPERATION_FAILED">;
export type DeleteResult = Result<TodoData, "OPERATION_FAILED">;
