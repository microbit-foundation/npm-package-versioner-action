import { SemVer, valid as isValidSemVer } from 'semver'

interface Context {
  ci: boolean
  branch: string | undefined
  tag: string | undefined
  buildNumber: number | undefined
}

interface VersionUpdateResult {
  version?: string
  error?: string
}

const parseIntOrThrow = (s: string): number => {
  const n = parseInt(s, 10)
  if (isNaN(n)) {
    throw new Error(`Could not parse integer '${s}'`)
  }
  return n
}

const github: (env: typeof process.env) => Context = (env) => {
  const ref = env.GITHUB_REF
  let branch: string | undefined
  let tag: string | undefined
  if (ref) {
    if (ref.startsWith('refs/tags/')) {
      tag = ref.slice('refs/tags/'.length)
    } else if (ref.startsWith('refs/heads/')) {
      branch = ref.slice('refs/heads/'.length)
    } else if (env.GITHUB_HEAD_REF) {
      // Pull request: GITHUB_REF is refs/pull/<n>/merge,
      // GITHUB_HEAD_REF is the source branch name.
      branch = env.GITHUB_HEAD_REF
    }
  }
  return {
    ci: !!env.CI,
    branch,
    tag,
    buildNumber:
      typeof env.GITHUB_RUN_NUMBER === 'undefined'
        ? undefined
        : parseIntOrThrow(env.GITHUB_RUN_NUMBER)
  }
}

export const contextFromEnvironment = (env: typeof process.env): Context => {
  return github(env)
}

const sanitizeBranchName = (branch: string): string => {
  if (branch === 'main' || branch === 'master' || branch === 'develop') {
    return 'dev'
  }

  return (
    branch
      .split(/[\\/\-._]/)
      .map((x) => x.replace(/[^a-zA-Z0-9]/, '').replace(/^0+/, ''))
      .filter((x) => x.length > 0)
      .join('.') || 'branch'
  )
}

/**
 *
 * @param inPackageJson The version number as specified in package.json.
 * @param context The build context from CI.
 */
export const generateVersion = (
  inPackageJson: string,
  context: Context
): VersionUpdateResult => {
  const version = new SemVer(inPackageJson)
  if (!context.ci) {
    version.prerelease = ['local']
    return { version: version.format() }
  }
  if (context.tag) {
    const tag = context.tag.replace(/^[^0-9]*/, '')
    if (!isValidSemVer(tag)) {
      return { error: 'Invalid semver tag: ' + context.tag }
    }
    return { version: tag }
  }
  const { branch } = context
  if (branch && typeof context.buildNumber !== 'undefined') {
    version.prerelease = [
      sanitizeBranchName(branch),
      context.buildNumber.toString(10)
    ]
    return { version: version.format() }
  }
  return { error: 'Could not determine a version. CI environment invalid?' }
}
