import {getFilesRecursive} from './utility'
import * as fs from 'fs'
import {HandlebarsTemplate} from './types'

const Handlebars = require('handlebars')
const rimraf = require('rimraf')
const mkdirp = require('mkdirp')
const matter = require('gray-matter')
const marked = require('marked')

export type ContentLoader<T> = (file: string) => T

interface Article {
  content: string
  data: any
}

const loadMarkDown: ContentLoader<Article> = file => {
  const { content, data } = matter.read(file)
  const html = marked(content)
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
  return loadFiles('src/articles', loadMarkDown)
}

const outputDirectory = 'dist'

function main() {
  const templates = loadTemplates()
  const articles = loadArticles()
  console.log(templates)
  console.log(articles)

  rimraf.sync(outputDirectory)
  mkdirp.sync(outputDirectory)

  const pageTemplate = templates.get('page')
  if (!pageTemplate)
    throw Error('Could not find page template')

  for (const [ key, article ] of articles) {
    const directory = outputDirectory + '/' + key
    mkdirp.sync(directory)
    const output = pageTemplate({
      ...article,
    })
    fs.writeFileSync(directory + '/index.html', output, 'utf8')
  }
}

main()
