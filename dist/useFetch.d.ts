/**
 * useFetch.js
 *
 * @description Custom fetch hook for TMC applications.
 * @author jarsmith@indot.in.gov
 * @license MIT
 * @copyright INDOT, 2019
 */
export interface IUseFetchState {
    data: any;
    isCancelled: boolean;
    isLoading: boolean;
    cancel: () => void;
    error: Error | null;
}
export interface IUseFetchArgs {
    request: Request | string;
    timeout?: number;
    initialData?: any;
    cache?: boolean;
}
export interface IPojo {
    [key: string]: any;
}
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
export default function useFetch({ request, timeout, initialData, cache, }: IUseFetchArgs): IUseFetchState;
