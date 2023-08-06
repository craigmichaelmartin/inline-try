const { itry, swallow, tapError } = require('./index');

class NonErrorClass {}
class ErrorSubclass extends Error {}

describe('itry', () => {
  describe('sync function', () => {
    describe('does not throw', () => {
      test('no errors listed', async () => {
        expect.assertions(2);
        const [data, ...shouldBeEmpty] = itry(() => 'foo');
        expect(data).toEqual('foo');
        expect(shouldBeEmpty).toEqual([]);
      });

      test('one error listed', async () => {
        expect.assertions(2);
        const [data, ...shouldBeEmpty] = itry(() => 'foo', TypeError);
        expect(data).toEqual('foo');
        expect(shouldBeEmpty).toEqual([]);
      });

      test('one error listed [DUPLICATE FOR ARRAY API]', async () => {
        expect.assertions(2);
        const [data, ...shouldBeEmpty] = itry(() => 'foo', [TypeError]);
        expect(data).toEqual('foo');
        expect(shouldBeEmpty).toEqual([]);
      });

      test('three errors listed', async () => {
        expect.assertions(2);
        const [data, ...shouldBeEmpty] = itry(
          () => 'foo',
          TypeError,
          RangeError,
          SyntaxError
        );
        expect(data).toEqual('foo');
        expect(shouldBeEmpty).toEqual([]);
      });

      test('three errors listed [DUPLICATE FOR ARRAY API]', async () => {
        expect.assertions(2);
        const [data, ...shouldBeEmpty] = itry(() => 'foo', [
          TypeError,
          RangeError,
          SyntaxError
        ]);
        expect(data).toEqual('foo');
        expect(shouldBeEmpty).toEqual([]);
      });
    });

    describe('throws', () => {
      test('one error listed but not it', async () => {
        expect.assertions(1);
        try {
          itry(() => {
            throw new TypeError();
          }, SyntaxError);
        } catch (err) {
          expect(err).toBeInstanceOf(TypeError);
        }
      });

      test('one error listed but not it [DUPLICATE FOR ARRAY API]', async () => {
        expect.assertions(1);
        try {
          itry(() => {
            throw new TypeError();
          }, [SyntaxError]);
        } catch (err) {
          expect(err).toBeInstanceOf(TypeError);
        }
      });

      test('three errors listed but not it', async () => {
        expect.assertions(1);
        try {
          itry(
            () => {
              throw new TypeError();
            },
            SyntaxError,
            RangeError,
            EvalError
          );
        } catch (err) {
          expect(err).toBeInstanceOf(TypeError);
        }
      });

      test('three errors listed but not it [DUPLICATE FOR ARRAY API]', async () => {
        expect.assertions(1);
        try {
          itry(() => {
            throw new TypeError();
          }, [SyntaxError, RangeError, EvalError]);
        } catch (err) {
          expect(err).toBeInstanceOf(TypeError);
        }
      });

      test('promise rejects with native error, no errors listed so default catches all', async () => {
        expect.assertions(3);
        const [data, error, ...shouldBeEmpty] = itry(() => {
          throw new TypeError();
        });
        expect(data).toBeUndefined();
        expect(error).toBeInstanceOf(TypeError);
        expect(shouldBeEmpty).toEqual([]);
      });

      test('promise rejects with custom object, no errors listed so default catches all', async () => {
        expect.assertions(3);
        const [data, error, ...shouldBeEmpty] = itry(() => {
          throw new NonErrorClass();
        });
        expect(data).toBeUndefined();
        expect(error).toBeInstanceOf(NonErrorClass);
        expect(shouldBeEmpty).toEqual([]);
      });

      test('one error listed and its it', async () => {
        expect.assertions(3);
        const [data, typeError, ...shouldBeEmpty] = itry(() => {
          throw new TypeError();
        }, TypeError);
        expect(data).toBeUndefined();
        expect(typeError).toBeInstanceOf(TypeError);
        expect(shouldBeEmpty).toEqual([]);
      });

      test('one error listed and its it [DUPLICATE FOR ARRAY API]', async () => {
        expect.assertions(3);
        const [data, typeError, ...shouldBeEmpty] = itry(() => {
          throw new TypeError();
        }, [TypeError]);
        expect(data).toBeUndefined();
        expect(typeError).toBeInstanceOf(TypeError);
        expect(shouldBeEmpty).toEqual([]);
      });

      test('one error listed and its a subclass', async () => {
        expect.assertions(3);
        const [data, typeError, ...shouldBeEmpty] = itry(() => {
          throw new ErrorSubclass();
        }, Error);
        expect(data).toBeUndefined();
        expect(typeError).toBeInstanceOf(ErrorSubclass);
        expect(shouldBeEmpty).toEqual([]);
      });

      test('one error listed and its a subclass [DUPLICATE FOR ARRAY API]', async () => {
        expect.assertions(3);
        const [data, typeError, ...shouldBeEmpty] = itry(() => {
          throw new ErrorSubclass();
        }, [Error]);
        expect(data).toBeUndefined();
        expect(typeError).toBeInstanceOf(ErrorSubclass);
        expect(shouldBeEmpty).toEqual([]);
      });

      test('three errors listed and its first', async () => {
        expect.assertions(5);
        const [data, typeError, rangeError, syntaxError, ...shouldBeEmpty] = itry(
          () => {
            throw new TypeError();
          },
          TypeError,
          RangeError,
          SyntaxError
        );
        expect(data).toBeUndefined();
        expect(typeError).toBeInstanceOf(TypeError);
        expect(rangeError).toBeUndefined();
        expect(syntaxError).toBeUndefined();
        expect(shouldBeEmpty).toEqual([]);
      });

      test('three errors listed and its first [DUPLICATE FOR ARRAY API]', async () => {
        expect.assertions(5);
        const [
          data,
          typeError,
          rangeError,
          syntaxError,
          ...shouldBeEmpty
        ] = itry(() => {
          throw new TypeError();
        }, [TypeError, RangeError, SyntaxError]);
        expect(data).toBeUndefined();
        expect(typeError).toBeInstanceOf(TypeError);
        expect(rangeError).toBeUndefined();
        expect(syntaxError).toBeUndefined();
        expect(shouldBeEmpty).toEqual([]);
      });

      test('three errors listed and its second', async () => {
        expect.assertions(5);
        const [data, typeError, rangeError, syntaxError, ...shouldBeEmpty] = itry(
          () => {
            throw new RangeError();
          },
          TypeError,
          RangeError,
          SyntaxError
        );
        expect(data).toBeUndefined();
        expect(typeError).toBeUndefined();
        expect(rangeError).toBeInstanceOf(RangeError);
        expect(syntaxError).toBeUndefined();
        expect(shouldBeEmpty).toEqual([]);
      });

      test('three errors listed and its second [DUPLICATE FOR ARRAY API]', async () => {
        expect.assertions(5);
        const [
          data,
          typeError,
          rangeError,
          syntaxError,
          ...shouldBeEmpty
        ] = itry(() => {
          throw new RangeError();
        }, [TypeError, RangeError, SyntaxError]);
        expect(data).toBeUndefined();
        expect(typeError).toBeUndefined();
        expect(rangeError).toBeInstanceOf(RangeError);
        expect(syntaxError).toBeUndefined();
        expect(shouldBeEmpty).toEqual([]);
      });

      test('three errors listed and its last', async () => {
        expect.assertions(5);
        const [data, typeError, rangeError, syntaxError, ...shouldBeEmpty] = itry(
          () => {
            throw new SyntaxError();
          },
          TypeError,
          RangeError,
          SyntaxError
        );
        expect(data).toBeUndefined();
        expect(typeError).toBeUndefined();
        expect(rangeError).toBeUndefined();
        expect(syntaxError).toBeInstanceOf(SyntaxError);
        expect(shouldBeEmpty).toEqual([]);
      });

      test('three errors listed and its last [DUPLICATE FOR ARRAY API]', async () => {
        expect.assertions(5);
        const [
          data,
          typeError,
          rangeError,
          syntaxError,
          ...shouldBeEmpty
        ] = itry(() => {
          throw new SyntaxError();
        }, [TypeError, RangeError, SyntaxError]);
        expect(data).toBeUndefined();
        expect(typeError).toBeUndefined();
        expect(rangeError).toBeUndefined();
        expect(syntaxError).toBeInstanceOf(SyntaxError);
        expect(shouldBeEmpty).toEqual([]);
      });
    });
  });

  describe('promise', () => {
    describe('resolves', () => {
      test('no errors listed', async () => {
        expect.assertions(2);
        const [data, ...shouldBeEmpty] = await itry(Promise.resolve('foo'));
        expect(data).toEqual('foo');
        expect(shouldBeEmpty).toEqual([]);
      });

      test('one error listed', async () => {
        expect.assertions(2);
        const [data, ...shouldBeEmpty] = await itry(
          Promise.resolve('foo'),
          TypeError
        );
        expect(data).toEqual('foo');
        expect(shouldBeEmpty).toEqual([]);
      });

      test('one error listed [DUPLICATE FOR ARRAY API]', async () => {
        expect.assertions(2);
        const [data, ...shouldBeEmpty] = await itry(Promise.resolve('foo'), [
          TypeError
        ]);
        expect(data).toEqual('foo');
        expect(shouldBeEmpty).toEqual([]);
      });

      test('three errors listed', async () => {
        expect.assertions(2);
        const [data, ...shouldBeEmpty] = await itry(
          Promise.resolve('foo'),
          TypeError,
          RangeError,
          SyntaxError
        );
        expect(data).toEqual('foo');
        expect(shouldBeEmpty).toEqual([]);
      });

      test('three errors listed [DUPLICATE FOR ARRAY API]', async () => {
        expect.assertions(2);
        const [data, ...shouldBeEmpty] = await itry(Promise.resolve('foo'), [
          TypeError,
          RangeError,
          SyntaxError
        ]);
        expect(data).toEqual('foo');
        expect(shouldBeEmpty).toEqual([]);
      });
    });

    describe('rejects', () => {
      test('one error listed but not it', async () => {
        expect.assertions(1);
        try {
          await itry(
            Promise.resolve().then(() => {
              throw new TypeError();
            }),
            SyntaxError
          );
        } catch (err) {
          expect(err).toBeInstanceOf(TypeError);
        }
      });

      test('one error listed but not it [DUPLICATE FOR ARRAY API]', async () => {
        expect.assertions(1);
        try {
          await itry(
            Promise.resolve().then(() => {
              throw new TypeError();
            }),
            [SyntaxError]
          );
        } catch (err) {
          expect(err).toBeInstanceOf(TypeError);
        }
      });

      test('three errors listed but not it', async () => {
        expect.assertions(1);
        try {
          await itry(
            Promise.resolve().then(() => {
              throw new TypeError();
            }),
            SyntaxError,
            RangeError,
            EvalError
          );
        } catch (err) {
          expect(err).toBeInstanceOf(TypeError);
        }
      });

      test('three errors listed but not it [DUPLICATE FOR ARRAY API]', async () => {
        expect.assertions(1);
        try {
          await itry(
            Promise.resolve().then(() => {
              throw new TypeError();
            }),
            [SyntaxError, RangeError, EvalError]
          );
        } catch (err) {
          expect(err).toBeInstanceOf(TypeError);
        }
      });

      test('promise rejects with native error, no errors listed so default catches all', async () => {
        expect.assertions(3);
        const [data, error, ...shouldBeEmpty] = await itry(
          Promise.resolve().then(() => {
            throw new TypeError();
          })
        );
        expect(data).toBeUndefined();
        expect(error).toBeInstanceOf(TypeError);
        expect(shouldBeEmpty).toEqual([]);
      });

      test('promise rejects with custom object, no errors listed so default catches all', async () => {
        expect.assertions(3);
        const [data, error, ...shouldBeEmpty] = await itry(
          Promise.resolve().then(() => {
            throw new NonErrorClass();
          })
        );
        expect(data).toBeUndefined();
        expect(error).toBeInstanceOf(NonErrorClass);
        expect(shouldBeEmpty).toEqual([]);
      });

      test('one error listed and its it', async () => {
        expect.assertions(3);
        const [data, typeError, ...shouldBeEmpty] = await itry(
          Promise.resolve().then(() => {
            throw new TypeError();
          }),
          TypeError
        );
        expect(data).toBeUndefined();
        expect(typeError).toBeInstanceOf(TypeError);
        expect(shouldBeEmpty).toEqual([]);
      });

      test('one error listed and its it [DUPLICATE FOR ARRAY API]', async () => {
        expect.assertions(3);
        const [data, typeError, ...shouldBeEmpty] = await itry(
          Promise.resolve().then(() => {
            throw new TypeError();
          }),
          [TypeError]
        );
        expect(data).toBeUndefined();
        expect(typeError).toBeInstanceOf(TypeError);
        expect(shouldBeEmpty).toEqual([]);
      });

      test('one error listed and its a subclass', async () => {
        expect.assertions(3);
        const [data, typeError, ...shouldBeEmpty] = await itry(
          Promise.resolve().then(() => {
            throw new ErrorSubclass();
          }),
          Error
        );
        expect(data).toBeUndefined();
        expect(typeError).toBeInstanceOf(ErrorSubclass);
        expect(shouldBeEmpty).toEqual([]);
      });

      test('one error listed and its a subclass [DUPLICATE FOR ARRAY API]', async () => {
        expect.assertions(3);
        const [data, typeError, ...shouldBeEmpty] = await itry(
          Promise.resolve().then(() => {
            throw new ErrorSubclass();
          }),
          [Error]
        );
        expect(data).toBeUndefined();
        expect(typeError).toBeInstanceOf(ErrorSubclass);
        expect(shouldBeEmpty).toEqual([]);
      });

      test('three errors listed and its first', async () => {
        expect.assertions(5);
        const [
          data,
          typeError,
          rangeError,
          syntaxError,
          ...shouldBeEmpty
        ] = await itry(
          Promise.resolve().then(() => {
            throw new TypeError();
          }),
          TypeError,
          RangeError,
          SyntaxError
        );
        expect(data).toBeUndefined();
        expect(typeError).toBeInstanceOf(TypeError);
        expect(rangeError).toBeUndefined();
        expect(syntaxError).toBeUndefined();
        expect(shouldBeEmpty).toEqual([]);
      });

      test('three errors listed and its first [DUPLICATE FOR ARRAY API]', async () => {
        expect.assertions(5);
        const [
          data,
          typeError,
          rangeError,
          syntaxError,
          ...shouldBeEmpty
        ] = await itry(
          Promise.resolve().then(() => {
            throw new TypeError();
          }),
          [TypeError, RangeError, SyntaxError]
        );
        expect(data).toBeUndefined();
        expect(typeError).toBeInstanceOf(TypeError);
        expect(rangeError).toBeUndefined();
        expect(syntaxError).toBeUndefined();
        expect(shouldBeEmpty).toEqual([]);
      });

      test('three errors listed and its second', async () => {
        expect.assertions(5);
        const [
          data,
          typeError,
          rangeError,
          syntaxError,
          ...shouldBeEmpty
        ] = await itry(
          Promise.resolve().then(() => {
            throw new RangeError();
          }),
          TypeError,
          RangeError,
          SyntaxError
        );
        expect(data).toBeUndefined();
        expect(typeError).toBeUndefined();
        expect(rangeError).toBeInstanceOf(RangeError);
        expect(syntaxError).toBeUndefined();
        expect(shouldBeEmpty).toEqual([]);
      });

      test('three errors listed and its second [DUPLICATE FOR ARRAY API]', async () => {
        expect.assertions(5);
        const [
          data,
          typeError,
          rangeError,
          syntaxError,
          ...shouldBeEmpty
        ] = await itry(
          Promise.resolve().then(() => {
            throw new RangeError();
          }),
          [TypeError, RangeError, SyntaxError]
        );
        expect(data).toBeUndefined();
        expect(typeError).toBeUndefined();
        expect(rangeError).toBeInstanceOf(RangeError);
        expect(syntaxError).toBeUndefined();
        expect(shouldBeEmpty).toEqual([]);
      });

      test('three errors listed and its last', async () => {
        expect.assertions(5);
        const [
          data,
          typeError,
          rangeError,
          syntaxError,
          ...shouldBeEmpty
        ] = await itry(
          Promise.resolve().then(() => {
            throw new SyntaxError();
          }),
          TypeError,
          RangeError,
          SyntaxError
        );
        expect(data).toBeUndefined();
        expect(typeError).toBeUndefined();
        expect(rangeError).toBeUndefined();
        expect(syntaxError).toBeInstanceOf(SyntaxError);
        expect(shouldBeEmpty).toEqual([]);
      });

      test('three errors listed and its last [DUPLICATE FOR ARRAY API]', async () => {
        expect.assertions(5);
        const [
          data,
          typeError,
          rangeError,
          syntaxError,
          ...shouldBeEmpty
        ] = await itry(
          Promise.resolve().then(() => {
            throw new SyntaxError();
          }),
          [TypeError, RangeError, SyntaxError]
        );
        expect(data).toBeUndefined();
        expect(typeError).toBeUndefined();
        expect(rangeError).toBeUndefined();
        expect(syntaxError).toBeInstanceOf(SyntaxError);
        expect(shouldBeEmpty).toEqual([]);
      });
    });
  });
});

