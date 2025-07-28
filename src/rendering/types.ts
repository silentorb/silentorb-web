export type HandlebarsTemplate = (data: any) => string

export type TemplateMap = Map<string, HandlebarsTemplate>
export type PartialMap = Map<string, string>

export interface SiteResources {
  pages: TemplateMap
  templates: TemplateMap,
  partials: PartialMap
}

export interface ContentLoaderParams {
  key: string
  file: string
  parentPath?: string
}

export type ContentLoader<T> = (params: ContentLoaderParams) => [string, T]

export interface RawArticle {
  content: string
  data: any
  file: string
  renderer?: string
}

export type RawArticleMap = Map<string, RawArticle>

export interface RenderingContext {
  articles: RawArticleMap
}

export interface ArticleContext extends RenderingContext {
  data: any
  key: string
}

export interface Article {
  content: string
  original: string
  data: any
  file: string
}

export type ArticleMap = Map<string, Article>
