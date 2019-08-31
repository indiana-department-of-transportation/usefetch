/* eslint no-shadow: 0 */
/**
 * useFetch.test.js
 *
 * @description Custom fetch hook tests.
 * @author jarsmith@indot.in.gov
 * @license MIT
 * @copyright INDOT, 2019
 */

import 'jsdom-global/register';
import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import Enzyme, { mount } from 'enzyme';
import fetchPonyfill from 'fetch-ponyfill';
import { act } from 'react-dom/test-utils';

import useFetch, {
  IUseFetchState,
  IUseFetchArgs,
  IPojo,
} from './useFetch';

Enzyme.configure({ adapter: new Adapter() });
const { Request } = fetchPonyfill();

type TestHookProps = {
  useHook: (x: IUseFetchArgs) => IUseFetchState,
  args: IUseFetchArgs,
}

type DisplayProps = {
  result: IUseFetchState,
}

type HTTPMethod = 'GET' | 'POST' | 'DELETE' | 'UPDATE';

type RequestOpts = {
  method?: HTTPMethod,
  headers?: Headers,
  body?: string,
}

const globalThis = (new Function("return this;"))();

const Display = ({ result }: DisplayProps) => <div>{JSON.stringify(result)}</div>;
const TestHook = ({ useHook, args }: TestHookProps) => {
  const res = useHook(args);
  return <Display result={res} />;
  // var res: unknown;
  // act(() => {
  //   res = useHook(args);
  // });
  // return <Display result={ res as IUseFetchState }/>;
};

globalThis.Request = Request;

const fakeResponseFactory = async (returnValue: any) => Promise.resolve({
  json: () => new Promise(res => setTimeout(res, 0, returnValue)),
});

beforeEach(() => {
  globalThis.fetch = jest.fn();
  globalThis.fetch.mockReturnValueOnce(fakeResponseFactory({}));
});

describe('useFetch', () => {
  it('should fetch data from a url', () => {
    const args = {
      request: 'http://foo.com',
    };

    var wrapper: unknown;
    act(() => {
      wrapper = mount(<TestHook args={args} useHook={(x: IUseFetchArgs) => useFetch(x)} />);
    });

    const { result } = (wrapper as Enzyme.ReactWrapper).find(Display).props();
    expect(result.data).toEqual({});
  });

  xit('should fetch data using a Request object', () => {
    const mockRequest = new Request('http://fobar.com');
    const args = {
      request: mockRequest as Request,
    };

    const wrapper = mount(<TestHook args={args} useHook={(x: IUseFetchArgs) => useFetch(x)} />);
    const { result } = wrapper.find(Display).props();
    expect(result.data).toEqual({});
  });

  xit('should use initialData when present', () => {
    const args = {
      request: 'http://foo.com',
      initialData: 3,
    };

    const wrapper = mount(<TestHook args={args} useHook={(x: IUseFetchArgs) => useFetch(x)} />);
    const { result } = wrapper.find(Display).props();
    expect(result.data).toBe(3);
  });

  xit('should do nothing when not presented with a url or request', () => {
  const args = {
    request: '',
    intiialData: 'bar',
  };

  const wrapper = mount(<TestHook args={args} useHook={(x: IUseFetchArgs) => useFetch(x)} />);
    const { result } = wrapper.find(Display).props();
    expect(result.data).toEqual('bar');
  });

  xit('should update with new data from the fetch', (done) => {
    const f = jest.fn();
    f.mockReturnValueOnce(fakeResponseFactory('foo'));
    globalThis.fetch = f;
    const args = {
      request: 'http://bar.com',
      initialData: 'baz',
    };

    const wrapper = mount(<TestHook args={args} useHook={(x: IUseFetchArgs) => useFetch(x)} />);
    const { result } = wrapper.find(Display).props();
    expect(result.data).toEqual('baz');
    setTimeout(() => {
      wrapper.update();
      const { result } = wrapper.find(Display).props();
      expect(result.data).toEqual('foo');
      done();
    }, 10);
  });

  xit('should have an isLoading that accurately reports loading status', (done) => {
    const f = jest.fn();
    f.mockReturnValueOnce(fakeResponseFactory('hi'));
    globalThis.fetch = f;
    const args = {
      request: 'http://baz.com',
    };

    const wrapper = mount(<TestHook args={args} useHook={(x: IUseFetchArgs) => useFetch(x)} />);
    const { result } = wrapper.find(Display).props();
    expect(result.isLoading).toEqual(true);
    setTimeout(() => {
      wrapper.update();
      const { result } = wrapper.find(Display).props();
      expect(result.isLoading).toEqual(false);
      done();
    }, 10);
  });

  xit('should have an error property that accurately reflects error status', (done) => {
    const f = jest.fn();
    f.mockReturnValueOnce(Promise.reject(new Error('aaargh')));
    globalThis.fetch = f;
    const args = {
      request: 'http://qux.com',
    };

    const wrapper = mount(<TestHook args={args} useHook={(x: IUseFetchArgs) => useFetch(x)} />);
    const { result } = wrapper.find(Display).props();
    expect(result.error).toEqual(null);
    setTimeout(() => {
      wrapper.update();
      const { result } = wrapper.find(Display).props();
      expect(result.error).toEqual(new Error('aaargh'));
      done();
    }, 10);
  });

  xit('should have a cancel function that prevents data update', (done) => {
    const f = jest.fn();
    f.mockReturnValueOnce(fakeResponseFactory('foo'));
    globalThis.fetch = f;
    const args = {
      request: 'http://foo.com',
      initialData: 'baz',
    };

    const wrapper = mount(<TestHook args={args} useHook={(x: IUseFetchArgs) => useFetch(x)} />);
    const { result } = wrapper.find(Display).props();
    expect(result.data).toEqual('baz');
    result.cancel();
    setTimeout(() => {
      wrapper.update();
      const { result } = wrapper.find(Display).props();
      expect(result.data).toEqual('baz');
      done();
    }, 10);
  });
});
