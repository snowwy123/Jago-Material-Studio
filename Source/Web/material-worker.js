// SPDX-License-Identifier: MIT
self.onmessage=e=>{const {id,source,size}=e.data;try{const result=SurfaceCore.generate(source,size);self.postMessage({id,result},Object.values(result).map(a=>a.buffer))}catch(error){self.postMessage({id,error:error.message})}};
