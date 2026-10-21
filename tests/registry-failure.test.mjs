import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {createRequirementLookup,getLicenseOptions,getStateOptions,lookupRequirement} from '../src/ce-finder.mjs';

// Exercise the real startup, error handling, and form submit code. This harness
// checks DOM output and fetch failures; rendered browser coverage is separate.
async function startApp(fetch) {
  const controls=new Map();
  for(const key of ['#state','#license','#load-status','#lookup-form','#result']) {
    controls.set(key,{value:'',textContent:'',innerHTML:'',append(){},listeners:{},
      addEventListener(name,fn){this.listeners[name]=fn;}});
  }
  const window={};window.parent=window;
  const source=readFileSync(new URL('../src/app.mjs',import.meta.url),'utf8')
    .replace(/^import\s*\{[\s\S]*?\}\s*from\s*"[^"]+";\s*/,'')
    .replaceAll('import.meta.url',JSON.stringify(new URL('../src/app.mjs',import.meta.url).href));
  vm.runInNewContext(source,{
    document:{querySelector:key=>controls.get(key),createElement:()=>({})},
    window,fetch,URL,createRequirementLookup,getLicenseOptions,getStateOptions,lookupRequirement
  });
  await new Promise(resolve=>setImmediate(resolve));
  return {controls,submit(state){
    controls.get('#state').value=state;
    controls.get('#lookup-form').listeners.submit({preventDefault(){}});
    return controls.get('#result').innerHTML;
  }};
}

for(const [name,fetch] of [
  ['HTTP failure',async()=>({ok:false})],
  ['network failure',async()=>{throw Error('offline');}],
  ['invalid payload',async()=>({ok:true,json:async()=>({unexpected:true})})]
]) {
  test(`registry ${name} announces limited coverage and preserves safe lookup`,async()=>{
    const {controls,submit}=await startApp(fetch);
    assert.match(controls.get('#load-status').textContent,/Full registry unavailable/);
    assert.match(controls.get('#result').innerHTML,/California/);
    assert.equal((controls.get('#result').innerHTML.match(/class="course-card"/g)||[]).length,2);
    const ohio=submit('OH');
    assert.match(ohio,/Needs review/);
    assert.doesNotMatch(ohio,/class="course-card"|30 clock hours/);
  });
}
