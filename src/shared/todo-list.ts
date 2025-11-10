import { Result } from "./result.ts";
import { TodoData } from "./todo.ts";

export abstract class TodoList {
  abstract init(): Promise<void>;
  abstract add(item: TodoData): Promise<Result<TodoData, "OPERATION_FAILED">>;
  abstract getOne(id: string): Promise<Result<TodoData, "NOT_FOUND">>;
  abstract getAll(): Promise<Result<Array<TodoData>, "OPERATION_FAILED">>;
  abstract update(id: TodoData["id"]): Promise<Result<TodoData, "NOT_FOUND">>;
  abstract remove(id: string): Promise<Result<TodoData, "NOT_FOUND">>;
  abstract close(): void;
}
