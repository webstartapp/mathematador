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
import { ExpressRouteType } from '@/resolvers/expressResolver';
import { LocalResolverType } from '@/resolvers/expressTypeResolver';

let faker;

if (process.env.NODE_ENV === 'development') {
  // Import faker only in development
  faker = require('@faker-js/faker').faker;
} else {
  // Do something else or nothing in production
  faker = {
    // Provide dummy or no-op functions for production
    fakeData: () => {},
    // ...
  };
}

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

let _404 = async (props: any, body: any, context: any) => {
    context?.res?.status?.(404);
    return {
        message: "Not Found"
    } as any;
};

try {
    const _404Resolver = require('../resolvers/apiPaths/_404');
    if(_404Resolver) {
        _404 = _404Resolver.default || _404Resolver;
    }
} catch(e) {
    console.error('Mapping _404 failed with error', e);
};

let _401 = async (props: {message?: string}, body: Record<string, string>, context: any) => {
    context.setResponseStatus(403);
    return {
        message: props?.message || "Forbidden"
    };
};

try {
    const _401Resolver = require('../resolvers/apiPaths/_401');
    if(_401Resolver) {
        _401 = _401Resolver.default || _401Resolver;
    }
} catch(e) {
    console.log('Mapping _401 failed with error', e);
};

let _403 = async (props: {message?: string}, body: Record<string, string>, context: any) => {
    context.setResponseStatus(403);
    return {
        message: props?.message || "Forbidden"
    };
};

try {
    const _403Resolver = require('../resolvers/apiPaths/_403');
    if(_403Resolver) {
        _403 = _403Resolver.default || _403Resolver;
    }
} catch(e) {
    console.log('Mapping _403 failed with error', e);
};

let _500 = async (props: {message?: string}, body: Record<string, string>, context: any) => {
    context.setResponseStatus(500);
    return {
        message: props?.message || "Internal Server Error"
    };
};

try {
    const _500Resolver = require('../resolvers/apiPaths/_500');
    if(_500Resolver) {
        _500 = _500Resolver.default || _500Resolver;
    }
} catch(e) {
    console.log('Mapping _500 failed with error', e);
};



export const apiResolvers = {
    _404: _404,
    _401: _401,
    _403: _403,
    _500: _500,
} as const;

export type APIResolversType = typeof apiResolvers


export const generatedRoutes: ExpressRouteType[] = [
    {
        path: "*" as `/${string}`,
        method: "get",
        resolver: _404
    },
    {
        path: "*" as `/${string}`,
        method: "post",
        resolver: _404
    },
    {
        path: "*" as `/${string}`,
        method: "put",
        resolver: _404
    },
    {
        path: "*" as `/${string}`,
        method: "delete",
        resolver: _404
    }
];