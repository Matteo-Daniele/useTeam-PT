export class GetCardDto {
  id: string;
  title: string;
  description?: string;
  boardId: string;
  columnId: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}
