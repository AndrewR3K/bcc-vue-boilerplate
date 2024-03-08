var fs = require('fs');
var path = require('path');
var archiver = require('archiver');
var { version } = require('../package.json')

function zipDirectory(sourceDir, outFolder, outPath) {
    const archive = archiver('zip', { zlib: { level: 9 }});

    fs.mkdirSync(outFolder, { recursive: true });
    const stream = fs.createWriteStream(`${outFolder}/${outPath}`);
  
    return new Promise((resolve, reject) => {
      archive
        .directory(sourceDir, false)
        .on('error', err => reject(err))
        .pipe(stream)
      ;
  
      stream.on('close', () => resolve());
      archive.finalize();
    });
}

(async () => {
    console.info("Cloning project into release")
    fs.readdirSync('../').forEach(path => {
        if (path !== 'ui' && path !=='releases') {
            fs.cpSync(`../${path}`, `../temp/${path}`, {recursive: true});
        }
    })
    
    console.info("Cloning UI build into release");
    fs.cpSync('./dist', '../temp/ui', {recursive: true});
    
    let name = path.basename(path.resolve('../'));
    let output_file = `releases/${version}/${name}`

    console.log(process.env.ZIP)
    if (process.env.ZIP === 'true') {
        console.info("Zipping your release");
        await zipDirectory('../temp', `../releases/${version}`, `${name}.zip`);
        output_file = output_file+'.zip';
    } else {
        console.info("Creating your release");
        fs.cpSync('../temp', `../${output_file}`, {recursive: true});
    }
    
    console.info("Cleaning up temp folder");
    fs.rmSync('../temp', {force: true, recursive: true});
    fs.rmSync('./dist', {force: true, recursive: true});
    
    console.info(`Release is done! ${output_file}`);
})()