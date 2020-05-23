import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';

const {
	parse,
	stringify,
  } = require('comment-json');

import {TaskInputDefinition} from 'vso-node-api/interfaces/TaskAgentInterfaces';

import AzPipelinesTask from './AzPipelinesTask';

export class DebugProfile {
    name: string;
    definition: string;

    constructor(name: string, definition: string) {
        this.name = name;
        this.definition = definition;
    }
}

export function appendDebugProfile(profile: DebugProfile, workspace: vscode.WorkspaceFolder) {

    const debugProfilesPath = path.join(workspace.uri.fsPath, '.vscode/launch.json');
    const debugProfiles = parse(fs.readFileSync(debugProfilesPath).toString());

    debugProfiles.configurations.push(profile.definition);

    const updatedProfiles = stringify(debugProfiles, null, 4);

    fs.writeFileSync(debugProfilesPath, updatedProfiles);
}

export function generateDebugProfile(azPipelinesTask: AzPipelinesTask): DebugProfile {

    if (!azPipelinesTask.taskDefinition.execution.Node) {
        throw new Error(`Unsupported execution type, expected type Node, but found: ${Object.keys(azPipelinesTask.taskDefinition.execution)}`);
    }
    
    const executable = azPipelinesTask.taskDefinition.execution.Node.target.replace(".js", ".ts");

	let debugDefinitionTemplate = 
	{
		name: `Debug ${azPipelinesTask.taskName}`,
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
			debugDefinition.env[name] = item.defaultValue || "";
			return;
		}

		if (item.type === 'connectedService:ssh') {
			debugDefinition.env['INPUT_SSHENDPOINT'] = 'SSH';
			debugDefinition.env['ENDPOINT_AUTH_PARAMETER_SSH_USERNAME'] = '';
			debugDefinition.env['ENDPOINT_AUTH_PARAMETER_SSH_PASSWORD'] = '';
			debugDefinition.env['ENDPOINT_DATA_SSH_HOST'] = '';
			return;
		}

        vscode.window.showErrorMessage(`Unknown input type: ${item.type}; Skipped`);

		//throw new Error(`Unsupported input type: ${item.type}`);
	});

	return new DebugProfile(azPipelinesTask.taskName, debugDefinition);
}
