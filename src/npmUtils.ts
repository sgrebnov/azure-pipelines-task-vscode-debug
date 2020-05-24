import * as fs from 'fs';
import * as path from 'path';
import * as child_process from 'child_process';

export function isModuleInstalled(root: string, moduleName: string) {
    try {
        fs.accessSync(path.join(root, './node_modules/', moduleName));
        return true;
      } catch (err) {
        return false;
      }
}

export async function installModule(root: string, moduleName: string) {

    try {
        child_process.execSync(`npm install ${moduleName}`, {cwd: root});
    } catch (err) {
        throw new Error(`Unable to install module ${moduleName}; error: ${err}`);
    }
}
// Installs the dependencies in the local node_modules folder
export async function installLocalDependencies(root: string) {

    try {
        // check whether dependencies have been already installed
        fs.accessSync(path.join(root, './node_modules/'));
        return true;
      } catch (err) {}

    try {
        child_process.execSync(`npm install`, {cwd: root});
    } catch (err) {
        throw new Error(`'npm install' failed: ${err}`);
    }
}

export function ensureModule(root: string, moduleName: string) {
    if (!isModuleInstalled(root, moduleName)) {
        installModule(root, moduleName);
    }
}