// ----------------------------------------------------------------------------
// `swallow`
// ----------------------------------------------------------------------------

// Resolves -------------------------------------------------------------------
describe('swallow', () => {
  describe('sync function', () => {
    describe('does not throw', () => {
      test('green path', async () => {
        expect.assertions(1);
        const shouldNotBeCalled = () => {
          throw 'This should not fire';
        };
        const data = swallow(() => 'foo', 'bar', shouldNotBeCalled);
        expect(data).toEqual('foo');
      });
    });

    describe('throws', () => {
      test('no effect function', async () => {
        expect.assertions(1);
        const data = swallow(() => {
          throw 'foo';
        }, 'bar');
        expect(data).toEqual('bar');
      });

      test('has effect function', async () => {
        expect.assertions(2);
        const shouldBeCalled = err => expect(err).toEqual('foo');
        const data = swallow(
          () => {
            throw 'foo';
          },
          'bar',
          shouldBeCalled
        );
        expect(data).toEqual('bar');
      });
    });
  });

  describe('promise', () => {
    describe('resolves', () => {
      test('green path', async () => {
        expect.assertions(1);
        const shouldNotBeCalled = () => {
          throw 'This should not fire';
        };
        const data = await swallow(Promise.resolve('foo'), 'bar', shouldNotBeCalled);
        expect(data).toEqual('foo');
      });
    });

    describe('rejects', () => {
      test('no effect function', async () => {
        expect.assertions(1);
        const data = await swallow(Promise.reject('foo'), 'bar');
        expect(data).toEqual('bar');
      });

      test('has effect function', async () => {
        expect.assertions(2);
        const shouldBeCalled = err => expect(err).toEqual('foo');
        const data = await swallow(Promise.reject('foo'), 'bar', shouldBeCalled);
        expect(data).toEqual('bar');
      });
    });
  });
});

