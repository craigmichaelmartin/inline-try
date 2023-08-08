# `inline-try`

```bash
npm i inline-try
```

A javascript library for an inline try, offering readability, ergonomics, convenience, and safety.

1. Readability: `itry` results in less code, less nesting, less branching.
2. Ergonomics: `itry` results in code that feels ergonmic, and not like you are fighting against the language (eg, with early declaring a let to avoid scoping issues in the try).
3. Convienence: `itry` allows you to declaratively specify errors, rather than you having to tediously match them.
4. Safety: `itry` forces you to specify which error types to catch which ensures against overcatching.

Judge for yourself in the comparison ⬇️

## Comparison

With `inline-try`:

```javascript
const getArticleEndpoint = async (req, res) => {
  const [article, resultError] = await itry(getArticle(slug), ResultError);
  if (resultError) {
    return res.sendStatus(404);
  }
  await article.incrementReadCount();
  res.json(article.serializeForAPI());
};
```

Without `inline-try`:

```javascript
const getArticleEndpoint = (req, res) => {
  // We have to deal with scoping issues
  let article;
  // And deeper nesting
  try {
    article = await getArticle(slug);
  } catch (error) {
    // And remember to check the error
    if (error instanceof ResultError) {
      return res.sendStatus(404);
    }
    // And to re-throw the error if not our type
    throw error;
  }
  article.incrementReadCount();
  res.json(article.serializeForAPI());
};
```

## Usage

`inline-try` works with both async and sync code.

### `inline-try` With Async Code

Wrap a promise with `itry` and provide error types you want to catch, and you'll receive an array you can unpack to those values, with the appropriate one defined.

If error types are provided, and the promise rejects with one not specified, it will be thrown.

```javascript
const { itry } = require('inline-try');

const [data, fooError] = await itry(promise, FooError);
// If the promise resolves, data will be defined.
// If the promise rejects with a FooError, fooError will be defined.
// If the promise rejects with any other error, the await will throw.

const [data, typeError, myError] = await itry(promise, TypeError, MyError);
// If the promise resolves, data will be defined.
// If the promise rejects with a TypeError, typeError will be defined.
// If the promise rejects with a FooError, fooError will be defined.
// If the promise rejects with any other error, the await will throw.
```

If no error types are provided, all errors will be caught.

```javascript
const [data, error] = await itry(promise);
// If the promise resolves, data will be defined.
// If the promise rejects, error will be defined.
// The await will never throw an error.
```

Note that with async functions you await the `itry` and call the function in the `itry` parameter list (since async functions enclose success and failure data in the returned promise).

### `inline-try` With Sync Code

Wrap a function with `itry` and provide error type(s) you want to catch, and you'll receive an array you can unpack to those values, with the appropriate one defined.

If error types are provided, and the function throws with one not specified, it will be thrown.

```javascript
const { itry } = require('inline-try');

const [data, fooError] = itry(someFn, FooError);
// If someFn returns successfully, data will be defined.
// If someFn throws a FooError, fooError will be defined.
// If someFn throws any other error, the itry will throw.

// Supports any amount of errors to match
const [data, typeError, fooError] = await itry(someFn, TypeError, FooError);
// If someFn returns successfully, data will be defined.
// If someFn throws a TypeError, typeError will be defined.
// If someFn throws a FooError, fooError will be defined.
// If someFn throws any other error, the itry will throw.
```

As a special case, if no error types are provided, all errors will be caught.

```javascript
const [data, error] = itry(someFn);
// If someFn returns successfully, data will be defined.
// If someFn throws, error will be defined.
// The itry will never throw an error.
```

Note that with sync code you do not call the function - it will be (and needs to be) invoked by `inline-try`. If your function takes parameters, you can wrap the function in an anonymous arrow function, or wrap any arbitrary code in a function like this. For example:

```javascript
const [data, fooError] = itry(() => someFn(1, 2, 3), FooError);
```

## Example

```javascript
const getArticleEndpoint = async (req, res) => {
  // This code is short and readable, and is specific with errors it's catching
  const [article, resultError] = await itry(getArticle(slug), ResultError);
  if (resultError) {
    return res.sendStatus(404);
  }
  await article.incrementReadCount();
  res.json(article.serializeForAPI());
};
```

Without `inline-try` there may be a temptation to write this:

