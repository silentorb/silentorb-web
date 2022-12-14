import { loadAndPrepareArticles } from './input'
import { loadSiteResources, writeHtmlFiles } from './output'

const fse = require('fs-extra')

const outputDirectory = 'dist'

export async function buildSite() {
  require('dotenv').config()
  console.log('Building site')
  const resources = await loadSiteResources()

  // MARLOTH_STORY_DIR should point to the marloth-story-docs/docs directory
  const marlothDirectory = process.env.MARLOTH_STORY_DIR || './node_modules/marloth-story-docs/docs'

  const articles = await loadAndPrepareArticles()

  fse.removeSync(outputDirectory)
  fse.ensureDirSync(outputDirectory)
  fse.copySync('public', outputDirectory)

  await writeHtmlFiles(outputDirectory, resources, articles)
  console.log('Finished building site')
}
