/* eslint-disable react-hooks/exhaustive-deps */
/**
 * useFetch.js
 *
 * @description Custom fetch hook for TMC applications.
 * @author jarsmith@indot.in.gov
 * @license MIT
 * @copyright INDOT, 2019
 */

import { useEffect, useState, useRef } from 'react';

export interface IUseFetchState {
  data: any,
  isCancelled: boolean,
  isLoading: boolean,
  cancel: () => void,
  error: Error | null | undefined,
}

export interface IUseFetchArgs {
  request: Request | string,
  timeout?: number,
  initialData?: any,
  cache?: boolean,
  fetchFn?: typeof fetch,
}

export interface IPojo {
  [key: string]: any,
}

const REQUEST_CACHE: IPojo = {};

/**
 * @description Custom hook for AJAX data. Takes either a Request object or a url and returns
 * a state from a call to useState that gets updated REQUEST_CACHE a result comes back.
 *
 * @param {Request|string} request The string url or URL object or Request object to fetch.
 *  **NOTE:** if using a Request object it *must* be wrapped in a call to useState to prevent
 *  an infinite render loop.
 * @param {number} timeout The timeout, defaults to none.
 * @param {Any} initialData The initial data to pass to useState. Defaults to null.
 * @param {boolean} cache Whether or not to cache the request to prevent unnecessary fetches.
 * @returns {Object} The current status of the fetch.
 */
export default function useFetch({
  request,
  timeout = 0,
  initialData = {},
  cache = false,
  fetchFn = fetch,
}: IUseFetchArgs): IUseFetchState {
  const isMounted = useRef(true);
  const [isCancelled, setCancelled] = useState(false);
  const [data, updateData] = useState(initialData);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<Error>();
  const cancel = () => setCancelled(true);
  const update = <T>(fn: (state: T) => void, arg: T) => {
    if (isMounted.current && !isCancelled) fn(arg);
  };

  useEffect(() => {
    const fetchData = async (url: string) => {
      if (!isLoading) {
        try {
          update(setLoading, true);
          const tout = timeout && timeout > 0
            ? new Promise((_, rej) => setTimeout(rej, timeout, new Error('Request timed out.')))
            : null;

          // Type assertion is ok here because the other branch will throw
          const req = (tout
            ? Promise.race([tout, fetchFn(request)])
            : fetchFn(request)
          ) as Promise<Response>;

          const resp = await req;

          if (resp.status < 200 || resp.status >= 400) {
            throw new Error(`HTTP error ${resp.status}`);
          }

          const text = await resp.text();
          let data;
          try {
            data = JSON.parse(text);
          } catch (err) {
            data = text;
          }

          if (!data) {
            throw new Error('Empty response');
          }
          
          if (cache) {
            REQUEST_CACHE[url] = data;
          }

          update(setError, undefined);
          update(updateData, data);
        } catch (e) {
          if (cache) REQUEST_CACHE[url] = e;
          update(setError, e);
        } finally {
          update(setLoading, false);
        }
      }

      if (!request && data !== initialData) {
        updateData(initialData);
      }
    };

    if (request && !isCancelled && !isLoading) {
      const url = ((): string => {
        switch (true) {
          case request instanceof Request:
            return (request as Request).url;

          case typeof request === 'string':
            return (request as string);

          default:
            update(setError, new Error(`Unknown request type for '${request}'.`));
            return '';
        }
      })();

      if (url) {
        if (!REQUEST_CACHE.hasOwnProperty(url)) {
          fetchData(url);
        } else {
          const cached = REQUEST_CACHE[url];
          if (cached instanceof Error) {
            update(setError, cached);
          } else {
            update(updateData, cached);
          }
        }
      }
    }
  }, [request]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return {
    data,
    isLoading,
    isCancelled,
    cancel,
    error,
  };
}