```javascript
const getArticleEndpoint = async (req, res) => {
  // This code looks short and readable, but is not equivalent.
  try {
    const article = await getArticle(slug);
    await article.incrementReadCount();
    const json = article.serializeForAPI();
    res.status(200).json(json);
  } catch (error) {
    // This is catching too much code. If the increment or serialize methods
    // fail, a 404 is confusingly sent and developer time wasted going down
    // the wrong path of looking into the article and slug and get method,
    // when really it could be the other methods.
    res.sendStatus(404);
  }
};
```

which is catching too much code. And if realized, may then become:

```javascript
const getArticleEndpoint = (req, res) => {
  // This code feels like it is working against the language -
  // declaring a variable ahead of time to escape a scoping issue
  // of having to attempt our function in a try block - but is correct.
  let article;
  try {
    article = await getArticle(slug);
  } catch (error) {
    // This is still too broad, and could errantly send a 404 for other
    // types of errors (for example a simple typo in the getArticle,
    // which if it were sync would blow up right away, but since it
    // is async now bubbles up here) again potentially wasting developer
    // time going down the wrong path of looking into the article and slug.
    return res.sendStatus(404);
  }
  article.incrementReadCount();
  res.json(article.serializeForAPI());
}
```

which is better, but still catching too broadly - and _especially_ in the case
of async code (where simple programing typos/mistakes/errors do not blow up the
program, but get passed along with the rejection path and so neccesitates really
strict analysis of these errors).

And so we'd finally get to the equivalent code:

```javascript
const getArticleEndpoint = (req, res) => {
  // This code feels like it is working against the language -
  // declaring a variable ahead of time to escape a scoping issue
  // of having to attempt our function in a try block - but is correct.
  let article;
  try {
    article = await getArticle(slug);
  } catch (error) {
    // We remember to check the error
    if (error instanceof ResultError) {
      // and to early return
      return res.sendStatus(404);
    }
    // and to re-throw the error if not our type
    throw error;
  }
  article.incrementReadCount();
  res.json(article.serializeForAPI());
};
```

## Alternate API

Error types can also be passed to the `itry` function as an array, rather than as
separate parameters. This can make the code look nicer when formatted.

```javascript
const [data, typeError, myError] = await itry(
  someAsyncFunctionThatIsKindaLong(oh, and, has, some, params),
  [TypeError, MyError]
);
```

## Addtional Utility Methods in `inline-try`

In addtion to the `itry` function described above, `inline-try` includes two other utility helpers for working with async code.

### `swallow`

Swallow returns the value the function / resolution of promise, or else a default value you provide. It will never throw an error. It may also take a function that is called with the error.

```javascript
const { swallow } = require('inline-try');
const { logError } = require('./logging');

// With Async Functions
const greeting = await swallow(getGreeting(), 'Hey There!', logError);
// If the promise resolves, greeting will be the value.
// If the promise rejects, greeting will be "Hey There!" and logError will be called with the error.
// The await will never throw an error.

// With Sync Functions
const greeting = swallow(getGreeting, 'Hey There!', logError);
// If the function returns successfully, greeting will be the value.
// If the function throws, greeting will be "Hey There!" and logError will be called with the error.
// The swallow will never throw an error.
```

### `tapError`

`tapError` is a function that is called with the error only if the function throws / promise rejects. It does not handle the error - the original error is received, but allows some side effect on that error. This is useful when an error traverses through many "layers" in the program (EG, db -> dao -> service -> controller), and each layer may easily perform side-effects regarding what the error means for it without needing to account for its journey.

```javascript
const { tapError } = require('inline-try');

// With Async Functions
const getOne = data => tapError(db.one(data), logError);
// If the promise resolves, the value will be returned.
// If the promise rejects, the rejected promise will be returned but with the error already logged.

// With Sync Functions
const getOne = data => tapError(() => sync.one(data), logError);
// If the function returns successfully, the value will be returned.
// If the function throws an error, the error will be returned but with the error already logged.
```

## Alternatives / Prior Art

- [`fAwait`](https://github.com/craigmichaelmartin/fawait) which this was based on, but only focused on async code for promises/await (and did not also support sync functions).
- Conception: [Making Await More Functional in JavaScript](https://dev.to/craigmichaelmartin/making-await-more-functional-in-javascript-2le4)
