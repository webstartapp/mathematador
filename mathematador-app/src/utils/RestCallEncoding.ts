export const encodeRestCall = (data: Record<string, any>): string => {
  return Buffer.from(JSON.stringify(data || {}))
    .toString('base64')
    .replace(/e/gm, '%')
    .replace(/6/gm, '#')
    .replace(/i/gm, '!')
    .replace(/y/gm, '@')
    .replace(/=/gm, '_');
};

export const decodeRestCall = (data: string): Record<string, any> => {
  try {
    return JSON.parse(
      Buffer.from(
        data
          .replace(/%/gm, 'e')
          .replace(/#/gm, '6')
          .replace(/!/gm, 'i')
          .replace(/@/gm, 'y')
          .replace(/_/gm, '='),
        'base64',
      ).toString('utf-8'),
    );
  } catch (e) {
    return {};
  }
};

/**
 * Preview JSON data
 * @param data - JSON data to preview
 * @param lines - Number of lines to preview
 * @returns Preview of JSON data
 */
export const previewJSONData = (
  data: Record<string, any>,
  lines = 6,
): string => {
  try {
    const debugDataString = JSON.stringify(data, null, 4);
    const debugDataStringPreview =
      debugDataString?.split('\n').slice(0, lines).join('\n') || '';
    return debugDataStringPreview;
  } catch (e) {
    return 'Unknown data format';
  }
};
