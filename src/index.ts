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

import $packageJson from '../package.json'
import ExpectationError from './error/expectation'
import { failure } from './result'
import ImproperUnwrapError from './error/improper-unwrap'
import { isMaybe } from './maybe'
import { isResult } from './result'
import type Maybe from './maybe'
import { nothing } from './maybe'
import type Result from './result'
import { something } from './maybe'
import { success } from './result'

const VERSION = (() => {
  return $packageJson.version
})()

export {
  ExpectationError,
  failure,
  ImproperUnwrapError,
  isMaybe,
  isResult,
  type Maybe,
  nothing,
  type Result,
  something,
  success,
  VERSION,
}
