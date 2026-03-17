const FRONTEND_VERSION = 'v2.0.4';

function createFooter() {
    // 加底部 padding 避免內容被 footer 遮住
    document.body.style.paddingBottom = '44px';

    var footer = document.createElement('div');
    footer.id = 'version-footer';
    footer.style.cssText = [
        'position:fixed', 'bottom:0', 'left:0', 'right:0',
        'background:#343a40', 'color:#adb5bd',
        'text-align:center', 'padding:10px 16px',
        'font-size:0.82rem', 'z-index:9999',
        'border-top:1px solid #495057'
    ].join(';');

    footer.innerHTML = '前端版本：<strong style="color:#f8f9fa">' + FRONTEND_VERSION + '</strong>'
        + '　｜　後端版本：<strong id="backend-version" style="color:#f8f9fa">載入中…</strong>';

    document.body.appendChild(footer);

    // 從 GAS API 取得後端版本
    if (typeof GAS_URL !== 'undefined') {
        fetch(GAS_URL + '?action=getVersion')
            .then(function(res) { return res.json(); })
            .then(function(json) {
                document.getElementById('backend-version').textContent = json.data || '未知';
            })
            .catch(function() {
                document.getElementById('backend-version').textContent = '無法取得';
            });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createFooter);
} else {
    createFooter();
}
