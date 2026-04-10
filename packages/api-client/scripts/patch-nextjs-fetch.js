/**
 * Post-generation script to patch the generated API client for Next.js fetch options
 * 
 * This script adds support for:
 * - `cache`: RequestCache option ('force-cache' | 'no-store' | etc.)
 * - `next`: Next.js specific options ({ revalidate, tags })
 * - Request/Response interceptors similar to axios
 * 
 * Run this after openapi-typescript-codegen generates the client.
 */

const fs = require('fs');
const path = require('path');

const GENERATED_DIR = path.join(__dirname, '../src/generated/core');
const OPEN_API_PATH = path.join(GENERATED_DIR, 'OpenAPI.ts');
const REQUEST_PATH = path.join(GENERATED_DIR, 'request.ts');

function patchOpenAPI() {
  console.log('📝 Patching OpenAPI.ts...');
  
  let content = fs.readFileSync(OPEN_API_PATH, 'utf-8');
  
  // Check if already patched
  if (content.includes('CACHE?:')) {
    console.log('  ⏭️  OpenAPI.ts already patched, skipping...');
    return;
  }

  // Add new types to OpenAPIConfig type
  content = content.replace(
    /ENCODE_PATH\?: \(\(path: string\) => string\) \| undefined;/,
    `ENCODE_PATH?: ((path: string) => string) | undefined;
    /** Next.js fetch cache option */
    CACHE?: RequestCache | undefined;
    /** Next.js specific fetch options */
    NEXT?: { revalidate?: number | false; tags?: string[] } | undefined;
    /** Request interceptor - called before each request */
    REQUEST_INTERCEPTOR?: ((url: string, options: RequestInit) => { url: string; options: RequestInit } | Promise<{ url: string; options: RequestInit }>) | undefined;
    /** Response interceptor - called after each response */
    RESPONSE_INTERCEPTOR?: ((response: Response, requestInfo: { url: string; startTime: number; method: string }) => Response | Promise<Response>) | undefined;
    /** Error interceptor - called on request errors */
    ERROR_INTERCEPTOR?: ((error: Error, requestInfo: { url: string; startTime: number; method: string }) => any) | undefined;`
  );

  // Add default values to OpenAPI object
  content = content.replace(
    /ENCODE_PATH: undefined,/,
    `ENCODE_PATH: undefined,
    CACHE: undefined,
    NEXT: undefined,
    REQUEST_INTERCEPTOR: undefined,
    RESPONSE_INTERCEPTOR: undefined,
    ERROR_INTERCEPTOR: undefined,`
  );

  fs.writeFileSync(OPEN_API_PATH, content);
  console.log('  ✅ OpenAPI.ts patched successfully');
}

function patchRequest() {
  console.log('📝 Patching request.ts...');
  
  let content = fs.readFileSync(REQUEST_PATH, 'utf-8');
  
  // Check if already patched
  if (content.includes('config.CACHE')) {
    console.log('  ⏭️  request.ts already patched, skipping...');
    return;
  }

  // Patch sendRequest function to include cache and next options
  // Find the request object creation and add cache/next
  content = content.replace(
    /const request: RequestInit = \{[\s\S]*?headers,[\s\S]*?body: body \?\? formData,[\s\S]*?method: options\.method,[\s\S]*?signal: controller\.signal,[\s\S]*?\};/,
    `const request: RequestInit & { next?: { revalidate?: number | false; tags?: string[] } } = {
        headers,
        body: body ?? formData,
        method: options.method,
        signal: controller.signal,
        ...(config.CACHE && { cache: config.CACHE }),
        ...(config.NEXT && { next: config.NEXT }),
    };`
  );

  // Now patch the sendRequest function to support interceptors
  // Replace the simple fetch call with interceptor-aware version
  content = content.replace(
    /return await fetch\(url, request\);/,
    `// Track request timing for interceptors
    const startTime = performance.now();
    const method = options.method;
    
    // Apply request interceptor if configured
    let finalUrl = url;
    let finalRequest = request;
    if (config.REQUEST_INTERCEPTOR) {
        const intercepted = await config.REQUEST_INTERCEPTOR(url, request);
        finalUrl = intercepted.url;
        finalRequest = intercepted.options as typeof request;
    }

    try {
        let response = await fetch(finalUrl, finalRequest);
        
        // Apply response interceptor if configured
        if (config.RESPONSE_INTERCEPTOR) {
            response = await config.RESPONSE_INTERCEPTOR(response, { url: finalUrl, startTime, method });
        }
        
        return response;
    } catch (error) {
        // Apply error interceptor if configured
        if (config.ERROR_INTERCEPTOR) {
            await config.ERROR_INTERCEPTOR(error as Error, { url: finalUrl, startTime, method });
        }
        throw error;
    }`
  );

  fs.writeFileSync(REQUEST_PATH, content);
  console.log('  ✅ request.ts patched successfully');
}

function main() {
  console.log('\n🔧 Patching generated API client for Next.js fetch support...\n');
  
  // Check if generated files exist
  if (!fs.existsSync(OPEN_API_PATH)) {
    console.error('❌ OpenAPI.ts not found. Make sure to run the generator first.');
    process.exit(1);
  }
  
  if (!fs.existsSync(REQUEST_PATH)) {
    console.error('❌ request.ts not found. Make sure to run the generator first.');
    process.exit(1);
  }

  try {
    patchOpenAPI();
    patchRequest();
    console.log('\n✅ All patches applied successfully!\n');
    console.log('You can now use these options in your code:');
    console.log('');
    console.log('  import { OpenAPI } from "@horse-racing/api-client";');
    console.log('');
    console.log('  // Set global cache options');
    console.log('  OpenAPI.CACHE = "force-cache";');
    console.log('  OpenAPI.NEXT = { revalidate: 60, tags: ["cms"] };');
    console.log('');
    console.log('  // Set up interceptors (similar to axios)');
    console.log('  OpenAPI.REQUEST_INTERCEPTOR = (url, options) => {');
    console.log('    console.log(`Request: ${url}`);');
    console.log('    return { url, options };');
    console.log('  };');
    console.log('');
    console.log('  OpenAPI.RESPONSE_INTERCEPTOR = (response, { url, startTime, method }) => {');
    console.log('    const duration = performance.now() - startTime;');
    console.log('    console.log(`${method} ${url} took ${duration.toFixed(2)}ms`);');
    console.log('    return response;');
    console.log('  };');
    console.log('');
  } catch (error) {
    console.error('❌ Error patching files:', error.message);
    process.exit(1);
  }
}

main();
