// Install inside LearnWorlds' existing analytics-consent script, after PostHog init.
// No SDK, identifiers, storage, form values, or goal-draft contents are added here.
(function () {
  if (window.educareAnalyticsBridgeInstalled) return;
  window.educareAnalyticsBridgeInstalled = true;
  var seenPurchases = new Set();
  // Installation is already gated by LearnWorlds' analytics category. Its native
  // gtag consent updates also tell an installed bridge when that choice changes.
  var analyticsAllowed = true;
  function consentValue(entry) {
    if (!entry || entry[0] !== 'consent' || (entry[1] !== 'default' && entry[1] !== 'update')) return null;
    var value = entry[2] && entry[2].analytics_storage;
    return value === 'granted' ? true : value === 'denied' ? false : null;
  }
  function applyConsent(allowed) {
    analyticsAllowed = allowed;
    var ph = window.posthog;
    if (!ph) return;
    // These SDK methods also stop automatic collection and clear analytics
    // persistence on withdrawal; guarding only our custom events is insufficient.
    if (allowed && typeof ph.opt_in_capturing === 'function') ph.opt_in_capturing();
    if (!allowed && typeof ph.opt_out_capturing === 'function') ph.opt_out_capturing();
  }
  function capture(name, properties) {
    if (!analyticsAllowed) return;
    var ph = window.posthog;
    if (!ph || typeof ph.capture !== 'function') return;
    if (typeof ph.has_opted_out_capturing === 'function' && ph.has_opted_out_capturing()) return;
    ph.capture(name, properties);
  }
  function safeId(value) {
    return typeof value === 'string' && /^[a-zA-Z0-9_-]{1,128}$/.test(value) ? value : null;
  }
  var names = {view_item:'course_viewed',add_to_cart:'course_added_to_cart',begin_checkout:'checkout_started',purchase:'purchase_completed',free_trial_subscription:'subscription_trial_started'};
  function consume(entry) {
    var consent = consentValue(entry);
    if (consent !== null) {applyConsent(consent);return;}
    if (!analyticsAllowed) return;
    var name, data;
    if (entry && entry[0] === 'event') {name=entry[1];data=entry[2] || {};}
    else if (entry && typeof entry.event === 'string') {name=entry.event;data=entry.ecommerce || entry;}
    if (!Object.prototype.hasOwnProperty.call(names,name)) return;
    var props={tracking_source:'learnworlds_native',page_path:window.location.pathname};
    if (typeof data.currency === 'string' && /^[A-Z]{3}$/.test(data.currency)) props.currency=data.currency;
    if (typeof data.value === 'number' && Number.isFinite(data.value) && data.value >= 0) props.value=data.value;
    // Native purchase confirmations still use legacy id; discovery events use item_id.
    if (Array.isArray(data.items)) props.item_ids=data.items.slice(0,20).map(function(item){
      return safeId(item && item.item_id) || (name === 'purchase' ? safeId(item && item.id) : null);
    }).filter(Boolean);
    if (name === 'purchase') {
      var id=safeId(data.transaction_id);
      if (!id || seenPurchases.has(id)) return;
      seenPurchases.add(id);
      props.transaction_id=id;
      props.$insert_id='educare-purchase-'+id;
    }
    capture(names[name],props);
  }
  var layer=window.dataLayer=window.dataLayer || [];
  var originalPush=layer.push;
  layer.push=function () {
    var result=originalPush.apply(this,arguments);
    for(var i=0;i<arguments.length;i++) {try {consume(arguments[i]);} catch (_) {}}
    return result;
  };
  // Only replay events after the latest explicit analytics grant. In particular,
  // accepting cookies must never backfill activity collected before acceptance.
  var pending = layer.slice();
  var consentIndex = -1;
  for (var j=0;j<pending.length;j++) {
    if (consentValue(pending[j]) !== null) consentIndex = j;
  }
  if (consentIndex >= 0) {
    applyConsent(consentValue(pending[consentIndex]));
    if (analyticsAllowed) pending.slice(consentIndex+1).forEach(function(entry){try {consume(entry);} catch (_) {}});
  }
  window.addEventListener('message',function(event){
    var frame=document.getElementById('educare-ce-finder');
    if (!frame || event.origin !== 'https://asipes60.github.io' || event.source !== frame.contentWindow) return;
    var data=event.data;
    if (!data || data.type !== 'educare-ce-finder:analytics') return;
    var props={tracking_source:'ce_finder',page_path:window.location.pathname};
    if (data.event === 'ce_finder_course_clicked') {
      if (typeof data.course_path !== 'string' || !/^\/course\/[a-z0-9-]{1,180}$/.test(data.course_path)) return;
      props.course_path=data.course_path;
    } else if (data.event === 'ce_finder_results_viewed') {
      if (!Number.isInteger(data.match_count) || data.match_count < 0 || data.match_count > 100) return;
      if (data.status !== 'verified' && data.status !== 'needs_review') return;
      props.match_count=data.match_count;props.status=data.status;
    } else return;
    capture(data.event,props);
  });
})();
