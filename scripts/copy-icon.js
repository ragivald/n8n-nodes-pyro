const fs = require('fs')
const path = require('path')

const src = path.join(__dirname, '..', 'nodes', 'Pyro', 'pyro.svg')
const destDir = path.join(__dirname, '..', 'dist', 'nodes', 'Pyro')
const dest = path.join(destDir, 'pyro.svg')

if (!fs.existsSync(src)) {
	console.error('Source icon not found:', src)
	process.exit(1)
}

if (!fs.existsSync(destDir)) {
	fs.mkdirSync(destDir, { recursive: true })
}

fs.copyFileSync(src, dest)
console.log('Copied icon to', dest)
