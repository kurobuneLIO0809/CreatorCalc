// Remembers the last tools this visitor opened (tool names only, stored in this browser).
(function () {
  try {
    var slug = document.currentScript && document.currentScript.getAttribute('data-tool-slug');
    if (!slug || !/^[a-z0-9-]{1,60}$/.test(slug)) return;
    var list = JSON.parse(localStorage.getItem('recentTools') || '[]');
    if (!Array.isArray(list)) list = [];
    list = [slug].concat(list.filter(function (s) { return s !== slug && typeof s === 'string'; })).slice(0, 6);
    localStorage.setItem('recentTools', JSON.stringify(list));
  } catch (e) {}
})();
