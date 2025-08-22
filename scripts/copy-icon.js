const fs = require('fs')
const path = require('path')

// Define paths
const srcPyro = path.join(__dirname, '..', 'nodes', 'Pyro', 'pyro.svg')
const destDirPyro = path.join(__dirname, '..', 'dist', 'nodes', 'Pyro')
const destPyro = path.join(destDirPyro, 'pyro.svg')

const srcTrigger = path.join(__dirname, '..', 'nodes', 'PyroTrigger', 'pyro.svg')
const destDirTrigger = path.join(__dirname, '..', 'dist', 'nodes', 'PyroTrigger')
const destTrigger = path.join(destDirTrigger, 'pyro.svg')

// Function to copy icon
function copyIcon(source, destDirectory, destination, nodeName) {
	if (!fs.existsSync(source)) {
		console.error(`Source icon not found for ${nodeName}:`, source)
		return false
	}

	if (!fs.existsSync(destDirectory)) {
		fs.mkdirSync(destDirectory, { recursive: true })
	}

	fs.copyFileSync(source, destination)
	console.log(`Copied ${nodeName} icon to`, destination)
	return true
}

// Copy icons for both nodes
copyIcon(srcPyro, destDirPyro, destPyro, 'Pyro')

// For PyroTrigger, use the same icon if it doesn't exist
if (!fs.existsSync(srcTrigger) && fs.existsSync(srcPyro)) {
	copyIcon(srcPyro, destDirTrigger, destTrigger, 'PyroTrigger')
} else {
	copyIcon(srcTrigger, destDirTrigger, destTrigger, 'PyroTrigger')
}
;('fs')
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
