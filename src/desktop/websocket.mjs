import crypto from 'node:crypto';
export function verifyUpgrade(header,key){
 const lines=header.split('\r\n'),headers=new Map(lines.slice(1).map(l=>{const i=l.indexOf(':');return[l.slice(0,i).trim().toLowerCase(),l.slice(i+1).trim()];}));
 const accept=crypto.createHash('sha1').update(key+'258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
 if(!/^HTTP\/1\.1 101\b/.test(lines[0])||headers.get('sec-websocket-accept')!==accept||headers.get('upgrade')?.toLowerCase()!=='websocket'||!headers.get('connection')?.toLowerCase().split(/\s*,\s*/).includes('upgrade'))throw Error('DESKTOP_UPGRADE_FAILED');
}
export function encodeFrame(data,opcode=1,fin=true){
 const body=Buffer.from(data),extra=body.length<126?0:body.length<=65535?2:8,head=Buffer.alloc(2+extra),mask=crypto.randomBytes(4);
 head[0]=(fin?128:0)|opcode;head[1]=128|(extra===0?body.length:extra===2?126:127);if(extra===2)head.writeUInt16BE(body.length,2);if(extra===8)head.writeBigUInt64BE(BigInt(body.length),2);
 for(let i=0;i<body.length;i++)body[i]^=mask[i%4];return Buffer.concat([head,mask,body]);
}
export class FrameReader{
 constructor({onMessage,onControl=()=>{},maxBytes=64000000}){this.onMessage=onMessage;this.onControl=onControl;this.maxBytes=maxBytes;this.buffer=Buffer.alloc(0);this.parts=[];this.size=0;this.fragmenting=false;}
 push(part){
 this.buffer=Buffer.concat([this.buffer,part]);if(this.buffer.length>this.maxBytes+16384)throw Error('DESKTOP_FRAME_LIMIT');
 while(this.buffer.length>=2){const b=this.buffer;const fin=!!(b[0]&128),op=b[0]&15,masked=!!(b[1]&128);if(b[0]&112)throw Error('DESKTOP_FRAME_RESERVED');let n=b[1]&127,o=2;
 if(n===126){if(b.length<4)return;n=b.readUInt16BE(2);o=4;}else if(n===127){if(b.length<10)return;const v=b.readBigUInt64BE(2);if(v>BigInt(this.maxBytes))throw Error('DESKTOP_FRAME_LIMIT');n=Number(v);o=10;}
 if(n>this.maxBytes)throw Error('DESKTOP_FRAME_LIMIT');if(op>=8&&(!fin||n>125))throw Error('DESKTOP_CONTROL_FRAME');const maskAt=o;if(masked)o+=4;if(b.length<o+n)return;
 const data=Buffer.from(b.subarray(o,o+n));if(masked)for(let i=0;i<n;i++)data[i]^=b[maskAt+i%4];this.buffer=b.subarray(o+n);
 if([8,9,10].includes(op)){this.onControl(op,data);continue;}
 if(![0,1].includes(op)||(op===0&&!this.fragmenting)||(op===1&&this.fragmenting))throw Error('DESKTOP_FRAME_SEQUENCE');
 this.parts.push(data);this.size+=n;if(this.size>this.maxBytes)throw Error('DESKTOP_MESSAGE_LIMIT');
 if(fin){const message=new TextDecoder('utf-8',{fatal:true}).decode(Buffer.concat(this.parts));this.parts=[];this.size=0;this.fragmenting=false;this.onMessage(message);}else this.fragmenting=true;
 }}
}
