import * as vscode from 'vscode';

import AzPipelinesTask from './AzPipelinesTask';
import {generateDebugProfiles, appendDebugProfiles} from './debugProfiles';
import * as npmUtils from './npmUtils';

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

			ensureGlobalDebugDependencies(workspace.uri.fsPath);

			profiles.forEach(p => {
				p.installLocalDebugDependencies();
				vscode.window.showInformationMessage(`Added Debug profile: ${p.name}`);
			});

		}
		catch(ex) {
			vscode.window.showErrorMessage(`Operation failed: ${ex.message}`);
		}
	});

	context.subscriptions.push(disposable);
}

function ensureGlobalDebugDependencies(root: string) {
	npmUtils.ensureModule(root, 'ts-node');
	npmUtils.ensureModule(root, '@types/node');
}

// this method is called when your extension is deactivated
export function deactivate() {}
