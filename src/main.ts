import * as core from '@actions/core'
import fs from 'node:fs'
import { contextFromEnvironment, generateVersion } from './version'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  console.log('XXX', process.env.GITHUB_REF)
  try {
    const packageJsonPath = 'package.json'
    const packageJson = JSON.parse(
      fs.readFileSync(packageJsonPath, { encoding: 'utf-8' })
    ) as { version: string }
    const context = contextFromEnvironment(process.env)
    const { error, version } = generateVersion(packageJson.version, context)
    if (error || !version) {
      core.setFailed(error ?? 'No version generated')
    } else {
      console.log(`Updating package version to ${version}`)
      packageJson.version = version
      fs.writeFileSync(
        packageJsonPath,
        JSON.stringify(packageJson, undefined, 2),
        {
          encoding: 'utf-8'
        }
      )
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}
