const itryErrorHandling = (_Errs, err) => {
  const Errs = Array.isArray(_Errs[0]) ? _Errs[0] : _Errs;
  if (Errs.length) {
    for (const [index, Err] of Errs.entries()) {
      if (err instanceof Err) {
        return [...Array.from(Array(index + 1), () => void 0), err];
      }
    }
    throw err;
  } else {
    return [void 0, err];
  }
};

const itry = (arg, ..._Errs) => {
  if (arg instanceof Promise) {
    return arg.then(val => [val], err => itryErrorHandling(_Errs, err));
  }
  let value;
  try {
    value = [arg()];
  } catch (err) {
    value = itryErrorHandling(_Errs, err);
  }
  return value;
};

const swallow = (arg, fallbackValue, effect) => {
  if (arg instanceof Promise) {
    return arg.then(
      val => val,
      err => {
        typeof effect === 'function' && effect(err);
        return fallbackValue;
      }
    );
  }
  let value;
  try {
    value = arg();
  } catch (err) {
    typeof effect === 'function' && effect(err);
    value = fallbackValue;
  }
  return value;
};

const tapError = (arg, tapFn) => {
  if (arg instanceof Promise) {
    return arg.then(
      val => val,
      err => {
        tapFn(err);
        throw err;
      }
    );
  }
  let value;
  try {
    value = arg();
  } catch (err) {
    tapFn(err);
    throw err;
  }
  return value;
};

module.exports = {
  itry,
  ftry: itry,
  swallow,
  tapError
};
