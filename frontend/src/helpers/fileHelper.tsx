import { TextInputType } from 'components/forms/TextUploader';

/**
 * Parses a string of categories and returns them as an object.
 *
 * @param categoryString Categories as a comma separated string.
 */
export function parseCategories(categoryString: string): { categories: string[] } {
    // replaces multiple whitespaces with only one and replaces semicolons with ','
    const cleanedString = categoryString.replace(/\s\s+/g, ' ').replaceAll(';', ',');
    // trims leading and ending whitespaces
    const categories = cleanedString.split(',').map(c => c.trim());
    return { categories };
}

/**
 * Converts a given object to a JSON file.
 *
 * @param object Object to be used as the file content
 * @param name Name to use as the filename (without '.json').
 */
export function createJsonFile(object: Record<string, unknown>, name: string): File {
    const jsonString = JSON.stringify(object);
    const blob = new Blob([jsonString], { type: 'application/json' });
    return new File([blob], `${name}.json`);
}

/**
 * Returns a text file for the given TextInput object.
 *
 * @param data Input object containing the content for the file.
 * @param name Name to use as the filename if the content isn't already a file.
 */
export function getTextFile(data: TextInputType, name: string): File | undefined {
    if (data.fileValue) {
        return data.fileValue.blobFile;
    } else if (data.textValue) {
        const obj = parseCategories(data.textValue);
        return createJsonFile(obj, name);
    }
}
