import fs from 'fs/promises'
import path from 'path'

const root = new URL('../', import.meta.url)
const dist = new URL('./dist/', root)

async function build() {
  await fs.rm(dist, { recursive: true, force: true })
  await fs.mkdir(dist, { recursive: true })

  await fs.copyFile(new URL('index.html', root), new URL('index.html', dist))
  await fs.cp(new URL('assets', root), new URL('assets', dist), { recursive: true })

  console.log('Built static DTC site to dist/')
}

build().catch((error) => {
  console.error(error)
  process.exit(1)
})
