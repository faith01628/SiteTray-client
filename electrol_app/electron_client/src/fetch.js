// src\fetch.js
let nodeFetch;
try {
    nodeFetch = await import('node-fetch');
} catch (error) {
    console.error('Error importing node-fetch:', error);
}
export default nodeFetch;