import {mkdtemp,readFile,rm} from "node:fs/promises";
import {tmpdir} from "node:os";import {join} from "node:path";import {fileURLToPath} from "node:url";import {execFileSync} from "node:child_process";
const root=fileURLToPath(new URL("../",import.meta.url)),out=await mkdtemp(join(tmpdir(),"conversation-tree-check-"));
let bodyError;
try{execFileSync(process.execPath,[join(root,"scripts/build.mjs"),"--out-dir",out],{cwd:root,stdio:"inherit"});for(const p of ["com.xsec.desktop/frontend/index.js","com.xsec.desktop/THIRD_PARTY_NOTICES.txt"]){if(!(await readFile(join(root,p))).equals(await readFile(join(out,p))))throw Error("Committed artifact is stale: "+p);}}catch(error){bodyError=error;throw error;}finally{try{await rm(out,{recursive:true});}catch(error){throw new AggregateError(bodyError?[bodyError,error]:[error],"Build check cleanup failed");}}
