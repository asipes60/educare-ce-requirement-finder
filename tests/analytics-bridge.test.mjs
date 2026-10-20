import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

function setup({optedOut=false}={}) {
  const captured=[];const listeners={};const source={};
  const window={location:{pathname:'/ce-requirement-finder'},dataLayer:[],posthog:{capture:(...args)=>captured.push(args),has_opted_out_capturing:()=>optedOut},addEventListener:(key,fn)=>listeners[key]=fn};
  const document={getElementById:()=>({contentWindow:source})};
  vm.runInNewContext(readFileSync(new URL('../integrations/consented-analytics-bridge.js',import.meta.url),'utf8'),{window,document,Number,Set,Array,Math});
  return {window,captured,send:(data,origin='https://asipes60.github.io',frame=source)=>listeners.message({data,origin,source:frame})};
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
