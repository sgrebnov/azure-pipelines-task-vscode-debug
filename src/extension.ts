import * as vscode from 'vscode';

import AzPipelinesTask from './AzPipelinesTask';
import {generateDebugProfile, appendDebugProfile} from './debugProfiles';
import {ensureModule} from './npmUtils';

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('az-pipelines-extension.generateDebugConfig', (evt) => {
		try {

			const workspace = vscode.workspace.getWorkspaceFolder(evt._formatted);
			if (!workspace) {
				return;
			}

			const azPipelinesTask = new AzPipelinesTask(evt.fsPath);

			const profile = generateDebugProfile(azPipelinesTask);
			appendDebugProfile(profile, workspace);

			ensureDebugDependencies(workspace.uri.fsPath);

			vscode.window.showInformationMessage(`Debug profile ${profile.name} has been created!`);

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
