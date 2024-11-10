import { RESTRequestType } from '@/types/RestAPIGenerator/RESTRequestType';
import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { errorObject } from './wrapRestCalls';
import JWT from 'expo-jwt';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ITokenBody } from '@/_generated/sessionOperations';

const PERSISTED_STATE_KEY = 'persistedStateRestApi';

export const restInnerCall = async (
  requestContext: Partial<RESTRequestType>,
  axiosAPI: AxiosInstance,
) => {
  const request = {
    ...requestContext,
    headers: {
      'Content-Type': requestContext.requestContentType || 'application/json',
      ...requestContext.headers,
    },
  } as Required<AxiosRequestConfig>;

  const storage = await AsyncStorage.getItem(PERSISTED_STATE_KEY);
  const { viewer } = JSON.parse(storage || '{}');

  if (process.env.EXPO_PUBLIC_JWT_SECRET && viewer?.id) {
    const tokenBody: ITokenBody = {
      userId: viewer.id,
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
      iat: Math.floor(Date.now() / 1000),
    };
    console.log(tokenBody, process.env.EXPO_PUBLIC_JWT_SECRET);
    const token = JWT.encode(tokenBody, process.env.EXPO_PUBLIC_JWT_SECRET);
    if (token) {
      request.headers['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const response = await axiosAPI(request);
    return response;
  } catch (e: any) {
    throw errorObject({
      title: 'error.unauthorized',
      message: 'error.unauthorized_message',
      APIError: {
        path: requestContext?.url,
        params: requestContext?.params,
        method: requestContext?.method,
        name: requestContext?.name,
        data: Buffer.from(JSON.stringify(requestContext.data || {})).toString(
          'base64',
        ),
        body: e?.response?.data,
        isAxiosError: true,
        code: e.code,
        message: e.message,
        status: e.response?.status,
      },
    });
  }
};
