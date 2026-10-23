import {test} from 'node:test';
import assert from 'node:assert/strict';
import {lookupRequirement,createRequirementLookup} from '../src/ce-finder.mjs';
test('California BBS licenses receive three published general CE courses',()=>{
 for(const license of ['lpc-lpcc-lmhc','lmft','lcsw-lisw']){
 const matches=lookupRequirement('CA',license).courseMatches;
 assert.equal(matches.length,3);assert.deepEqual(matches.map(x=>x.creditValue),[5,3,1]);
 assert.ok(matches.every(x=>x.url.startsWith('https://educarecomplete.com/course/')&&x.matchType==='general'));
 }
});
test('no unsupported credential or jurisdiction recommendations',()=>{
 const base=lookupRequirement('CA','lpc-lpcc-lmhc');
 for(const [stateCode,licenseKey] of [['CA','psychologist'],['CA','bcba'],['CA','bcaba'],['NY','lmft']]){
 assert.equal(createRequirementLookup([{...base,stateCode,licenseKey}]).lookupRequirement(stateCode,licenseKey).courseMatches.length,0);
 }
});
test('cached records retain matching without private course IDs',()=>{
 const base=lookupRequirement('CA','lpc-lpcc-lmhc');
 const result=createRequirementLookup([{...base,courseMatches:[]}]).lookupRequirement('CA','lpc-lpcc-lmhc');
 assert.equal(result.courseMatches.length,3);assert.ok(!('courseMatchIds' in result));
 assert.ok(result.courseMatches.every(x=>x.categoryCredit===null));
});

test('reviewed Ohio combinations receive the published nationally relevant courses',()=>{
 for(const licenseKey of ['lpc-lpcc-lmhc','lmft','lcsw-lisw']){
 const base=lookupRequirement('CA','lpc-lpcc-lmhc');
 const result=createRequirementLookup([{...base,stateCode:'OH',licenseKey}]).lookupRequirement('OH',licenseKey);
 assert.equal(result.courseMatches.length,2);
 assert.ok(result.courseMatches.every(x=>!x.id.includes('minor-consent')&&x.eligibilitySources.length===2));
 }
});
test('conditional Oregon and Arizona rules do not become recommendations',()=>{
 const base=lookupRequirement('CA','lpc-lpcc-lmhc');
 for(const stateCode of ['OR','AZ']){
 assert.equal(createRequirementLookup([{...base,stateCode}]).lookupRequirement(stateCode,base.licenseKey).courseMatches.length,0);
 }
});

test('all state/profession combinations have explicit evidence gates',async()=>{
 const {courseEligibility}=await import('../docs/research/course-eligibility-evidence.mjs');
 assert.equal(courseEligibility.length,150);
 assert.equal(new Set(courseEligibility.map(x=>`${x.stateCode}:${x.licenseKey}`)).size,150);
 assert.ok(courseEligibility.filter(x=>x.status==='verified').every(x=>x.sources.length&&x.reviewedAt&&x.courseIds.length));
 for(const row of courseEligibility){
 const base=lookupRequirement('CA','lpc-lpcc-lmhc');
 const result=createRequirementLookup([{...base,...row,status:'verified'}]).lookupRequirement(row.stateCode,row.licenseKey);
 if(row.status==='verified'){
 assert.ok(result.courseMatches.length>0);
 assert.ok(result.courseMatches.every(x=>row.courseIds.includes(x.id)));
 }else assert.equal(result.courseMatches.length,0);
 }
});
