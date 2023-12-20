import { xml2json, Options } from 'xml-js';
import { match, P } from 'ts-pattern';

const isDebug = process.env.NODE_ENV === 'development';

export const convertResponse = (value: any, parentElement: any) => {
  if (!parentElement || !parentElement._parent) {
    console.error('Invalid parentElement provided.');
    return;
  }

  try {
    const parentKeys = Object.keys(parentElement._parent);
    if (parentKeys.length === 0) {
      console.error('Parent element has no properties.');
      return;
    }

    const keyName = parentKeys[parentKeys.length - 1];
    parentElement._parent[keyName] = nativeType(value);
  } catch (e) {
    console.error('Error in convertResponse:', e);
  }
};

export const formatResponse = (xml: string, options: Options.XML2JSON) => {
  xml = xml.replace(/(rapi|api|transaction)-response/g, 'response');

  const jsonResponse = JSON.parse(xml2json(xml, options));

  console.log(isDebug ? 'development mode' : 'production mode');
  console.log(xml);

  return jsonResponse.response ?? JSON.parse(xml2json(xml, options));
};

function nativeType(value: string | number) {
  return match(value)
    .with(P.string, n => {
      const lowerCaseValue = n.toLowerCase();
      return match(lowerCaseValue)
        .with('true', () => true)
        .with('false', () => false)
        .otherwise(() => n);
    })
    .with(P.number, n => Number(n))
    .otherwise(() => value);
}
