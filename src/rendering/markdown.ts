import { absoluteRelativePath } from './utility'
import { Article, ArticleContext, ContentLoader, RawArticle, RenderingContext } from './types'
import Handlebars = require('handlebars')
import matter = require('gray-matter')

const marked = require('marked')

const mdPattern = /(\/index)?\.md$/
const indexPattern = /\/index$/

export const newMarkdownHandlebars = () => {
  const handlebars = Handlebars.create()

  handlebars.registerHelper('childIndex', (data: any) => {
    const context: ArticleContext = data.data.root
    const parentPath = context.key + '/'
    const { articles } = context
    const values = [...articles]
      .filter(([key, value]) => key.startsWith(parentPath) && key.length > parentPath.length)

    const links = values.map(([key, value]) => `<a href="/${key}">${value.data.title}</a>`)
      .join('\n')

    // const links = values.map(([key, value]) => `[${value.data.title}](/${key})`)
    //   .join('\n')

    return `<menu>\n${links}\n</menu>`
    // return links
  })

  return handlebars
}

const getTitleFromMarkdown = (data: any) => (token: any) => {
  if (token.type === 'heading' && token.depth === 1) {
    data.title = token.text
  }
}

function customMarkedRenderer(parentPath: string = '') {
  const renderer = new marked.Renderer()
  const link = renderer.link.bind(renderer)
  renderer.link = function (href: string, title: string, text: string) {
    const target = mdPattern.test(href)
      ? `/${absoluteRelativePath(parentPath, href.replace(mdPattern, ''))}`
      : href

    return link(target, title, text)
  }

  const heading = renderer.heading.bind(renderer)
  renderer.heading = function (text: string, level: number, raw: string, slugger: any) {
    return level > 1
      ? heading(text, level, raw, slugger)
      : ''
  }

  return renderer
}

export const loadMarkDown: (defaults?: any) => ContentLoader<RawArticle> = defaults => params => {
  const { key, file } = params
  const response = matter.read(file)
  const { content } = response
  const data = { ...defaults, ...response.data }
  const filteredKey = key.replace(indexPattern, '')
  return [filteredKey, { content, data, file, renderer: params.parentPath }]
}

export function renderMarkDown(handlebars: any, globalContext: RenderingContext, key: string, article: RawArticle): Article {
  const { content, data, file } = article
  const context: ArticleContext = { ...globalContext, key, data }
  const expanded = handlebars.compile(content, { noEscape: true })(context)
  const walkTokens = data.title ? undefined : getTitleFromMarkdown(data)
  const renderer = article.renderer ? customMarkedRenderer(article.renderer) : undefined
  const html = marked(expanded, { renderer, walkTokens })
  return { content: html, original: content, data, file }
}
