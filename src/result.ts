/*
 *******************************************************************************
 * Copyright © 2024-present Jonathan Barronville <jonathanmarvens@proton.me>   *
 *                                                                             *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not *
 * use this file except in compliance with the License.                        *
 * You may obtain a copy of the License at                                     *
 *                                                                             *
 *     http://www.apache.org/licenses/LICENSE-2.0                              *
 *                                                                             *
 * Unless required by applicable law or agreed to in writing, software         *
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT   *
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.            *
 * See the License for the specific language governing permissions and         *
 * limitations under the License.                                              *
 *******************************************************************************
 */

import assert from './utilities/assert'
import { customSymbol as customNodeJsUtilInspectSymbol } from './utilities/node-js-util-inspect'
import ExpectationError from './error/expectation'
import ImproperUnwrapError from './error/improper-unwrap'
import type Maybe from './maybe'
import nodeJsUtilInspect from './utilities/node-js-util-inspect'
import { nothing } from './maybe'
import { something } from './maybe'
import UnreachableCodeError from './error/unreachable-code'

/**
 * A robust abstraction for handling operations that can either succeed or fail.
 */
abstract class Result<TValue, TError extends NonNullable<unknown>> {
  protected constructor() { }

  #convertToString(toStringFunction: (value: unknown) => string) {
    if (this.isSuccess()) {
      const value = this.unwrap()
      const valueString = toStringFunction(value)
        .split('\n')
        .map((line) => `    ${line}`)
        .join('\n')
        .trimStart()
      return `
Result{
  Success{
    value: ${valueString},
  }
}
        `.trim()
    } else if (this.isFailure()) {
      const error = this.unwrapFailure()
      const errorString = toStringFunction(error)
        .split('\n')
        .map((line) => `    ${line}`)
        .join('\n')
        .trimStart()
      return `
Result{
  Failure{
    error: ${errorString},
  }
}
        `.trim()
    } else {
      throw new UnreachableCodeError('Reached an unreachable code path')
    }
  }

  protected abstract _and<TOtherValue>(other: Result<TOtherValue, TError>): Result<TOtherValue, TError>

  protected abstract _andThen<TOtherValue>(f: (value: TValue) => Result<TOtherValue, TError>): Result<TOtherValue, TError>

  protected abstract _expect(message: string): TValue

  protected abstract _expectFailure(message: string): TError

  protected abstract _getFailure(): Maybe<TError>

  protected abstract _getSuccess(): Maybe<TValue>

  protected abstract _inspect(f: (value: TValue) => void): Result<TValue, TError>

  protected abstract _inspectFailure(f: (error: TError) => void): Result<TValue, TError>

  protected abstract _isFailure(): boolean

  protected abstract _isFailureAnd(predicate: (error: TError) => boolean): boolean

  protected abstract _isSuccess(): boolean

  protected abstract _isSuccessAnd(predicate: (value: TValue) => boolean): boolean

  protected abstract _map<TNewValue>(f: (value: TValue) => TNewValue): Result<TNewValue, TError>

  protected abstract _mapFailure<TNewError extends NonNullable<unknown>>(f: (error: TError) => TNewError): Result<TValue, TNewError>

  protected abstract _or<TOtherError extends NonNullable<unknown>>(other: Result<TValue, TOtherError>): Result<TValue, TOtherError>

  protected abstract _unwrap(): TValue

  protected abstract _unwrapFailure(): TError

  /**
   * If this is a `Success` {@link Result}, returns {@link other}.
   * If this is a `Failure` {@link Result}, returns this {@link Result}.
   *
   * @param other The {@link Result} to return if this is a `Success` {@link Result}.
   */
  public and<TOtherValue>(other: Result<TOtherValue, TError>) {
    assert(isResult(other))
    return this._and(other)
  }

  /**
   * If this is a `Success` {@link Result}, returns the result of applying {@link f} to the contained value.
   * If this is a `Failure` {@link Result}, returns this {@link Result}.
   *
   * @param f The function to apply to the contained value.
   */
  public andThen<TOtherValue>(f: (value: TValue) => Result<TOtherValue, TError>) {
    assert(typeof f === 'function')
    return this._andThen(f)
  }

  /**
   * If this is a `Success` {@link Result}, returns the contained value.
   * If this is a `Failure` {@link Result}, throws an {@link ExpectationError} with the provided {@link message}.
   *
   * @param message The message to include in the {@link ExpectationError}.
   */
  public expect(message: string) {
    assert(typeof message === 'string')
    return this._expect(message)
  }

  /**
   * If this is a `Success` {@link Result}, throws an {@link ExpectationError} with the provided {@link message}.
   * If this is a `Failure` {@link Result}, returns the contained error.
   *
   * @param message The message to include in the {@link ExpectationError}.
   */
  public expectFailure(message: string) {
    assert(typeof message === 'string')
    return this._expectFailure(message)
  }

  /**
   * If this is a `Success` {@link Result}, returns a `Nothing` {@link Maybe}.
   * If this is a `Failure` {@link Result}, returns a `Something` {@link Maybe} containing the contained error.
   */
  public getFailure() {
    return this._getFailure()
  }

  /**
   * If this is a `Success` {@link Result}, returns a `Something` {@link Maybe} containing the contained value.
   * If this is a `Failure` {@link Result}, returns a `Nothing` {@link Maybe}.
   */
  public getSuccess() {
    return this._getSuccess()
  }

  /**
   * If this is a `Success` {@link Result}, applies {@link f} to the contained value and returns this {@link Result}.
   * If this is a `Failure` {@link Result}, returns this {@link Result}.
   *
   * @param f The function to apply to the contained value.
   */
  public inspect(f: (value: TValue) => void) {
    assert(typeof f === 'function')
    return this._inspect(f)
  }

  /**
   * If this is a `Success` {@link Result}, returns this {@link Result}.
   * If this is a `Failure` {@link Result}, applies {@link f} to the contained error and returns this {@link Result}.
   *
   * @param f The function to apply to the contained error.
   */
  public inspectFailure(f: (error: TError) => void) {
    assert(typeof f === 'function')
    return this._inspectFailure(f)
  }

  /**
   * If this is a `Success` {@link Result}, returns `false`.
   * If this is a `Failure` {@link Result}, returns `true`.
   */
  public isFailure() {
    return this._isFailure()
  }

  /**
   * If this is a `Success` {@link Result}, returns `false`.
   * If this is a `Failure` {@link Result}, returns the result of applying {@link predicate} to the contained error.
   *
   * @param predicate The predicate to apply to the contained error.
   */
  public isFailureAnd(predicate: (error: TError) => boolean) {
    assert(typeof predicate === 'function')
    return this._isFailureAnd(predicate)
  }

  /**
   * If this is a `Success` {@link Result}, returns `true`.
   * If this is a `Failure` {@link Result}, returns `false`.
   */
  public isSuccess() {
    return this._isSuccess()
  }

  /**
   * If this is a `Success` {@link Result}, returns the result of applying {@link predicate} to the contained value.
   * If this is a `Failure` {@link Result}, returns `false`.
   *
   * @param predicate The predicate to apply to the contained value.
   */
  public isSuccessAnd(predicate: (value: TValue) => boolean) {
    assert(typeof predicate === 'function')
    return this._isSuccessAnd(predicate)
  }

  /**
   * If this is a `Success` {@link Result}, returns a `Success` {@link Result} containing the result of applying {@link f} to the contained value.
   * If this is a `Failure` {@link Result}, returns this {@link Result}.
   *
   * @param f The function to apply to the contained value.
   */
  public map<TNewValue>(f: (value: TValue) => TNewValue) {
    assert(typeof f === 'function')
    return this._map(f)
  }

  /**
   * If this is a `Success` {@link Result}, returns this {@link Result}.
   * If this is a `Failure` {@link Result}, returns a `Failure` {@link Result} containing the result of applying {@link f} to the contained error.
   *
   * @param f The function to apply to the contained error.
   */
  public mapFailure<TNewError extends NonNullable<unknown>>(f: (error: TError) => TNewError) {
    assert(typeof f === 'function')
    return this._mapFailure(f)
  }

  /**
   * If this is a `Success` {@link Result}, returns this {@link Result}.
   * If this is a `Failure` {@link Result}, returns {@link other}.
   *
   * @param other The {@link Result} to return if this is a `Failure` {@link Result}.
   */
  public or<TOtherError extends NonNullable<unknown>>(other: Result<TValue, TOtherError>) {
    assert(isResult(other))
    return this._or(other)
  }

  public toString() {
    return this.#convertToString((value) => `${value}`)
  }

  /**
   * If this is a `Success` {@link Result}, returns the contained value.
   * If this is a `Failure` {@link Result}, throws an {@link ImproperUnwrapError}.
   */
  public unwrap() {
    return this._unwrap()
  }

  /**
   * If this is a `Success` {@link Result}, throws an {@link ImproperUnwrapError}.
   * If this is a `Failure` {@link Result}, returns the contained error.
   */
  public unwrapFailure() {
    return this._unwrapFailure()
  }

  public [customNodeJsUtilInspectSymbol]() {
    return this.#convertToString((value) => {
      return nodeJsUtilInspect(value)
    })
  }
}

