import * as vscode from 'vscode';

import AzPipelinesTask from './AzPipelinesTask';
import {generateDebugProfiles, appendDebugProfiles} from './debugProfiles';
import {ensureModule} from './npmUtils';

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('az-pipelines-extension.generateDebugConfig', (evt) => {
		try {

			const workspace = vscode.workspace.getWorkspaceFolder(evt._formatted);
			if (!workspace) {
				return;
			}

			const azPipelinesTask = new AzPipelinesTask(evt.fsPath);

			const profiles = generateDebugProfiles(azPipelinesTask);

			if (profiles.length === 0) {
				vscode.window.showErrorMessage(`No supported configurations found`);
				return;
			}

			appendDebugProfiles(profiles, workspace);

			ensureDebugDependencies(workspace.uri.fsPath);

			profiles.forEach(p => vscode.window.showInformationMessage(`Debug profile ${p.name} has been created!`));

		}
		catch(ex) {
			vscode.window.showErrorMessage(`Operation failed: ${ex.message}`);
		}
	});

	context.subscriptions.push(disposable);
}

function ensureDebugDependencies(root: string) {
	ensureModule(root, 'ts-node');
	ensureModule(root, '@types/node');
}

// this method is called when your extension is deactivated
export function deactivate() {}
