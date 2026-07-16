(function () {
  var table = document.getElementById('plan-table');
  if (!table) return;
  var tbody = table.tBodies[0];
  var ths = Array.prototype.slice.call(table.querySelectorAll('thead th'));
  var RATING_COL = 8; /* 0-indexed: Provider,Network,Tier,Data,$/Month,Price,$/GB,Banking,Rating */

  var mobileQuery = window.matchMedia('(max-width: 860px)');

  function mergeRatingColumn() {
    var rows = Array.prototype.slice.call(tbody.querySelectorAll('tr'));
    rows.forEach(function (r) {
      r.children[RATING_COL].style.display = '';
      r.children[RATING_COL].removeAttribute('rowspan');
    });
    if (mobileQuery.matches) return; /* stacked cards on mobile: every card keeps its own rating */
    var i = 0;
    while (i < rows.length) {
      var providerVal = rows[i].children[0].getAttribute('data-value');
      var j = i + 1;
      while (j < rows.length && rows[j].children[0].getAttribute('data-value') === providerVal) {
        j++;
      }
      if (j - i > 1) {
        rows[i].children[RATING_COL].setAttribute('rowspan', j - i);
        for (var k = i + 1; k < j; k++) {
          rows[k].children[RATING_COL].style.display = 'none';
        }
      }
      i = j;
    }
  }

  function clearOtherHeaders(except) {
    ths.forEach(function (th) {
      if (th !== except) {
        th.removeAttribute('aria-sort');
        delete th.dataset.dir;
        var arrow = th.querySelector('.sort-arrow');
        if (arrow) arrow.textContent = '↕';
      }
    });
  }

  function applySort(idx, type, dir) {
    var rows = Array.prototype.slice.call(tbody.querySelectorAll('tr'));
    rows.sort(function (a, b) {
      var av = a.children[idx].getAttribute('data-value');
      var bv = b.children[idx].getAttribute('data-value');
      var cmp;
      if (type === 'num') {
        cmp = parseFloat(av) - parseFloat(bv);
      } else {
        cmp = String(av).localeCompare(String(bv));
      }
      return dir === 'asc' ? cmp : -cmp;
    });
    rows.forEach(function (r) { tbody.appendChild(r); });
    mergeRatingColumn();
  }

  function syncHeaderUI(idx, dir) {
    var th = ths[idx];
    clearOtherHeaders(th);
    th.dataset.dir = dir;
    th.setAttribute('aria-sort', dir === 'asc' ? 'ascending' : 'descending');
    var arrow = th.querySelector('.sort-arrow');
    if (arrow) arrow.textContent = dir === 'asc' ? '▲' : '▼';
  }

  ths.forEach(function (th, idx) {
    th.setAttribute('aria-sort', 'none');
    var btn = th.querySelector('button.sort-btn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var nextDir = th.dataset.dir === 'asc' ? 'desc' : 'asc';
      var type = th.getAttribute('data-type');
      syncHeaderUI(idx, nextDir);
      applySort(idx, type, nextDir);
    });
  });

  var mobileSortSelect = document.getElementById('mobile-sort-select');
  if (mobileSortSelect) {
    mobileSortSelect.addEventListener('change', function () {
      var parts = mobileSortSelect.value.split(':');
      if (parts.length !== 3) return;
      var idx = parseInt(parts[0], 10);
      var type = parts[1];
      var dir = parts[2];
      syncHeaderUI(idx, dir);
      applySort(idx, type, dir);
    });
  }

  document.querySelectorAll('.info-btn').forEach(function (b) {
    b.addEventListener('click', function (e) { e.stopPropagation(); e.preventDefault(); });
  });

  mergeRatingColumn();
  if (mobileQuery.addEventListener) {
    mobileQuery.addEventListener('change', mergeRatingColumn);
  } else if (mobileQuery.addListener) {
    mobileQuery.addListener(mergeRatingColumn);
  }
})();
