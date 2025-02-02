# `eaux`

A lightweight and functional-style library that provides robust abstractions for handling optional values and handling operations that can either succeed or fail. By making states explicit, it encourages precise and deliberate management of application logic.

---

## Overview

**`eaux`** introduces two core abstractions:

- **`Maybe`**

  Represents an optional value. A `Maybe` can either be a `Nothing` containing no value or a `Something` containing a value.

- **`Result`**

  Represents the outcome of an operation that can either succeed or fail. A `Result` can either be a `Failure` containing an error or a `Success` containing a value.

Both abstractions support a suite of chainable and composable operations that lead to code that is clear, consistent, and reliable.

---

## Installation

To install **`eaux`**, ensure that you have Node.js version 20 or newer, and use your preferred package manager.

### `npm`

```bash
npm install eaux
```

### `pnpm`

```bash
pnpm add eaux
```

### `yarn`

```bash
yarn add eaux
```

---

## API

Below is a complete overview of the functions and methods exposed by the library.

### `Maybe`

#### Functions

- **`something<TValue = any>(value: TValue): Maybe<TValue>`**

  Creates and returns a new `Something` `Maybe` containing the provided `value`.

- **`nothing<TValue = any>(): Maybe<TValue>`**

  Creates and returns a new `Nothing` `Maybe`.

- **`isMaybe(value: unknown): value is Maybe<unknown>`**

  Checks if the provided `value` is a `Maybe`.

#### Methods

On a `Maybe` instance, the following methods are available:

- **`and<TOtherValue>(other: Maybe<TOtherValue>): Maybe<TOtherValue>`**

  If this is a `Something` `Maybe`, returns `other`.
  If this is a `Nothing` `Maybe`, returns this `Maybe`.

- **`andThen<TOtherValue>(f: (value: TValue) => Maybe<TOtherValue>): Maybe<TOtherValue>`**

  If this is a `Something` `Maybe`, returns the result of applying `f` to the contained value.
  If this is a `Nothing` `Maybe`, returns this `Maybe`.

- **`expect(message: string): TValue`**

  If this is a `Something` `Maybe`, returns the contained value.
  If this is a `Nothing` `Maybe`, throws an [`ExpectationError`][src-error-expectation-ts-file] with the provided `message`.

- **`filter(predicate: (value: TValue) => boolean): Maybe<TValue>`**

  If this is a `Something` `Maybe`, returns this `Maybe` if the contained value satisfies the provided `predicate`.
  If this is a `Nothing` `Maybe`, returns this `Maybe`.

- **`getSuccessOr<TError>(error: TError): Result<TValue, TError>`**

  If this is a `Something` `Maybe`, returns a `Success` `Result` containing the contained value.
  If this is a `Nothing` `Maybe`, returns a `Failure` `Result` containing the provided `error`.

- **`inspect(f: (value: TValue) => void): Maybe<TValue>`**

  If this is a `Something` `Maybe`, applies `f` to the contained value and returns this `Maybe`.
  If this is a `Nothing` `Maybe`, returns this `Maybe`.

- **`isNothing(): boolean`**

  If this is a `Something` `Maybe`, returns `false`.
  If this is a `Nothing` `Maybe`, returns `true`.

- **`isNothingOr(predicate: (value: TValue) => boolean): boolean`**

  If this is a `Something` `Maybe`, returns the result of applying `predicate` to the contained value.
  If this is a `Nothing` `Maybe`, returns `true`.

- **`isSomething(): boolean`**

  If this is a `Something` `Maybe`, returns `true`.
  If this is a `Nothing` `Maybe`, returns `false`.

- **`isSomethingAnd(predicate: (value: TValue) => boolean): boolean`**

  If this is a `Something` `Maybe`, returns the result of applying `predicate` to the contained value.
  If this is a `Nothing` `Maybe`, returns `false`.

- **`map<TNewValue>(f: (value: TValue) => TNewValue): Maybe<TNewValue>`**

  If this is a `Something` `Maybe`, returns a `Something` `Maybe` containing the result of applying `f` to the contained value.
  If this is a `Nothing` `Maybe`, returns this `Maybe`.

- **`or(other: Maybe<TValue>): Maybe<TValue>`**

  If this is a `Something` `Maybe`, returns this `Maybe`.
  If this is a `Nothing` `Maybe`, returns `other`.

- **`unwrap(): TValue`**

  If this is a `Something` `Maybe`, returns the contained value.
  If this is a `Nothing` `Maybe`, throws an [`ImproperUnwrapError`][src-error-improper-unwrap-ts-file].

---

### `Result`

#### Functions

- **`success<TValue = any, TError = any>(value: TValue): Result<TValue, TError>`**

  Creates and returns a new `Success` `Result` containing the provided `value`.

- **`failure<TValue = any, TError = any>(error: TError): Result<TValue, TError>`**

  Creates and returns a new `Failure` `Result` containing the provided `error`.

- **`isResult(value: unknown): value is Result<unknown, unknown>`**

  Checks if the provided `value` is a `Result`.

#### Methods

On a `Result` instance, the following methods are available:

- **`and<TOtherValue>(other: Result<TOtherValue, TError>): Result<TOtherValue, TError>`**

  If this is a `Success` `Result`, returns `other`.
  If this is a `Failure` `Result`, returns this `Result`.

- **`andThen<TOtherValue>(f: (value: TValue) => Result<TOtherValue, TError>): Result<TOtherValue, TError>`**

  If this is a `Success` `Result`, returns the result of applying `f` to the contained value.
  If this is a `Failure` `Result`, returns this `Result`.