describe('tapError', () => {
  describe('sync function', () => {
    describe('does not throw', () => {
      test('green path', async () => {
        expect.assertions(1);
        const shouldNotBeCalled = () => {
          throw 'This should not fire';
        };
        const data = tapError(() => 'foo', shouldNotBeCalled);
        expect(data).toEqual('foo');
      });
    });

    describe('throws', () => {
      test('green path', async () => {
        expect.assertions(3);
        const shouldBeCalled = () => expect('called').toEqual('called');
        let data;
        try {
          data = tapError(() => {
            throw 'foo';
          }, shouldBeCalled);
        } catch (err) {
          expect(err).toEqual('foo');
        }
        expect(data).toBeUndefined();
      });
    });
  });

  describe('promise', () => {
    describe('resolves', () => {
      test('green path', async () => {
        expect.assertions(1);
        const shouldNotBeCalled = () => {
          throw 'This should not fire';
        };
        const data = await tapError(Promise.resolve('foo'), shouldNotBeCalled);
        expect(data).toEqual('foo');
      });
    });

    describe('rejects', () => {
      test('green path', async () => {
        expect.assertions(3);
        const shouldBeCalled = () => expect('called').toEqual('called');
        let data;
        try {
          data = await tapError(Promise.reject('foo'), shouldBeCalled);
        } catch (err) {
          expect(err).toEqual('foo');
        }
        expect(data).toBeUndefined();
      });
    });
  });
});
