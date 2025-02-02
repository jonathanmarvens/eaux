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

import ExpectationError from './error/expectation'
import { failure } from './result'
import ImproperUnwrapError from './error/improper-unwrap'
import type Result from './result'
import { success } from './result'
import UnreachableCodeError from './error/unreachable-code'
import util from 'node:util'

/**
 * A robust abstraction for handling optional values.
 */
abstract class Maybe<TValue> {
  protected constructor() { }

  protected abstract _and<TOtherValue>(other: Maybe<TOtherValue>): Maybe<TOtherValue>

  protected abstract _andThen<TOtherValue>(f: (value: TValue) => Maybe<TOtherValue>): Maybe<TOtherValue>

  protected abstract _expect(message: string): TValue

  protected abstract _filter(predicate: (value: TValue) => boolean): Maybe<TValue>

  protected abstract _getSuccessOr<TError>(error: TError): Result<TValue, TError>

  protected abstract _inspect(f: (value: TValue) => void): Maybe<TValue>

  protected abstract _isNothing(): boolean

  protected abstract _isNothingOr(predicate: (value: TValue) => boolean): boolean

  protected abstract _isSomething(): boolean

  protected abstract _isSomethingAnd(predicate: (value: TValue) => boolean): boolean

  protected abstract _map<TNewValue>(f: (value: TValue) => TNewValue): Maybe<TNewValue>

  protected abstract _or(other: Maybe<TValue>): Maybe<TValue>

  protected abstract _unwrap(): TValue

  /**
   * If this is a `Something` {@link Maybe}, returns {@link other}.
   * If this is a `Nothing` {@link Maybe}, returns this {@link Maybe}.
   *
   * @param other The {@link Maybe} to return if this is a `Something` {@link Maybe}.
   */
  public and<TOtherValue>(other: Maybe<TOtherValue>) {
    return this._and(other)
  }

  /**
   * If this is a `Something` {@link Maybe}, returns the result of applying {@link f} to the contained value.
   * If this is a `Nothing` {@link Maybe}, returns this {@link Maybe}.
   *
   * @param f The function to apply to the contained value.
   */
  public andThen<TOtherValue>(f: (value: TValue) => Maybe<TOtherValue>) {
    return this._andThen(f)
  }

  /**
   * If this is a `Something` {@link Maybe}, returns the contained value.
   * If this is a `Nothing` {@link Maybe}, throws an {@link ExpectationError} with the provided {@link message}.
   *
   * @param message The message to include in the {@link ExpectationError}.
   */
  public expect(message: string) {
    return this._expect(message)
  }

  /**
   * If this is a `Something` {@link Maybe}, returns this {@link Maybe} if the contained value satisfies the provided {@link predicate}.
   * If this is a `Nothing` {@link Maybe}, returns this {@link Maybe}.
   *
   * @param predicate The predicate to apply to the contained value.
   */
  public filter(predicate: (value: TValue) => boolean) {
    return this._filter(predicate)
  }

  /**
   * If this is a `Something` {@link Maybe}, returns a `Success` {@link Result} containing the contained value.
   * If this is a `Nothing` {@link Maybe}, returns a `Failure` {@link Result} containing the provided {@link error}.
   *
   * @param error The error to include in the `Failure` {@link Result}.
   */
  public getSuccessOr<TError>(error: TError) {
    return this._getSuccessOr(error)
  }

  /**
   * If this is a `Something` {@link Maybe}, applies {@link f} to the contained value and returns this {@link Maybe}.
   * If this is a `Nothing` {@link Maybe}, returns this {@link Maybe}.
   *
   * @param f The function to apply to the contained value.
   */
  public inspect(f: (value: TValue) => void) {
    return this._inspect(f)
  }

  /**
   * If this is a `Something` {@link Maybe}, returns `false`.
   * If this is a `Nothing` {@link Maybe}, returns `true`.
   */
  public isNothing() {
    return this._isNothing()
  }

  /**
   * If this is a `Something` {@link Maybe}, returns the result of applying {@link predicate} to the contained value.
   * If this is a `Nothing` {@link Maybe}, returns `true`.
   *
   * @param predicate The predicate to apply to the contained value.
   */
  public isNothingOr(predicate: (value: TValue) => boolean) {
    return this._isNothingOr(predicate)
  }

  /**
   * If this is a `Something` {@link Maybe}, returns `true`.
   * If this is a `Nothing` {@link Maybe}, returns `false`.
   */
  public isSomething() {
    return this._isSomething()
  }

