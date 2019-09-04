/* eslint-disable react-hooks/exhaustive-deps */

/**
 * useFetch.js
 *
 * @description Custom fetch hook for TMC applications.
 * @author jarsmith@indot.in.gov
 * @license MIT
 * @copyright INDOT, 2019
 */
import { useEffect, useState } from 'react';
const REQUEST_CACHE = {};
/**
 * @description Custom hook for AJAX data. Takes either a Request object or a url and returns
 * a state from a call to useState that gets updated REQUEST_CACHE a result comes back.
 *
 * @param {Request|string} request The string url or URL object or Request object to fetch.
 * @param {number} timeout The timeout, defaults to none.
 * @param {Any} initialData The initial data to pass to useState. Defaults to null.
 * @param {boolean} cache Whether or not to cache the request to prevent unnecessary fetches.
 * @returns {Object} The current status of the fetch.
 */

export default function useFetch({
  request,
  timeout = 0,
  initialData = {},
  cache = false
}) {
  const [isCancelled, setCancelled] = useState(false);
  const [data, updateData] = useState(initialData);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState();

  const cancel = () => setCancelled(true);

  useEffect(() => {
    const fetchData = async url => {
      if (!isLoading) {
        try {
          setLoading(true);
          const tout = timeout && timeout > 0 ? new Promise((_, rej) => setTimeout(rej, timeout, new Error('Request timed out.'))) : null; // Type assertion is ok here because the other branch will throw

          const req = tout ? Promise.race([tout, fetch(request)]) : fetch(request);
          const resp = await req;

          if (resp.status < 200 || resp.status >= 400) {
            throw new Error(`HTTP error ${resp.status}`);
          }

          const json = await resp.json();

          if (!json) {
            throw new Error('Empty response');
          }

          if (!isCancelled) {
            if (cache) {
              REQUEST_CACHE[url] = json;
            }

            setError(undefined);
            updateData(json);
          }
        } catch (e) {
          if (cache) REQUEST_CACHE[url] = e;
          setError(e);
        } finally {
          setLoading(false);
        }
      }

      if (!request && data !== initialData) {
        updateData(initialData);
      }
    };

    if (request && !isCancelled && !isLoading) {
      const url = (() => {
        switch (true) {
          case request instanceof Request:
            return request.url;

          case typeof request === 'string':
            return request;

          default:
            setError(new Error(`Unknown request type for '${request}'.`));
            return '';
        }
      })();

      if (url) {
        if (!REQUEST_CACHE.hasOwnProperty(url)) {
          fetchData(url);
        } else {
          const cached = REQUEST_CACHE[url];

          if (cached instanceof Error) {
            setError(cached);
          } else {
            updateData(cached);
          }
        }
      }
    }
  }, [request]);
  return {
    get data() {
      if (error) {
        throw error;
      }

      return data;
    },

    isLoading,
    isCancelled,
    cancel,
    error
  };
}

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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