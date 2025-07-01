import fs from 'node:fs/promises'
import { join, resolve } from 'node:path'

async function getDirContent(dirPath) {
  const dirContent = await fs.readdir(dirPath)
  return Promise.all(dirContent.map(fName => getFProps(dirPath, fName)))
}

async function getFProps(dirPath, fName) {
  const fPath = join(dirPath, fName)
  const fProps = await fs.stat(fPath)

  return {
    id: fProps.ino,
    name: fName,
    path: fPath,
    type: fProps.isDirectory() ? "dir" : "file",
    createdAt: fProps.birthtime,
    updatedAt: fProps.mtime,
    ...(fProps.isDirectory()
      ? { dirContent: await getDirContent(fPath)}
      : {}
    )
  }
}

(async () => {
  const dirPath = resolve('.', "src", "renderer")
  const dirContent = await getDirContent(dirPath);
  console.log(JSON.stringify(dirContent, null, 2))
})()
