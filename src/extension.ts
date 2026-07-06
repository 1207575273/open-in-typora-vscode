import * as vscode from 'vscode';
import { openInTypora } from './commands/openInTypora';

export function activate(context: vscode.ExtensionContext): void {
  const disposable = vscode.commands.registerCommand('openInTypora.open', (uri?: vscode.Uri) => {
    void openInTypora(uri);
  });
  context.subscriptions.push(disposable);
}

export function deactivate(): void {
  // no-op
}