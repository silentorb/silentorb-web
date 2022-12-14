export type HandlebarsTemplate = (data: any) => string

export interface ContentLoaderParams {
  key: string
  file: string
  parentPath?: string
}

export type ContentLoader<T> = (params: ContentLoaderParams) => [string, T]

export interface Article {
  content: string
  data: any
  file: string
}
