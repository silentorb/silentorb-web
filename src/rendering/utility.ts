import * as fs from 'fs'
import * as path from "path"

export function flatten<T>(input: T[][]): T[] {
  return [].concat.apply([], input as any)
}

export function getFilesRecursive(fileOrDirectory: string): string[] {
  if (!fs.lstatSync(fileOrDirectory).isDirectory())
    return [fileOrDirectory]

  const hierarchy = fs.readdirSync(fileOrDirectory).map(f =>
    getFilesRecursive(fileOrDirectory + '/' + f)
  )

  return flatten(hierarchy)
}

export function getPathWithoutExtension(file: string): string | undefined {
  const match = file.match(/^(.*)\.[^.]+$/)
  return match ? match[1] : undefined
}

export function getFileNameWithoutExtension(file: string): string | undefined {
  return getPathWithoutExtension(path.basename(file))
}

export function normalizeSlashes(text: string) {
  return text.replace(/\\+/g, '/')
}

export function relativePath(directory: string, file: string) {
  return normalizeSlashes(path.relative(directory, file))
}

export function getDirName(filePath: string) {
  return normalizeSlashes(path.dirname(filePath))
}

export function absoluteRelativePath(directory: string, file: string) {
  const relative = path.relative(directory, path.dirname(file))
  const absolute = path.join(directory, file)
  return normalizeSlashes(absolute)
}
