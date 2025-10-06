export class GetCardDto {
  id: string;
  title: string;
  description?: string;
  boardId: string;
  columnId: string;
  order: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
