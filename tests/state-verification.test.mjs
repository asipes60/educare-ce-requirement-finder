import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequirementLookup} from '../src/ce-finder.mjs';
import {courseEligibility} from '../src/course-eligibility.mjs';

const cache=JSON.parse(readFileSync(new URL('../public/requirements.json',import.meta.url),'utf8'));
const lookup=createRequirementLookup(cache.records).lookupRequirement;

test('New Mexico social-work summary uses the replacement rule and current board guidance',()=>{
 const result=lookup('NM','lcsw-lisw');
 const summary=result.requirementSummary.join('\n');
 assert.equal(result.totalHours,30);
 assert.match(summary,/23.*board.approved/i);
 assert.match(summary,/3.*professional ethics/i);
 assert.match(summary,/7.*self.directed/i);
 assert.match(summary,/four years/i);
 assert.equal(result.lastReviewed,'2026-10-21');
 assert.equal(result.courseMatches.length,0);
 assert.ok(result.sourceUrls.some(x=>x.includes('c02857fb-a2cc-4f8a-bf94-e405760b12e9')));
});

test('Arizona requirements distinguish current reporting choice and future technology hours',()=>{
 for(const licenseKey of ['lpc-lpcc-lmhc','lmft','lcsw-lisw']){
  const result=lookup('AZ',licenseKey);
  const summary=result.requirementSummary.join('\n');
  assert.equal(result.totalHours,30);
  assert.match(summary,/Cultural considerations in psychotherapy/i);
  assert.match(summary,/CE Broker is optional/i);
  assert.match(summary,/January 1, 2027/);
  assert.equal(result.lastReviewed,'2026-10-21');
  assert.equal(courseEligibility.find(x=>x.stateCode==='AZ'&&x.licenseKey===licenseKey).providerAcceptance.status,'recognized');
  assert.equal(result.courseMatches.length,0);
 }
});

test('Texas records state the combined other-provider allocation without calling it an online cap',()=>{
 for(const [licenseKey,cap] of [['lpc-lpcc-lmhc',12],['lmft',15],['lcsw-lisw',15]]){
  const result=lookup('TX',licenseKey);
  const summary=result.requirementSummary.join('\n');
  assert.match(summary,new RegExp(`at most ${cap} hours`,'i'));
  assert.match(summary,/combined with all other providers/i);
  assert.match(summary,/not an online.course cap/i);
  assert.match(summary,/CE Broker/i);
  assert.equal(result.lastReviewed,'2026-10-21');
  assert.equal(result.courseMatches.length,0);
  assert.equal(courseEligibility.find(x=>x.stateCode==='TX'&&x.licenseKey===licenseKey).providerAcceptance.status,'recognized');
 }
});

test('courses with required draft sections cannot be recommended in any state',()=>{
 for(const record of cache.records){
  const result=lookup(record.stateCode,record.licenseKey);
  assert.ok(result.courseMatches.every(x=>!['nbcc-counseling-theories','nbcc-counseling-systems'].includes(x.id)));
 }
});
