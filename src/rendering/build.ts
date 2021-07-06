import { getFileNameWithoutExtension, getFilesRecursive } from './utility'
import * as fs from 'fs'
import { HandlebarsTemplate } from './types'
import * as path from 'path'

const Handlebars = require('handlebars')
const matter = require('gray-matter')
const marked = require('marked')
const fse = require('fs-extra')

const articlesDirectory = 'src/articles'

export type ContentLoader<T> = (file: string) => T

interface Article {
  content: string
  data: any
}

function customMarkedRenderer() {
  const mdPattern = /\.md$/
  const renderer = new marked.Renderer()
  const link = renderer.link.bind(renderer)
  renderer.link = function (href: string, title: string, text: string) {
    const target = href
      .replace(mdPattern, '')
      .replace(/^\./, '')

    return link(target, title, text)
  }
  return renderer
}

const loadMarkDown: (defaults?: any) => ContentLoader<Article> = defaults => file => {
  const response = matter.read(file)
  const { content } = response
  const data = { ...defaults, ...response.data }
  const expanded = Handlebars.compile(content)({})
  const html = marked(expanded, { renderer: customMarkedRenderer() })
  return { content: html, data }
}

const loadTemplate: ContentLoader<HandlebarsTemplate> = file => Handlebars.compile(fs.readFileSync(file, 'utf8'))

function loadFiles<T = string>(directory: string, processor: ContentLoader<T>): Map<string, T> {
  const files = getFilesRecursive(directory)
  return new Map(
    files.map(file => {
      const key = getFileNameWithoutExtension(file)
      if (!key)
        throw new Error(`Could not find file ${file}`)

      return [key, processor(file)]
    })
  )
}

function loadTemplates(directory: string): Map<string, HandlebarsTemplate> {
  return loadFiles<HandlebarsTemplate>(directory, loadTemplate)
}

function loadArticles(directory: string, defaults?: any): Map<string, Article> {
  return loadFiles(directory, loadMarkDown(defaults))
}

function loadPartials() {
  const files = getFilesRecursive('src/partials')
  for (const file of files) {
    const name = getFileNameWithoutExtension(file)
    if (!name)
      throw new Error(`Could not find partial ${name}`)

    const template = fs.readFileSync(file, 'utf8')
    Handlebars.registerPartial(name, template, { noEscape: true })
  }
}

const outputDirectory = 'dist'

const newWriteFile = (rootDirectory: string) => (relativePath: string, content: string): void => {
  const filePath = `${rootDirectory}/${relativePath}`
  fse.ensureDirSync(path.dirname(filePath))
  fs.writeFileSync(filePath, content, 'utf8')
}

export function getRequiredConfigString(name: string): string {
  const value = process.env[name]
  if (!value)
    throw Error(`Missing required environment variable ${name}`)

  return value
}

export function buildSite() {
  require('dotenv').config()
  console.log('Building site')
  loadPartials()
  const templates = loadTemplates('src/templates')
  const pages = loadTemplates('src/pages')
  // MARLOTH_STORY_DIR should point to the marloth-story-docs/docs directory
  const marlothDirectory = process.env.MARLOTH_STORY_DIR || './node_modules/marloth-story-docs/docs'
  const articles = new Map([
    ...loadArticles(articlesDirectory),
    ...loadArticles(marlothDirectory, { template: 'marloth', articleStyle: 'reading' }),
  ])

  fse.removeSync(outputDirectory)
  fse.ensureDirSync(outputDirectory)
  fse.copySync('public', outputDirectory)

  const writeFile = newWriteFile(outputDirectory)

  for (const [title, page] of pages) {
    const html = page({
      title,
    })
    writeFile(`${title}.html`, html)
  }

  for (const [key, article] of articles) {
    const templateName = article.data.template
    const pageTemplate = templates.get(templateName)
    if (!pageTemplate)
      throw Error(`Could not find page template ${templateName}`)

    const html = pageTemplate({
      content: article.content,
      ...article.data,
    })
    writeFile(`${key}/index.html`, html)
  }
  console.log('Finished building site')
}
