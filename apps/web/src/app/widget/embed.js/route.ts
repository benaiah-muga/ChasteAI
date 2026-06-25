export const runtime = "nodejs"

export async function GET() {
  const script = `
(function() {
  var channelId = document.currentScript.getAttribute('data-channel');
  if (!channelId) {
    console.error('ChasteAI widget: missing data-channel attribute');
    return;
  }

  var origin = window.location.origin;
  var existing = document.getElementById('chasteai-widget-container');
  if (existing) return;

  var container = document.createElement('div');
  container.id = 'chasteai-widget-container';
  container.innerHTML = [
    '<style>',
      '#chasteai-widget-button {',
        'position: fixed; bottom: 24px; right: 24px; z-index: 2147483646;',
        'width: 56px; height: 56px; border-radius: 50%;',
        'background: #6366f1; color: white; border: none; cursor: pointer;',
        'box-shadow: 0 4px 12px rgba(99,102,241,0.4);',
        'display: flex; align-items: center; justify-content: center;',
        'transition: transform 0.2s, box-shadow 0.2s;',
      '}',
      '#chasteai-widget-button:hover {',
        'transform: scale(1.05);',
        'box-shadow: 0 6px 20px rgba(99,102,241,0.5);',
      '}',
      '#chasteai-widget-iframe {',
        'position: fixed; bottom: 88px; right: 24px; z-index: 2147483645;',
        'width: 380px; height: 600px; max-height: calc(100vh - 120px);',
        'border: none; border-radius: 16px;',
        'box-shadow: 0 8px 32px rgba(0,0,0,0.12);',
        'display: none; overflow: hidden;',
      '}',
      '@media (max-width: 480px) {',
        '#chasteai-widget-iframe {',
          'width: 100vw; height: 100vh; max-height: 100vh;',
          'bottom: 0; right: 0;',
          'border-radius: 0;',
        '}',
        '#chasteai-widget-button { bottom: 16px; right: 16px; }',
      '}',
    '</style>',
    '<button id="chasteai-widget-button" aria-label="Open chat">',
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">',
        '<path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8Z"/>',
      '</svg>',
    '</button>',
    '<iframe id="chasteai-widget-iframe" src="' + origin + '/widget/channel/' + channelId + '" title="Chat widget"></iframe>',
  ].join('\\n');
  document.body.appendChild(container);

  var button = document.getElementById('chasteai-widget-button');
  var iframe = document.getElementById('chasteai-widget-iframe');
  var open = false;

  button.addEventListener('click', function() {
    open = !open;
    iframe.style.display = open ? 'block' : 'none';
    button.innerHTML = open
      ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>'
      : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8Z"/></svg>';
  });
})();
`

  return new Response(script, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "public, max-age=3600",
    },
  })
}