- **`expect(message: string): TValue`**

  If this is a `Success` `Result`, returns the contained value.
  If this is a `Failure` `Result`, throws an [`ExpectationError`][src-error-expectation-ts-file] with the provided `message`.

- **`expectFailure(message: string): TError`**

  If this is a `Success` `Result`, throws an [`ExpectationError`][src-error-expectation-ts-file] with the provided `message`.
  If this is a `Failure` `Result`, returns the contained error.

- **`getFailure(): Maybe<TError>`**

  If this is a `Success` `Result`, returns a `Nothing` `Maybe`.
  If this is a `Failure` `Result`, returns a `Something` `Maybe` containing the contained error.

- **`getSuccess(): Maybe<TValue>`**

  If this is a `Success` `Result`, returns a `Something` `Maybe` containing the contained value.
  If this is a `Failure` `Result`, returns a `Nothing` `Maybe`.

- **`inspect(f: (value: TValue) => void): Result<TValue, TError>`**

  If this is a `Success` `Result`, applies `f` to the contained value and returns this `Result`.
  If this is a `Failure` `Result`, returns this `Result`.

- **`inspectFailure(f: (error: TError) => void): Result<TValue, TError>`**

  If this is a `Success` `Result`, returns this `Result`.
  If this is a `Failure` `Result`, applies `f` to the contained error and returns this `Result`.

- **`isFailure(): boolean`**

  If this is a `Success` `Result`, returns `false`.
  If this is a `Failure` `Result`, returns `true`.

- **`isFailureAnd(predicate: (error: TError) => boolean): boolean`**

  If this is a `Success` `Result`, returns `false`.
  If this is a `Failure` `Result`, returns the result of applying `predicate` to the contained error.

- **`isSuccess(): boolean`**

  If this is a `Success` `Result`, returns `true`.
  If this is a `Failure` `Result`, returns `false`.

- **`isSuccessAnd(predicate: (value: TValue) => boolean): boolean`**

  If this is a `Success` `Result`, returns the result of applying `predicate` to the contained value.
  If this is a `Failure` `Result`, returns `false`.

- **`map<TNewValue>(f: (value: TValue) => TNewValue): Result<TNewValue, TError>`**

  If this is a `Success` `Result`, returns a `Success` `Result` containing the result of applying `f` to the contained value.
  If this is a `Failure` `Result`, returns this `Result`.

- **`mapFailure<TNewError>(f: (error: TError) => TNewError): Result<TValue, TNewError>`**

  If this is a `Success` `Result`, returns this `Result`.
  If this is a `Failure` `Result`, returns a `Failure` `Result` containing the result of applying `f` to the contained error.

- **`or<TOtherError>(other: Result<TValue, TOtherError>): Result<TValue, TOtherError>`**

  If this is a `Success` `Result`, returns this `Result`.
  If this is a `Failure` `Result`, returns `other`.

- **`unwrap(): TValue`**

  If this is a `Success` `Result`, returns the contained value.
  If this is a `Failure` `Result`, throws an [`ImproperUnwrapError`][src-error-improper-unwrap-ts-file].

- **`unwrapFailure(): TError`**

  If this is a `Success` `Result`, throws an [`ImproperUnwrapError`][src-error-improper-unwrap-ts-file].
  If this is a `Failure` `Result`, returns the contained error.

---

## Usage

The following examples illustrate some real-world scenarios where **`eaux`** can be useful.

### Example 1: Handling Optional User Input

Assume you want to process user input that might be empty. With `Maybe`, you can ensure that every code path explicitly checks whether the value exists.

```typescript
import { nothing, something } from 'eaux'

// A function that simulates reading user input.
function getUserInput() {
  // Imagine a real implementation here.
  const randomNumber = Math.random()
  return (randomNumber > 0.5) ?
    'Hello, world!' :
    null
}

const input = getUserInput()
const maybeInput = (input !== null) ?
  something(input) :
  nothing()

if (maybeInput.isSomething()) {
  console.log('User input provided:', maybeInput.unwrap())
} else {
  console.log('No user input was provided')
}
```

### Example 2: Parsing Numbers with `Result`

Imagine a routine that attempts to parse a string into a number. By using `Result`, you enforce error handling explicitly.

```typescript
import { failure, success } from 'eaux'

function parseNumber(input: string): Result<number, string> {
  const parsedValue = Number(input)
  // Check for non-numeric values.
  if (isNaN(parsedValue)) {
    return failure('Invalid number format, expected a numeric string.')
  }
  return success(parsedValue)
}

const result = parseNumber('42') // Try changing `'42'` to an invalid input.

if (result.isSuccess()) {
  console.log('Number parsed:', result.unwrap())
} else {
  console.error('Error parsing number:', result.unwrapFailure())
}
```

### Example 3: Transforming Values with Chainable Operations

Combine operations using chainable methods to build complex logic that is both clear and explicit.

```typescript
import { nothing, something } from 'eaux'

function doubleValue(value: number): number {
  return (value * 2)
}

const maybeValue = something(21)

// Chain the operations: if the value exists, double it; otherwise, do nothing.
const transformedValue = maybeValue
  .map(doubleValue)
  .or(something(0))

console.log('Value transformed:', transformedValue.unwrap())
```

---

## License

This project is licensed under the Apache License, Version 2.0. See the accompanying [`LICENSE`][license-file] file for details.

---

[license-file]: ./LICENSE
[src-error-expectation-ts-file]: ./src/error/expectation.ts
[src-error-improper-unwrap-ts-file]: ./src/error/improper-unwrap.ts
