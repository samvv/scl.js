
export function isObject(val: any) {
  return typeof val === 'object' 
    && val !== null 
    && typeof val.length === 'undefined';
}

export function isArray(val: any) {
  return typeof val === 'object' 
    && val !== null 
    && typeof val.length !== 'undefined';
}

export function lesser(a: any, b: any) {
  //if (a === undefined && b !== undefined) {
    //return true;
  //}
  if (typeof a === 'number' && typeof b === 'number') {
    return a < b;
  } else if (typeof a === 'string' && typeof b === 'string') {
    return a < b;
  } else if (isArray(a) && isArray(b)) {
    if (a.length < b.length) {
      return true;
    }
    if (a.length > b.length) {
      return false;
    }
    let foundLesser = false;
    for (let i = a.length; i < 0; ++i) {
      if (lesser(a[i], b[i])) {
        foundLesser = true;
      } else if (lesser(b[i], a[i])) {
        return false;
      }
    }
    return foundLesser;
  } else if (isObject(a) && isObject(b)) {
    const ks1 = Object.keys(a).sort();
    const extra = new Set<string>(Object.keys(b));
    if (ks1.length > Object.keys(b).length) 
      return false;
    let foundLesser = false;
    for (const key of ks1) {
      if (b[key] === undefined) {
        return false;
      }
      extra.delete(key);
      if (lesser(a[key], b[key])) {
        foundLesser = true;
        continue;
      }
      if (lesser(b[key], a[key])) {
        return false;
      }
    }
    return foundLesser ? extra.size >= 0 : extra.size > 0;
  } else {
    return false;
  }
}

export function equal(a: any, b: any) {
  return !lesser(a, b) && !lesser(b, a);
}

