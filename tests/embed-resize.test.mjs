import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

function hostListener(){
 const html=readFileSync(new URL('../integrations/learnworlds-ce-finder.html',import.meta.url),'utf8');
 const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
 const source={};const frame={contentWindow:source,style:{height:'900px'}};let listener;
 vm.runInNewContext(script,{document:{getElementById:()=>frame},window:{addEventListener:(event,fn)=>{assert.equal(event,'message');listener=fn;}},Number,Math});
 return {frame,send:(overrides={})=>listener({origin:'https://asipes60.github.io',source,data:{type:'educare-ce-finder:resize',height:1500},...overrides})};
}
test('embedded height accepts only the expected origin, frame, message and safe range',()=>{
 const {frame,send}=hostListener();
 send({origin:'https://example.com'});send({source:{}});send({data:{type:'other',height:1500}});
 for(const height of [-1,0,249,30001,Infinity,'not a number'])send({data:{type:'educare-ce-finder:resize',height}});
 assert.equal(frame.style.height,'900px');
 send();assert.equal(frame.style.height,'1500px');
 send({data:{type:'educare-ce-finder:resize',height:500.2}});assert.equal(frame.style.height,'501px');
});
