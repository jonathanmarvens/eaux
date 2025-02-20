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

const inspect = await (async () => {
  type InspectFunction =
    (...args: InspectFunctionArgs) => InspectFunctionReturn

  type InspectFunctionArgs =
    Parameters<InspectObject>

  type InspectFunctionReturn =
    ReturnType<InspectObject>

  type InspectObject =
    typeof import('node:util')['inspect']

  let function_: InspectFunction
  try {
    const module = await import('node:util')
    function_ = module.inspect
  } catch (error) {
    return (() => '') as InspectFunction
  }
  return function_
})()

const customSymbol = (() => {
  return Symbol.for('nodejs.util.inspect.custom')
})()

export {
  inspect as default,
  customSymbol,
}
