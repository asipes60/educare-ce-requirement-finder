import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

function setup({optedOut=false,entries=[]}={}) {
  const captured=[];const consentCalls=[];const listeners={};const source={};
  const window={location:{pathname:'/ce-requirement-finder'},dataLayer:[...entries],posthog:{
    capture:(...args)=>captured.push(args),has_opted_out_capturing:()=>optedOut,
    opt_out_capturing:()=>{optedOut=true;consentCalls.push('denied');},
    opt_in_capturing:()=>{optedOut=false;consentCalls.push('granted');}
  },addEventListener:(key,fn)=>listeners[key]=fn};
  const document={getElementById:()=>({contentWindow:source})};
  vm.runInNewContext(readFileSync(new URL('../integrations/consented-analytics-bridge.js',import.meta.url),'utf8'),{window,document,Number,Set,Array,Math});
  return {window,captured,consentCalls,send:(data,origin='https://asipes60.github.io',frame=source)=>listeners.message({data,origin,source:frame})};
}
test('native ecommerce bridge preserves dataLayer and excludes customer fields',()=>{
 const {window,captured}=setup();
 const entry=['event','begin_checkout',{value:29,currency:'USD',items:[{item_id:'course-1',item_name:'Private text'}],email:'private@example.com'}];
 assert.equal(window.dataLayer.push(entry),1);
 assert.equal(window.dataLayer[0],entry);
 assert.equal(captured[0][0],'checkout_started');
 assert.equal(captured[0][1].value,29);
 assert.equal(JSON.stringify(captured).includes('private'),false);
 assert.equal(JSON.stringify(captured).includes('Private text'),false);
});
test('purchase bridge requires transaction id and deduplicates confirmations',()=>{
 const {window,captured}=setup();
 window.dataLayer.push(['event','purchase',{value:29,currency:'USD'}]);
 window.dataLayer.push(['event','purchase',{transaction_id:'order-123',value:29,currency:'USD'}]);
 window.dataLayer.push(['event','purchase',{transaction_id:'order-123',value:29,currency:'USD'}]);
 assert.equal(captured.length,1);
 assert.equal(captured[0][1].$insert_id,'educare-purchase-order-123');
});
test('LearnWorlds legacy purchase IDs survive the analytics bridge',()=>{
 const {window,captured}=setup();
 // Shape observed in the October 20 native zero-dollar confirmation.
 window.dataLayer.push(['event','purchase',{
  transaction_id:'purchase-qa',value:0,currency:'USD',
  items:[{id:'68f918cf93892f61e3020ff8',name:'Private course text',price:0,category:'course',quantity:1}]
 }]);
 assert.deepEqual(Array.from(captured[0][1].item_ids),['68f918cf93892f61e3020ff8']);
 assert.equal(captured[0][1].value,0);
 assert.equal(JSON.stringify(captured).includes('Private course text'),false);
});
test('purchase item IDs prefer GA4 format and validate legacy IDs',()=>{
 const {window,captured}=setup();
 window.dataLayer.push({event:'purchase',ecommerce:{transaction_id:'qa-mixed',items:[
  {item_id:'modern-course',id:'legacy-course'},
  {id:'legacy-course-2'},
  {id:'private@example.com'},
  {id:123},null
 ]}});
 assert.deepEqual(Array.from(captured[0][1].item_ids),['modern-course','legacy-course-2']);
 assert.equal(JSON.stringify(captured).includes('private@example.com'),false);
});
test('Finder bridge rejects other frames, origins and arbitrary payload fields',()=>{
 const {send,captured}=setup();
 const data={type:'educare-ce-finder:analytics',event:'ce_finder_course_clicked',course_path:'/course/example',draft:'private text'};
 send(data,'https://example.com');send(data,'https://asipes60.github.io',{});send({...data,event:'arbitrary'});
 assert.equal(captured.length,0);
 send(data);assert.equal(captured.length,1);
 assert.equal(captured[0][1].course_path,'/course/example');
 assert.equal(JSON.stringify(captured).includes('private'),false);
});
test('opted-out visitors produce no bridge events',()=>{
 const {window,send,captured}=setup({optedOut:true});
 window.dataLayer.push(['event','view_item',{items:[{item_id:'course-1'}]}]);
 send({type:'educare-ce-finder:analytics',event:'ce_finder_results_viewed',match_count:4,status:'verified'});
 assert.equal(captured.length,0);
});

test('LearnWorlds consent withdrawal stops events immediately and explicit reacceptance resumes',()=>{
 const {window,send,captured,consentCalls}=setup();
 const result={type:'educare-ce-finder:analytics',event:'ce_finder_results_viewed',match_count:4,status:'verified'};
 send(result);
 window.dataLayer.push(['consent','update',{analytics_storage:'denied'}]);
 send(result);
 window.dataLayer.push(['event','view_item',{items:[{item_id:'rejected-course'}]}]);
 assert.equal(captured.length,1);
 assert.deepEqual(consentCalls,['denied']);
 // Marketing consent cannot restore analytics.
 window.dataLayer.push(['consent','update',{ad_storage:'granted'}]);
 send(result);assert.equal(captured.length,1);
 window.dataLayer.push(['consent','update',{analytics_storage:'granted'}]);
 send(result);
 assert.equal(captured.length,2);
 assert.deepEqual(consentCalls,['denied','granted']);
});

test('queued events before consent are not replayed after acceptance',()=>{
 const {captured}=setup({entries:[
  ['consent','default',{analytics_storage:'denied'}],
  ['event','view_item',{items:[{item_id:'before-consent'}]}],
  ['consent','update',{analytics_storage:'granted'}],
  ['event','purchase',{transaction_id:'accepted-order',items:[{id:'accepted-course'}]}]
 ]});
 assert.equal(captured.length,1);
 assert.equal(captured[0][0],'purchase_completed');
 assert.deepEqual(Array.from(captured[0][1].item_ids),['accepted-course']);
});

test('a retained denial blocks queued and future events even when the SDK starts enabled',()=>{
 const {window,send,captured,consentCalls}=setup({entries:[
  ['consent','default',{analytics_storage:'granted'}],
  ['event','purchase',{transaction_id:'old-order'}],
  ['consent','update',{analytics_storage:'denied'}]
 ]});
 window.dataLayer.push(['event','view_item',{}]);
 send({type:'educare-ce-finder:analytics',event:'ce_finder_results_viewed',match_count:3,status:'verified'});
 assert.equal(captured.length,0);
 assert.deepEqual(consentCalls,['denied']);
});

test('consent granted before bridge installation restores a persisted SDK opt-out',()=>{
 const {captured,consentCalls}=setup({optedOut:true,entries:[
  ['consent','update',{analytics_storage:'granted'}],
  ['event','purchase',{transaction_id:'new-order'}]
 ]});
 assert.equal(captured.length,1);
 assert.deepEqual(consentCalls,['granted']);
});