  /**
   * If this is a `Something` {@link Maybe}, returns the result of applying {@link predicate} to the contained value.
   * If this is a `Nothing` {@link Maybe}, returns `false`.
   *
   * @param predicate The predicate to apply to the contained value.
   */
  public isSomethingAnd(predicate: (value: TValue) => boolean) {
    return this._isSomethingAnd(predicate)
  }

  /**
   * If this is a `Something` {@link Maybe}, returns a `Something` {@link Maybe} containing the result of applying {@link f} to the contained value.
   * If this is a `Nothing` {@link Maybe}, returns this {@link Maybe}.
   *
   * @param f The function to apply to the contained value.
   */
  public map<TNewValue>(f: (value: TValue) => TNewValue) {
    return this._map(f)
  }

  /**
   * If this is a `Something` {@link Maybe}, returns this {@link Maybe}.
   * If this is a `Nothing` {@link Maybe}, returns {@link other}.
   *
   * @param other The {@link Maybe} to return if this is a `Nothing` {@link Maybe}.
   */
  public or(other: Maybe<TValue>) {
    return this._or(other)
  }

  public toString(): string {
    if (this.isSomething()) {
      return `Maybe{ Something{ value: ${this.unwrap()} } }`
    } else if (this.isNothing()) {
      return 'Maybe{ Nothing }'
    } else {
      throw new UnreachableCodeError('Reached an unreachable code path')
    }
  }

  /**
   * If this is a `Something` {@link Maybe}, returns the contained value.
   * If this is a `Nothing` {@link Maybe}, throws an {@link ImproperUnwrapError}.
   */
  public unwrap() {
    return this._unwrap()
  }

  public [util.inspect.custom]() {
    return `${this}`
  }
}

class Nothing extends Maybe<never> {
  static #instance: Nothing

  static {
    const instance = new this()
    this.#instance = instance
  }

  public static make() {
    return this.#instance
  }

  private constructor() {
    super()
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

  protected _filter() {
    return this
  }

  protected _getSuccessOr<TError>(error: TError) {
    return failure<never, TError>(error)
  }

  protected _inspect() {
    return this
  }

  protected _isNothing() {
    return true
  }

  protected _isNothingOr() {
    return true
  }

  protected _isSomething() {
    return false
  }

  protected _isSomethingAnd() {
    return false
  }

  protected _map() {
    return this
  }

  protected _or(other: Maybe<never>) {
    return other
  }

  protected _unwrap(): never {
    throw new ImproperUnwrapError('Attempted to unwrap a `Nothing` value')
  }
}

class Something<TValue> extends Maybe<TValue> {
  public static make<TValue>(value: TValue) {
    return new this(value)
  }

  #value: TValue

  private constructor(value: TValue) {
    super()
    this.#value = value
  }

  protected _and<TOtherValue>(other: Maybe<TOtherValue>) {
    return other
  }

  protected _andThen<TOtherValue>(f: (value: TValue) => Maybe<TOtherValue>) {
    return f(this.#value)
  }

  protected _expect() {
    return this.#value
  }

  protected _filter(predicate: (value: TValue) => boolean) {
    return predicate(this.#value) ?
      this :
      Nothing.make()
  }

  protected _getSuccessOr() {
    return success<TValue, never>(this.#value)
  }

  protected _inspect(f: (value: TValue) => void) {
    f(this.#value)
    return this
  }

  protected _isNothing() {
    return false
  }

  protected _isNothingOr(predicate: (value: TValue) => boolean) {
    return predicate(this.#value)
  }

  protected _isSomething() {
    return true
  }

  protected _isSomethingAnd(predicate: (value: TValue) => boolean) {
    return predicate(this.#value)
  }

  protected _map<TNewValue>(f: (value: TValue) => TNewValue) {
    const value = f(this.#value)
    return Something.make(value)
  }

  protected _or() {
    return this
  }

  protected _unwrap() {
    return this.#value
  }
}

/**
 * Checks if the provided {@link value} is a {@link Maybe}.
 *
 * @param value The value to check.
 */
function isMaybe(value: unknown): value is Maybe<unknown> {
  return (value instanceof Maybe)
}

/**
 * Creates and returns a new `Nothing` {@link Maybe}.
 */
function nothing<TValue = any>(): Maybe<TValue> {
  return Nothing.make()
}

/**
 * Creates and returns a new `Something` {@link Maybe} containing the provided {@link value}.
 *
 * @param value The value to contain in the new `Something` {@link Maybe}.
 */
function something<TValue = any>(value: TValue): Maybe<TValue> {
  return Something.make(value)
}

export {
  type Maybe as default,
  isMaybe,
  nothing,
  something,
}
