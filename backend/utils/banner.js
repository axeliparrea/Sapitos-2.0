/**
 * ASCII banner for server startup
 */
const colors = require('colors/safe');

function getVersionFromPackage() {
    try {
        const packageJson = require('../package.json');
        return packageJson.version || '1.0.0';
    } catch (err) {
        return '1.0.0';
    }
}

function displayBanner() {
    const version = getVersionFromPackage();
    
    console.log('');
    console.log(colors.green('  ███████╗ █████╗ ██████╗ ██╗████████╗ ██████╗ ███████╗'));
    console.log(colors.green('  ██╔════╝██╔══██╗██╔══██╗██║╚══██╔══╝██╔═══██╗██╔════╝'));
    console.log(colors.green('  ███████╗███████║██████╔╝██║   ██║   ██║   ██║███████╗'));
    console.log(colors.green('  ╚════██║██╔══██║██╔═══╝ ██║   ██║   ██║   ██║╚════██║'));
    console.log(colors.green('  ███████║██║  ██║██║     ██║   ██║   ╚██████╔╝███████║'));
    console.log(colors.green('  ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝   ╚═╝    ╚═════╝ ╚══════╝'));
    console.log('');
    console.log(`  ${colors.cyan('Backend Server')} ${colors.yellow('v' + version)}`);
    console.log(`  ${colors.dim('Running in')} ${colors.white(process.env.NODE_ENV || 'development')} ${colors.dim('mode')}`);
    console.log('');
}

module.exports = { displayBanner };
