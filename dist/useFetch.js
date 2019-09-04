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
export default function useFetch({ request, timeout = 0, initialData = {}, cache = false, }) {
    const [isCancelled, setCancelled] = useState(false);
    const [data, updateData] = useState(initialData);
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState();
    const cancel = () => setCancelled(true);
    useEffect(() => {
        const fetchData = async (url) => {
            if (!isLoading) {
                try {
                    setLoading(true);
                    const tout = timeout && timeout > 0
                        ? new Promise((_, rej) => setTimeout(rej, timeout, new Error('Request timed out.')))
                        : null;
                    // Type assertion is ok here because the other branch will throw
                    const req = (tout
                        ? Promise.race([tout, fetch(request)])
                        : fetch(request));
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
                }
                catch (e) {
                    if (cache)
                        REQUEST_CACHE[url] = e;
                    setError(e);
                }
                finally {
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
                }
                else {
                    const cached = REQUEST_CACHE[url];
                    if (cached instanceof Error) {
                        setError(cached);
                    }
                    else {
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
        error,
    };
}
//# sourceMappingURL=useFetch.js.map