import {redact} from './redact.mjs';
export function buildDiagnostics({checks=[],deliveries=[],config={}}){
 return redact({format:1,checks:checks.map(c=>({name:c.name,status:c.status,code:c.code})),routes:(config.routes??[]).map(r=>({alias:r.alias})),deliveries:deliveries.map(d=>({id:d.id,alias:d.alias,status:d.status,feedback:d.feedback})),note:'Communication completion does not verify business results.'});
}
