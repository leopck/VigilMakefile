const chokidar = require('chokidar');
var sys = require('util')
var exec = require('child_process').exec;
var fs = require('fs');
var flagReady = false;
var registrationArray = {};
const projectRootPath = "/home/pi/makefilewatchdog";
var projectName = {};

function registerMakefile(projectPath, makePath) {
  //During registration, need to make sure that the path of the project is not a sub-project
  tmp = projectRootPath.split('/');
  tmp2 = projectPath.split('/');

  if((tmp2.length - 1) == tmp.length){
    registrationArray[projectPath] = makePath;
    console.log("Successfully Registered your project");
    console.log(registrationArray);
    try {
      if (fs.existsSync(makePath)) {
        console.log('No generation of Makefile since file exist already in project');        
      }
      else{
        generateMakefile(makePath);
      }
    } catch(err) {
      console.log("Error in Registration");
    }
  }
}

function unregisterMakefile(projectPath, makePath) {
    //During registration, need to make sure that the path of the project is not a sub-project
    tmp = projectRootPath.split('/');
    tmp2 = projectPath.split('/');
  
    if((tmp2.length - 1) == tmp.length){
      delete registrationArray[projectPath];
      console.log("Successfully Unregistered your project");
      console.log(registrationArray);
    }
}

function executeMakefile(projectPath) {
  dir = exec(projectPath, function(err, stdout, stderr) {
    if (err) {
      console.log(`Failed to run: ${err}`);  
    }
    console.log(stdout);
  });
  dir.on('exit', function (code) {
    // exit code is code
    console.log("Exit!");
    
  });
}

function generateMakefile(makePath){
  fs.appendFile(makePath, 'all: \n echo "Success!"', function (err) {
    if (err) throw err;
    console.log('Saved!');
    fs.chmodSync(makePath, '755');
  });
}

function discoverProjectFromFilePath(filePath) {
  tmp = projectRootPath.split('/').filter(function (el) {
    return el != '';
  });
  tmp2 = filePath.split('/').filter(function (el) {
    return el != '';
  });

  return `/${tmp2.slice(0, tmp.length+1).join('/')}`;
}

function runMakefile(addedFilePathName) {
  if (flagReady == true){
    try {
      if (fs.existsSync(addedFilePathName)) {
        console.log("Trying to execute Makefile");
        executeMakefile(`${discoverProjectFromFilePath(addedFilePathName)}/Makefile`);
      }
      else{
        console.log('Project removed; no Makefile to run');        
      }
    } catch(err) {
      console.log("Error in runMakefile");
    }
  }
}

function setReady(statusFlag) {
  console.log(statusFlag);
  flagReady = true;
}

// Initialize watcher.
const watcher = chokidar.watch(projectRootPath, {
  ignored: [`${projectRootPath}/src`, `${projectRootPath}/.git`, `${projectRootPath}/*/.git`, `${projectRootPath}/*.swp`, `${projectRootPath}/*/*.swp`],
  persistent: true
});

// Something to use when events are received.
const log = console.log.bind(console);
// Add event listeners.
watcher
  .on('add', addedFilePathName => runMakefile(addedFilePathName))
  .on('change', addedFilePathName => runMakefile(addedFilePathName))
  .on('unlink', addedFilePathName => runMakefile(addedFilePathName));
 
// More possible events.
watcher
  .on('addDir', projectPath => registerMakefile(projectPath, `${projectPath}/Makefile`))
  .on('unlinkDir', projectPath => unregisterMakefile(projectPath, `${projectPath}/Makefile`))
  .on('error', error => runMakefile('error', `Watcher error: ${error}`))
  .on('ready', () => setReady('Initial scan complete. Ready for changes'));
  // .on('raw', (event, projectRootPath, details) => {
  //   log('Raw event info:', event, projectRootPath, details);
  // });
