/* eslint no-shadow: 0 */
/**
 * useFetch.test.js
 *
 * @description Custom fetch hook tests.
 * @author jarsmith@indot.in.gov
 * @license MIT
 * @copyright INDOT, 2019
 */

import { useState } from 'react';
import fetchPonyfill from 'fetch-ponyfill';
import { renderHook, act } from '@testing-library/react-hooks';

import useFetch from './useFetch';

const { Request, Response } = fetchPonyfill();

const globalThis = (new Function("return this;"))();
globalThis.Request = Request;

const fakeResponseFactory = async (returnValue: any, status: number = 200) => ({
  json: () => new Promise(res => setTimeout(res, 0, returnValue)),
  status,
});

beforeEach(() => {
  globalThis.fetch = jest.fn();
});

describe('useFetch', () => {
  xit('should take a string url to fetch data from', async () => {
    globalThis.fetch.mockReturnValueOnce(fakeResponseFactory({ foo: 1 }));
    const { result, waitForNextUpdate } = renderHook(() => useFetch({ request: 'http://foobara.com' }));
    expect(result.current.data).toEqual({});
    await waitForNextUpdate();
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual({ foo: 1 });
  });

  xit('should take a Request object instead of a string', async () => {
    globalThis.fetch.mockReturnValueOnce(fakeResponseFactory({ foo: 1 }));
    const { result, waitForNextUpdate } = renderHook(() => {
      const [request] = useState(new Request('http://foobarb.com'));
      return useFetch({ request });
    });
    expect(result.current.data).toEqual({});
    await waitForNextUpdate();
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual({ foo: 1 });
  });

  xit('should rerun when request changes', async () => {
    let setRequest: unknown;
    globalThis.fetch
      .mockReturnValueOnce(fakeResponseFactory({ foo: 1 }))
      .mockReturnValueOnce(fakeResponseFactory({ foo: 2 }));

    const { result, waitForNextUpdate } = renderHook(() => {
      const [request, setReq] = useState(new Request('http://foobarb.com'));
      setRequest = setReq;
      return useFetch({ request });
    });

    expect(result.current.data).toEqual({});
    await waitForNextUpdate();
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual({ foo: 1 });

    act(() => {
      (setRequest as Function)(new Request("http://barfoo.com"));
    });

    await waitForNextUpdate();
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    expect(result.current.data).toEqual({ foo: 2 });
  });

  xit('should have a result with a isCancelled property and a cancel function', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useFetch({ request: 'http://foobarc.com' }));
    expect(result.current.isCancelled).toBe(false);
    act(() => {
      result.current.cancel();
    });

    await waitForNextUpdate();
    expect(result.current.isCancelled).toBe(true);
  });

  xit('should have a result with a isLoading property', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useFetch({ request: 'http://foobard.com' }));
    expect(result.current.isLoading).toBe(true);
    await waitForNextUpdate();
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(result.current.isLoading).toEqual(false);
  });

  xit('should have a result with an error property', () => {
    globalThis.fetch = () => {
      throw new Error('catch me if you can');
    };

    const { result } = renderHook(() => useFetch({ request: 'http://foobare.com' }));
    expect(result.current.error).toEqual(new Error('catch me if you can'));
  });

  xit('should optionally take initialData', async () => {
    globalThis.fetch.mockReturnValueOnce(fakeResponseFactory({ foo: 2 }));
    const { result, waitForNextUpdate } = renderHook(() => useFetch({
      request: 'http://foobarf.com',
      initialData: { foo: 1 }
    }));

    expect(result.current.data).toEqual({ foo: 1 });
    await waitForNextUpdate();
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual({ foo: 2 });
  });

  xit('should do nothing if the request is empty', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useFetch({
      request: '',
      initialData: { foo: 1 },
    }));

    expect(globalThis.fetch).not.toHaveBeenCalled();
    expect(result.current.data).toEqual({ foo: 1 });
  });

  xit('should take an optional timeout', async () => {
    globalThis.fetch = () => new Promise((res) => {
      setTimeout(res, 500);
    });

    const { result, waitForNextUpdate } = renderHook(() => useFetch({
      request: 'http://foobargh.com',
      initialData: { foo: 1 },
      timeout: 1,
    }));

    expect(result.current.data).toEqual({ foo: 1 });
    await waitForNextUpdate();

    expect(result.current.error).toEqual(new Error('Request timed out.'));
  });

  xit('should cache the result of the request if asked', async () => {
    globalThis.fetch.mockReturnValueOnce(fakeResponseFactory({ foo: 1 }));
    const { waitForNextUpdate } = renderHook(() => useFetch({
      request: 'http://foobari.com',
      cache: true,
    }));

    await waitForNextUpdate();
    const res2 = renderHook(() => useFetch({
      request: 'http://foobari.com',
    }));
    await new Promise(res => setTimeout(res, 5));

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(res2.result.current.data).toEqual({ foo: 1 });
  });

  xit('should continue to fetch if not', async () => {
    globalThis.fetch
      .mockReturnValueOnce(fakeResponseFactory({ foo: 1 }))
      .mockReturnValueOnce(fakeResponseFactory({ foo: 2 }));

    const { result, waitForNextUpdate } = renderHook(() => useFetch({
      request: 'http://foobaz.com',
    }));

    await waitForNextUpdate();
    expect(result.current.data).toEqual({ foo: 1 });

    const res2 = renderHook(() => useFetch({
      request: 'http://foobark.com',
    }));
    await res2.waitForNextUpdate();

    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    expect(res2.result.current.data).toEqual({ foo: 2 });
  });

  xit('should throw on a bad HTTP response status', async () => {
    globalThis.fetch.mockReturnValueOnce(fakeResponseFactory({ foo: 1 }, 500));

    const { result, waitForNextUpdate } = renderHook(() => useFetch({
      request: 'http://foobarl.com',
    }));

    await waitForNextUpdate();
    expect(result.current.error).toEqual(new Error('HTTP error 500'));
  });

  xit('should throw on an empty HTTP response', async () => {
    globalThis.fetch.mockReturnValueOnce(fakeResponseFactory(''));

    const { result, waitForNextUpdate } = renderHook(() => useFetch({
      request: 'http://foobarm.com',
    }));

    await waitForNextUpdate();
    expect(result.current.error).toEqual(new Error('Empty response'));
  });

  xit('should throw on an unknown request argument', async () => {
    // Don't have to worry about this if using typescript, but...
    let request: unknown;
    request = true;
    const { result } = renderHook(() => useFetch({
      request: (request as string),
    }));

    expect(result.current.error).toEqual(new Error('Unknown request type for \'true\'.'));
  });

  it('should take a custom fetch function', async () => {
    const customFetch = jest.fn();
    customFetch.mockReturnValueOnce(new Response('hi', { status: 200 }));

    const { result, waitForNextUpdate } = renderHook(() => useFetch({
      request: "someurl",
      fetchFn: customFetch,
    }));

    expect(customFetch).toHaveBeenCalled();
    await waitForNextUpdate();
    expect(result.current.data).toBe('hi');
  });
});
