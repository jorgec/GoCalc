// src/stores/constantsStore.js
import constantsData from '../constants.json';

export const constants = constantsData;

// If you really need a dynamic import, you could do this:
// let _constants = {};
// export async function initConstants() {
//   const resp = await import('../constants.json');
//   _constants = resp.default;
// }
// export function getConstants() {
//   return _constants;
// }