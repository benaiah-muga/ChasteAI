export const runtime = "nodejs"

export async function GET() {
  const script = `
(function() {
  var el = document.currentScript;
  var channelId = (window.chasteai && window.chasteai.q && window.chasteai.q[0] && window.chasteai.q[0][1]) || (el && el.getAttribute('data-channel'));
  if (!channelId) {
    console.error('ChasteAI widget: missing channel ID. Use chasteai("init", "CHANNEL_ID") or data-channel attribute.');
    return;
  }

  var color = (el && el.getAttribute('data-color')) || '#6366f1';
  var position = (el && el.getAttribute('data-position')) || 'right';
  var title = (el && el.getAttribute('data-title')) || 'Chat';
  var greeting = (el && el.getAttribute('data-greeting')) || '';
  var agentName = (el && el.getAttribute('data-agent-name')) || '';
  var autoOpen = parseInt((el && el.getAttribute('data-auto-open')) || '0', 10);

  var scriptSrc = el && el.src;
  var origin = scriptSrc ? scriptSrc.substring(0, scriptSrc.lastIndexOf('/widget/embed.js')) : window.location.origin;
  var existing = document.getElementById('chasteai-widget-container');
  if (existing) return;

  var side = position === 'left' ? 'left' : 'right';
  var buttonBottom = '24px';
  var buttonSide = side === 'left' ? '24px' : '24px';
  var iframeBottom = '88px';
  var iframeSide = side === 'left' ? '24px' : '24px';

  var params = '?color=' + encodeURIComponent(color) + '&title=' + encodeURIComponent(title) + '&greeting=' + encodeURIComponent(greeting) + '&agentName=' + encodeURIComponent(agentName);

  var container = document.createElement('div');
  container.id = 'chasteai-widget-container';
  container.innerHTML = [
    '<style>',
      '#chasteai-widget-button {',
        'position: fixed; bottom: ' + buttonBottom + '; ' + side + ': ' + buttonSide + '; z-index: 2147483646;',
        'width: 56px; height: 56px; border-radius: 50%;',
        'background: ' + color + '; color: white; border: none; cursor: pointer;',
        'box-shadow: 0 4px 12px ' + color + '66;',
        'display: flex; align-items: center; justify-content: center;',
        'transition: transform 0.2s, box-shadow 0.2s;',
      '}',
      '#chasteai-widget-button:hover {',
        'transform: scale(1.05);',
        'box-shadow: 0 6px 20px ' + color + '99;',
      '}',
      '#chasteai-widget-iframe {',
        'position: fixed; bottom: ' + iframeBottom + '; ' + side + ': ' + iframeSide + '; z-index: 2147483645;',
        'width: 380px; height: 600px; max-height: calc(100vh - 120px);',
        'border: none; border-radius: 16px;',
        'box-shadow: 0 8px 32px rgba(0,0,0,0.12);',
        'display: none; overflow: hidden;',
      '}',
      '@media (max-width: 480px) {',
        '#chasteai-widget-iframe {',
          'width: 100vw; height: 100vh; max-height: 100vh;',
          'bottom: 0; ' + side + ': 0;',
          'border-radius: 0;',
        '}',
        '#chasteai-widget-button { bottom: 16px; ' + side + ': 16px; }',
      '}',
    '</style>',
    '<button id="chasteai-widget-button" aria-label="Open chat">',
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">',
        '<path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8Z"/>',
      '</svg>',
    '</button>',
    '<iframe id="chasteai-widget-iframe" src="' + origin + '/widget/channel/' + channelId + params + '" title="Chat widget"></iframe>',
  ].join('\\n');
  document.body.appendChild(container);

  var button = document.getElementById('chasteai-widget-button');
  var iframe = document.getElementById('chasteai-widget-iframe');
  var open = false;

  function toggleWidget(state) {
    open = state !== undefined ? state : !open;
    iframe.style.display = open ? 'block' : 'none';
    button.innerHTML = open
      ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>'
      : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8Z"/></svg>';
  }

  button.addEventListener('click', function() { toggleWidget(); });

  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'chasteai-close') {
      toggleWidget(false);
    }
  });

  if (autoOpen > 0) {
    setTimeout(function() { toggleWidget(true); }, autoOpen * 1000);
  }
})();
`

  return new Response(script, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "public, max-age=3600",
    },
  })
}
