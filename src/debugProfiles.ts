import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';

const {
	parse,
	stringify,
  } = require('comment-json');

import {TaskInputDefinition} from 'vso-node-api/interfaces/TaskAgentInterfaces';

import AzPipelinesTask from './AzPipelinesTask';

export class AzTaskDebugProfile {
    name: string;
    definition: string;
    taskCodebasePath: string;

    constructor(name: string, definition: string, taskCodebasePath: string) {
        this.name = name;
        this.definition = definition;
        this.taskCodebasePath = taskCodebasePath;
    }
}

function ensureDebugProfilesConfigExists (debugProfilesPath: string) {

    if (fs.existsSync(debugProfilesPath)) {
        return;
    }

    const vsCodeDir = path.join(debugProfilesPath, '..');

    if (!fs.existsSync(vsCodeDir)) {
        fs.mkdirSync(vsCodeDir);
    }

    // generate empty launch.json if it does not exist
    fs.writeFileSync(debugProfilesPath, '{"version": "0.2.0", "configurations": []}');
}

export function appendDebugProfiles(profiles: AzTaskDebugProfile[], workspace: vscode.WorkspaceFolder) {

    if (profiles.length === 0) {
        throw new Error('Invalid argument: profiles list is empty');
        
    }

    const debugProfilesPath = path.join(workspace.uri.fsPath, '.vscode/launch.json');

    ensureDebugProfilesConfigExists(debugProfilesPath);

    const debugProfiles = parse(fs.readFileSync(debugProfilesPath).toString());

    debugProfiles.configurations = debugProfiles.configurations.concat(profiles.map(x=>x.definition));

    const updatedProfiles = stringify(debugProfiles, null, 4);

    fs.writeFileSync(debugProfilesPath, updatedProfiles);
}

export function generateDebugProfiles(azPipelinesTask: AzPipelinesTask): AzTaskDebugProfile[] {

    const profiles: AzTaskDebugProfile[] = [];

    const taskDefinition: any = azPipelinesTask.taskDefinition;
    
    [
        'execution',
        'prejobexecution',
        'postjobexecution',
    ].forEach(x => {

        if(!taskDefinition[x]) {
            return;
        }

        if (!taskDefinition[x].Node) {
            throw new Error(`Unsupported execution type, expected type Node, but found: ${Object.keys(azPipelinesTask.taskDefinition.execution)}`);
        }

        profiles.push(generateDebugProfile(`${azPipelinesTask.taskName}-${x}`, taskDefinition[x].Node, azPipelinesTask));

    }); 

    return profiles;

}

function generateDebugProfile(name: string, section: any, azPipelinesTask: AzPipelinesTask): AzTaskDebugProfile {
    
    const executable = section.target.replace(".js", ".ts");

	let debugDefinitionTemplate = 
	{
		name: name,
		type: "node",
		request: "launch",
		args: ["${workspaceRoot}/Tasks/${TaskName}/${Executable}"],
		runtimeArgs: ["--nolazy", "-r", "ts-node/register"],
		sourceMaps: true,
		cwd: "${workspaceRoot}",
		protocol: "inspector",
		env: {},
	};

	const debugDefinition = parse(JSON.stringify(debugDefinitionTemplate).replace("${TaskName}", azPipelinesTask.taskName).replace("${Executable}", executable));

	azPipelinesTask.taskDefinition.inputs.forEach((item: TaskInputDefinition) => {
		if (['string', 'boolean', 'filePath', 'multiLine'].indexOf(item.type) !== -1) {
			const name = `INPUT_${item.name}`.toUpperCase();
			debugDefinition.env[name] = item.defaultValue || '';
			return;
		}

		if (item.type === 'connectedService:ssh') {
			debugDefinition.env['INPUT_SSHENDPOINT'] = 'SSH';
			debugDefinition.env['ENDPOINT_AUTH_PARAMETER_SSH_USERNAME'] = '';
			debugDefinition.env['ENDPOINT_AUTH_PARAMETER_SSH_PASSWORD'] = '';
			debugDefinition.env['ENDPOINT_DATA_SSH_HOST'] = '';
			return;
        }

        if (item.type === 'secureFile') {
            debugDefinition.env['INPUT_SSHKEYSECUREFILE'] = item.defaultValue || '';
            debugDefinition.env['SYSTEM_TEAMFOUNDATIONCOLLECTIONURI'] = '';
            debugDefinition.env['ENDPOINT_AUTH_PARAMETER_SYSTEMVSSCONNECTION_ACCESSTOKEN'] = '';
            return;
        }

        vscode.window.showErrorMessage(`Unknown input type: ${item.type}; Skipped`);

		//throw new Error(`Unsupported input type: ${item.type}`);
	});

	return new AzTaskDebugProfile(name, debugDefinition, azPipelinesTask.taskCodebasePath);
}
