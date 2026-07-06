import * as vscode from 'vscode';
import { validatePath } from '../domain/TyporaPathValidator';
import { launchTypora } from '../process/typoraLauncher';

/**
 * Open in Typora 命令。
 * 菜单的显示由 package.json 的 when 子句保证(只在 markdown 上出现),
 * 这里只处理"路径配置"这一可变状态。
 */
export async function openInTypora(uri?: vscode.Uri): Promise<void> {
  const filePath = resolveFilePath(uri);
  if (!filePath) {
    vscode.window.showWarningMessage('No Markdown file selected.');
    return;
  }

  const config = vscode.workspace.getConfiguration('openInTypora');
  const typoraPath = config.get<string>('executablePath', '');

  const check = validatePath(typoraPath);
  if (!check.valid) {
    const action = await vscode.window.showErrorMessage(
      `${check.message} Configure Typora path in Settings.`,
      'Open Settings',
    );
    if (action === 'Open Settings') {
      vscode.commands.executeCommand('workbench.action.openSettings', 'openInTypora.executablePath');
    }
    return;
  }

  try {
    launchTypora(typoraPath!, filePath);
  } catch (e) {
    vscode.window.showErrorMessage(`Failed to launch Typora: ${(e as Error).message}`);
  }
}

function resolveFilePath(uri?: vscode.Uri): string | undefined {
  // 右键文件树:uri 直接传入
  if (uri) {
    return uri.fsPath;
  }
  // 编辑器右键:取当前活动编辑器
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    return editor.document.uri.fsPath;
  }
  return undefined;
}