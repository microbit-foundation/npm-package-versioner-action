import * as core from '@actions/core'
import fs from 'node:fs'
import { contextFromEnvironment, generateVersion } from './version'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    // Unfortunately "uses" steps aren't affected by the job-wide working-directory
    // setting so we add our own.
    const workingDirectory = core.getInput('working-directory')
    if (workingDirectory) {
      process.chdir(workingDirectory)
    }

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
    core.setFailed(error instanceof Error ? error.message : 'Unknown error')
  }
}
