import * as vscode from 'vscode';
import { spawn } from 'child_process';
import { stripVTControlCharacters } from 'util';
import { relative } from 'path';

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand('rbs-snippets.convertSigsToRBSInFile', () => {
		let editor = vscode.window.activeTextEditor
		if (!editor) return;

		let folders = vscode.workspace.workspaceFolders
		if (!folders) return;

		let folder = folders[0]
		let folderPath = folder.uri.fsPath
		let documentPath = editor.document.fileName
		let result = spawn(
			'bundle',
			[
				'exec',
				'spoom',
				'srb',
				'sigs',
				'translate',
				documentPath,
			],
			{
				cwd: folderPath,
			}
		)

		result.stderr.on('data', (data) => {
			let msg = stripVTControlCharacters(data.toString())
			vscode.window.showErrorMessage(`Spoom error: ${msg}`)
		})
		result.on('close', (code) => {
			let relativeDocumentPath = relative(folderPath, documentPath)
			if (code === 0) {
				vscode.window.showInformationMessage(`Translated sigs to RBS in ${relativeDocumentPath}`)
			} else {
				vscode.window.showErrorMessage(`Could not translate sigs to RBS in ${relativeDocumentPath}!`)
			}
		})
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