class Failure<TError extends NonNullable<unknown>> extends Result<never, TError> {
  public static make<TError extends NonNullable<unknown>>(error: TError) {
    return new this(error)
  }

  #error: TError

  private constructor(error: TError) {
    super()
    this.#error = error
  }

  protected _and() {
    return this
  }

  protected _andThen() {
    return this
  }

  protected _expect(message: string): never {
    throw new ExpectationError(message)
  }

  protected _expectFailure() {
    return this.#error
  }

  protected _getFailure() {
    return something(this.#error)
  }

  protected _getSuccess() {
    return nothing<never>()
  }

  protected _inspect() {
    return this
  }

  protected _inspectFailure(f: (error: TError) => void) {
    f(this.#error)
    return this
  }

  protected _isFailure() {
    return true
  }

  protected _isFailureAnd(predicate: (error: TError) => boolean) {
    const isSatified = predicate(this.#error)
    assert(typeof isSatified === 'boolean')
    return isSatified
  }

  protected _isSuccess() {
    return false
  }

  protected _isSuccessAnd() {
    return false
  }

  protected _map() {
    return this
  }

  protected _mapFailure<TNewError extends NonNullable<unknown>>(f: (error: TError) => TNewError) {
    const error = f(this.#error)
    assert(typeof error !== 'undefined')
    assert(error !== null)
    return Failure.make(error)
  }

  protected _or<TOtherError extends NonNullable<unknown>>(other: Result<never, TOtherError>) {
    return other
  }

  protected _unwrap(): never {
    throw new ImproperUnwrapError('Attempted to unwrap a `Failure` value')
  }

  protected _unwrapFailure() {
    return this.#error
  }
}

class Success<TValue> extends Result<TValue, never> {
  public static make<TValue>(value: TValue) {
    return new this(value)
  }

  #value: TValue

  private constructor(value: TValue) {
    super()
    this.#value = value
  }

  protected _and<TOtherValue>(other: Result<TOtherValue, never>) {
    return other
  }

  protected _andThen<TOtherValue>(f: (value: TValue) => Result<TOtherValue, never>) {
    const value = f(this.#value)
    assert(isResult(value))
    return value
  }

  protected _expect() {
    return this.#value
  }

  protected _expectFailure(message: string): never {
    throw new ExpectationError(message)
  }

  protected _getFailure() {
    return nothing<never>()
  }

  protected _getSuccess() {
    return something(this.#value)
  }

  protected _inspect(f: (value: TValue) => void) {
    f(this.#value)
    return this
  }

  protected _inspectFailure() {
    return this
  }

  protected _isFailure() {
    return false
  }

  protected _isFailureAnd() {
    return false
  }

  protected _isSuccess() {
    return true
  }

  protected _isSuccessAnd(predicate: (value: TValue) => boolean) {
    const isSatified = predicate(this.#value)
    assert(typeof isSatified === 'boolean')
    return isSatified
  }

  protected _map<TNewValue>(f: (value: TValue) => TNewValue) {
    const value = f(this.#value)
    return Success.make(value)
  }

  protected _mapFailure() {
    return this
  }

  protected _or() {
    return this
  }

  protected _unwrap() {
    return this.#value
  }

  protected _unwrapFailure(): never {
    throw new ImproperUnwrapError('Attempted to unwrap a `Success` value')
  }
}

/**
 * Checks if the provided {@link value} is a {@link Result}.
 *
 * @param value The value to check.
 */
function isResult(value: unknown): value is Result<unknown, NonNullable<unknown>> {
  return (value instanceof Result)
}

/**
 * Creates and returns a new `Failure` {@link Result} containing the provided {@link error}.
 *
 * @param error The error to contain in the new `Failure` {@link Result}.
 */
function failure<TValue = any, TError extends NonNullable<unknown> = any>(error: TError): Result<TValue, TError> {
  assert(typeof error !== 'undefined')
  assert(error !== null)
  return Failure.make(error)
}

/**
 * Creates and returns a new `Success` {@link Result} containing the provided {@link value}.
 *
 * @param value The value to contain in the new `Success` {@link Result}.
 */
function success<TValue = any, TError extends NonNullable<unknown> = any>(value: TValue): Result<TValue, TError> {
  return Success.make(value)
}

export {
  type Result as default,
  failure,
  isResult,
  success,
}
