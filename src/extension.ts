import * as vscode from 'vscode';

import AzPipelinesTask from './AzPipelinesTask';
import {generateDebugProfile, appendDebugProfile} from './debugProfiles';


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

			vscode.window.showInformationMessage(`Debug profile ${profile.name} has been created!`);

		}
		catch(ex) {
			vscode.window.showErrorMessage(`Operation failed: ${ex.message}`);
		}
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
