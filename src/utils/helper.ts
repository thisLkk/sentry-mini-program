export function parseQueryString(url: string): Record<string, string> {
    const queryString = url.split('?')[1];
    if (!queryString) {
      return {};
    }
  
    return queryString.split('&').reduce((acc, param) => {
      const [key, value] = param.split('=');
      acc[key] = decodeURIComponent(value);
      return acc;
    }, {} as Record<string, string>);
  }
  
export function mergeObjectsWithFixedLength(obj1: Record<string, any>, obj2: Record<string, any>): Record<string, any> {
    const result = { ...obj1 };
  
    for (const key in obj1) {
      if (obj2.hasOwnProperty(key)) {
        result[key] = obj2[key];
      }
    }
  
    return result;
  }