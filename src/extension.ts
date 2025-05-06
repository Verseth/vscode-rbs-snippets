import * as vscode from 'vscode';
import { spawn } from 'child_process';
import { stripVTControlCharacters } from 'util';
import { relative } from 'path';

function convertSigsToRBS() {
	return new Promise((resolve, reject) => {
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
				resolve(relativeDocumentPath)
				vscode.window.showInformationMessage(`Translated sorbet sigs to RBS in ${relativeDocumentPath}`)
			} else {
				reject(relativeDocumentPath)
				vscode.window.showErrorMessage(`Could not translate sorbet sigs to RBS in ${relativeDocumentPath}!`)
			}
		})
	})
}

function convertAssertionsToRBS() {
	return new Promise((resolve, reject) => {
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
				'assertions',
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
				resolve(relativeDocumentPath)
				vscode.window.showInformationMessage(`Translated sorbet assertions to RBS in ${relativeDocumentPath}`)
			} else {
				reject(relativeDocumentPath)
				vscode.window.showErrorMessage(`Could not translate sorbet assertions to RBS in ${relativeDocumentPath}!`)
			}
		})
	})
}

async function convertSigsAndAssertionsToRBS() {
	await convertSigsToRBS()
	await convertAssertionsToRBS()
}

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('rbs-snippets.convertSigsToRBSInFile', convertSigsToRBS)
	context.subscriptions.push(disposable)

	disposable = vscode.commands.registerCommand('rbs-snippets.convertAssertionsToRBSInFile', convertAssertionsToRBS)
	context.subscriptions.push(disposable)

	disposable = vscode.commands.registerCommand('rbs-snippets.convertSigsAndAssertionsToRBSInFile', convertSigsAndAssertionsToRBS)
	context.subscriptions.push(disposable)
}

// This method is called when your extension is deactivated
export function deactivate() {}
