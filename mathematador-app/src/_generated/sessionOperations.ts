/*
    Automaticky generovany soubor!
*/
/* tslint:disable */
/* eslint-disable */
import yup from '@/utils/ValidationService';
import { RESTRequestType } from '@/types/RestAPIGenerator/RESTRequestType';
import { COREFormFieldType } from '@/types/RestAPIGenerator/COREFormFieldType';
import { COREFormInputTypeEnum, COREInputTypeEnum } from '@/types/enums';
import { AnyTypeValidation, IAnyType } from '@/types/IAnyType';
import dayjs from 'dayjs';
import { wrapRestCalls } from '@/utils/wrapRestCalls';

const globalPath = '';
export interface GlobalStorageDataType {
};
export type GlobalLabelType<T extends object = any> = COREFormFieldType<T>
let GlobalInnerLabels: Record<string, Record<string, GlobalLabelType>> = {};
/**
 *
 * @export
 * @class RequiredError
 * @extends {Error}
 */
export class RequiredError extends Error {
    name: "RequiredError" = "RequiredError";
    constructor(public field: string, msg?: string) {
        super(msg);
    }
}

const getPath = (functionName: string, localPath: string, query: any, headers: Array<string>, replacements: Record<string,string>)=>{
    let M = [...localPath.matchAll(/\{(.*?)\}/gmi)];
    let out: any = {
        url: localPath,
        error: undefined,
        params: {},
        headers: {}
    };
    Object.keys(query||{}).map(key=>{
        out.params[replacements[key] || key] = query[key];
    }); 
    for(let i=0; i<M.length; i++){
            if(!query[M[i][1]]) 
                throw new RequiredError(M[i][1], `Required parameter ${M[i][1]} was null or undefined when calling ${functionName}.`);;
            delete out.params[M[i][1]];
            out.url = out.url.replace(M[i][0], query[M[i][1]]);
    }
    headers.map(header=>{
        if(query[header]){
            delete out.params[replacements[header] || header];
            out.headers[replacements[header] || header] = query[header];
        }
    });
    return out;
};




export const restValidations = {
    any: (yup.mixed().nullable()),
}
export const restOperations = {
};

export interface GlobalFormTypes { };

export interface GlobalFormValuesTypes { };
export const GlobalLabels = { 
};

export const restCalls = wrapRestCalls(restOperations);
