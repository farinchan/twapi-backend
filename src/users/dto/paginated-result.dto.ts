import { Prisma } from '@prisma/client';

export interface PaginatedResult<T> {
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  data: T[];
}

export interface FindAllParams {
  skip?: number;
  take?: number;
  cursor?: Prisma.UserWhereUniqueInput;
  search?: string;
}
