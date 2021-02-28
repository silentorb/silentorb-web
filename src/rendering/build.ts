import {getFilesRecursive} from './utility'
import * as fs from 'fs'
import {HandlebarsTemplate} from './types'
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

function customMarkedRenderer(directory: string) {
  const mdPattern = /\.md$/
  const renderer = new marked.Renderer()
  const link = renderer.link.bind(renderer)
  renderer.link = function (href: string, title: string, text: string) {
    const target = href
      .replace(mdPattern, '')
      .replace(/^\./, directory)

    return link(target, title, text)
  }
  return renderer
  // return {
  //   ...defaultRenderer,
  //   link: function (href: string, title: string, text: string) {
  //     const target = href
  //       .replace(mdPattern, '')
  //       .replace(/^\./, directory)
  //
  //     return defaultRenderer.link(href, title, text)
  //   }
  // }
}

const loadMarkDown: ContentLoader<Article> = file => {
  const dir = path.dirname(file).slice(articlesDirectory.length + 1)
  const { content, data } = matter.read(file)
  const expanded = Handlebars.compile(content)({})
  const html = marked(expanded, { renderer: customMarkedRenderer(dir) })
  return { content: html, data }
}

const loadTemplate: ContentLoader<HandlebarsTemplate> = file => Handlebars.compile(fs.readFileSync(file, 'utf8'))

function loadFiles<T = string>(directory: string, processor: ContentLoader<T>): Map<string, T> {
  const files = getFilesRecursive(directory)
  return new Map(
    files.map(file => {
      const key = file.slice(directory.length + 1)
        .split('.')[0]

      return [ key, processor(file) ]
    })
  )
}

function loadTemplates(): Map<string, HandlebarsTemplate> {
  return loadFiles<HandlebarsTemplate>('src/templates', loadTemplate)
}

function loadArticles(): Map<string, Article> {
  return loadFiles(articlesDirectory, loadMarkDown)
}

function loadPartials() {
  const files = getFilesRecursive('src/partials')
  for (const file of files) {
    const name = path.basename(file).split('.')[0]
    const template = fs.readFileSync(file, 'utf8')
    Handlebars.registerPartial(name, template, { noEscape: true })
  }
}

const outputDirectory = 'dist'

export function buildSite() {
  loadPartials()
  const templates = loadTemplates()
  const articles = loadArticles()

  fse.removeSync(outputDirectory)
  fse.ensureDirSync(outputDirectory)
  fse.copySync('public', outputDirectory)

  for (const [ key, article ] of articles) {
    const directory = outputDirectory + '/' + key
    fse.ensureDirSync(directory)
    const templateName = article.data.template
    const pageTemplate = templates.get(templateName)
    if (!pageTemplate)
      throw Error(`Could not find page template ${templateName}`)

    const output = pageTemplate({
      ...article,
    })
    fs.writeFileSync(directory + '/index.html', output, 'utf8')
  }
}
