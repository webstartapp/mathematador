export type RESTRequestType<T = any> = {
  method: string;
  url: string;
  query?: Record<string, string>;
  params?: any;
  data?: any;
  headers?: any;
  responseType: T;
  requestContentType?: string;
  name: string;
  noLoader?: boolean;
  cached?: number;
  security?: string[];
  responseMock: T;
};

export type ResponseDataStatusType = {
  code?: number;
  status?: string;
  message?: string;
  timestamp?: number;
  time?: number;
};

export type APIRequestCallType<T = any, U = any, V = any> = (
  queryParams?: T,
  body?: U,
  options?: Partial<RESTRequestType>,
) => RESTRequestType<V>;

export type APIRequestType<
  RequestCallType extends APIRequestCallType = APIRequestCallType,
> = Omit<Request, 'query' | 'body' | 'headers'> & {
  query: Parameters<RequestCallType>[0];
  json: () => Promise<Parameters<RequestCallType>[1]>;
  headers: { get: (header: string) => string };
};
export type APIContextType<
  RequestCallType extends APIRequestCallType = APIRequestCallType,
> = { params: undefined | Parameters<RequestCallType>[0] };

export type APINextFNType = () => void;

export type APIHandlerType<T = any, U = any, V = any> = (
  req: APIRequestType<
    (queryParams: T, body: U, options: any) => RESTRequestType<V>
  >,
  context: APIContextType<
    (queryParams: T, body: U, options: any) => RESTRequestType<V>
  >,
  next: APINextFNType,
) => Promise<Response | void>;

export type APIErrorObject = {
  path?: string;
  params?: Record<string, any>;
  method?: string;
  name?: string;
  body?: Record<string, any>;
  data?: string | Record<string, any>;
  isAxiosError?: boolean;
  code?: string;
  message?: string;
  status?: number;
};
export type ErrorObject = {
  title?: string | undefined;
  message?: string | undefined;
  statusCode?: number;
  stack?: string;
  APIError?: APIErrorObject;
};
