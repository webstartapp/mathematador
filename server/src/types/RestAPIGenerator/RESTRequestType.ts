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

type APIRequestCallType<T = any, U = any, V = any> = (
  queryParams?: T,
  body?: U,
  options?: Partial<RESTRequestType>
) => RESTRequestType<V>;

export type APIRequestType<RequestCallType extends APIRequestCallType = APIRequestCallType> = {
  query: Parameters<RequestCallType>[0];
  json: () => Promise<Parameters<RequestCallType>[1]>;
  headers: { get: (header: string) => string };
};
export type APIContextType<RequestCallType extends APIRequestCallType = APIRequestCallType> = {
  params: undefined | Parameters<RequestCallType>[0];
};

export type APINextFNType = () => void;

export type APIHandlerType<T = any, U = any, V = any> = (
  req: APIRequestType<(queryParams: T, body: U, options: any) => RESTRequestType<V>>,
  context: APIContextType<(queryParams: T, body: U, options: any) => RESTRequestType<V>>,
  next: APINextFNType
) => Promise<Response | void>;
