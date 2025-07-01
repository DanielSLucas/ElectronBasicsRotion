import fs from 'node:fs/promises'
import { FEntry, FType } from '../shared/types/ipc'
import { join } from 'node:path'

export async function getDirContent(dirPath: string): Promise<FEntry[]> {
  const dirContent = await fs.readdir(dirPath)
  return Promise.all(dirContent.map(fName => getFProps(dirPath, fName)))
}

async function getFProps(dirPath: string, fName: string): Promise<FEntry> {
  const fPath = join(dirPath, fName)
  const fProps = await fs.stat(fPath)

  const f: FEntry = {
    id: fProps.ino.toString(),
    name: fName,
    path: fPath,
    type: FType.FILE,
    createdAt: fProps.birthtime,
    updatedAt: fProps.mtime,
  }

  if (fProps.isDirectory()) {
    Object.assign(f, {
      type: FType.FOLDER,
      content: await getDirContent(fPath),
    })
  }

  return f
}
