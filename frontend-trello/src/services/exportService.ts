import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface ExportBacklogRequest {
  email: string;
  fields?: string[];
  boardName?: string;
}

export interface ExportBacklogResponse {
  message: string;
  requestId: string;
}

export class ExportService {
  /**
   * Exportar backlog del board a CSV vía email
   */
  static async exportBoardBacklog(
    boardId: string,
    request: ExportBacklogRequest,
  ): Promise<ExportBacklogResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/export/backlog/${boardId}`, request);
      return response.data;
    } catch (error: unknown) {
      console.error('Error al exportar backlog:', error);
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Error al exportar backlog'
        : 'Error al exportar backlog';
      throw new Error(errorMessage);
    }
  }
}

export const exportService = new ExportService();
