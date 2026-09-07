export function showDiagnosticErrorBanner(
  title: string,
  message: string,
  stack?: string,
  componentStack?: string
) {
  if (typeof document === 'undefined') return;

  let overlay = document.getElementById('on-screen-diagnostic-error');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'on-screen-diagnostic-error';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.right = '0';
    overlay.style.zIndex = '9999999';
    overlay.style.backgroundColor = '#450a0a';
    overlay.style.color = '#ffffff';
    overlay.style.fontFamily = 'monospace, Courier, sans-serif';
    overlay.style.fontSize = '12px';
    overlay.style.padding = '12px 16px';
    overlay.style.maxHeight = '60vh';
    overlay.style.overflowY = 'auto';
    overlay.style.borderBottom = '3px solid #ef4444';
    overlay.style.boxShadow = '0 10px 30px rgba(0,0,0,0.9)';
    overlay.style.direction = 'ltr';
    overlay.style.textAlign = 'left';
    document.body.appendChild(overlay);
  }

  const timestamp = new Date().toLocaleTimeString('ar-EG');

  const escapeHtml = (str: string) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const contentHtml = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 6px;">
      <strong style="color: #fca5a5; font-size: 13px;">⚠️ [DIAGNOSTIC ERROR] ${escapeHtml(title)} (${timestamp})</strong>
      <button onclick="document.getElementById('on-screen-diagnostic-error')?.remove()" style="background: #ef4444; color: white; border: none; padding: 4px 10px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 11px;">إغلاق X</button>
    </div>
    <div style="font-weight: bold; color: #ffffff; margin-bottom: 6px; font-size: 13px; word-break: break-word;">
      ${escapeHtml(message)}
    </div>
    ${
      stack
        ? `<div style="background: rgba(0,0,0,0.5); padding: 8px; border-radius: 4px; margin-top: 6px; white-space: pre-wrap; word-break: break-all; color: #fecdd3; font-size: 11px; line-height: 1.4;">
            <strong>Stack Trace:</strong>\n${escapeHtml(stack)}
           </div>`
        : ''
    }
    ${
      componentStack
        ? `<div style="background: rgba(0,0,0,0.6); padding: 8px; border-radius: 4px; margin-top: 6px; white-space: pre-wrap; word-break: break-all; color: #cbd5e1; font-size: 11px; line-height: 1.4;">
            <strong>Component Stack:</strong>\n${escapeHtml(componentStack)}
           </div>`
        : ''
    }
  `;

  overlay.innerHTML = contentHtml;
}
